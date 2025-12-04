import { RequestHandler } from "express";
import * as sqlite3 from "sqlite3";
import { db } from "../database/init";

type RunResult = sqlite3.RunResult;
type AppError = Error & { status?: number };

interface WarehouseRecord {
  id: number;
  code: string;
  name: string;
  allow_negatives: number;
  is_active: number;
}

interface InventoryItemRecord {
  id: number;
  product_id: number;
  warehouse_id: number;
  stock_on_hand: number;
  reserved_quantity: number;
  incoming_quantity: number;
  damaged_quantity: number;
  reorder_level: number;
  safety_stock: number;
  average_unit_cost: number;
}

const run = (sql: string, params: any[] = []) =>
  new Promise<RunResult>((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

const get = <T = any>(sql: string, params: any[] = []) =>
  new Promise<T | undefined>((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row as T);
    });
  });

const all = <T = any>(sql: string, params: any[] = []) =>
  new Promise<T[]>((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows as T[]);
    });
  });

const withTransaction = async (fn: () => Promise<void>) => {
  await run("BEGIN TRANSACTION");
  try {
    await fn();
    await run("COMMIT");
  } catch (error) {
    await run("ROLLBACK");
    throw error;
  }
};

const httpError = (status: number, message: string): AppError => {
  const err = new Error(message) as AppError;
  err.status = status;
  return err;
};

const findWarehouse = (id: number) =>
  get<WarehouseRecord>("SELECT * FROM warehouses WHERE id = ?", [id]);

const ensureWarehouse = async (id: number) => {
  const warehouse = await findWarehouse(id);
  if (!warehouse || warehouse.is_active === 0) {
    throw httpError(404, "Warehouse not found");
  }
  return warehouse;
};

const ensureProduct = async (productId: number) => {
  const product = await get<{ id: number }>("SELECT id FROM products WHERE id = ?", [productId]);
  if (!product) {
    throw httpError(404, "Product not found");
  }
};

const ensureInventoryItem = async (productId: number, warehouseId: number) => {
  await ensureProduct(productId);
  await ensureWarehouse(warehouseId);
  const existing = await get<InventoryItemRecord>(
    "SELECT * FROM inventory_items WHERE product_id = ? AND warehouse_id = ?",
    [productId, warehouseId]
  );
  if (existing) return existing;

  const result = await run(
    `INSERT INTO inventory_items (product_id, warehouse_id) VALUES (?, ?)`,
    [productId, warehouseId]
  );

  return {
    id: result.lastID,
    product_id: productId,
    warehouse_id: warehouseId,
    stock_on_hand: 0,
    reserved_quantity: 0,
    incoming_quantity: 0,
    damaged_quantity: 0,
    reorder_level: 0,
    safety_stock: 0,
    average_unit_cost: 0,
  } as InventoryItemRecord;
};

interface InboundPayload {
  productId: number;
  warehouseId: number;
  quantity: number;
  movementType: string;
  unitCost?: number;
  referenceType?: string;
  referenceCode?: string;
  note?: string;
  batchNumber?: string;
  expiryDate?: string;
  createdBy?: string;
  fromWarehouseId?: number;
  toWarehouseId?: number;
}

interface OutboundPayload {
  productId: number;
  warehouseId: number;
  quantity: number;
  movementType: string;
  referenceType?: string;
  referenceCode?: string;
  note?: string;
  batchNumber?: string;
  createdBy?: string;
  fromWarehouseId?: number;
  toWarehouseId?: number;
}

