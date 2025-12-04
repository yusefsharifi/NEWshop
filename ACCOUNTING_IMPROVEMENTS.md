# پیشنهادات بهبود ماژول مالی و حسابداری

## 📊 وضعیت فعلی

### مشکلات موجود:
1. ❌ تمام داده‌ها Mock هستند و به دیتابیس متصل نیستند
2. ❌ جداول دیتابیس برای ماژول مالی وجود ندارد
3. ❌ اتصال بین ماژول‌ها (Orders → Accounting) وجود ندارد
4. ❌ API endpoints برای عملیات مالی وجود ندارد
5. ❌ سیستم تأیید و Workflow وجود ندارد
6. ❌ گزارش‌های مالی از داده‌های واقعی محاسبه نمی‌شوند

---

## 🗄️ پیشنهادات Backend (دیتابیس و API)

### 1. جداول دیتابیس پیشنهادی

#### Chart of Accounts (خطة حساب)
```sql
CREATE TABLE chart_of_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  type TEXT NOT NULL, -- asset, liability, equity, revenue, expense
  category TEXT,
  parent_id INTEGER,
  balance DECIMAL(15,2) DEFAULT 0,
  debit_balance DECIMAL(15,2) DEFAULT 0,
  credit_balance DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'active', -- active, inactive, archived
  is_control_account BOOLEAN DEFAULT 0,
  bank_account TEXT,
  description_en TEXT,
  description_fa TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES chart_of_accounts (id)
);
```

#### Journal Entries (دفاتر روزنامه)
```sql
CREATE TABLE journal_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_number TEXT UNIQUE NOT NULL,
  entry_date DATE NOT NULL,
  posting_date DATE,
  journal_type TEXT NOT NULL, -- general, sales, purchase, payment, bank, petty_cash
  reference_number TEXT,
  description TEXT NOT NULL,
  total_debit DECIMAL(15,2) DEFAULT 0,
  total_credit DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft, posted, voided
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
);

CREATE TABLE journal_entry_lines (
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
);
```

#### General Ledger (دفتر کل)
```sql
CREATE TABLE general_ledger (
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
  status TEXT DEFAULT 'posted', -- posted, voided
  document_reference TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Accounts Receivable (حساب‌های دریافتنی)
```sql
CREATE TABLE ar_invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id INTEGER,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  balance_due DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, sent, viewed, partially_paid, paid, overdue, cancelled
  payment_terms TEXT DEFAULT 'Net 30',
  notes TEXT,
  sent_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ar_invoice_line_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (invoice_id) REFERENCES ar_invoices (id) ON DELETE CASCADE
);

CREATE TABLE ar_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  invoice_number TEXT NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT NOT NULL, -- check, bank_transfer, credit_card, cash, other
  reference_number TEXT,
  notes TEXT,
  recorded_by TEXT,
  recorded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES ar_invoices (id)
);
```

#### Accounts Payable (حساب‌های پرداختنی)
```sql
CREATE TABLE ap_bills (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_number TEXT UNIQUE NOT NULL,
  vendor_id INTEGER,
  vendor_name TEXT NOT NULL,
  vendor_email TEXT,
  vendor_phone TEXT,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  po_number TEXT,
  subtotal DECIMAL(15,2) NOT NULL,
  tax_amount DECIMAL(15,2) DEFAULT 0,
  total_amount DECIMAL(15,2) NOT NULL,
  paid_amount DECIMAL(15,2) DEFAULT 0,
  balance_due DECIMAL(15,2) NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, received, approved, partially_paid, paid, overdue, cancelled
  payment_terms TEXT DEFAULT 'Net 30',
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ap_bill_line_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_price DECIMAL(15,2) NOT NULL,
  tax_rate DECIMAL(5,2) DEFAULT 0,
  line_total DECIMAL(15,2) NOT NULL,
  FOREIGN KEY (bill_id) REFERENCES ap_bills (id) ON DELETE CASCADE
);

