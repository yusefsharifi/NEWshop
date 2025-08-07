import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Menu, 
  X, 
  Phone, 
  User, 
  Globe, 
  Settings, 
  LogOut, 
  Shield, 
  ChevronDown 
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationBell } from './NotificationSystem';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface MenuItem {
  id: number;
  name_en: string;
  name_fa: string;
  url: string;
  target: '_self' | '_blank';
  icon?: string;
  parent_id?: number;
  order: number;
  is_active: boolean;
  is_dropdown: boolean;
  children?: MenuItem[];
}

export default function HeaderNew() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [hoveredMenu, setHoveredMenu] = useState<number | null>(null);
  const { language, setLanguage, t, dir } = useLanguage();
  const { setIsOpen, itemCount } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    // Mock data - در پروژه واقعی از API دریافت می‌شود
    const mockData: MenuItem[] = [
      {
        id: 1,
        name_en: 'Products',
        name_fa: 'محصولات',
        url: '/products',
        target: '_self',
        icon: 'Package',
        order: 1,
        is_active: true,
        is_dropdown: true,
        children: [
          {
            id: 2,
            name_en: 'Pool Pumps',
            name_fa: 'پمپ‌های استخر',
            url: '/category/pumps',
            target: '_self',
            parent_id: 1,
            order: 1,
            is_active: true,
            is_dropdown: false
          },
          {
            id: 3,
            name_en: 'Filters',
            name_fa: 'فیلترها',
            url: '/category/filters',
            target: '_self',
            parent_id: 1,
            order: 2,
            is_active: true,
            is_dropdown: false
          },
          {
            id: 4,
            name_en: 'Heaters',
            name_fa: 'بخاری‌ها',
            url: '/category/heaters',
            target: '_self',
            parent_id: 1,
            order: 3,
            is_active: true,
            is_dropdown: false
          },
          {
            id: 7,
            name_en: 'Pool Lights',
            name_fa: 'چراغ‌های استخر',
            url: '/category/lights',
            target: '_self',
            parent_id: 1,
            order: 4,
            is_active: true,
            is_dropdown: false
          },
          {
            id: 8,
            name_en: 'Chemicals',
            name_fa: 'مواد شیمیایی',
            url: '/category/chemicals',
            target: '_self',
            parent_id: 1,
            order: 5,
            is_active: true,
            is_dropdown: false
          },
          {
            id: 9,
            name_en: 'Accessories',
            name_fa: 'لوازم جانبی',
            url: '/category/accessories',
            target: '_self',
            parent_id: 1,
            order: 6,
            is_active: true,
            is_dropdown: false
          }
        ]
      },
      {
        id: 5,
        name_en: 'Blog',
        name_fa: 'وبلاگ',
        url: '/blog',
        target: '_self',
        icon: 'FileText',
        order: 2,
        is_active: true,
        is_dropdown: false
      },
      {
        id: 6,
        name_en: 'Contact',
        name_fa: 'تماس با ما',
        url: '/contact',
        target: '_self',
        icon: 'Phone',
        order: 3,
        is_active: true,
        is_dropdown: false
      }
    ];
    setMenuItems(mockData);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50" dir={dir}>
      {/* Top bar */}
      <div className="bg-navy-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-6' : 'space-x-6'}`}>
              <span className="flex items-center">
                <Phone className={`w-4 h-4 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
                {t('header.phone')}
              </span>
              <span>{t('header.freeShipping')}</span>
            </div>
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
              {/* Language Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:text-blue-300">
                    <Globe className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'فا' : 'EN'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    🇺🇸 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('fa')}>
                    🇮🇷 فارسی
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to="/account" className="hover:text-blue-300 transition-colors">
                {t('header.myAccount')}
              </Link>
              <Link to="/track-order" className="hover:text-blue-300 transition-colors">
                {t('header.trackOrder')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full opacity-90"></div>
              </div>
              <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                <h1 className="text-2xl font-bold text-navy-900">
                  {language === 'fa' ? 'آکواپرو' : 'AquaPro'}
                </h1>
                <p className="text-sm text-gray-600">{t('footer.company')}</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation with Dropdown Support */}
          <nav className={`hidden lg:flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            {menuItems
              .filter(item => item.is_active)
              .sort((a, b) => a.order - b.order)
              .map(item => (
                <div 
                  key={item.id} 
                  className="relative group"
                  onMouseEnter={() => setHoveredMenu(item.id)}
                  onMouseLeave={() => setHoveredMenu(null)}
                >
                  {item.is_dropdown ? (
                    <button className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors font-medium">
                      <span>{language === 'fa' ? item.name_fa : item.name_en}</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  ) : (
                    <Link 
                      to={item.url}
                      target={item.target}
                      className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
                    >
                      {language === 'fa' ? item.name_fa : item.name_en}
                    </Link>
                  )}
                  
                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {item.is_dropdown && item.children && hoveredMenu === item.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full ${dir === 'rtl' ? 'right-0' : 'left-0'} mt-2 w-64 bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden z-50`}
                      >
                        <div className="py-2">
                          {item.children
                            .filter(child => child.is_active)
                            .sort((a, b) => a.order - b.order)
                            .map(child => (
                              <Link
                                key={child.id}
                                to={child.url}
                                target={child.target}
                                className="block px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              >
                                <div className="font-medium">
                                  {language === 'fa' ? child.name_fa : child.name_en}
                                </div>
                              </Link>
                            ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder={t('header.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                dir={dir}
              />
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
            </form>
          </div>

          {/* Right side actions */}
          <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            {/* User Authentication */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`hidden md:flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'} text-gray-700 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors`}
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold">{user?.username}</div>
                      <div className="text-xs text-gray-500">
                        {user?.role === 'admin' ? (language === 'fa' ? 'ادمین' : 'Admin') : (language === 'fa' ? 'کاربر' : 'User')}
                      </div>
                    </div>
                  </motion.button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <User className="w-4 h-4 mr-2" />
                      {language === 'fa' ? 'حساب کاربری' : 'My Account'}
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <Shield className="w-4 h-4 mr-2" />
                        {language === 'fa' ? 'پنل مدیریت' : 'Admin Panel'}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      {language === 'fa' ? 'تنظیمات' : 'Settings'}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'خروج' : 'Sign Out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`hidden md:flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'} text-gray-700 hover:text-blue-600`}
                  >
                    <User className="w-5 h-5" />
                    <span>{t('header.login')}</span>
                  </Button>
                </motion.div>
              </Link>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="relative"
            >
              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'} text-gray-700 hover:text-blue-600`}
              >
                <motion.div
                  animate={itemCount > 0 ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <ShoppingCart className="w-5 h-5" />
                </motion.div>
                <span className="hidden sm:inline">{t('header.cart')}</span>
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className={`absolute -top-2 ${dir === 'rtl' ? '-left-2' : '-right-2'} bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center shadow-lg`}
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder={t('header.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              dir={dir}
            />
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
          </form>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white border-t border-gray-200"
          >
            <nav className="px-4 py-4 space-y-3">
              {menuItems
                .filter(item => item.is_active)
                .sort((a, b) => a.order - b.order)
                .map((item) => (
                  <div key={item.id}>
                    {item.is_dropdown && item.children ? (
                      <div>
                        <div className="font-medium text-gray-900 py-2 border-b border-gray-100">
                          {language === 'fa' ? item.name_fa : item.name_en}
                        </div>
                        <div className="pl-4 space-y-2 mt-2">
                          {item.children
                            .filter(child => child.is_active)
                            .sort((a, b) => a.order - b.order)
                            .map(child => (
                              <Link
                                key={child.id}
                                to={child.url}
                                target={child.target}
                                className="block py-2 text-gray-600 hover:text-blue-600 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {language === 'fa' ? child.name_fa : child.name_en}
                              </Link>
                            ))}
                        </div>
                      </div>
                    ) : (
                      <Link
                        to={item.url}
                        target={item.target}
                        className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {language === 'fa' ? item.name_fa : item.name_en}
                      </Link>
                    )}
                  </div>
                ))}
              
              <div className="pt-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user?.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{user?.username}</div>
                          <div className="text-xs text-gray-500">
                            {user?.role === 'admin' ? (language === 'fa' ? 'ادمین' : 'Admin') : (language === 'fa' ? 'کاربر' : 'User')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/account"
                      className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('header.myAccount')}
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {language === 'fa' ? 'پنل مدیریت' : 'Admin Panel'}
                      </Link>
                    )}

                    <Link
                      to="/track-order"
                      className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('header.trackOrder')}
                    </Link>

                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      {language === 'fa' ? 'خروج' : 'Sign Out'}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {t('header.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {language === 'fa' ? 'ثبت نام' : 'Register'}
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
