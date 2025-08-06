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
import Header from "./components/Header";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import WhatsAppWidget from "./components/WhatsAppWidget";
import PlaceholderPage from "./components/PlaceholderPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import Search from "./pages/Search";
import Login from "./pages/Login";
import OrderSuccess from "./pages/OrderSuccess";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCategories from "./pages/admin/Categories";
import AdminCustomers from "./pages/admin/Customers";
import AdminSettings from "./pages/admin/Settings";
import ProductForm from "./pages/admin/ProductForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <CartDrawer />
            <WhatsAppWidget />
            <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Product Routes */}
              <Route path="/products" element={<Search />} />
              <Route path="/search" element={<Search />} />

              <Route path="/category/pumps" element={
                <PlaceholderPage
                  title="Pool Pumps"
                  description="Variable speed and single speed pumps for efficient water circulation."
                  suggestedAction="Our pump selection includes top brands like Pentair, Hayward, and Jandy."
                />
              } />

              <Route path="/category/filters" element={
                <PlaceholderPage
                  title="Pool Filters"
                  description="Sand, cartridge, and DE filters for crystal clear pool water."
                  suggestedAction="Find the perfect filtration system for your pool size and needs."
                />
              } />

              <Route path="/category/heaters" element={
                <PlaceholderPage
                  title="Pool Heaters"
                  description="Gas, electric, and heat pump heaters for year-round swimming."
                  suggestedAction="Extend your swimming season with our energy-efficient heating solutions."
                />
              } />

              <Route path="/category/lights" element={
                <PlaceholderPage
                  title="Pool Lights"
                  description="LED and fiber optic lighting systems for stunning pool ambiance."
                  suggestedAction="Transform your pool with our professional lighting systems."
                />
              } />

              <Route path="/category/chemicals" element={
                <PlaceholderPage
                  title="Pool Chemicals"
                  description="Professional-grade chemicals for perfect water balance."
                  suggestedAction="Maintain pristine water quality with our chemical treatment solutions."
                />
              } />

              <Route path="/category/accessories" element={
                <PlaceholderPage
                  title="Pool Accessories"
                  description="Covers, cleaners, and maintenance tools for complete pool care."
                  suggestedAction="Complete your pool setup with our professional accessories."
                />
              } />

              {/* Individual Product Pages */}
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* Customer Pages */}
              <Route path="/cart" element={
                <PlaceholderPage
                  title="Shopping Cart"
                  description="Review your selected items and proceed to checkout."
                  suggestedAction="Secure checkout with multiple payment options is being implemented."
                />
              } />

              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success" element={<OrderSuccess />} />

              <Route path="/account" element={
                <PlaceholderPage
                  title="Customer Account"
                  description="Manage your orders, preferences, and account information."
                  suggestedAction="Customer dashboard with order tracking and reorder functionality coming soon."
                />
              } />

              <Route path="/track-order" element={
                <PlaceholderPage
                  title="Track Your Order"
                  description="Real-time tracking information for your pool equipment orders."
                  suggestedAction="Enter your order number to get real-time shipping updates."
                />
              } />

              {/* Content Pages */}
              <Route path="/blog" element={
                <PlaceholderPage
                  title="Pool Care Blog"
                  description="Expert tips, maintenance guides, and industry insights."
                  suggestedAction="Our pool professionals are preparing comprehensive guides and tips."
                />
              } />

              <Route path="/contact" element={
                <PlaceholderPage
                  title="Contact Us"
                  description="Get in touch with our pool equipment experts."
                  suggestedAction="Multiple contact options including phone, email, and live chat coming soon."
                />
              } />

              <Route path="/consultation" element={
                <PlaceholderPage
                  title="Free Consultation"
                  description="Schedule a personalized consultation with our pool experts."
                  suggestedAction="Book your free consultation to get expert recommendations for your pool."
                />
              } />

              <Route path="/best-sellers" element={
                <PlaceholderPage
                  title="Best Sellers"
                  description="Our most popular and trusted pool equipment."
                  suggestedAction="Discover why these products are favorites among pool professionals."
                />
              } />

              <Route path="/bundles" element={
                <PlaceholderPage
                  title="Equipment Bundles"
                  description="Complete system packages at discounted prices."
                  suggestedAction="Save money with our professionally curated equipment bundles."
                />
              } />

              <Route path="/faq" element={
                <PlaceholderPage
                  title="Frequently Asked Questions"
                  description="Answers to common questions about pool equipment and maintenance."
                  suggestedAction="Our FAQ section will cover installation, maintenance, and troubleshooting."
                />
              } />

              {/* Legal Pages */}
              <Route path="/privacy" element={
                <PlaceholderPage
                  title="Privacy Policy"
                  description="How we protect and handle your personal information."
                />
              } />

              <Route path="/terms" element={
                <PlaceholderPage
                  title="Terms of Service"
                  description="Terms and conditions for using our services."
                />
              } />

              <Route path="/shipping" element={
                <PlaceholderPage
                  title="Shipping Information"
                  description="Delivery options and shipping policies."
                />
              } />

              <Route path="/returns" element={
                <PlaceholderPage
                  title="Returns & Exchanges"
                  description="Our return policy and exchange procedures."
                />
              } />

              <Route path="/warranty" element={
                <PlaceholderPage
                  title="Warranty Information"
                  description="Product warranties and support coverage."
                />
              } />

              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />

              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin/products" element={
                <ProtectedRoute requireAdmin>
                  <AdminProducts />
                </ProtectedRoute>
              } />
              <Route path="/admin/products/new" element={
                <ProtectedRoute requireAdmin>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/products/:id/edit" element={
                <ProtectedRoute requireAdmin>
                  <ProductForm />
                </ProtectedRoute>
              } />
              <Route path="/admin/orders" element={
                <ProtectedRoute requireAdmin>
                  <AdminOrders />
                </ProtectedRoute>
              } />
              <Route path="/admin/categories" element={
                <ProtectedRoute requireAdmin>
                  <AdminCategories />
                </ProtectedRoute>
              } />
              <Route path="/admin/customers" element={
                <ProtectedRoute requireAdmin>
                  <AdminCustomers />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute requireAdmin>
                  <AdminSettings />
                </ProtectedRoute>
              } />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
          </TooltipProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