const recordInboundMovement = async (payload: InboundPayload) => {
  const {
    productId,
    warehouseId,
    quantity,
    movementType,
    unitCost,
    referenceType,
    referenceCode,
    note,
    batchNumber,
    expiryDate,
    createdBy,
    fromWarehouseId,
    toWarehouseId,
  } = payload;

  const inventoryItem = await ensureInventoryItem(productId, warehouseId);
  const previousQty = inventoryItem.stock_on_hand || 0;
  const newQty = previousQty + quantity;

  let newAverage = inventoryItem.average_unit_cost || 0;
  if (unitCost !== undefined && unitCost !== null) {
    const prevValue = newAverage * previousQty;
    const newValue = unitCost * quantity;
    newAverage = Number(((prevValue + newValue) / Math.max(newQty, 1)).toFixed(2));
  }

  await run(
    `UPDATE inventory_items 
     SET stock_on_hand = ?, average_unit_cost = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [newQty, newAverage, inventoryItem.id]
  );

  if (batchNumber) {
    await run(
      `INSERT INTO inventory_batches (inventory_item_id, batch_number, expiry_date, quantity)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(inventory_item_id, batch_number) DO UPDATE SET
         quantity = inventory_batches.quantity + excluded.quantity,
         expiry_date = COALESCE(excluded.expiry_date, inventory_batches.expiry_date),
         updated_at = CURRENT_TIMESTAMP`,
      [inventoryItem.id, batchNumber, expiryDate || null, quantity]
    );
  }

  const movement = await run(
    `INSERT INTO stock_movements
      (product_id, warehouse_id, direction, movement_type, quantity, reference_type, reference_code, note, unit_cost, created_by, from_warehouse_id, to_warehouse_id)
     VALUES (?, ?, 'inbound', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      productId,
      warehouseId,
      movementType,
      quantity,
      referenceType || null,
      referenceCode || null,
      note || null,
      unitCost ?? null,
      createdBy || "system",
      fromWarehouseId || null,
      toWarehouseId || null,
    ]
  );

  return movement.lastID;
};

const recordOutboundMovement = async (payload: OutboundPayload) => {
  const {
    productId,
    warehouseId,
    quantity,
    movementType,
    referenceType,
    referenceCode,
    note,
    batchNumber,
    createdBy,
    fromWarehouseId,
    toWarehouseId,
  } = payload;

  const warehouse = await ensureWarehouse(warehouseId);
  const inventoryItem = await ensureInventoryItem(productId, warehouseId);

  if (!warehouse.allow_negatives && inventoryItem.stock_on_hand < quantity) {
    throw httpError(400, "Insufficient stock for outbound movement");
  }

  const newQty = inventoryItem.stock_on_hand - quantity;

  await run(
    `UPDATE inventory_items
     SET stock_on_hand = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [newQty, inventoryItem.id]
  );

  if (batchNumber) {
    const batch = await get<{ quantity: number }>(
      `SELECT quantity FROM inventory_batches WHERE inventory_item_id = ? AND batch_number = ?`,
      [inventoryItem.id, batchNumber]
    );

    if (!batch || batch.quantity < quantity) {
      throw httpError(400, "Insufficient batch quantity for outbound movement");
    }

    await run(
      `UPDATE inventory_batches
       SET quantity = quantity - ?, updated_at = CURRENT_TIMESTAMP
       WHERE inventory_item_id = ? AND batch_number = ?`,
      [quantity, inventoryItem.id, batchNumber]
    );
  }

  const movement = await run(
    `INSERT INTO stock_movements
      (product_id, warehouse_id, direction, movement_type, quantity, reference_type, reference_code, note, created_by, from_warehouse_id, to_warehouse_id)
     VALUES (?, ?, 'outbound', ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      productId,
      warehouseId,
      movementType,
      quantity,
      referenceType || null,
      referenceCode || null,
      note || null,
      createdBy || "system",
      fromWarehouseId || null,
      toWarehouseId || null,
    ]
  );

  return movement.lastID;
};

const respondWithError = (res: Parameters<RequestHandler>[1], error: AppError) => {
  const status = error.status || 500;
  res.status(status).json({ error: error.message || "Unexpected error" });
};

