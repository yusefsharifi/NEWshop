import { RequestHandler } from "express";
import { db } from "../database/init";

export const getShipments: RequestHandler = (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT s.*, 
           i.invoice_number,
           o.order_number,
           o.customer_name,
           o.customer_email,
           o.customer_phone,
           (SELECT COUNT(*) FROM shipment_items WHERE shipment_id = s.id) as items_count
    FROM shipments s
    JOIN invoices i ON s.invoice_id = i.id
    JOIN orders o ON s.order_id = o.id
  `;

  const params: any[] = [];

  if (status && status !== 'all') {
    query += ` WHERE s.status = ?`;
    params.push(status);
  }

  query += ` ORDER BY s.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching shipments:', err);
      return res.status(500).json({ error: 'Failed to fetch shipments' });
    }
    res.json(rows);
  });
};

export const getShipment: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT s.*, 
     i.invoice_number,
     o.order_number,
     o.customer_name,
     o.customer_email,
     o.customer_phone
     FROM shipments s
     JOIN invoices i ON s.invoice_id = i.id
     JOIN orders o ON s.order_id = o.id
     WHERE s.id = ?`,
    [id],
    (err, shipment) => {
      if (err) {
        console.error('Error fetching shipment:', err);
        return res.status(500).json({ error: 'Failed to fetch shipment' });
      }

      if (!shipment) {
        return res.status(404).json({ error: 'Shipment not found' });
      }

      // Get shipment items
      db.all(
        `SELECT si.*, p.name_en, p.name_fa, p.image_url, p.sku
         FROM shipment_items si
         JOIN products p ON si.product_id = p.id
         WHERE si.shipment_id = ?
         ORDER BY si.id`,
        [id],
        (err, items) => {
          if (err) {
            console.error('Error fetching shipment items:', err);
            return res.status(500).json({ error: 'Failed to fetch shipment items' });
          }

          res.json({ ...(shipment as any), items });
        }
      );
    }
  );
};

export const updateShipmentStatus: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { status, tracking_number, carrier, shipping_method, notes } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (status) {
    updates.push('status = ?');
    params.push(status);

    // Set timestamps based on status
    if (status === 'preparing') {
      updates.push('prepared_at = CURRENT_TIMESTAMP');
    } else if (status === 'shipped') {
      updates.push('shipped_at = CURRENT_TIMESTAMP');
    } else if (status === 'delivered') {
      updates.push('delivered_at = CURRENT_TIMESTAMP');
    }
  }

  if (tracking_number) {
    updates.push('tracking_number = ?');
    params.push(tracking_number);
  }

  if (carrier) {
    updates.push('carrier = ?');
    params.push(carrier);
  }

  if (shipping_method) {
    updates.push('shipping_method = ?');
    params.push(shipping_method);
  }

  if (notes !== undefined) {
    updates.push('notes = ?');
    params.push(notes);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  db.run(
    `UPDATE shipments SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        console.error('Error updating shipment:', err);
        return res.status(500).json({ error: 'Failed to update shipment' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Shipment not found' });
      }

      res.json({ success: true, message: 'Shipment updated successfully' });
    }
  );
};

export const prepareShipmentItem: RequestHandler = (req, res) => {
  const { shipmentId, itemId } = req.params;
  const { prepared, prepared_by } = req.body;

  db.run(
    `UPDATE shipment_items 
     SET prepared = ?, prepared_at = CURRENT_TIMESTAMP
     WHERE id = ? AND shipment_id = ?`,
    [prepared ? 1 : 0, itemId, shipmentId],
    function (err) {
      if (err) {
        console.error('Error updating shipment item:', err);
        return res.status(500).json({ error: 'Failed to update shipment item' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Shipment item not found' });
      }

      // Update shipment prepared_by if provided
      if (prepared && prepared_by) {
        db.run(
          `UPDATE shipments SET prepared_by = ? WHERE id = ?`,
          [prepared_by, shipmentId],
          () => { }
        );
      }

      res.json({ success: true, message: 'Shipment item updated successfully' });
    }
  );
};

export const getInvoices: RequestHandler = (req, res) => {
  db.all(
    `SELECT i.*, o.order_number, o.status as order_status
     FROM invoices i
     JOIN orders o ON i.order_id = o.id
     ORDER BY i.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching invoices:', err);
        return res.status(500).json({ error: 'Failed to fetch invoices' });
      }
      res.json(rows);
    }
  );
};