CREATE TABLE ap_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bill_id INTEGER NOT NULL,
  bill_number TEXT NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  payment_method TEXT NOT NULL,
  reference_number TEXT,
  notes TEXT,
  recorded_by TEXT,
  recorded_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bill_id) REFERENCES ap_bills (id)
);
```

#### Bank Reconciliation (تطبیق بانکی)
```sql
CREATE TABLE bank_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  currency TEXT DEFAULT 'IRR',
  current_balance DECIMAL(15,2) DEFAULT 0,
  gl_account_code TEXT,
  last_reconciliation_date DATE,
  reconciliation_status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bank_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bank_account_id INTEGER NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  debit DECIMAL(15,2) DEFAULT 0,
  credit DECIMAL(15,2) DEFAULT 0,
  balance DECIMAL(15,2),
  type TEXT NOT NULL, -- deposit, withdrawal, fee, interest, other
  matched BOOLEAN DEFAULT 0,
  matched_to TEXT,
  reconciled BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bank_account_id) REFERENCES bank_accounts (id)
);

CREATE TABLE reconciliations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  statement_date DATE NOT NULL,
  statement_balance DECIMAL(15,2) NOT NULL,
  gl_balance DECIMAL(15,2) NOT NULL,
  reconciled_balance DECIMAL(15,2) NOT NULL,
  outstanding_deposits DECIMAL(15,2) DEFAULT 0,
  outstanding_checks DECIMAL(15,2) DEFAULT 0,
  bank_fees DECIMAL(15,2) DEFAULT 0,
  interest_earned DECIMAL(15,2) DEFAULT 0,
  variance DECIMAL(15,2) DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, completed, rejected
  notes TEXT,
  created_by TEXT,
  created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_date DATETIME,
  FOREIGN KEY (account_id) REFERENCES bank_accounts (id)
);
```

#### Voucher Templates (قالب‌های سند)
```sql
CREATE TABLE voucher_templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  name_fa TEXT NOT NULL,
  voucher_type TEXT NOT NULL, -- check, receipt, payment, debit_note, credit_note
  number_sequence TEXT NOT NULL,
  last_number INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2. API Endpoints پیشنهادی

#### Chart of Accounts
- `GET /api/admin/accounts` - لیست حساب‌ها
- `GET /api/admin/accounts/:id` - جزئیات حساب
- `POST /api/admin/accounts` - ایجاد حساب جدید
- `PUT /api/admin/accounts/:id` - ویرایش حساب
- `DELETE /api/admin/accounts/:id` - حذف حساب
- `GET /api/admin/accounts/:id/balance` - موجودی حساب
- `GET /api/admin/accounts/tree` - درخت حساب‌ها

#### Journal Entries
- `GET /api/admin/journal-entries` - لیست دفاتر
- `GET /api/admin/journal-entries/:id` - جزئیات دفتر
- `POST /api/admin/journal-entries` - ایجاد دفتر جدید
- `PUT /api/admin/journal-entries/:id` - ویرایش دفتر
- `POST /api/admin/journal-entries/:id/post` - ثبت دفتر
- `POST /api/admin/journal-entries/:id/void` - لغو دفتر
- `POST /api/admin/journal-entries/:id/approve` - تأیید دفتر

#### General Ledger
- `GET /api/admin/general-ledger` - لیست تراکنش‌های دفتر کل
- `GET /api/admin/general-ledger/account/:code` - تراکنش‌های یک حساب
- `GET /api/admin/general-ledger/report` - گزارش دفتر کل
- `GET /api/admin/trial-balance` - میزان آزمایشی

#### Accounts Receivable
- `GET /api/admin/ar/invoices` - لیست فاکتورها
- `GET /api/admin/ar/invoices/:id` - جزئیات فاکتور
- `POST /api/admin/ar/invoices` - ایجاد فاکتور
- `PUT /api/admin/ar/invoices/:id` - ویرایش فاکتور
- `POST /api/admin/ar/invoices/:id/send` - ارسال فاکتور
- `GET /api/admin/ar/payments` - لیست پرداخت‌ها
- `POST /api/admin/ar/payments` - ثبت پرداخت
- `GET /api/admin/ar/aging` - تحلیل سن حساب‌ها

#### Accounts Payable
- `GET /api/admin/ap/bills` - لیست فاکتورهای فروشندگان
- `GET /api/admin/ap/bills/:id` - جزئیات فاکتور
- `POST /api/admin/ap/bills` - ایجاد فاکتور
- `PUT /api/admin/ap/bills/:id` - ویرایش فاکتور
- `POST /api/admin/ap/bills/:id/approve` - تأیید فاکتور
- `GET /api/admin/ap/payments` - لیست پرداخت‌ها
- `POST /api/admin/ap/payments` - ثبت پرداخت
- `GET /api/admin/ap/aging` - تحلیل سن حساب‌ها

