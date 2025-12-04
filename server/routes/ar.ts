import { RequestHandler } from "express";
import { db } from "../database/init";

// Get all AR Invoices
export const getARInvoices: RequestHandler = (req, res) => {
  const { status, search, customer } = req.query;

  let query = `
    SELECT 
      ar.*,
      o.order_number,
      i.invoice_number as original_invoice_number
    FROM ar_invoices ar
    LEFT JOIN orders o ON ar.order_id = o.id
    LEFT JOIN invoices i ON ar.invoice_id = i.id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ` AND ar.status = ?`;
    params.push(status);
  }

  if (search) {
    query += ` AND (ar.invoice_number LIKE ? OR ar.customer_name LIKE ? OR ar.customer_email LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (customer) {
    query += ` AND ar.customer_name LIKE ?`;
    params.push(`%${customer}%`);
  }

  query += ` ORDER BY ar.invoice_date DESC, ar.created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching AR invoices:', err);
      return res.status(500).json({ error: 'Failed to fetch AR invoices' });
    }

    // Get line items for each invoice
    const invoicesWithItems = rows.map((invoice: any) => {
      return new Promise((resolve) => {
        db.all(
          `SELECT * FROM ar_invoice_line_items WHERE ar_invoice_id = ?`,
          [invoice.id],
          (err, items) => {
            if (err) {
              resolve({ ...invoice, items: [] });
            } else {
              resolve({ ...invoice, items: items || [] });
            }
          }
        );
      });
    });

    Promise.all(invoicesWithItems).then((invoices) => {
      res.json(invoices);
    });
  });
};

// Get AR Invoice by ID
export const getARInvoice: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT 
      ar.*,
      o.order_number,
      i.invoice_number as original_invoice_number
    FROM ar_invoices ar
    LEFT JOIN orders o ON ar.order_id = o.id
    LEFT JOIN invoices i ON ar.invoice_id = i.id
    WHERE ar.id = ?`,
    [id],
    (err, invoice: any) => {
      if (err) {
        console.error('Error fetching AR invoice:', err);
        return res.status(500).json({ error: 'Failed to fetch AR invoice' });
      }

      if (!invoice) {
        return res.status(404).json({ error: 'AR invoice not found' });
      }

      // Get line items
      db.all(
        `SELECT * FROM ar_invoice_line_items WHERE ar_invoice_id = ?`,
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch line items' });
          }

          // Get payments
          db.all(
            `SELECT * FROM ar_payments WHERE ar_invoice_id = ? ORDER BY payment_date DESC`,
            [id],
            (err, payments) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch payments' });
              }

              res.json({
                ...invoice,
                items: items || [],
                payments: payments || []
              });
            }
          );
        }
      );
    }
  );
};

// Create AR Invoice (usually from order invoice)
export const createARInvoice: RequestHandler = (req, res) => {
  const {
    order_id,
    invoice_id,
    customer_name,
    customer_email,
    customer_phone,
    invoice_date,
    due_date,
    items,
    subtotal,
    tax_amount,
    shipping_cost,
    discount_amount,
    payment_terms,
    notes
  } = req.body;

  if (!customer_name || !invoice_date || !due_date || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const total_amount = (subtotal || 0) + (tax_amount || 0) + (shipping_cost || 0) - (discount_amount || 0);
  const invoiceNumber = `AR-INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  db.run(
    `INSERT INTO ar_invoices (
      invoice_number, order_id, invoice_id, customer_name, customer_email, customer_phone,
      invoice_date, due_date, subtotal, tax_amount, shipping_cost, discount_amount,
      total_amount, balance_amount, payment_terms, notes, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'sent', ?)`,
    [
      invoiceNumber,
      order_id || null,
      invoice_id || null,
      customer_name,
      customer_email || null,
      customer_phone || null,
      invoice_date,
      due_date,
      subtotal || 0,
      tax_amount || 0,
      shipping_cost || 0,
      discount_amount || 0,
      total_amount,
      total_amount, // Initial balance equals total
      payment_terms || null,
      notes || null,
      'system' // created_by
    ],
    function (err) {
      if (err) {
        console.error('Error creating AR invoice:', err);
        return res.status(500).json({ error: 'Failed to create AR invoice' });
      }

      const arInvoiceId = this.lastID;

      // Create line items
      const insertItem = db.prepare(`
        INSERT INTO ar_invoice_line_items (
          ar_invoice_id, product_id, description, quantity, unit_price, tax_rate, tax_amount, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      items.forEach((item: any) => {
        const lineTotal = (item.unit_price || 0) * (item.quantity || 0);
        const taxAmt = lineTotal * ((item.tax_rate || 0) / 100);
        insertItem.run(
          arInvoiceId,
          item.product_id || null,
          item.description || '',
          item.quantity || 0,
          item.unit_price || 0,
          item.tax_rate || 0,
          taxAmt,
          lineTotal + taxAmt
        );
      });

      insertItem.finalize((err) => {
        if (err) {
          console.error('Error creating line items:', err);
          return res.status(500).json({ error: 'Failed to create line items' });
        }

        res.json({
          success: true,
          id: arInvoiceId,
          invoice_number: invoiceNumber
        });
      });
    }
  );
};

