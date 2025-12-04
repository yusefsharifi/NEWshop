import { RequestHandler } from "express";
import { db } from "../database/init";

// Chart of Accounts APIs
export const getAccounts: RequestHandler = (req, res) => {
  const { type, status, search } = req.query;

  let query = `SELECT * FROM chart_of_accounts WHERE 1=1`;
  const params: any[] = [];

  if (type && type !== 'all') {
    query += ` AND type = ?`;
    params.push(type);
  }

  if (status && status !== 'all') {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (search) {
    query += ` AND (code LIKE ? OR name_en LIKE ? OR name_fa LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ` ORDER BY code`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching accounts:', err);
      return res.status(500).json({ error: 'Failed to fetch accounts' });
    }
    res.json(rows);
  });
};

export const getAccount: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM chart_of_accounts WHERE id = ?`, [id], (err, row) => {
    if (err) {
      console.error('Error fetching account:', err);
      return res.status(500).json({ error: 'Failed to fetch account' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Account not found' });
    }

    res.json(row);
  });
};

export const createAccount: RequestHandler = (req, res) => {
  const {
    code,
    name_en,
    name_fa,
    type,
    category,
    parent_id,
    description_en,
    description_fa,
    is_control_account,
    bank_account,
  } = req.body;

  if (!code || !name_en || !name_fa || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `INSERT INTO chart_of_accounts (
      code, name_en, name_fa, type, category, parent_id,
      description_en, description_fa, is_control_account, bank_account,
      balance, debit_balance, credit_balance, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0, 'active')`,
    [
      code,
      name_en,
      name_fa,
      type,
      category || null,
      parent_id || null,
      description_en || null,
      description_fa || null,
      is_control_account ? 1 : 0,
      bank_account || null,
    ],
    function (err) {
      if (err) {
        console.error('Error creating account:', err);
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Account code already exists' });
        }
        return res.status(500).json({ error: 'Failed to create account' });
      }

      res.json({
        success: true,
        id: this.lastID,
        message: 'Account created successfully',
      });
    }
  );
};

export const updateAccount: RequestHandler = (req, res) => {
  const { id } = req.params;
  const {
    code,
    name_en,
    name_fa,
    type,
    category,
    parent_id,
    description_en,
    description_fa,
    status,
    is_control_account,
    bank_account,
  } = req.body;

  const updates: string[] = [];
  const params: any[] = [];

  if (code !== undefined) {
    updates.push('code = ?');
    params.push(code);
  }
  if (name_en !== undefined) {
    updates.push('name_en = ?');
    params.push(name_en);
  }
  if (name_fa !== undefined) {
    updates.push('name_fa = ?');
    params.push(name_fa);
  }
  if (type !== undefined) {
    updates.push('type = ?');
    params.push(type);
  }
  if (category !== undefined) {
    updates.push('category = ?');
    params.push(category);
  }
  if (parent_id !== undefined) {
    updates.push('parent_id = ?');
    params.push(parent_id);
  }
  if (description_en !== undefined) {
    updates.push('description_en = ?');
    params.push(description_en);
  }
  if (description_fa !== undefined) {
    updates.push('description_fa = ?');
    params.push(description_fa);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    params.push(status);
  }
  if (is_control_account !== undefined) {
    updates.push('is_control_account = ?');
    params.push(is_control_account ? 1 : 0);
  }
  if (bank_account !== undefined) {
    updates.push('bank_account = ?');
    params.push(bank_account);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  db.run(
    `UPDATE chart_of_accounts SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        console.error('Error updating account:', err);
        return res.status(500).json({ error: 'Failed to update account' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.json({ success: true, message: 'Account updated successfully' });
    }
  );
};

export const deleteAccount: RequestHandler = (req, res) => {
  const { id } = req.params;

  // Check if account has transactions
  db.get(
    `SELECT COUNT(*) as count FROM general_ledger WHERE account_code = (SELECT code FROM chart_of_accounts WHERE id = ?)`,
    [id],
    (err, row: any) => {
      if (err) {
        console.error('Error checking account usage:', err);
        return res.status(500).json({ error: 'Failed to check account usage' });
      }

      if (row.count > 0) {
        return res.status(400).json({
          error: 'Cannot delete account with existing transactions',
        });
      }

      db.run(`DELETE FROM chart_of_accounts WHERE id = ?`, [id], function (err) {
        if (err) {
          console.error('Error deleting account:', err);
          return res.status(500).json({ error: 'Failed to delete account' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Account not found' });
        }

        res.json({ success: true, message: 'Account deleted successfully' });
      });
    }
  );
};

export const getAccountBalance: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.get(
    `SELECT 
      balance,
      debit_balance,
      credit_balance,
      (SELECT COALESCE(SUM(debit_amount), 0) FROM general_ledger WHERE account_code = (SELECT code FROM chart_of_accounts WHERE id = ?)) as total_debit,
      (SELECT COALESCE(SUM(credit_amount), 0) FROM general_ledger WHERE account_code = (SELECT code FROM chart_of_accounts WHERE id = ?)) as total_credit
     FROM chart_of_accounts WHERE id = ?`,
    [id, id, id],
    (err, row) => {
      if (err) {
        console.error('Error fetching account balance:', err);
        return res.status(500).json({ error: 'Failed to fetch account balance' });
      }

      if (!row) {
        return res.status(404).json({ error: 'Account not found' });
      }

      res.json(row);
    }
  );
};

// Journal Entries APIs
export const getJournalEntries: RequestHandler = (req, res) => {
  const { status, journal_type, search } = req.query;

  let query = `SELECT * FROM journal_entries WHERE 1=1`;
  const params: any[] = [];

  if (status && status !== 'all') {
    query += ` AND status = ?`;
    params.push(status);
  }

  if (journal_type && journal_type !== 'all') {
    query += ` AND journal_type = ?`;
    params.push(journal_type);
  }

  if (search) {
    query += ` AND (entry_number LIKE ? OR description LIKE ? OR reference_number LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  query += ` ORDER BY entry_date DESC, created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching journal entries:', err);
      return res.status(500).json({ error: 'Failed to fetch journal entries' });
    }

    // Get lines for each entry
    const entriesWithLines = rows.map((entry: any) => {
      return new Promise((resolve) => {
        db.all(
          `SELECT * FROM journal_entry_lines WHERE journal_entry_id = ? ORDER BY line_number`,
          [entry.id],
          (err, lines) => {
            if (err) {
              resolve({ ...entry, lines: [] });
            } else {
              resolve({ ...(entry as any), lines });
            }
          }
        );
      });
    });

    Promise.all(entriesWithLines).then((results) => {
      res.json(results);
    });
  });
};

export const getJournalEntry: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM journal_entries WHERE id = ?`, [id], (err, entry) => {
    if (err) {
      console.error('Error fetching journal entry:', err);
      return res.status(500).json({ error: 'Failed to fetch journal entry' });
    }

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    // Get lines
    db.all(
      `SELECT * FROM journal_entry_lines WHERE journal_entry_id = ? ORDER BY line_number`,
      [id],
      (err, lines) => {
        if (err) {
          console.error('Error fetching journal entry lines:', err);
          return res.status(500).json({ error: 'Failed to fetch journal entry lines' });
        }

        res.json({ ...entry, lines });
      }
    );
  });
};

export const createJournalEntry: RequestHandler = (req, res) => {
  const {
    entry_date,
    journal_type,
    reference_number,
    description,
    lines,
    notes,
    approval_required,
    created_by,
  } = req.body;

  if (!entry_date || !journal_type || !description || !lines || !Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Validate debit and credit totals
  const totalDebit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.debit) || 0), 0);
  const totalCredit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.credit) || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return res.status(400).json({
      error: 'Debit and credit totals must be equal',
      totalDebit,
      totalCredit,
    });
  }

  // Generate entry number
  const year = new Date().getFullYear();
  db.get(
    `SELECT COUNT(*) as count FROM journal_entries WHERE entry_number LIKE ?`,
    [`JE-${year}-%`],
    (err, row: any) => {
      if (err) {
        console.error('Error generating entry number:', err);
        return res.status(500).json({ error: 'Failed to generate entry number' });
      }

      const entryNumber = `JE-${year}-${String((row.count || 0) + 1).padStart(3, '0')}`;

      db.run(
        `INSERT INTO journal_entries (
          entry_number, entry_date, journal_type, reference_number, description,
          total_debit, total_credit, status, approval_required, notes, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?, ?)`,
        [
          entryNumber,
          entry_date,
          journal_type,
          reference_number || null,
          description,
          totalDebit,
          totalCredit,
          approval_required ? 1 : 0,
          notes || null,
          created_by || 'admin',
        ],
        function (err) {
          if (err) {
            console.error('Error creating journal entry:', err);
            return res.status(500).json({ error: 'Failed to create journal entry' });
          }

          const entryId = this.lastID;

          // Insert lines
          const insertLine = db.prepare(`
            INSERT INTO journal_entry_lines (
              journal_entry_id, line_number, account_code, account_name,
              debit, credit, cost_center, department, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          lines.forEach((line: any, index: number) => {
            insertLine.run(
              entryId,
              index + 1,
              line.account_code,
              line.account_name,
              parseFloat(line.debit) || 0,
              parseFloat(line.credit) || 0,
              line.cost_center || null,
              line.department || null,
              line.notes || null
            );
          });

          insertLine.finalize((err) => {
            if (err) {
              console.error('Error creating journal entry lines:', err);
              return res.status(500).json({ error: 'Failed to create journal entry lines' });
            }

            res.json({
              success: true,
              id: entryId,
              entry_number: entryNumber,
              message: 'Journal entry created successfully',
            });
          });
        }
      );
    }
  );
};

export const updateJournalEntry: RequestHandler = (req, res) => {
  const { id } = req.params;
  const {
    entry_date,
    journal_type,
    reference_number,
    description,
    lines,
    notes,
    status,
  } = req.body;

  // Check if entry is posted
  db.get(`SELECT status FROM journal_entries WHERE id = ?`, [id], (err, entry: any) => {
    if (err) {
      console.error('Error checking journal entry status:', err);
      return res.status(500).json({ error: 'Failed to check journal entry status' });
    }

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (entry.status === 'posted') {
      return res.status(400).json({ error: 'Cannot update posted journal entry' });
    }

    // If lines are provided, validate and update
    if (lines && Array.isArray(lines)) {
      const totalDebit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.debit) || 0), 0);
      const totalCredit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.credit) || 0), 0);

      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        return res.status(400).json({
          error: 'Debit and credit totals must be equal',
        });
      }

      // Delete existing lines
      db.run(`DELETE FROM journal_entry_lines WHERE journal_entry_id = ?`, [id], (err) => {
        if (err) {
          console.error('Error deleting journal entry lines:', err);
          return res.status(500).json({ error: 'Failed to update journal entry' });
        }

        // Insert new lines
        const insertLine = db.prepare(`
          INSERT INTO journal_entry_lines (
            journal_entry_id, line_number, account_code, account_name,
            debit, credit, cost_center, department, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        lines.forEach((line: any, index: number) => {
          insertLine.run(
            id,
            index + 1,
            line.account_code,
            line.account_name,
            parseFloat(line.debit) || 0,
            parseFloat(line.credit) || 0,
            line.cost_center || null,
            line.department || null,
            line.notes || null
          );
        });

        insertLine.finalize();
      });
    }

    // Update entry
    const updates: string[] = [];
    const params: any[] = [];

    if (entry_date !== undefined) {
      updates.push('entry_date = ?');
      params.push(entry_date);
    }
    if (journal_type !== undefined) {
      updates.push('journal_type = ?');
      params.push(journal_type);
    }
    if (reference_number !== undefined) {
      updates.push('reference_number = ?');
      params.push(reference_number);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }
    if (lines && Array.isArray(lines)) {
      const totalDebit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.debit) || 0), 0);
      const totalCredit = lines.reduce((sum: number, line: any) => sum + (parseFloat(line.credit) || 0), 0);
      updates.push('total_debit = ?');
      updates.push('total_credit = ?');
      params.push(totalDebit, totalCredit);
    }

    if (updates.length > 0) {
      updates.push('updated_at = CURRENT_TIMESTAMP');
      params.push(id);

      db.run(
        `UPDATE journal_entries SET ${updates.join(', ')} WHERE id = ?`,
        params,
        function (err) {
          if (err) {
            console.error('Error updating journal entry:', err);
            return res.status(500).json({ error: 'Failed to update journal entry' });
          }

          res.json({ success: true, message: 'Journal entry updated successfully' });
        }
      );
    } else {
      res.json({ success: true, message: 'Journal entry updated successfully' });
    }
  });
};

