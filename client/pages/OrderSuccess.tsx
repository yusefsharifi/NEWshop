import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, Download, ArrowRight, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderSuccess() {
  const { t, dir, language } = useLanguage();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const confettiVariants = {
    hidden: { opacity: 0, y: -100, rotate: 0 },
    visible: (i: number) => ({
      opacity: 1,
      y: window.innerHeight + 100,
      rotate: Math.random() * 360,
      transition: {
        duration: Math.random() * 3 + 2,
        delay: Math.random() * 2,
        ease: "easeOut"
      }
    })
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4" dir={dir}>
      {/* Confetti Animation */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                variants={confettiVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                className="absolute w-3 h-3 rounded"
                style={{
                  left: `${Math.random() * 100}%`,
                  backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][Math.floor(Math.random() * 5)]
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-green-400 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-400 rounded-full opacity-10 blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full relative z-20"
      >
        {/* Success Icon */}
        <motion.div
          variants={itemVariants}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 15,
              delay: 0.2 
            }}
            className="w-24 h-24 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
          >
            <CheckCircle className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.h1
            variants={itemVariants}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            {language === 'fa' ? '🎉 سفارش شما ثبت شد!' : '🎉 Order Confirmed!'}
          </motion.h1>
          
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-600 mb-8"
          >
            {language === 'fa' 
              ? 'از خرید شما متشکریم. سفارش شما با موفقیت ثبت شد.'
              : 'Thank you for your purchase! Your order has been successfully placed.'
            }
          </motion.p>
        </motion.div>

        {/* Order Details Card */}
        <motion.div variants={itemVariants} className="mb-8">
          <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-lg glass-light">
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'fa' ? 'شماره سفارش' : 'Order Number'}
                  </h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-2xl font-bold text-blue-600"
                  >
                    #AQ{Date.now().toString().slice(-6)}
                  </motion.p>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {language === 'fa' ? 'وضعیت پرداخت' : 'Payment Status'}
                  </h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-lg font-semibold text-green-600"
                  >
                    {language === 'fa' ? 'پرداخت شده ✓' : 'Paid ✓'}
                  </motion.p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {language === 'fa' ? 'زمان تحویل تخمینی' : 'Estimated Delivery'}
                  </h4>
                  <p className="text-lg text-gray-700">
                    {language === 'fa' ? '3-5 روز کاری' : '3-5 Business Days'}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === 'fa' 
                      ? 'کد پیگیری از طریق ایمیل ارسال خواهد شد'
                      : 'Tracking code will be sent via email'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/account/orders" className="block">
              <Button className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all">
                <Package className="w-5 h-5 mr-2" />
                {language === 'fa' ? 'پیگیری سفارش' : 'Track Order'}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full h-12 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all"
            >
              <Download className="w-5 h-5 mr-2" />
              {language === 'fa' ? 'دانلود فاکتور' : 'Download Invoice'}
            </Button>
          </motion.div>
        </motion.div>

        {/* Continue Shopping */}
        <motion.div variants={itemVariants} className="text-center">
          <Link to="/products">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                {language === 'fa' ? 'ادامه خرید' : 'Continue Shopping'}
                <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'mr-2' : 'ml-2'}`} />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Thank You Message */}
        <motion.div
          variants={itemVariants}
          className="mt-12 text-center p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="w-5 h-5 text-red-500 fill-current" />
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <Heart className="w-5 h-5 text-red-500 fill-current" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {language === 'fa' ? 'از اعتماد شما متشکریم!' : 'Thank You for Your Trust!'}
          </h3>
          <p className="text-gray-600">
            {language === 'fa' 
              ? 'ما متعهد به ارائه بهترین محصولات و خدمات هستیم. نظرات شما برای ما ارزشمند است.'
              : 'We are committed to providing the best products and service. Your feedback is valuable to us.'
            }
          </p>
          
          <motion.div
            className="mt-6"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
              {language === 'fa' ? 'ثبت نظر و امتیاز' : 'Leave a Review'}
              <Star className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
