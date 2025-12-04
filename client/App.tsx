import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./components/NotificationSystem";
import HeaderNew from "./components/HeaderNew";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import WhatsAppWidget from "./components/WhatsAppWidget";
import LiveChat from "./components/LiveChat";
import PlaceholderPage from "./components/PlaceholderPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Search from "./pages/Search";
import SearchSimple from "./pages/SearchSimple";
import SearchAdvanced from "./pages/SearchAdvanced";
import ProductComparison from "./pages/ProductComparison";
import Blog from "./pages/Blog";
import Consultation from "./pages/Consultation";
import FAQ from "./pages/FAQ";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/UserDashboard";
import OrderTracking from "./pages/OrderTracking";
import OrderSuccess from "./pages/OrderSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCategories from "./pages/admin/Categories";
import AdminCustomers from "./pages/admin/Customers";
import AdminSettings from "./pages/admin/Settings";
import AdminInventory from "./pages/admin/Inventory";
import AdminSEO from "./pages/admin/SEO";
import AdminAccounting from "./pages/admin/Accounting";
import AdminJournalEntries from "./pages/admin/JournalEntries";
import AdminFinancialReports from "./pages/admin/FinancialReports";
import AdminAccountsReceivable from "./pages/admin/AccountsReceivable";
import AdminAccountsPayable from "./pages/admin/AccountsPayable";
import AdminBankReconciliation from "./pages/admin/BankReconciliation";
import AdminHRManagement from "./pages/admin/HRManagement";
import AdminSalesAndCRM from "./pages/admin/SalesAndCRM";
import AdminProcurement from "./pages/admin/Procurement";
import ProductForm from "./pages/admin/ProductForm";
import MenuManagement from "./pages/admin/MenuManagement";
import AdminStorePages from "./pages/admin/StorePages";
import AdminDistribution from "./pages/admin/Distribution";
import AdminBlog from "./pages/admin/Blog";

const queryClient = new QueryClient();