export const postJournalEntry: RequestHandler = (req, res) => {
  const { id } = req.params;
  const { posted_by } = req.body;

  db.get(`SELECT * FROM journal_entries WHERE id = ?`, [id], (err, entry: any) => {
    if (err) {
      console.error('Error fetching journal entry:', err);
      return res.status(500).json({ error: 'Failed to fetch journal entry' });
    }

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (entry.status === 'posted') {
      return res.status(400).json({ error: 'Journal entry already posted' });
    }

    if (entry.status === 'voided') {
      return res.status(400).json({ error: 'Cannot post voided journal entry' });
    }

    // Get lines
    db.all(
      `SELECT * FROM journal_entry_lines WHERE journal_entry_id = ?`,
      [id],
      (err, lines: any[]) => {
        if (err) {
          console.error('Error fetching journal entry lines:', err);
          return res.status(500).json({ error: 'Failed to fetch journal entry lines' });
        }

        // Insert into general ledger
        const insertGL = db.prepare(`
          INSERT INTO general_ledger (
            transaction_date, reference_number, journal_type, account_code, account_name,
            debit_amount, credit_amount, description, posted_by, posted_date, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'posted')
        `);

        lines.forEach((line) => {
          insertGL.run(
            entry.entry_date,
            entry.entry_number,
            entry.journal_type,
            line.account_code,
            line.account_name,
            line.debit,
            line.credit,
            entry.description,
            posted_by || 'admin'
          );
        });

        insertGL.finalize((err) => {
          if (err) {
            console.error('Error posting to general ledger:', err);
            return res.status(500).json({ error: 'Failed to post to general ledger' });
          }

          // Update account balances
          lines.forEach((line) => {
            if (line.debit > 0) {
              db.run(
                `UPDATE chart_of_accounts 
                 SET balance = balance + ?, debit_balance = debit_balance + ?, updated_at = CURRENT_TIMESTAMP
                 WHERE code = ?`,
                [line.debit, line.debit, line.account_code]
              );
            }
            if (line.credit > 0) {
              db.run(
                `UPDATE chart_of_accounts 
                 SET balance = balance - ?, credit_balance = credit_balance + ?, updated_at = CURRENT_TIMESTAMP
                 WHERE code = ?`,
                [line.credit, line.credit, line.account_code]
              );
            }
          });

          // Update journal entry status
          db.run(
            `UPDATE journal_entries 
             SET status = 'posted', posted_by = ?, posted_date = CURRENT_TIMESTAMP, posting_date = CURRENT_DATE, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`,
            [posted_by || 'admin', id],
            (err) => {
              if (err) {
                console.error('Error updating journal entry status:', err);
                return res.status(500).json({ error: 'Failed to update journal entry status' });
              }

              res.json({ success: true, message: 'Journal entry posted successfully' });
            }
          );
        });
      }
    );
  });
};