#### Bank Reconciliation
- `GET /api/admin/bank/accounts` - لیست حساب‌های بانکی
- `POST /api/admin/bank/accounts` - ایجاد حساب بانکی
- `GET /api/admin/bank/accounts/:id/transactions` - تراکنش‌های حساب
- `POST /api/admin/bank/transactions` - افزودن تراکنش بانکی
- `POST /api/admin/bank/match` - تطابق تراکنش‌ها
- `POST /api/admin/bank/reconcile` - تکمیل تطابق
- `GET /api/admin/bank/reconciliations` - سابقه تطابق‌ها

#### Financial Reports
- `GET /api/admin/reports/income-statement` - صورت سود و زیان
- `GET /api/admin/reports/balance-sheet` - ترازنامه
- `GET /api/admin/reports/cash-flow` - جریان نقد
- `GET /api/admin/reports/metrics` - شاخص‌های مالی
- `GET /api/admin/reports/profit-loss` - سود و زیان
- `GET /api/admin/reports/budget-vs-actual` - بودجه در مقابل واقعی

### 3. Business Logic پیشنهادی

#### Auto-Posting از Orders
- هنگام ثبت سفارش → ایجاد Journal Entry خودکار
- هنگام صدور فاکتور → ایجاد AR Invoice و Journal Entry
- هنگام دریافت پرداخت → به‌روزرسانی AR و Journal Entry

#### Auto-Posting از Procurement
- هنگام ثبت خرید → ایجاد AP Bill و Journal Entry
- هنگام پرداخت به فروشنده → به‌روزرسانی AP و Journal Entry

#### محاسبه خودکار موجودی حساب‌ها
- پس از هر Journal Entry → به‌روزرسانی موجودی حساب‌ها
- محاسبه Trial Balance به صورت Real-time

#### Aging Analysis خودکار
- محاسبه سن حساب‌های دریافتنی/پرداختنی
- هشدار برای حساب‌های سررسید شده

---

## 🎨 پیشنهادات Frontend

### 1. بهبودهای UI/UX

#### Dashboard مالی
- کارت‌های آماری Real-time:
  - موجودی نقد
  - حساب‌های دریافتنی
  - حساب‌های پرداختنی
  - سود/زیان ماه جاری
  - نمودارهای تعاملی (Recharts)
  
#### Chart of Accounts
- نمایش درختی حساب‌ها (Tree View)
- Drag & Drop برای تغییر ساختار
- فیلتر پیشرفته
- جستجوی سریع
- Export به Excel/PDF

#### Journal Entries
- Template برای دفاتر تکراری
- کپی از دفتر قبلی
- پیش‌نمایش قبل از ثبت
- اعتبارسنجی Real-time (برابری بدهکار/بستانکار)
- تاریخچه تغییرات

#### Financial Reports
- فیلترهای پیشرفته (تاریخ، حساب، دوره)
- Export به PDF/Excel
- چاپ حرفه‌ای
- نمودارهای تعاملی
- مقایسه دوره‌ای (ماه جاری vs ماه قبل)

### 2. ویژگی‌های پیشرفته

#### Approval Workflow
- سیستم تأیید چندمرحله‌ای
- اعلان‌ها برای تأییدکنندگان
- تاریخچه تأییدها
- رد با دلیل

#### Budget Management
- تعریف بودجه برای حساب‌ها
- مقایسه بودجه با واقعی
- هشدار برای انحراف از بودجه
- گزارش Variance

#### Multi-Currency
- پشتیبانی از چند ارز
- نرخ تبدیل خودکار
- گزارش‌های چند ارزی

#### Cost Centers & Departments
- تخصیص هزینه به مراکز هزینه
- گزارش‌های تفکیک شده
- بودجه‌بندی بر اساس دپارتمان

#### Recurring Transactions
- تراکنش‌های تکراری (حقوق، اجاره، ...)
- زمان‌بندی خودکار
- اعلان قبل از اجرا

#### Document Attachments
- آپلود فایل‌های مرتبط
- پیوست به Journal Entries
- پیوست به Invoices/Bills

### 3. گزارش‌های پیشنهادی

