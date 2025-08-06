import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingCart, Menu, X, Phone, User, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { language, setLanguage, t, dir } = useLanguage();
  const { setIsOpen, itemCount } = useCart();

  const navigation = [
    { name: t('nav.products'), href: '/products' },
    { name: t('nav.pumps'), href: '/category/pumps' },
    { name: t('nav.filters'), href: '/category/filters' },
    { name: t('nav.heaters'), href: '/category/heaters' },
    { name: t('nav.chemicals'), href: '/category/chemicals' },
    { name: t('nav.accessories'), href: '/category/accessories' },
    { name: t('nav.blog'), href: '/blog' },
    { name: t('nav.contact'), href: '/contact' },
  ];

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

          {/* Desktop Navigation */}
          <nav className={`hidden lg:flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-8' : 'space-x-8'}`}>
            {navigation.slice(0, 6).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder={t('header.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                dir={dir}
              />
              <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
            </div>
          </div>

          {/* Right side actions */}
          <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-4' : 'space-x-4'}`}>
            <Button
              variant="ghost"
              size="sm"
              className={`hidden md:flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'} text-gray-700 hover:text-blue-600`}
            >
              <User className="w-5 h-5" />
              <span>{t('header.login')}</span>
            </Button>

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
          <div className="relative">
            <Input
              type="text"
              placeholder={t('header.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`${dir === 'rtl' ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              dir={dir}
            />
            <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <nav className="px-4 py-4 space-y-3">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-3 border-t border-gray-200">
              <Link
                to="/account"
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.myAccount')}
              </Link>
              <Link
                to="/track-order"
                className="block py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('header.trackOrder')}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
