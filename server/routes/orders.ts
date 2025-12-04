import { RequestHandler } from "express";
import { db } from "../database/init";

export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  payment_method: string;
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping_cost: number;
  total_amount: number;
}

export const createOrder: RequestHandler = async (req, res) => {
  try {
    const orderData: CreateOrderRequest = req.body;

    // Generate order number
    const orderNumber = `ORD-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create order
    db.run(
      `INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        shipping_address, total_amount, status, payment_status, payment_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderNumber,
        orderData.customer_name,
        orderData.customer_email,
        orderData.customer_phone,
        JSON.stringify({
          address: orderData.shipping_address,
          city: orderData.city,
          state: orderData.state,
          zipCode: orderData.zipCode,
          country: orderData.country,
        }),
        orderData.total_amount,
        'pending',
        'paid',
        orderData.payment_method,
      ],
      function (err) {
        if (err) {
          console.error('Error creating order:', err);
          return res.status(500).json({ error: 'Failed to create order' });
        }

        const orderId = this.lastID;

        // Create order items
        const insertItem = db.prepare(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
           VALUES (?, ?, ?, ?, ?)`
        );

        orderData.items.forEach((item) => {
          insertItem.run(
            orderId,
            item.product_id,
            item.quantity,
            item.unit_price,
            item.unit_price * item.quantity
          );
        });

        insertItem.finalize((err) => {
          if (err) {
            console.error('Error creating order items:', err);
            return res.status(500).json({ error: 'Failed to create order items' });
          }

          // Create invoice automatically
          createInvoiceForOrder(orderId, orderData, (invoiceErr, invoiceId) => {
            if (invoiceErr) {
              console.error('Error creating invoice:', invoiceErr);
              // Still return success for order, invoice can be created later
            }

            res.json({
              success: true,
              order_id: orderId,
              order_number: orderNumber,
              invoice_id: invoiceId,
            });
          });
        });
      }
    );
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function createInvoiceForOrder(
  orderId: number,
  orderData: CreateOrderRequest,
  callback: (err: Error | null, invoiceId?: number) => void
) {
  const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  db.run(
    `INSERT INTO invoices (
      invoice_number, order_id, customer_name, customer_email, customer_phone,
      shipping_address, total_amount, tax_amount, shipping_cost, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      invoiceNumber,
      orderId,
      orderData.customer_name,
      orderData.customer_email,
      orderData.customer_phone,
      JSON.stringify({
        address: orderData.shipping_address,
        city: orderData.city,
        state: orderData.state,
        zipCode: orderData.zipCode,
        country: orderData.country,
      }),
      orderData.total_amount,
      orderData.tax,
      orderData.shipping_cost,
      'issued',
    ],
    function (err) {
      if (err) {
        return callback(err);
      }

      const invoiceId = this.lastID;

      // Create AR Invoice automatically when invoice is issued
      createARInvoiceForOrder(invoiceId, orderId, orderData, (arErr) => {
        if (arErr) {
          console.error('Error creating AR invoice:', arErr);
        }

        // Create shipment automatically when invoice is issued
        createShipmentForInvoice(invoiceId, orderId, orderData, (shipmentErr) => {
          if (shipmentErr) {
            console.error('Error creating shipment:', shipmentErr);
          }
          callback(null, invoiceId);
        });
      });
    }
  );
}

function createARInvoiceForOrder(
  invoiceId: number,
  orderId: number,
  orderData: CreateOrderRequest,
  callback: (err: Error | null) => void
) {
  // Calculate due date (30 days from now)
  const invoiceDate = new Date().toISOString().split('T')[0];
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  // Get order items to create AR invoice line items
  db.all(
    `SELECT oi.*, p.name_en as product_name 
     FROM order_items oi
     LEFT JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [orderId],
    (err, orderItems: any[]) => {
      if (err) {
        return callback(err);
      }

      const arInvoiceNumber = `AR-INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const subtotal = orderData.subtotal || (orderData.total_amount - (orderData.tax || 0) - (orderData.shipping_cost || 0));

      // Create AR Invoice
      db.run(
        `INSERT INTO ar_invoices (
          invoice_number, order_id, invoice_id, customer_name, customer_email, customer_phone,
          invoice_date, due_date, subtotal, tax_amount, shipping_cost, discount_amount,
          total_amount, balance_amount, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', ?)`,
        [
          arInvoiceNumber,
          orderId,
          invoiceId,
          orderData.customer_name,
          orderData.customer_email,
          orderData.customer_phone,
          invoiceDate,
          dueDateStr,
          subtotal,
          orderData.tax || 0,
          orderData.shipping_cost || 0,
          0, // discount_amount
          orderData.total_amount,
          orderData.total_amount, // Initial balance equals total
          'system'
        ],
        function (err) {
          if (err) {
            return callback(err);
          }

          const arInvoiceId = this.lastID;

          // Create AR Invoice line items
          const insertItem = db.prepare(`
            INSERT INTO ar_invoice_line_items (
              ar_invoice_id, product_id, description, quantity, unit_price, tax_rate, tax_amount, line_total
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          orderItems.forEach((item) => {
            const lineTotal = item.unit_price * item.quantity;
            const taxRate = orderData.tax ? (orderData.tax / subtotal) * 100 : 0;
            const taxAmt = lineTotal * (taxRate / 100);
            insertItem.run(
              arInvoiceId,
              item.product_id,
              item.product_name || `Product ${item.product_id}`,
              item.quantity,
              item.unit_price,
              taxRate,
              taxAmt,
              lineTotal + taxAmt
            );
          });

          insertItem.finalize((err) => {
            callback(err || null);
          });
        }
      );
    }
  );
}

function createShipmentForInvoice(
  invoiceId: number,
  orderId: number,
  orderData: CreateOrderRequest,
  callback: (err: Error | null) => void
) {
  const shipmentNumber = `SHIP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  db.run(
    `INSERT INTO shipments (
      shipment_number, invoice_id, order_id, shipping_address, status
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      shipmentNumber,
      invoiceId,
      orderId,
      JSON.stringify({
        address: orderData.shipping_address,
        city: orderData.city,
        state: orderData.state,
        zipCode: orderData.zipCode,
        country: orderData.country,
      }),
      'pending',
    ],
    function (err) {
      if (err) {
        return callback(err);
      }

      const shipmentId = this.lastID;

      // Create shipment items from order items
      db.all(
        `SELECT product_id, quantity, unit_price, total_price
         FROM order_items WHERE order_id = ?`,
        [orderId],
        (err, orderItems: any[]) => {
          if (err) {
            return callback(err);
          }

          const insertShipmentItem = db.prepare(
            `INSERT INTO shipment_items (
              shipment_id, product_id, quantity, unit_price, total_price
            ) VALUES (?, ?, ?, ?, ?)`
          );

          orderItems.forEach((item) => {
            insertShipmentItem.run(
              shipmentId,
              item.product_id,
              item.quantity,
              item.unit_price,
              item.total_price
            );
          });

          insertShipmentItem.finalize((err) => {
            callback(err || null);
          });
        }
      );
    }
  );
}

export const getOrders: RequestHandler = (req, res) => {
  db.all(
    `SELECT o.*, 
     (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
     FROM orders o
     ORDER BY o.created_at DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching orders:', err);
        return res.status(500).json({ error: 'Failed to fetch orders' });
      }
      res.json(rows);
    }
  );
};

export const getOrder: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM orders WHERE id = ?`, [id], (err, order) => {
    if (err) {
      console.error('Error fetching order:', err);
      return res.status(500).json({ error: 'Failed to fetch order' });
    }

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    db.all(
      `SELECT oi.*, p.name_en, p.name_fa, p.image_url, p.sku
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [id],
      (err, items) => {
        if (err) {
          console.error('Error fetching order items:', err);
          return res.status(500).json({ error: 'Failed to fetch order items' });
        }

        res.json({ ...order, items });
      }
    );
  });
};

