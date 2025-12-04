import { RequestHandler } from "express";
import { db } from "../database/init";

// Get all AP Bills
export const getAPBills: RequestHandler = (req, res) => {
  const { status, search, vendor } = req.query;

  let query = `SELECT * FROM ap_bills WHERE 1=1`;
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    query += ` AND (bill_number LIKE ? OR vendor_name LIKE ? OR vendor_email LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  if (vendor) {
    query += ` AND vendor_name LIKE ?`;
    params.push(`%${vendor}%`);
  }

  query += ` ORDER BY bill_date DESC, created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching AP bills:', err);
      return res.status(500).json({ error: 'Failed to fetch AP bills' });
    }

    // Get line items for each bill
    const billsWithItems = rows.map((bill: any) => {
      return new Promise((resolve) => {
        db.all(
          `SELECT * FROM ap_bill_line_items WHERE ap_bill_id = ?`,
          [bill.id],
          (err, items) => {
            if (err) {
              resolve({ ...bill, items: [] });
            } else {
              resolve({ ...bill, items: items || [] });
            }
          }
        );
      });
    });

    Promise.all(billsWithItems).then((bills) => {
      res.json(bills);
    });
  });
};

// Get AP Bill by ID
export const getAPBill: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT * FROM ap_bills WHERE id = ?`,
    [id],
    (err, bill: any) => {
      if (err) {
        console.error('Error fetching AP bill:', err);
        return res.status(500).json({ error: 'Failed to fetch AP bill' });
      }

      if (!bill) {
        return res.status(404).json({ error: 'AP bill not found' });
      }

      // Get line items
      db.all(
        `SELECT * FROM ap_bill_line_items WHERE ap_bill_id = ?`,
        [id],
        (err, items) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch line items' });
          }

          // Get payments
          db.all(
            `SELECT * FROM ap_payments WHERE ap_bill_id = ? ORDER BY payment_date DESC`,
            [id],
            (err, payments) => {
              if (err) {
                return res.status(500).json({ error: 'Failed to fetch payments' });
              }

              res.json({
                ...bill,
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

// Create AP Bill
export const createAPBill: RequestHandler = (req, res) => {
  const {
    vendor_name,
    vendor_email,
    vendor_phone,
    bill_date,
    due_date,
    items,
    subtotal,
    tax_amount,
    shipping_cost,
    discount_amount,
    payment_terms,
    notes
  } = req.body;

  if (!vendor_name || !bill_date || !due_date || !items || items.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const total_amount = (subtotal || 0) + (tax_amount || 0) + (shipping_cost || 0) - (discount_amount || 0);
  const billNumber = `AP-BILL-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

  db.run(
    `INSERT INTO ap_bills (
      bill_number, vendor_name, vendor_email, vendor_phone,
      bill_date, due_date, subtotal, tax_amount, shipping_cost, discount_amount,
      total_amount, balance_amount, payment_terms, notes, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', ?)`,
    [
      billNumber,
      vendor_name,
      vendor_email || null,
      vendor_phone || null,
      bill_date,
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
        console.error('Error creating AP bill:', err);
        return res.status(500).json({ error: 'Failed to create AP bill' });
      }

      const apBillId = this.lastID;

      // Create line items
      const insertItem = db.prepare(`
        INSERT INTO ap_bill_line_items (
          ap_bill_id, product_id, description, quantity, unit_price, tax_rate, tax_amount, line_total
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      items.forEach((item: any) => {
        const lineTotal = (item.unit_price || 0) * (item.quantity || 0);
        const taxAmt = lineTotal * ((item.tax_rate || 0) / 100);
        insertItem.run(
          apBillId,
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
          id: apBillId,
          bill_number: billNumber
        });
      });
    }
  );
};

// Record AP Payment
export const createAPPayment: RequestHandler = (req, res) => {
  const {
    ap_bill_id,
    payment_date,
    payment_method,
    payment_amount,
    reference_number,
    notes
  } = req.body;

  if (!ap_bill_id || !payment_date || !payment_method || !payment_amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check bill balance
  db.get(
    `SELECT balance_amount, total_amount, paid_amount FROM ap_bills WHERE id = ?`,
    [ap_bill_id],
    (err, bill: any) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check bill balance' });
      }

      if (!bill) {
        return res.status(404).json({ error: 'AP bill not found' });
      }

      if (payment_amount > bill.balance_amount) {
        return res.status(400).json({ error: 'Payment amount exceeds bill balance' });
      }

      const paymentNumber = `AP-PAY-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

      db.run(
        `INSERT INTO ap_payments (
          payment_number, ap_bill_id, payment_date, payment_method,
          payment_amount, reference_number, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          paymentNumber,
          ap_bill_id,
          payment_date,
          payment_method,
          payment_amount,
          reference_number || null,
          notes || null,
          'system'
        ],
        function (err) {
          if (err) {
            console.error('Error creating AP payment:', err);
            return res.status(500).json({ error: 'Failed to create AP payment' });
          }

          // Update bill balance
          const newPaidAmount = (bill.paid_amount || 0) + payment_amount;
          const newBalance = bill.total_amount - newPaidAmount;
          const newStatus = newBalance <= 0 ? 'paid' : (newPaidAmount > 0 ? 'partial' : bill.status);

          db.run(
            `UPDATE ap_bills 
            SET paid_amount = ?, balance_amount = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [newPaidAmount, newBalance, newStatus, ap_bill_id],
            (err) => {
              if (err) {
                console.error('Error updating bill balance:', err);
                return res.status(500).json({ error: 'Failed to update bill balance' });
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

// Get AP Aging Report
export const getAPAging: RequestHandler = (req, res) => {
  db.all(
    `SELECT 
      vendor_name,
      bill_number,
      bill_date,
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
    FROM ap_bills
    WHERE balance_amount > 0
    ORDER BY due_date ASC, balance_amount DESC`,
    [],
    (err, rows) => {
      if (err) {
        console.error('Error fetching AP aging:', err);
        return res.status(500).json({ error: 'Failed to fetch AP aging' });
      }

      res.json(rows);
    }
  );
};

