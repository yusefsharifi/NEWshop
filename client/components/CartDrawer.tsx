import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { X, Plus, Minus, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, total, itemCount } = useCart();
  const { t, dir, language } = useLanguage();

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const drawerVariants = {
    hidden: { 
      x: dir === 'rtl' ? '-100%' : '100%',
      opacity: 0 
    },
    visible: { 
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      x: dir === 'rtl' ? '-100%' : '100%',
      opacity: 0,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    }),
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const emptyStateVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`fixed top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col`}
            dir={dir}
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {t('header.cart')}
                    </h2>
                    <p className="text-blue-100 text-sm">
                      {itemCount} {language === 'fa' ? 'آیتم' : 'items'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {items.length === 0 ? (
                  <motion.div
                    variants={emptyStateVariants}
                    initial="hidden"
                    animate="visible"
                    key="empty"
                    className="flex flex-col items-center justify-center h-full text-center py-12"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <ShoppingBag className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {language === 'fa' ? 'سبد خرید خالی است' : 'Your cart is empty'}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {language === 'fa' 
                        ? 'محصولی به سبد خرید اضافه نکرده‌اید' 
                        : 'You haven\'t added any items to your cart yet'
                      }
                    </p>
                    <Link to="/products">
                      <Button 
                        onClick={() => setIsOpen(false)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {language === 'fa' ? 'شروع خرید' : 'Start Shopping'}
                      </Button>
                    </Link>
                  </motion.div>
                ) : (
                  <motion.div
                    key="items"
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {items.map((item, index) => (
                      <motion.div
                        key={item.id}
                        variants={itemVariants}
                        custom={index}
                        layout
                        className="group p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start space-x-4">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="flex-shrink-0"
                          >
                            <img
                              src={item.image_url}
                              alt={language === 'fa' ? item.name_fa : item.name_en}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          </motion.div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">
                              {language === 'fa' ? item.name_fa : item.name_en}
                            </h3>
                            <p className="text-lg font-bold text-blue-600 mt-1">
                              ${item.price}
                            </p>

                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex items-center border border-gray-300 rounded-lg">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors rounded-l-lg"
                                >
                                  <Minus className="w-4 h-4" />
                                </motion.button>
                                
                                <span className="px-3 py-2 min-w-[2.5rem] text-center font-semibold">
                                  {item.quantity}
                                </span>
                                
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.stock_quantity}
                                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-200 transition-colors rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-4 h-4" />
                                </motion.button>
                              </div>

                              <motion.button
                                whileHover={{ scale: 1.1, backgroundColor: '#fee2e2' }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => removeItem(item.id)}
                                className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </motion.button>
                            </div>
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {language === 'fa' ? 'جمع کل:' : 'Subtotal:'}
                            </span>
                            <motion.span 
                              key={item.quantity}
                              initial={{ scale: 1.2, color: '#2563eb' }}
                              animate={{ scale: 1, color: '#1f2937' }}
                              className="font-bold text-gray-900"
                            >
                              ${(item.price * item.quantity).toFixed(2)}
                            </motion.span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 border-t border-gray-200 bg-gray-50"
              >
                {/* Total */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-semibold text-gray-900">
                    {language === 'fa' ? 'مجموع:' : 'Total:'}
                  </span>
                  <motion.span 
                    key={total}
                    initial={{ scale: 1.2, color: '#2563eb' }}
                    animate={{ scale: 1, color: '#1f2937' }}
                    className="text-2xl font-bold text-gray-900"
                  >
                    ${total.toFixed(2)}
                  </motion.span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link to="/cart" className="block">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full h-12 border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                        onClick={() => setIsOpen(false)}
                      >
                        {language === 'fa' ? 'مشاهده سبد خرید' : 'View Cart'}
                      </Button>
                    </motion.div>
                  </Link>

                  <Link to="/checkout" className="block">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        onClick={() => setIsOpen(false)}
                      >
                        <span>{language === 'fa' ? 'تسویه حساب' : 'Checkout'}</span>
                        <ArrowRight className={`w-5 h-5 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
                      </Button>
                    </motion.div>
                  </Link>
                </div>

                {/* Free shipping notice */}
                {total < 500 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                  >
                    <p className="text-sm text-blue-700 text-center">
                      {language === 'fa' 
                        ? `${(500 - total).toFixed(2)}$ دیگر خرید کنید تا ارسال رایگان شود!`
                        : `Add $${(500 - total).toFixed(2)} more for free shipping!`
                      }
                    </p>
                    <div className="mt-2 bg-blue-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((total / 500) * 100, 100)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="bg-blue-600 h-2 rounded-full"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}
