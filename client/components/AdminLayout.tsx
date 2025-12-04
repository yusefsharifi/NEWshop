import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Home,
  ChevronDown,
  DollarSign,
  Warehouse,
  Truck,
  FileText,
} from "lucide-react";
import { Button } from "./ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, dir, language } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    inventory: true,
    sales: true,
    finance: true,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  interface MenuItem {
    name_en: string;
    name_fa: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }

  interface MenuSection {
    id: string;
    name_en: string;
    name_fa: string;
    icon: React.ComponentType<{ className?: string }>;
    items: MenuItem[];
  }

  const navigationSections: MenuSection[] = [
    {
      id: "main",
      name_en: "Main",
      name_fa: "اصلی",
      icon: BarChart3,
      items: [
        {
          name_en: "Dashboard",
          name_fa: "داشبورد",
          href: "/admin",
          icon: BarChart3,
        },
      ],
    },
    {
      id: "inventory",
      name_en: "Inventory & Products",
      name_fa: "انبار و محصولات",
      icon: Warehouse,
      items: [
        {
          name_en: "Inventory",
          name_fa: "انبار",
          href: "/admin/inventory",
          icon: Package,
        },
        {
          name_en: "Products",
          name_fa: "محصولات",
          href: "/admin/products",
          icon: Package,
        },
        {
          name_en: "Categories",
          name_fa: "دسته‌بندی‌ها",
          href: "/admin/categories",
          icon: Package,
        },
        {
          name_en: "Procurement",
          name_fa: "خرید و تدارکات",
          href: "/admin/procurement",
          icon: Package,
        },
      ],
    },
    {
      id: "sales",
      name_en: "Sales & Customers",
      name_fa: "فروش و مشتریان",
      icon: ShoppingCart,
      items: [
        {
          name_en: "Orders",
          name_fa: "سفارشات",
          href: "/admin/orders",
          icon: ShoppingCart,
        },
        {
          name_en: "Customers",
          name_fa: "مشتریان",
          href: "/admin/customers",
          icon: Users,
        },
        {
          name_en: "Sales & CRM",
          name_fa: "فروش و CRM",
          href: "/admin/sales-crm",
          icon: BarChart3,
        },
        {
          name_en: "Distribution & Shipping",
          name_fa: "ارسال و توزیع",
          href: "/admin/distribution",
          icon: Truck,
        },
      ],
    },
    {
      id: "finance",
      name_en: "Finance & Accounting",
      name_fa: "مالی و حسابداری",
      icon: DollarSign,
      items: [
        {
          name_en: "Accounting",
          name_fa: "حسابداری",
          href: "/admin/accounting",
          icon: BarChart3,
        },
        {
          name_en: "Journal Entries",
          name_fa: "دفاتر روزنامه",
          href: "/admin/journal-entries",
          icon: Settings,
        },
        {
          name_en: "Accounts Receivable",
          name_fa: "حساب‌های دریافتی",
          href: "/admin/accounts-receivable",
          icon: BarChart3,
        },
        {
          name_en: "Accounts Payable",
          name_fa: "حساب‌های پرداختی",
          href: "/admin/accounts-payable",
          icon: BarChart3,
        },
        {
          name_en: "Bank Reconciliation",
          name_fa: "تطبیق بانکی",
          href: "/admin/bank-reconciliation",
          icon: BarChart3,
        },
        {
          name_en: "Financial Reports",
          name_fa: "گزارشات مالی",
          href: "/admin/financial-reports",
          icon: BarChart3,
        },
      ],
    },
    {
      id: "settings",
      name_en: "Settings & Other",
      name_fa: "تنظیمات و سایر",
      icon: Settings,
      items: [
        {
          name_en: "HR Management",
          name_fa: "منابع انسانی",
          href: "/admin/hr-management",
          icon: Users,
        },
        {
          name_en: "Menu Management",
          name_fa: "مدیریت منو",
          href: "/admin/menus",
          icon: Settings,
        },
        {
          name_en: "Store Pages",
          name_fa: "صفحات فروشگاه",
          href: "/admin/store-pages",
          icon: BarChart3,
        },
        {
          name_en: "Blog Management",
          name_fa: "مدیریت بلاگ",
          href: "/admin/blog",
          icon: FileText,
        },
        {
          name_en: "SEO",
          name_fa: "سئو",
          href: "/admin/seo",
          icon: Settings,
        },
        {
          name_en: "Settings",
          name_fa: "تن��یمات",
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
  ];

  const isCurrentPath = (path: string) => {
    if (path === "/admin" && location.pathname === "/admin") return true;
    if (path !== "/admin" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div
      className={`min-h-screen bg-gray-100 ${dir === "rtl" ? "rtl" : "ltr"}`}
      dir={dir}
    >
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen
            ? "translate-x-0"
            : dir === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        } ${dir === "rtl" ? "right-0" : "left-0"}`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full opacity-90"></div>
            </div>
            <span
              className={`${dir === "rtl" ? "mr-3" : "ml-3"} text-xl font-bold text-gray-900`}
            >
              {language === "fa" ? "پنل مدیریت" : "Admin Panel"}
            </span>
          </Link>

          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="mt-8 px-4 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 200px)" }}>
          {navigationSections.map((section) => (
            <div key={section.id}>
              {section.id === "main" ? (
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        isCurrentPath(item.href)
                          ? "bg-blue-100 text-blue-700"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`flex-shrink-0 w-5 h-5 ${dir === "rtl" ? "ml-3" : "mr-3"}`}
                      />
                      {language === "fa" ? item.name_fa : item.name_en}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <div className="flex items-center">
                      <section.icon
                        className={`flex-shrink-0 w-5 h-5 ${dir === "rtl" ? "ml-3" : "mr-3"}`}
                      />
                      {language === "fa" ? section.name_fa : section.name_en}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${expandedSections[section.id] ? "rotate-180" : ""}`}
                    />
                  </button>

                  {expandedSections[section.id] && (
                    <div className="mt-2 space-y-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            isCurrentPath(item.href)
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          } ${dir === "rtl" ? "pr-2" : "pl-2"}`}
                        >
                          <item.icon
                            className={`flex-shrink-0 w-4 h-4 ${dir === "rtl" ? "ml-3" : "mr-3"}`}
                          />
                          {language === "fa" ? item.name_fa : item.name_en}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
            >
              <Home
                className={`flex-shrink-0 w-5 h-5 ${dir === "rtl" ? "ml-3" : "mr-3"}`}
              />
              {language === "fa" ? "بازگشت به سایت" : "Back to Website"}
            </Link>

            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut
                className={`flex-shrink-0 w-5 h-5 ${dir === "rtl" ? "ml-3" : "mr-3"}`}
              />
              {language === "fa" ? "خروج" : "Logout"}
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {language === "fa" ? "خوش آمدید" : "Welcome"},{" "}
                      {user?.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === "fa"
                        ? "مدیر سیستم"
                        : "System Administrator"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
