import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handlePlaceholder } from "./routes/placeholder";
import { initializeDatabase, seedDatabase, initializeBlogTables } from "./database/init";
import {
  getProducts,
  getProduct,
  getCategories,
  getCategory,
  createProduct,
  updateProduct,
  deleteProduct
} from "./routes/products";
import {
  createOrder,
  getOrders,
  getOrder
} from "./routes/orders";
import {
  getShipments,
  getShipment,
  updateShipmentStatus,
  prepareShipmentItem,
  getInvoices
} from "./routes/distribution";
import {
  getAccounts,
  getAccount,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountBalance,
  getJournalEntries,
  getJournalEntry,
  createJournalEntry,
  updateJournalEntry,
  postJournalEntry,
  voidJournalEntry,
  getGeneralLedger,
  getTrialBalance
} from "./routes/accounting";
import {
  getARInvoices,
  getARInvoice,
  createARInvoice,
  createARPayment,
  getARAging
} from "./routes/ar";
import {
  getAPBills,
  getAPBill,
  createAPBill,
  createAPPayment,
  getAPAging
} from "./routes/ap";
import {
  getBlogPosts,
  getBlogPost,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  getBlogCategories,
  createBlogCategory
} from "./routes/blog";
import {
  aiCreateBlogPost,
  aiUpdateBlogPost,
  getAIKeys,
  createAIKey,
  getAIActivityLog,
  verifyAIKey
} from "./routes/ai";
import {
  getWarehouses,
  createWarehouse,
  updateWarehouse,
  getInventoryItems,
  getInventoryItem,
  createStockReceipt,
  createStockIssue,
  transferStock,
  getStockMovements,
  createInventoryReturn,
  updateInventoryReturn,
  getInventoryReturns
} from "./routes/inventory";

export function createServer() {
  const app = express();

  // Initialize database
  initializeDatabase()
    .then(() => seedDatabase())
    .then(() => initializeBlogTables())
    .then(() => console.log('Database initialized successfully'))
    .catch(err => console.error('Database initialization failed:', err));

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Placeholder image routes
  app.get("/api/placeholder/:width/:height", handlePlaceholder);

  // Product API routes
  app.get("/api/products", getProducts);
  app.get("/api/products/:id", getProduct);
  app.get("/api/categories", getCategories);
  app.get("/api/categories/:slug", getCategory);

  // Admin product routes (should be protected in production)
  app.post("/api/admin/products", createProduct);
  app.put("/api/admin/products/:id", updateProduct);
  app.delete("/api/admin/products/:id", deleteProduct);

  // Order routes
  app.post("/api/orders", createOrder);
  app.get("/api/admin/orders", getOrders);
  app.get("/api/admin/orders/:id", getOrder);

  // Distribution routes
  app.get("/api/admin/shipments", getShipments);
  app.get("/api/admin/shipments/:id", getShipment);
  app.put("/api/admin/shipments/:id", updateShipmentStatus);
  app.put("/api/admin/shipments/:shipmentId/items/:itemId", prepareShipmentItem);
  app.get("/api/admin/invoices", getInvoices);

  // Accounting routes - Chart of Accounts
  app.get("/api/admin/accounts", getAccounts);
  app.get("/api/admin/accounts/:id", getAccount);
  app.post("/api/admin/accounts", createAccount);
  app.put("/api/admin/accounts/:id", updateAccount);
  app.delete("/api/admin/accounts/:id", deleteAccount);
  app.get("/api/admin/accounts/:id/balance", getAccountBalance);

  // Accounting routes - Accounts Receivable
  app.get("/api/admin/ar/invoices", getARInvoices);
  app.get("/api/admin/ar/invoices/:id", getARInvoice);
  app.post("/api/admin/ar/invoices", createARInvoice);
  app.post("/api/admin/ar/payments", createARPayment);
  app.get("/api/admin/ar/aging", getARAging);

  // Accounting routes - Accounts Payable
  app.get("/api/admin/ap/bills", getAPBills);
  app.get("/api/admin/ap/bills/:id", getAPBill);
  app.post("/api/admin/ap/bills", createAPBill);
  app.post("/api/admin/ap/payments", createAPPayment);
  app.get("/api/admin/ap/aging", getAPAging);

  // Accounting routes - Journal Entries
  app.get("/api/admin/journal-entries", getJournalEntries);
  app.get("/api/admin/journal-entries/:id", getJournalEntry);
  app.post("/api/admin/journal-entries", createJournalEntry);
  app.put("/api/admin/journal-entries/:id", updateJournalEntry);
  app.post("/api/admin/journal-entries/:id/post", postJournalEntry);
  app.post("/api/admin/journal-entries/:id/void", voidJournalEntry);

  // Accounting routes - General Ledger
  app.get("/api/admin/general-ledger", getGeneralLedger);
  app.get("/api/admin/trial-balance", getTrialBalance);

  // Blog routes - Public
  app.get("/api/blog/posts", getBlogPosts);
  app.get("/api/blog/posts/:id", getBlogPost);

  // Blog routes - Admin
  app.get("/api/admin/blog/posts", getBlogPosts);
  app.post("/api/admin/blog/posts", createBlogPost);
  app.put("/api/admin/blog/posts/:id", updateBlogPost);
  app.delete("/api/admin/blog/posts/:id", deleteBlogPost);
  app.get("/api/admin/blog/categories", getBlogCategories);
  app.post("/api/admin/blog/categories", createBlogCategory);

  // AI API routes
  app.post("/api/ai/blog/posts", verifyAIKey, aiCreateBlogPost);
  app.put("/api/ai/blog/posts/:id", verifyAIKey, aiUpdateBlogPost);

  // AI Management routes - Admin
  app.get("/api/admin/ai/keys", getAIKeys);
  app.post("/api/admin/ai/keys", createAIKey);
  app.get("/api/admin/ai/activity", getAIActivityLog);

  // Inventory & Warehouse routes
  app.get("/api/admin/warehouses", getWarehouses);
  app.post("/api/admin/warehouses", createWarehouse);
  app.put("/api/admin/warehouses/:id", updateWarehouse);

  app.get("/api/admin/inventory/items", getInventoryItems);
  app.get("/api/admin/inventory/items/:id", getInventoryItem);
  app.get("/api/admin/inventory/movements", getStockMovements);
  app.post("/api/admin/inventory/movements/inbound", createStockReceipt);
  app.post("/api/admin/inventory/movements/outbound", createStockIssue);
  app.post("/api/admin/inventory/movements/transfer", transferStock);

  app.post("/api/admin/inventory/returns", createInventoryReturn);
  app.put("/api/admin/inventory/returns/:id", updateInventoryReturn);
  app.get("/api/admin/inventory/returns", getInventoryReturns);

  return app;
}