// Record AR Payment
export const createARPayment: RequestHandler = (req, res) => {
  const {
    ar_invoice_id,
    payment_date,
    payment_method,
    payment_amount,
    reference_number,
    notes
  } = req.body;

  if (!ar_invoice_id || !payment_date || !payment_method || !payment_amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check invoice balance
  db.get(
    `SELECT balance_amount, total_amount, paid_amount FROM ar_invoices WHERE id = ?`,
    [ar_invoice_id],
    (err, invoice: any) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check invoice balance' });
      }

      if (!invoice) {
        return res.status(404).json({ error: 'AR invoice not found' });
      }

      if (payment_amount > invoice.balance_amount) {
        return res.status(400).json({ error: 'Payment amount exceeds invoice balance' });
      }

      const paymentNumber = `AR-PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      db.run(
        `INSERT INTO ar_payments (
          payment_number, ar_invoice_id, payment_date, payment_method,
          payment_amount, reference_number, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentNumber,
          ar_invoice_id,
          payment_date,
          payment_method,
          payment_amount,
          reference_number || null,
          notes || null,
          'system'
        ],
        function (err) {
          if (err) {
            console.error('Error creating AR payment:', err);
            return res.status(500).json({ error: 'Failed to create AR payment' });
          }

          // Update invoice balance
          const newPaidAmount = (invoice.paid_amount || 0) + payment_amount;
          const newBalance = invoice.total_amount - newPaidAmount;
          const newStatus = newBalance <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : invoice.status);

          db.run(
            `UPDATE ar_invoices 
            SET paid_amount = ?, balance_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [newPaidAmount, newBalance, newStatus, ar_invoice_id],
            (err) => {
              if (err) {
                console.error('Error updating invoice balance:', err);
                return res.status(500).json({ error: 'Failed to update invoice balance' });
              }

              res.json({
                success: true,
                id: this.lastID,
                payment_number: paymentNumber
              });
            }
          );
        }
      );
    }
  );
};

// Get AR Aging Report
export const getARAging: RequestHandler = (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  db.all(
    `SELECT 
      customer_name,
      invoice_number,
      invoice_date,
      due_date,
      total_amount,
      paid_amount,
      balance_amount,
      CASE 
        WHEN balance_amount = 0 THEN 'paid'
        WHEN due_date < date('now') THEN 'overdue'
        WHEN due_date >= date('now') AND due_date <= date('now', '+30 days') THEN 'current'
        ELSE 'future'
      END as aging_category,
      CASE 
        WHEN due_date < date('now') THEN julianday('now') - julianday(due_date)
        ELSE 0
      END as days_overdue
    FROM ar_invoices
    WHERE balance_amount > 0
    ORDER BY due_date ASC, balance_amount DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching AR aging:', err);
        return res.status(500).json({ error: 'Failed to fetch AR aging' });
      }

      res.json(rows);
    }
  );
};