export const voidJournalEntry: RequestHandler = (req, res) => {
  const { id } = req.params;

  db.get(`SELECT status FROM journal_entries WHERE id = ?`, [id], (err, entry: any) => {
    if (err) {
      console.error('Error fetching journal entry:', err);
      return res.status(500).json({ error: 'Failed to fetch journal entry' });
    }

    if (!entry) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (entry.status === 'voided') {
      return res.status(400).json({ error: 'Journal entry already voided' });
    }

    db.run(
      `UPDATE journal_entries SET status = 'voided', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [id],
      function (err) {
        if (err) {
          console.error('Error voiding journal entry:', err);
          return res.status(500).json({ error: 'Failed to void journal entry' });
        }

        res.json({ success: true, message: 'Journal entry voided successfully' });
      }
    );
  });
};

// General Ledger APIs
export const getGeneralLedger: RequestHandler = (req, res) => {
  const { account_code, start_date, end_date, journal_type } = req.query;

  let query = `SELECT * FROM general_ledger WHERE 1=1`;
  const params: any[] = [];

  if (account_code) {
    query += ` AND account_code = ?`;
    params.push(account_code);
  }

  if (start_date) {
    query += ` AND transaction_date >= ?`;
    params.push(start_date);
  }

  if (end_date) {
    query += ` AND transaction_date <= ?`;
    params.push(end_date);
  }

  if (journal_type) {
    query += ` AND journal_type = ?`;
    params.push(journal_type);
  }

  query += ` ORDER BY transaction_date DESC, created_at DESC`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching general ledger:', err);
      return res.status(500).json({ error: 'Failed to fetch general ledger' });
    }
    res.json(rows);
  });
};

export const getTrialBalance: RequestHandler = (req, res) => {
  const { as_of_date } = req.query;

  let query = `
    SELECT 
      coa.id,
      coa.code,
      coa.name_en,
      coa.name_fa,
      coa.type,
      COALESCE(SUM(gl.debit_amount), 0) as total_debit,
      COALESCE(SUM(gl.credit_amount), 0) as total_credit,
      (COALESCE(SUM(gl.debit_amount), 0) - COALESCE(SUM(gl.credit_amount), 0)) as balance
    FROM chart_of_accounts coa
    LEFT JOIN general_ledger gl ON coa.code = gl.account_code
  `;

  const params: any[] = [];

  if (as_of_date) {
    query += ` AND gl.transaction_date <= ?`;
    params.push(as_of_date);
  }

  query += ` WHERE coa.status = 'active' GROUP BY coa.id, coa.code, coa.name_en, coa.name_fa, coa.type ORDER BY coa.code`;

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching trial balance:', err);
      return res.status(500).json({ error: 'Failed to fetch trial balance' });
    }
    res.json(rows);
  });
};