export const getWarehouses: RequestHandler = async (_req, res) => {
  try {
    const warehouses = await all("SELECT * FROM warehouses ORDER BY name");
    res.json(warehouses);
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const createWarehouse: RequestHandler = async (req, res) => {
  const {
    code,
    name,
    type,
    address,
    city,
    contact_person,
    phone,
    capacity = 0,
    allow_negatives = 0,
  } = req.body;

  if (!code || !name) {
    return respondWithError(res, httpError(400, "Warehouse code and name are required"));
  }

  try {
    const result = await run(
      `INSERT INTO warehouses
        (code, name, type, address, city, contact_person, phone, capacity, allow_negatives)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code, name, type || "store", address || null, city || null, contact_person || null, phone || null, capacity, allow_negatives ? 1 : 0]
    );

    const warehouse = await findWarehouse(result.lastID);
    res.status(201).json(warehouse);
  } catch (error) {
    if ((error as AppError).message?.includes("UNIQUE")) {
      return respondWithError(res, httpError(409, "Warehouse code already exists"));
    }
    respondWithError(res, error as AppError);
  }
};

export const updateWarehouse: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const {
    name,
    type,
    address,
    city,
    contact_person,
    phone,
    capacity,
    allow_negatives,
    is_active,
  } = req.body;

  try {
    const warehouse = await findWarehouse(Number(id));
    if (!warehouse) {
      return respondWithError(res, httpError(404, "Warehouse not found"));
    }

    await run(
      `UPDATE warehouses SET
        name = COALESCE(?, name),
        type = COALESCE(?, type),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        contact_person = COALESCE(?, contact_person),
        phone = COALESCE(?, phone),
        capacity = COALESCE(?, capacity),
        allow_negatives = COALESCE(?, allow_negatives),
        is_active = COALESCE(?, is_active),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        name || null,
        type || null,
        address || null,
        city || null,
        contact_person || null,
        phone || null,
        capacity ?? null,
        allow_negatives ?? null,
        is_active ?? null,
        id,
      ]
    );

    const updated = await findWarehouse(Number(id));
    res.json(updated);
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const getInventoryItems: RequestHandler = async (req, res) => {
  const { warehouse_id, product_id, search } = req.query;
  const params: any[] = [];
  let where = "1=1";

  if (warehouse_id) {
    where += " AND ii.warehouse_id = ?";
    params.push(Number(warehouse_id));
  }

  if (product_id) {
    where += " AND ii.product_id = ?";
    params.push(Number(product_id));
  }

  if (search) {
    where += " AND (p.sku LIKE ? OR p.name_en LIKE ? OR p.name_fa LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  try {
    const items = await all(
      `SELECT ii.*, 
              p.name_en, p.name_fa, p.sku, p.image_url,
              w.code as warehouse_code, w.name as warehouse_name
       FROM inventory_items ii
       JOIN products p ON ii.product_id = p.id
       JOIN warehouses w ON ii.warehouse_id = w.id
       WHERE ${where}
       ORDER BY w.name, p.name_en`,
      params
    );

    const mapped = items.map((item: any) => ({
      ...item,
      available_quantity: Math.max(0, (item.stock_on_hand || 0) - (item.reserved_quantity || 0)),
    }));

    res.json(mapped);
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const getInventoryItem: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const item = await get(
      `SELECT ii.*, 
              p.name_en, p.name_fa, p.sku, p.image_url,
              w.code as warehouse_code, w.name as warehouse_name
       FROM inventory_items ii
       JOIN products p ON ii.product_id = p.id
       JOIN warehouses w ON ii.warehouse_id = w.id
       WHERE ii.id = ?`,
      [id]
    );

    if (!item) {
      return respondWithError(res, httpError(404, "Inventory item not found"));
    }

    res.json({
      ...item,
      available_quantity: Math.max(0, (item.stock_on_hand || 0) - (item.reserved_quantity || 0)),
    });
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const createStockReceipt: RequestHandler = async (req, res) => {
  const {
    product_id,
    warehouse_id,
    quantity,
    movement_type = "purchase",
    reference_type,
    reference_code,
    note,
    unit_cost,
    batch_number,
    expiry_date,
    created_by,
  } = req.body;

  if (!product_id || !warehouse_id || !quantity || quantity <= 0) {
    return respondWithError(res, httpError(400, "product_id, warehouse_id and positive quantity are required"));
  }

  try {
    let movementId: number | null = null;
    await withTransaction(async () => {
      movementId = await recordInboundMovement({
        productId: Number(product_id),
        warehouseId: Number(warehouse_id),
        quantity: Number(quantity),
        movementType: "purchase",
        unitCost: unit_cost !== undefined ? Number(unit_cost) : undefined,
        referenceType: reference_type,
        referenceCode: reference_code,
        note,
        batchNumber: batch_number,
        expiryDate: expiry_date,
        createdBy: created_by,
      });
    });

    res.status(201).json({ message: "Stock receipt recorded", movement_id: movementId });
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const createStockIssue: RequestHandler = async (req, res) => {
  const {
    product_id,
    warehouse_id,
    quantity,
    movement_type = "sale",
    reference_type,
    reference_code,
    note,
    batch_number,
    created_by,
  } = req.body;

  if (!product_id || !warehouse_id || !quantity || quantity <= 0) {
    return respondWithError(res, httpError(400, "product_id, warehouse_id and positive quantity are required"));
  }

  try {
    let movementId: number | null = null;
    await withTransaction(async () => {
      movementId = await recordOutboundMovement({
        productId: Number(product_id),
        warehouseId: Number(warehouse_id),
        quantity: Number(quantity),
        movementType: movement_type,
        referenceType: reference_type,
        referenceCode: reference_code,
        note,
        batchNumber: batch_number,
        createdBy: created_by,
      });
    });

    res.status(201).json({ message: "Stock issue recorded", movement_id: movementId });
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const transferStock: RequestHandler = async (req, res) => {
  const {
    product_id,
    from_warehouse_id,
    to_warehouse_id,
    quantity,
    reference_code,
    note,
    created_by,
  } = req.body;

  if (!product_id || !from_warehouse_id || !to_warehouse_id || !quantity || quantity <= 0) {
    return respondWithError(res, httpError(400, "product_id, from_warehouse_id, to_warehouse_id and positive quantity are required"));
  }

  if (from_warehouse_id === to_warehouse_id) {
    return respondWithError(res, httpError(400, "Source and destination warehouses must differ"));
  }

  try {
    let outboundMovementId: number | null = null;
    let inboundMovementId: number | null = null;

    await withTransaction(async () => {
      outboundMovementId = await recordOutboundMovement({
        productId: Number(product_id),
        warehouseId: Number(from_warehouse_id),
        quantity: Number(quantity),
        movementType: "transfer_out",
        referenceType: "transfer",
        referenceCode: reference_code,
        note,
        createdBy: created_by,
        fromWarehouseId: Number(from_warehouse_id),
        toWarehouseId: Number(to_warehouse_id),
      });

      inboundMovementId = await recordInboundMovement({
        productId: Number(product_id),
        warehouseId: Number(to_warehouse_id),
        quantity: Number(quantity),
        movementType: "transfer_in",
        referenceType: "transfer",
        referenceCode: reference_code,
        note,
        createdBy: created_by,
        fromWarehouseId: Number(from_warehouse_id),
        toWarehouseId: Number(to_warehouse_id),
      });
    });

    res.status(201).json({
      message: "Transfer completed",
      outbound_movement_id: outboundMovementId,
      inbound_movement_id: inboundMovementId,
    });
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const getStockMovements: RequestHandler = async (req, res) => {
  const { warehouse_id, product_id, direction, limit = 50 } = req.query;
  const params: any[] = [];
  let where = "1=1";

  if (warehouse_id) {
    where += " AND sm.warehouse_id = ?";
    params.push(Number(warehouse_id));
  }

  if (product_id) {
    where += " AND sm.product_id = ?";
    params.push(Number(product_id));
  }

  if (direction) {
    where += " AND sm.direction = ?";
    params.push(direction);
  }

  try {
    const movements = await all(
      `SELECT sm.*, p.name_en, p.name_fa, p.sku, w.code as warehouse_code, w.name as warehouse_name
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       JOIN warehouses w ON sm.warehouse_id = w.id
       WHERE ${where}
       ORDER BY sm.created_at DESC
       LIMIT ?`,
      [...params, Number(limit)]
    );

    res.json(movements);
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const createInventoryReturn: RequestHandler = async (req, res) => {
  const {
    product_id,
    warehouse_id,
    quantity,
    source = "customer",
    reason,
    reference_code,
    disposition = "pending",
    note,
    restock_now = false,
    created_by,
  } = req.body;

  if (!product_id || !warehouse_id || !quantity || quantity <= 0) {
    return respondWithError(res, httpError(400, "product_id, warehouse_id and positive quantity are required"));
  }

  try {
    let restockMovementId: number | null = null;

    const result = await run(
      `INSERT INTO inventory_returns
        (product_id, warehouse_id, quantity, source, reason, reference_code, status, disposition, note)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?, ?)`,
      [
        Number(product_id),
        Number(warehouse_id),
        Number(quantity),
        source,
        reason || null,
        reference_code || null,
        disposition,
        note || null,
      ]
    );

    const returnId = result.lastID;

    if (restock_now && disposition === "restock") {
      await withTransaction(async () => {
        restockMovementId = await recordInboundMovement({
          productId: Number(product_id),
          warehouseId: Number(warehouse_id),
          quantity: Number(quantity),
          movementType: "return_restock",
          referenceType: "return",
          referenceCode: reference_code || `RET-${returnId}`,
          note: note || reason,
          createdBy: created_by,
        });

        await run(
          `UPDATE inventory_returns
           SET status = 'restocked',
               disposition = 'restock',
               restock_movement_id = ?,
               restocked_at = CURRENT_TIMESTAMP,
               resolved_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [restockMovementId, returnId]
        );
      });
    }

    const record = await get("SELECT * FROM inventory_returns WHERE id = ?", [returnId]);
    res.status(201).json({ ...record, restock_movement_id: restockMovementId });
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const updateInventoryReturn: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { status, disposition, note, restock, created_by } = req.body;

  try {
    const existing = await get<any>("SELECT * FROM inventory_returns WHERE id = ?", [id]);
    if (!existing) {
      return respondWithError(res, httpError(404, "Return request not found"));
    }

    let restockMovementId = existing.restock_movement_id;

    await withTransaction(async () => {
      await run(
        `UPDATE inventory_returns
         SET status = COALESCE(?, status),
             disposition = COALESCE(?, disposition),
             note = COALESCE(?, note),
             resolved_at = CASE WHEN ? IN ('approved', 'rejected', 'restocked') THEN CURRENT_TIMESTAMP ELSE resolved_at END
         WHERE id = ?`,
        [status || null, disposition || null, note || null, status || null, id]
      );

      if (restock && !restockMovementId) {
        restockMovementId = await recordInboundMovement({
          productId: existing.product_id,
          warehouseId: existing.warehouse_id,
          quantity: existing.quantity,
          movementType: "return_restock",
          referenceType: "return",
          referenceCode: existing.reference_code || `RET-${existing.id}`,
          note: note || existing.note,
          createdBy: created_by,
        });

        await run(
          `UPDATE inventory_returns
           SET status = 'restocked',
               disposition = 'restock',
               restock_movement_id = ?,
               restocked_at = CURRENT_TIMESTAMP
           WHERE id = ?`,
          [restockMovementId, id]
        );
      }
    });

    const updated = await get("SELECT * FROM inventory_returns WHERE id = ?", [id]);
    res.json(updated);
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

export const getInventoryReturns: RequestHandler = async (_req, res) => {
  try {
    const returns = await all(
      `SELECT ir.*, p.name_en, p.name_fa, p.sku, w.name as warehouse_name
       FROM inventory_returns ir
       JOIN products p ON ir.product_id = p.id
       JOIN warehouses w ON ir.warehouse_id = w.id
       ORDER BY ir.created_at DESC`
    );
    res.json(returns);
  } catch (error) {
    respondWithError(res, error as AppError);
  }
};