#### گزارش‌های استاندارد
1. **Trial Balance** - میزان آزمایشی
2. **Income Statement** - صورت سود و زیان
3. **Balance Sheet** - ترازنامه
4. **Cash Flow Statement** - جریان نقد
5. **Aging Report** - تحلیل سن حساب‌ها
6. **Profit & Loss** - سود و زیان
7. **General Ledger Report** - گزارش دفتر کل

#### گزارش‌های تحلیلی
1. **Budget vs Actual** - بودجه در مقابل واقعی
2. **Trend Analysis** - تحلیل روند
3. **Department Performance** - عملکرد دپارتمان‌ها
4. **Product Profitability** - سودآوری محصولات
5. **Customer Profitability** - سودآوری مشتریان
6. **Vendor Analysis** - تحلیل فروشندگان

### 4. امنیت و دسترسی

#### Role-Based Access Control
- تعریف نقش‌ها (Accountant, CFO, Manager, ...)
- دسترسی‌های تفکیک شده
- Audit Log برای تمام تغییرات

#### Audit Trail
- ثبت تمام تغییرات
- چه کسی، چه زمانی، چه تغییری
- امکان Rollback

---

## 🔗 یکپارچه‌سازی با ماژول‌های دیگر

### 1. اتصال Orders → Accounting
- هنگام ثبت سفارش → Journal Entry خودکار
- هنگام صدور فاکتور → AR Invoice
- هنگام دریافت پرداخت → Payment Record

### 2. اتصال Procurement → Accounting
- هنگام ثبت خرید → AP Bill
- هنگام پرداخت → Payment Record

### 3. اتصال Inventory → Accounting
- هنگام ورود کالا → Journal Entry
- هنگام خروج کالا → COGS Entry
- موجودی پایان دوره → Adjustment Entry

### 4. اتصال HR → Accounting
- حقوق و دستمزد → Journal Entry خودکار
- هزینه‌های پرسنلی → Expense Entry

---

## 📈 اولویت‌بندی پیاده‌سازی

### فاز 1 (ضروری)
1. ✅ ایجاد جداول دیتابیس
2. ✅ API endpoints پایه
3. ✅ اتصال Frontend به Backend
4. ✅ Chart of Accounts با دیتابیس
5. ✅ Journal Entries با دیتابیس

### فاز 2 (مهم)
1. ✅ General Ledger
2. ✅ Trial Balance
3. ✅ Accounts Receivable کامل
4. ✅ Accounts Payable کامل
5. ✅ اتصال Orders → Accounting

### فاز 3 (پیشرفته)
1. ✅ Bank Reconciliation
2. ✅ Financial Reports
3. ✅ Approval Workflow
4. ✅ Budget Management
5. ✅ Multi-Currency

### فاز 4 (اختیاری)
1. ⏳ Cost Centers
2. ⏳ Recurring Transactions
3. ⏳ Document Attachments
4. ⏳ Advanced Analytics
5. ⏳ Mobile App

---

## 🛠️ تکنولوژی‌های پیشنهادی

### Backend
- **Database**: SQLite (فعلی) → PostgreSQL (توصیه برای Production)
- **Validation**: Zod (موجود)
- **API**: Express (موجود)

### Frontend
- **Charts**: Recharts (موجود)
- **PDF Export**: jsPDF یا PDFKit
- **Excel Export**: xlsx
- **Date Picker**: react-day-picker (موجود)
- **Form Validation**: react-hook-form + zod (موجود)

---

## 📝 نکات مهم

1. **دقت محاسبات**: استفاده از Decimal برای مبالغ مالی
2. **Audit Trail**: ثبت تمام تغییرات
3. **Backup**: پشتیبان‌گیری منظم
4. **Security**: رمزگذاری داده‌های حساس
5. **Performance**: Indexing مناسب برای جداول
6. **Compliance**: رعایت استانداردهای حسابداری

---

## 🎯 نتیجه‌گیری

با پیاده‌سازی این پیشنهادات، سیستم مالی شما:
- ✅ کاملاً یکپارچه با سایر ماژول‌ها خواهد بود
- ✅ گزارش‌های دقیق و Real-time ارائه می‌دهد
- ✅ استانداردهای حسابداری را رعایت می‌کند
- ✅ قابلیت‌های پیشرفته برای مدیریت مالی دارد

