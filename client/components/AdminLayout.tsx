import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  Home
} from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t, dir } = useLanguage();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Categories', href: '/admin/categories', icon: Package },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const isCurrentPath = (path: string) => {
    if (path === '/admin' && location.pathname === '/admin') return true;
    if (path !== '/admin' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${dir === 'rtl' ? 'rtl' : 'ltr'}`} dir={dir}>
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black opacity-50" onClick={() => setSidebarOpen(false)}></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full' : '-translate-x-full'
      } ${dir === 'rtl' ? 'right-0' : 'left-0'}`}>
        
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link to="/admin" className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full opacity-90"></div>
            </div>
            <span className={`${dir === 'rtl' ? 'mr-3' : 'ml-3'} text-xl font-bold text-gray-900`}>
              Admin Panel
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

        <nav className="mt-8 px-4">
          <div className="space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isCurrentPath(item.href)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className={`flex-shrink-0 w-5 h-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <Link
              to="/"
              className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900"
            >
              <Home className={`flex-shrink-0 w-5 h-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
              Back to Website
            </Link>
            
            <button
              onClick={handleLogout}
              className="w-full group flex items-center px-3 py-2 text-sm font-medium text-red-600 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors"
            >
              <LogOut className={`flex-shrink-0 w-5 h-5 ${dir === 'rtl' ? 'ml-3' : 'mr-3'}`} />
              {language === 'fa' ? 'خروج' : 'Logout'}
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
                
                <h1 className={`${dir === 'rtl' ? 'mr-4' : 'ml-4'} text-2xl font-semibold text-gray-900`}>
                  Admin Dashboard
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user?.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium text-gray-900">
                      {language === 'fa' ? 'خوش آمدید' : 'Welcome'}, {user?.username}
                    </div>
                    <div className="text-xs text-gray-500">
                      {language === 'fa' ? 'مدیر سیستم' : 'System Administrator'}
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