// Suppress harmless recharts defaultProps warnings
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = String(args[0] || '');
    // Suppress recharts XAxis/YAxis defaultProps warnings from library
    if (message.includes('defaultProps') && (message.includes('XAxis') || message.includes('YAxis'))) {
      return;
    }
    // Also suppress by checking the component name in the full args
    const fullMessage = args.join(' ');
    if (fullMessage.includes('XAxis2') || fullMessage.includes('YAxis2')) {
      if (fullMessage.includes('defaultProps')) {
        return;
      }
    }
    originalWarn.apply(console, args as any);
  };
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <div className="min-h-screen flex flex-col">
                  <HeaderNew />
                  <CartDrawer />
                  <WhatsAppWidget />
                  <LiveChat />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<Index />} />

                      {/* Product Routes */}
                      <Route path="/products" element={<SearchSimple />} />
                      <Route path="/search" element={<SearchSimple />} />

                      <Route
                        path="/category/pumps"
                        element={
                          <PlaceholderPage
                            title="Pool Pumps"
                            description="Variable speed and single speed pumps for efficient water circulation."
                            suggestedAction="Our pump selection includes top brands like Pentair, Hayward, and Jandy."
                          />
                        }
                      />

                      <Route
                        path="/category/filters"
                        element={
                          <PlaceholderPage
                            title="Pool Filters"
                            description="Sand, cartridge, and DE filters for crystal clear pool water."
                            suggestedAction="Find the perfect filtration system for your pool size and needs."
                          />
                        }
                      />

                      <Route
                        path="/category/heaters"
                        element={
                          <PlaceholderPage
                            title="Pool Heaters"
                            description="Gas, electric, and heat pump heaters for year-round swimming."
                            suggestedAction="Extend your swimming season with our energy-efficient heating solutions."
                          />
                        }
                      />

                      <Route
                        path="/category/lights"
                        element={
                          <PlaceholderPage
                            title="Pool Lights"
                            description="LED and fiber optic lighting systems for stunning pool ambiance."
                            suggestedAction="Transform your pool with our professional lighting systems."
                          />
                        }
                      />

                      <Route
                        path="/category/chemicals"
                        element={
                          <PlaceholderPage
                            title="Pool Chemicals"
                            description="Professional-grade chemicals for perfect water balance."
                            suggestedAction="Maintain pristine water quality with our chemical treatment solutions."
                          />
                        }
                      />

                      <Route
                        path="/category/accessories"
                        element={
                          <PlaceholderPage
                            title="Pool Accessories"
                            description="Covers, cleaners, and maintenance tools for complete pool care."
                            suggestedAction="Complete your pool setup with our professional accessories."
                          />
                        }
                      />

                      {/* Individual Product Pages */}
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/compare" element={<ProductComparison />} />

                      {/* Customer Pages */}
                      <Route
                        path="/cart"
                        element={
                          <PlaceholderPage
                            title="Shopping Cart"
                            description="Review your selected items and proceed to checkout."
                            suggestedAction="Secure checkout with multiple payment options is being implemented."
                          />
                        }
                      />

                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-success" element={<OrderSuccess />} />

                      <Route
                        path="/account"
                        element={
                          <ProtectedRoute>
                            <UserDashboard />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="/track-order" element={<OrderTracking />} />
                      <Route
                        path="/track-order/:orderId"
                        element={<OrderTracking />}
                      />

                      {/* Content Pages */}
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:id" element={<Blog />} />

                      <Route
                        path="/contact"
                        element={
                          <PlaceholderPage
                            title="Contact Us"
                            description="Get in touch with our pool equipment experts."
                            suggestedAction="Multiple contact options including phone, email, and live chat coming soon."
                          />
                        }
                      />

                      <Route path="/consultation" element={<Consultation />} />

                      <Route
                        path="/best-sellers"
                        element={
                          <PlaceholderPage
                            title="Best Sellers"
                            description="Our most popular and trusted pool equipment."
                            suggestedAction="Discover why these products are favorites among pool professionals."
                          />
                        }
                      />

                      <Route
                        path="/bundles"
                        element={
                          <PlaceholderPage
                            title="Equipment Bundles"
                            description="Complete system packages at discounted prices."
                            suggestedAction="Save money with our professionally curated equipment bundles."
                          />
                        }
                      />

                      <Route path="/faq" element={<FAQ />} />

                      {/* Legal Pages */}
                      <Route
                        path="/privacy"
                        element={
                          <PlaceholderPage
                            title="Privacy Policy"
                            description="How we protect and handle your personal information."
                          />
                        }
                      />

                      <Route
                        path="/terms"
                        element={
                          <PlaceholderPage
                            title="Terms of Service"
                            description="Terms and conditions for using our services."
                          />
                        }
                      />

                      <Route
                        path="/shipping"
                        element={
                          <PlaceholderPage
                            title="Shipping Information"
                            description="Delivery options and shipping policies."
                          />
                        }
                      />

                      <Route
                        path="/returns"
                        element={
                          <PlaceholderPage
                            title="Returns & Exchanges"
                            description="Our return policy and exchange procedures."
                          />
                        }
                      />

                      <Route
                        path="/warranty"
                        element={
                          <PlaceholderPage
                            title="Warranty Information"
                            description="Product warranties and support coverage."
                          />
                        }
                      />

                      {/* Authentication Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Admin Routes */}
                      <Route
                        path="/admin"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/products"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminProducts />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/products/new"
                        element={
                          <ProtectedRoute requireAdmin>
                            <ProductForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/products/:id/edit"
                        element={
                          <ProtectedRoute requireAdmin>
                            <ProductForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/orders"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminOrders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/categories"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminCategories />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/customers"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminCustomers />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/menus"
                        element={
                          <ProtectedRoute requireAdmin>
                            <MenuManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/inventory"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminInventory />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/blog"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminBlog />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/seo"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminSEO />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/accounting"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminAccounting />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/journal-entries"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminJournalEntries />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/financial-reports"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminFinancialReports />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/accounts-receivable"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminAccountsReceivable />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/accounts-payable"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminAccountsPayable />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/bank-reconciliation"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminBankReconciliation />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/hr-management"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminHRManagement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/sales-crm"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminSalesAndCRM />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/distribution"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminDistribution />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/procurement"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminProcurement />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/store-pages"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminStorePages />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/admin/settings"
                        element={
                          <ProtectedRoute requireAdmin>
                            <AdminSettings />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
