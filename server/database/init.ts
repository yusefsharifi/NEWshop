import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'database.sqlite');

export const db = new sqlite3.Database(dbPath);

// Initialize database tables
export function initializeDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name_en TEXT NOT NULL,
          name_fa TEXT NOT NULL,
          description_en TEXT,
          description_fa TEXT,
          slug TEXT UNIQUE NOT NULL,
          icon TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Products table
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name_en TEXT NOT NULL,
          name_fa TEXT NOT NULL,
          description_en TEXT,
          description_fa TEXT,
          specifications_en TEXT,
          specifications_fa TEXT,
          category_id INTEGER,
          price DECIMAL(10,2) NOT NULL,
          original_price DECIMAL(10,2),
          stock_quantity INTEGER DEFAULT 0,
          sku TEXT UNIQUE,
          brand TEXT,
          rating DECIMAL(2,1) DEFAULT 0,
          review_count INTEGER DEFAULT 0,
          image_url TEXT,
          images TEXT, -- JSON array of image URLs
          is_bestseller BOOLEAN DEFAULT 0,
          is_featured BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          meta_title_en TEXT,
          meta_title_fa TEXT,
          meta_description_en TEXT,
          meta_description_fa TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES categories (id)
        )
      `);

      // Warehouses table
      db.run(`
        CREATE TABLE IF NOT EXISTS warehouses (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          type TEXT DEFAULT 'store',
          address TEXT,
          city TEXT,
          contact_person TEXT,
          phone TEXT,
          capacity INTEGER DEFAULT 0,
          allow_negatives BOOLEAN DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Inventory items per warehouse
      db.run(`
        CREATE TABLE IF NOT EXISTS inventory_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          warehouse_id INTEGER NOT NULL,
          stock_on_hand INTEGER DEFAULT 0,
          reserved_quantity INTEGER DEFAULT 0,
          incoming_quantity INTEGER DEFAULT 0,
          damaged_quantity INTEGER DEFAULT 0,
          reorder_level INTEGER DEFAULT 0,
          safety_stock INTEGER DEFAULT 0,
          average_unit_cost DECIMAL(10,2) DEFAULT 0,
          last_count_date DATE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(product_id, warehouse_id),
          FOREIGN KEY (product_id) REFERENCES products (id),
          FOREIGN KEY (warehouse_id) REFERENCES warehouses (id)
        )
      `);

      // Inventory batches (optional per lot)
      db.run(`
        CREATE TABLE IF NOT EXISTS inventory_batches (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          inventory_item_id INTEGER NOT NULL,
          batch_number TEXT NOT NULL,
          expiry_date DATE,
          quantity INTEGER DEFAULT 0,
          reserved_quantity INTEGER DEFAULT 0,
          status TEXT DEFAULT 'available',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (inventory_item_id) REFERENCES inventory_items (id) ON DELETE CASCADE,
          UNIQUE(inventory_item_id, batch_number)
        )
      `);

      // Stock movements log
      db.run(`
        CREATE TABLE IF NOT EXISTS stock_movements (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          warehouse_id INTEGER NOT NULL,
          direction TEXT NOT NULL,
          movement_type TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          reference_type TEXT,
          reference_code TEXT,
          reference_id INTEGER,
          note TEXT,
          unit_cost DECIMAL(10,2),
          from_warehouse_id INTEGER,
          to_warehouse_id INTEGER,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (product_id) REFERENCES products (id),
          FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
          FOREIGN KEY (from_warehouse_id) REFERENCES warehouses (id),
          FOREIGN KEY (to_warehouse_id) REFERENCES warehouses (id)
        )
      `);

      // Inventory returns
      db.run(`
        CREATE TABLE IF NOT EXISTS inventory_returns (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          warehouse_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          source TEXT DEFAULT 'customer',
          reason TEXT,
          reference_code TEXT,
          status TEXT DEFAULT 'pending',
          disposition TEXT DEFAULT 'pending',
          note TEXT,
          restock_movement_id INTEGER,
          restocked_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          resolved_at DATETIME,
          FOREIGN KEY (product_id) REFERENCES products (id),
          FOREIGN KEY (warehouse_id) REFERENCES warehouses (id),
          FOREIGN KEY (restock_movement_id) REFERENCES stock_movements (id)
        )
      `);

      // Stock counts (physical)
      db.run(`
        CREATE TABLE IF NOT EXISTS stock_counts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          warehouse_id INTEGER,
          scheduled_date DATE,
          status TEXT DEFAULT 'planned',
          total_items INTEGER DEFAULT 0,
          counted_items INTEGER DEFAULT 0,
          variance INTEGER DEFAULT 0,
          note TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY (warehouse_id) REFERENCES warehouses (id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS stock_count_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          stock_count_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          expected_quantity INTEGER DEFAULT 0,
          counted_quantity INTEGER DEFAULT 0,
          variance INTEGER DEFAULT 0,
          note TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (stock_count_id) REFERENCES stock_counts (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id),
          UNIQUE(stock_count_id, product_id)
        )
      `);

      // Admin users table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT DEFAULT 'admin',
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Orders table
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT UNIQUE NOT NULL,
          customer_name TEXT,
          customer_email TEXT,
          customer_phone TEXT,
          shipping_address TEXT,
          total_amount DECIMAL(10,2) NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_status TEXT DEFAULT 'pending',
          payment_method TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Order items table
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER,
          product_id INTEGER,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Invoices table
      db.run(`
        CREATE TABLE IF NOT EXISTS invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_number TEXT UNIQUE NOT NULL,
          order_id INTEGER NOT NULL,
          customer_name TEXT NOT NULL,
          customer_email TEXT,
          customer_phone TEXT,
          shipping_address TEXT,
          total_amount DECIMAL(10,2) NOT NULL,
          tax_amount DECIMAL(10,2) DEFAULT 0,
          shipping_cost DECIMAL(10,2) DEFAULT 0,
          status TEXT DEFAULT 'issued',
          issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id)
        )
      `);

      // Shipments table
      db.run(`
        CREATE TABLE IF NOT EXISTS shipments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          shipment_number TEXT UNIQUE NOT NULL,
          invoice_id INTEGER NOT NULL,
          order_id INTEGER NOT NULL,
          status TEXT DEFAULT 'pending',
          shipping_method TEXT,
          tracking_number TEXT,
          carrier TEXT,
          estimated_delivery_date DATE,
          actual_delivery_date DATE,
          shipping_address TEXT NOT NULL,
          notes TEXT,
          prepared_by TEXT,
          prepared_at DATETIME,
          shipped_at DATETIME,
          delivered_at DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (invoice_id) REFERENCES invoices (id),
          FOREIGN KEY (order_id) REFERENCES orders (id)
        )
      `);

      // Shipment items table
      db.run(`
        CREATE TABLE IF NOT EXISTS shipment_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          shipment_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(10,2) NOT NULL,
          total_price DECIMAL(10,2) NOT NULL,
          prepared BOOLEAN DEFAULT 0,
          prepared_at DATETIME,
          FOREIGN KEY (shipment_id) REFERENCES shipments (id),
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // Chart of Accounts table
      db.run(`
        CREATE TABLE IF NOT EXISTS chart_of_accounts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT UNIQUE NOT NULL,
          name_en TEXT NOT NULL,
          name_fa TEXT NOT NULL,
          type TEXT NOT NULL,
          category TEXT,
          parent_id INTEGER,
          balance DECIMAL(15,2) DEFAULT 0,
          debit_balance DECIMAL(15,2) DEFAULT 0,
          credit_balance DECIMAL(15,2) DEFAULT 0,
          status TEXT DEFAULT 'active',
          is_control_account BOOLEAN DEFAULT 0,
          bank_account TEXT,
          description_en TEXT,
          description_fa TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (parent_id) REFERENCES chart_of_accounts (id)
        )
      `);

      // Journal Entries table
      db.run(`
        CREATE TABLE IF NOT EXISTS journal_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          entry_number TEXT UNIQUE NOT NULL,
          entry_date DATE NOT NULL,
          posting_date DATE,
          journal_type TEXT NOT NULL,
          reference_number TEXT,
          description TEXT NOT NULL,
          total_debit DECIMAL(15,2) DEFAULT 0,
          total_credit DECIMAL(15,2) DEFAULT 0,
          status TEXT DEFAULT 'draft',
          approval_required BOOLEAN DEFAULT 0,
          approved_by TEXT,
          approved_date DATETIME,
          posted_by TEXT,
          posted_date DATETIME,
          notes TEXT,
          attachment_url TEXT,
          created_by TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Journal Entry Lines table
      db.run(`
        CREATE TABLE IF NOT EXISTS journal_entry_lines (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          journal_entry_id INTEGER NOT NULL,
          line_number INTEGER NOT NULL,
          account_code TEXT NOT NULL,
          account_name TEXT NOT NULL,
          debit DECIMAL(15,2) DEFAULT 0,
          credit DECIMAL(15,2) DEFAULT 0,
          cost_center TEXT,
          department TEXT,
          notes TEXT,
          FOREIGN KEY (journal_entry_id) REFERENCES journal_entries (id) ON DELETE CASCADE
        )
      `);

      // General Ledger table
      db.run(`
        CREATE TABLE IF NOT EXISTS general_ledger (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          transaction_date DATE NOT NULL,
          reference_number TEXT,
          journal_type TEXT,
          account_code TEXT NOT NULL,
          account_name TEXT NOT NULL,
          debit_amount DECIMAL(15,2) DEFAULT 0,
          credit_amount DECIMAL(15,2) DEFAULT 0,
          description TEXT,
          cost_center TEXT,
          department TEXT,
          posted_by TEXT,
          posted_date DATETIME,
          status TEXT DEFAULT 'posted',
          document_reference TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Accounts Receivable Invoices table
      db.run(`
        CREATE TABLE IF NOT EXISTS ar_invoices (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          invoice_number TEXT UNIQUE NOT NULL,
          order_id INTEGER,
          invoice_id INTEGER,
          customer_name TEXT NOT NULL,
          customer_email TEXT,
          customer_phone TEXT,
          invoice_date DATE NOT NULL,
          due_date DATE NOT NULL,
          subtotal DECIMAL(15,2) NOT NULL,
          tax_amount DECIMAL(15,2) DEFAULT 0,
          shipping_cost DECIMAL(15,2) DEFAULT 0,
          discount_amount DECIMAL(15,2) DEFAULT 0,
          total_amount DECIMAL(15,2) NOT NULL,
          paid_amount DECIMAL(15,2) DEFAULT 0,
          balance_amount DECIMAL(15,2) NOT NULL,
          status TEXT DEFAULT 'draft', -- draft, sent, partial, paid, overdue, cancelled
          payment_terms TEXT,
          notes TEXT,
          journal_entry_id INTEGER,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (order_id) REFERENCES orders (id),
          FOREIGN KEY (invoice_id) REFERENCES invoices (id),
          FOREIGN KEY (journal_entry_id) REFERENCES journal_entries (id)
        )
      `);

      // AR Invoice Line Items table
      db.run(`
        CREATE TABLE IF NOT EXISTS ar_invoice_line_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ar_invoice_id INTEGER NOT NULL,
          product_id INTEGER,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(15,2) NOT NULL,
          tax_rate DECIMAL(5,2) DEFAULT 0,
          tax_amount DECIMAL(15,2) DEFAULT 0,
          line_total DECIMAL(15,2) NOT NULL,
          FOREIGN KEY (ar_invoice_id) REFERENCES ar_invoices (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // AR Payments table
      db.run(`
        CREATE TABLE IF NOT EXISTS ar_payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_number TEXT UNIQUE NOT NULL,
          ar_invoice_id INTEGER NOT NULL,
          payment_date DATE NOT NULL,
          payment_method TEXT NOT NULL, -- cash, bank_transfer, check, credit_card
          payment_amount DECIMAL(15,2) NOT NULL,
          reference_number TEXT,
          notes TEXT,
          journal_entry_id INTEGER,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ar_invoice_id) REFERENCES ar_invoices (id),
          FOREIGN KEY (journal_entry_id) REFERENCES journal_entries (id)
        )
      `);

      // Accounts Payable Bills table
      db.run(`
        CREATE TABLE IF NOT EXISTS ap_bills (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          bill_number TEXT UNIQUE NOT NULL,
          vendor_name TEXT NOT NULL,
          vendor_email TEXT,
          vendor_phone TEXT,
          bill_date DATE NOT NULL,
          due_date DATE NOT NULL,
          subtotal DECIMAL(15,2) NOT NULL,
          tax_amount DECIMAL(15,2) DEFAULT 0,
          shipping_cost DECIMAL(15,2) DEFAULT 0,
          discount_amount DECIMAL(15,2) DEFAULT 0,
          total_amount DECIMAL(15,2) NOT NULL,
          paid_amount DECIMAL(15,2) DEFAULT 0,
          balance_amount DECIMAL(15,2) NOT NULL,
          status TEXT DEFAULT 'draft', -- draft, received, partial, paid, overdue, cancelled
          payment_terms TEXT,
          notes TEXT,
          journal_entry_id INTEGER,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (journal_entry_id) REFERENCES journal_entries (id)
        )
      `);

      // AP Bill Line Items table
      db.run(`
        CREATE TABLE IF NOT EXISTS ap_bill_line_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ap_bill_id INTEGER NOT NULL,
          product_id INTEGER,
          description TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          unit_price DECIMAL(15,2) NOT NULL,
          tax_rate DECIMAL(5,2) DEFAULT 0,
          tax_amount DECIMAL(15,2) DEFAULT 0,
          line_total DECIMAL(15,2) NOT NULL,
          FOREIGN KEY (ap_bill_id) REFERENCES ap_bills (id) ON DELETE CASCADE,
          FOREIGN KEY (product_id) REFERENCES products (id)
        )
      `);

      // AP Payments table
      db.run(`
        CREATE TABLE IF NOT EXISTS ap_payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          payment_number TEXT UNIQUE NOT NULL,
          ap_bill_id INTEGER NOT NULL,
          payment_date DATE NOT NULL,
          payment_method TEXT NOT NULL, -- cash, bank_transfer, check, credit_card
          payment_amount DECIMAL(15,2) NOT NULL,
          reference_number TEXT,
          notes TEXT,
          journal_entry_id INTEGER,
          created_by TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (ap_bill_id) REFERENCES ap_bills (id),
          FOREIGN KEY (journal_entry_id) REFERENCES journal_entries (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

// Seed initial data
export function seedDatabase() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Insert categories
      const categories = [
        {
          name_en: 'Pool Pumps',
          name_fa: 'پمپ‌های استخر',
          description_en: 'Variable speed and single speed pumps for efficient water circulation',
          description_fa: 'پمپ‌های تک سرعته و متغیر برای گردش موثر آب',
          slug: 'pumps',
          icon: 'Zap'
        },
        {
          name_en: 'Filters',
          name_fa: 'فیلترها',
          description_en: 'Sand, cartridge, and DE filters for crystal clear pool water',
          description_fa: 'فیلترهای شنی، کارتریج و DE برای آب شفاف استخر',
          slug: 'filters',
          icon: 'Filter'
        },
        {
          name_en: 'Heaters',
          name_fa: 'بخاری‌ها',
          description_en: 'Gas, electric, and heat pump heaters for year-round swimming',
          description_fa: 'بخاری‌های گازی، برقی و پمپ حرارتی برای شنا در تمام فصول',
          slug: 'heaters',
          icon: 'Thermometer'
        },
        {
          name_en: 'Pool Lights',
          name_fa: 'چراغ‌های استخر',
          description_en: 'LED and fiber optic lighting systems for stunning pool ambiance',
          description_fa: 'سیستم‌های روشنایی LED و فیبر نوری برای فضای زیبای استخر',
          slug: 'lights',
          icon: 'Lightbulb'
        },
        {
          name_en: 'Chemicals',
          name_fa: 'مواد شیمیایی',
          description_en: 'Professional-grade chemicals for perfect water balance',
          description_fa: 'مواد شیمیایی حرفه‌ای برای تعادل کامل آب',
          slug: 'chemicals',
          icon: 'Droplets'
        },
        {
          name_en: 'Accessories',
          name_fa: 'لوازم جانبی',
          description_en: 'Covers, cleaners, and maintenance tools for complete pool care',
          description_fa: 'پوشش‌ها، تمیزکننده‌ها و ابزارهای نگهداری برای مراقبت کامل استخر',
          slug: 'accessories',
          icon: 'Wrench'
        }
      ];

      const insertCategory = db.prepare(`
        INSERT OR IGNORE INTO categories (name_en, name_fa, description_en, description_fa, slug, icon)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      categories.forEach(cat => {
        insertCategory.run(cat.name_en, cat.name_fa, cat.description_en, cat.description_fa, cat.slug, cat.icon);
      });

      insertCategory.finalize();

      // Insert sample products
      const products = [
        {
          name_en: 'Pentair SuperFlo VS Variable Speed Pump',
          name_fa: 'پمپ متغیر سرعت پنتیر سوپرفلو',
          description_en: 'Energy-efficient variable speed pump with advanced flow control technology',
          description_fa: 'پمپ متغیر سرعت با صرفه‌جویی انرژی و تکنولوژی کنترل جریان پیشرفته',
          specifications_en: '• Variable speed technology\n• Energy Star certified\n• Quiet operation\n• Digital display\n• Self-priming design',
          specifications_fa: '• تکنولوژی سرعت متغیر\n• گواهی انرژی استار\n• عملکرد بی‌صدا\n• نمایشگر دیجیتال\n• طراحی خودپرایم',
          category_id: 1,
          price: 849,
          original_price: 999,
          stock_quantity: 25,
          sku: 'PEN-SF-VS-001',
          brand: 'Pentair',
          rating: 4.8,
          review_count: 342,
          image_url: '/api/placeholder/300/250',
          is_bestseller: 1,
          is_featured: 1
        },
        {
          name_en: 'Hayward SwimClear Cartridge Filter',
          name_fa: 'فیلتر کارتریج هیوارد سوئیم کلیر',
          description_en: 'High-performance cartridge filter for superior water clarity',
          description_fa: 'فیلتر کارتریج با کارایی بالا برای شفافیت عالی آب',
          specifications_en: '• Cartridge filter technology\n• Easy maintenance\n• High flow rate\n• Durable construction\n• Energy efficient',
          specifications_fa: '• تکنولوژی فیلتر کارتریج\n• نگهداری آسان\n• نرخ جریان بالا\n• ساخت مقاوم\n• صرفه‌جویی انرژی',
          category_id: 2,
          price: 379,
          original_price: 449,
          stock_quantity: 18,
          sku: 'HAY-SC-CF-002',
          brand: 'Hayward',
          rating: 4.9,
          review_count: 189,
          image_url: '/api/placeholder/300/250',
          is_bestseller: 1
        },
        {
          name_en: 'Raypak Digital Gas Heater 266K BTU',
          name_fa: 'بخاری گازی دیجیتال ریپک ۲۶۶ هزار BTU',
          description_en: 'High-efficiency gas heater with digital controls for precise temperature management',
          description_fa: 'بخاری گازی با راندمان بالا و کنترل دیجیتال برای مدیریت دقیق دما',
          specifications_en: '• 266,000 BTU capacity\n• Digital temperature control\n• Cupro-nickel heat exchanger\n• Low NOx emissions\n• Weather-resistant cabinet',
          specifications_fa: '• ظرفیت ۲۶۶ هزار BTU\n• کنترل دمای دیجیتال\n• مبدل حرارتی مس-نیکل\n• انتشار کم NOx\n• کابینت مقاوم در برابر آب و هوا',
          category_id: 3,
          price: 1299,
          original_price: 1499,
          stock_quantity: 8,
          sku: 'RAY-DG-266-003',
          brand: 'Raypak',
          rating: 4.7,
          review_count: 156,
          image_url: '/api/placeholder/300/250',
          is_bestseller: 1
        },
        {
          name_en: 'Jandy Pro Series LED Pool Light',
          name_fa: 'چراغ LED استخر سری پرو جندی',
          description_en: 'Multi-color LED pool light with smart controls and energy efficiency',
          description_fa: 'چراغ LED چندرنگ استخر با کنترل هوشمند و صرفه‌جویی انرژی',
          specifications_en: '• Multi-color LED technology\n• Smart phone app control\n• Energy efficient\n• Long lifespan\n• Easy installation',
          specifications_fa: '• تکنولوژی LED چندرنگ\n• کنترل از طریق اپلیکیشن موبایل\n• صرفه‌جویی انرژی\n• عمر طولانی\n• نصب آسان',
          category_id: 4,
          price: 299,
          original_price: 399,
          stock_quantity: 35,
          sku: 'JAN-LED-PS-004',
          brand: 'Jandy',
          rating: 4.9,
          review_count: 234,
          image_url: '/api/placeholder/300/250',
          is_bestseller: 1
        }
      ];

      const insertProduct = db.prepare(`
        INSERT OR IGNORE INTO products (
          name_en, name_fa, description_en, description_fa, specifications_en, specifications_fa,
          category_id, price, original_price, stock_quantity, sku, brand, rating, review_count,
          image_url, is_bestseller, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      products.forEach(product => {
        insertProduct.run(
          product.name_en, product.name_fa, product.description_en, product.description_fa,
          product.specifications_en, product.specifications_fa, product.category_id,
          product.price, product.original_price, product.stock_quantity, product.sku,
          product.brand, product.rating, product.review_count, product.image_url,
          product.is_bestseller, product.is_featured
        );
      });

      insertProduct.finalize();

      // Insert warehouses
      const warehouses = [
        {
          code: 'MAIN',
          name: 'Main Fulfillment Center',
          type: 'fulfillment',
          address: 'Tehran - Shahrak Sanati',
          city: 'Tehran',
          contact_person: 'Hossein Sadeghi',
          phone: '+98-21-1111-2222',
          capacity: 10000,
          allow_negatives: 0
        },
        {
          code: 'SEC',
          name: 'Secondary Storage',
          type: 'reserve',
          address: 'Karaj - Fardis',
          city: 'Karaj',
          contact_person: 'Sara Ahmadi',
          phone: '+98-26-3333-4444',
          capacity: 6000,
          allow_negatives: 0
        }
      ];

      const insertWarehouse = db.prepare(`
        INSERT OR IGNORE INTO warehouses
        (code, name, type, address, city, contact_person, phone, capacity, allow_negatives)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      warehouses.forEach(w =>
        insertWarehouse.run(
          w.code,
          w.name,
          w.type,
          w.address,
          w.city,
          w.contact_person,
          w.phone,
          w.capacity,
          w.allow_negatives
        )
      );

      insertWarehouse.finalize();

      // Map seed inventory to warehouses
      const inventorySeeds = [
        { sku: 'PEN-SF-VS-001', warehouse: 'MAIN', stock_on_hand: 20, reserved: 2, reorder: 5, safety: 8, avg_cost: 700 },
        { sku: 'HAY-SC-CF-002', warehouse: 'MAIN', stock_on_hand: 12, reserved: 1, reorder: 4, safety: 6, avg_cost: 280 },
        { sku: 'RAY-DG-266-003', warehouse: 'SEC', stock_on_hand: 6, reserved: 0, reorder: 2, safety: 3, avg_cost: 950 },
        { sku: 'JAN-LED-PS-004', warehouse: 'MAIN', stock_on_hand: 30, reserved: 5, reorder: 10, safety: 12, avg_cost: 180 }
      ];

      const insertInventory = db.prepare(`
        INSERT OR IGNORE INTO inventory_items
        (product_id, warehouse_id, stock_on_hand, reserved_quantity, reorder_level, safety_stock, average_unit_cost)
        VALUES (
          (SELECT id FROM products WHERE sku = ?),
          (SELECT id FROM warehouses WHERE code = ?),
          ?, ?, ?, ?, ?
        )
      `);

      inventorySeeds.forEach(seed =>
        insertInventory.run(
          seed.sku,
          seed.warehouse,
          seed.stock_on_hand,
          seed.reserved,
          seed.reorder,
          seed.safety,
          seed.avg_cost
        )
      );

      insertInventory.finalize();

      // Insert standard Chart of Accounts
      const standardAccounts = [
        // ASSETS (1000-1999)
        { code: '1000', name_en: 'Cash & Cash Equivalents', name_fa: 'نقد و اسکناس', type: 'asset', category: 'current_assets', balance: 5000000, debit_balance: 5000000, credit_balance: 0, is_control_account: 1 },
        { code: '1010', name_en: 'Petty Cash', name_fa: 'صندوق کوچک', type: 'asset', category: 'current_assets', balance: 500000, debit_balance: 500000, credit_balance: 0, is_control_account: 0 },
        { code: '1100', name_en: 'Accounts Receivable', name_fa: 'حسابهای دریافتنی', type: 'asset', category: 'current_assets', balance: 3500000, debit_balance: 3500000, credit_balance: 0, is_control_account: 1 },
        { code: '1200', name_en: 'Inventory', name_fa: 'موجودی کالا', type: 'asset', category: 'current_assets', balance: 8500000, debit_balance: 8500000, credit_balance: 0, is_control_account: 1 },
        { code: '1500', name_en: 'Fixed Assets', name_fa: 'دارایی های ثابت', type: 'asset', category: 'fixed_assets', balance: 15000000, debit_balance: 15000000, credit_balance: 0, is_control_account: 1 },
        { code: '1600', name_en: 'Accumulated Depreciation', name_fa: 'استهلاک انباشته', type: 'asset', category: 'fixed_assets', balance: -2000000, debit_balance: 0, credit_balance: 2000000, is_control_account: 0 },
        
        // LIABILITIES (2000-2999)
        { code: '2000', name_en: 'Accounts Payable', name_fa: 'حسابهای پرداختنی', type: 'liability', category: 'current_liabilities', balance: -2000000, debit_balance: 0, credit_balance: 2000000, is_control_account: 1 },
        { code: '2100', name_en: 'Short-term Loans', name_fa: 'وام های کوتاه مدت', type: 'liability', category: 'current_liabilities', balance: -1500000, debit_balance: 0, credit_balance: 1500000, is_control_account: 0 },
        { code: '2200', name_en: 'Long-term Loans', name_fa: 'وام های بلند مدت', type: 'liability', category: 'long_term_liabilities', balance: -5000000, debit_balance: 0, credit_balance: 5000000, is_control_account: 0 },
        { code: '2300', name_en: 'Accrued Expenses', name_fa: 'هزینه های تعلق گرفته', type: 'liability', category: 'current_liabilities', balance: -500000, debit_balance: 0, credit_balance: 500000, is_control_account: 0 },
        
        // EQUITY (3000-3999)
        { code: '3000', name_en: 'Share Capital', name_fa: 'سرمایه سهام', type: 'equity', category: 'equity', balance: -10000000, debit_balance: 0, credit_balance: 10000000, is_control_account: 0 },
        { code: '3100', name_en: 'Retained Earnings', name_fa: 'سود انباشته', type: 'equity', category: 'equity', balance: -5000000, debit_balance: 0, credit_balance: 5000000, is_control_account: 0 },
        
        // REVENUE (4000-4999)
        { code: '4000', name_en: 'Sales Revenue', name_fa: 'درآمد فروش', type: 'revenue', category: 'revenue', balance: -18000000, debit_balance: 0, credit_balance: 18000000, is_control_account: 1 },
        { code: '4100', name_en: 'Service Revenue', name_fa: 'درآمد خدمات', type: 'revenue', category: 'revenue', balance: -2500000, debit_balance: 0, credit_balance: 2500000, is_control_account: 0 },
        { code: '4200', name_en: 'Interest Income', name_fa: 'درآمد بهره', type: 'revenue', category: 'revenue', balance: -200000, debit_balance: 0, credit_balance: 200000, is_control_account: 0 },
        
        // EXPENSES (5000-9999)
        { code: '5000', name_en: 'Cost of Goods Sold', name_fa: 'بهای تمام شده کالا فروخته شده', type: 'expense', category: 'operating_expenses', balance: 9000000, debit_balance: 9000000, credit_balance: 0, is_control_account: 0 },
        { code: '5100', name_en: 'Raw Materials', name_fa: 'مواد اولیه', type: 'expense', category: 'cost_of_sales', balance: 2000000, debit_balance: 2000000, credit_balance: 0, is_control_account: 0 },
        { code: '6000', name_en: 'Salaries & Wages', name_fa: 'حقوق و دستمزد', type: 'expense', category: 'operating_expenses', balance: 3000000, debit_balance: 3000000, credit_balance: 0, is_control_account: 0 },
        { code: '6100', name_en: 'Utilities', name_fa: 'مصارف', type: 'expense', category: 'operating_expenses', balance: 500000, debit_balance: 500000, credit_balance: 0, is_control_account: 0 },
        { code: '6200', name_en: 'Rent Expense', name_fa: 'هزینه اجاره', type: 'expense', category: 'operating_expenses', balance: 800000, debit_balance: 800000, credit_balance: 0, is_control_account: 0 },
        { code: '6300', name_en: 'Office Supplies', name_fa: 'لوازم اداری', type: 'expense', category: 'operating_expenses', balance: 300000, debit_balance: 300000, credit_balance: 0, is_control_account: 0 },
        { code: '6400', name_en: 'Marketing Expense', name_fa: 'هزینه بازاریابی', type: 'expense', category: 'operating_expenses', balance: 700000, debit_balance: 700000, credit_balance: 0, is_control_account: 0 },
        { code: '6500', name_en: 'Depreciation Expense', name_fa: 'هزینه استهلاک', type: 'expense', category: 'operating_expenses', balance: 400000, debit_balance: 400000, credit_balance: 0, is_control_account: 0 },
        { code: '6600', name_en: 'Interest Expense', name_fa: 'هزینه بهره', type: 'expense', category: 'financing_expenses', balance: 250000, debit_balance: 250000, credit_balance: 0, is_control_account: 0 },
        { code: '6700', name_en: 'Tax Expense', name_fa: 'هزینه مالیات', type: 'expense', category: 'tax_expense', balance: 1000000, debit_balance: 1000000, credit_balance: 0, is_control_account: 0 },
      ];

      const insertAccount = db.prepare(`
        INSERT OR IGNORE INTO chart_of_accounts (
          code, name_en, name_fa, type, category, balance, debit_balance, credit_balance,
          status, is_control_account
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
      `);

      standardAccounts.forEach(acc => {
        insertAccount.run(
          acc.code, acc.name_en, acc.name_fa, acc.type, acc.category,
          acc.balance, acc.debit_balance, acc.credit_balance, acc.is_control_account
        );
      });

      insertAccount.finalize((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

// Initialize Blog Tables
export function initializeBlogTables() {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Blog Categories table
      db.run(`
        CREATE TABLE IF NOT EXISTS blog_categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          name_en TEXT NOT NULL,
          name_fa TEXT NOT NULL,
          description_en TEXT,
          description_fa TEXT,
          color TEXT DEFAULT 'blue',
          icon TEXT,
          post_count INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Blog Tags table
      db.run(`
        CREATE TABLE IF NOT EXISTS blog_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          name_en TEXT NOT NULL,
          name_fa TEXT NOT NULL,
          post_count INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Blog Posts table
      db.run(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT UNIQUE NOT NULL,
          title_en TEXT NOT NULL,
          title_fa TEXT NOT NULL,
          summary_en TEXT,
          summary_fa TEXT,
          content_en TEXT NOT NULL,
          content_fa TEXT NOT NULL,
          featured_image TEXT,
          gallery TEXT, -- JSON array of image URLs
          video_url TEXT,
          category_id INTEGER,
          author_id INTEGER,
          author_name TEXT NOT NULL,
          author_avatar TEXT,
          author_bio_en TEXT,
          author_bio_fa TEXT,
          published_date DATETIME,
          updated_date DATETIME,
          reading_time INTEGER DEFAULT 0,
          views INTEGER DEFAULT 0,
          likes INTEGER DEFAULT 0,
          shares INTEGER DEFAULT 0,
          is_featured BOOLEAN DEFAULT 0,
          is_trending BOOLEAN DEFAULT 0,
          is_published BOOLEAN DEFAULT 0,
          post_type TEXT DEFAULT 'article', -- article, video, guide, news
          difficulty TEXT, -- beginner, intermediate, advanced
          meta_title_en TEXT,
          meta_title_fa TEXT,
          meta_description_en TEXT,
          meta_description_fa TEXT,
          meta_keywords TEXT, -- JSON array
          og_image TEXT,
          canonical_url TEXT,
          status TEXT DEFAULT 'draft', -- draft, published, archived
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (category_id) REFERENCES blog_categories (id),
          FOREIGN KEY (author_id) REFERENCES admin_users (id)
        )
      `);

      // Blog Post Tags (many-to-many)
      db.run(`
        CREATE TABLE IF NOT EXISTS blog_post_tags (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          tag_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES blog_tags (id) ON DELETE CASCADE,
          UNIQUE(post_id, tag_id)
        )
      `);

      // Blog Comments table (for future use)
      db.run(`
        CREATE TABLE IF NOT EXISTS blog_comments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          post_id INTEGER NOT NULL,
          parent_id INTEGER,
          author_name TEXT NOT NULL,
          author_email TEXT,
          author_website TEXT,
          content TEXT NOT NULL,
          is_approved BOOLEAN DEFAULT 0,
          is_spam BOOLEAN DEFAULT 0,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (post_id) REFERENCES blog_posts (id) ON DELETE CASCADE,
          FOREIGN KEY (parent_id) REFERENCES blog_comments (id) ON DELETE CASCADE
        )
      `);

      // AI API Keys table (for AI integration)
      db.run(`
        CREATE TABLE IF NOT EXISTS ai_api_keys (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          api_key TEXT UNIQUE NOT NULL,
          provider TEXT NOT NULL, -- openai, anthropic, custom
          permissions TEXT, -- JSON array of allowed actions
          is_active BOOLEAN DEFAULT 1,
          last_used_at DATETIME,
          usage_count INTEGER DEFAULT 0,
          rate_limit INTEGER DEFAULT 100, -- requests per hour
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // AI Activity Log table
      db.run(`
        CREATE TABLE IF NOT EXISTS ai_activity_log (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          api_key_id INTEGER,
          action TEXT NOT NULL, -- create_post, update_post, delete_post, etc.
          resource_type TEXT, -- blog_post, product, etc.
          resource_id INTEGER,
          request_data TEXT, -- JSON
          response_data TEXT, -- JSON
          status TEXT DEFAULT 'success', -- success, error
          error_message TEXT,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (api_key_id) REFERENCES ai_api_keys (id)
        )
      `, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}
