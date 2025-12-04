import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShoppingCart, 
  CreditCard, 
  Truck, 
  Check, 
  Lock,
  Edit3,
  MapPin,
  Phone,
  Mail,
  User,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface CheckoutStep {
  id: number;
  title: string;
  icon: any;
  completed: boolean;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface PaymentInfo {
  method: 'card' | 'paypal' | 'bank';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardName: string;
}

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const { t, dir, language } = useLanguage();
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States'
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    method: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: ''
  });

  const steps: CheckoutStep[] = [
    {
      id: 1,
      title: language === 'fa' ? 'اطلاعات ارسال' : 'Shipping Information',
      icon: Truck,
      completed: currentStep > 1
    },
    {
      id: 2,
      title: language === 'fa' ? 'روش پرداخت' : 'Payment Method',
      icon: CreditCard,
      completed: currentStep > 2
    },
    {
      id: 3,
      title: language === 'fa' ? 'بررسی نهایی' : 'Review Order',
      icon: Check,
      completed: currentStep > 3
    }
  ];

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items, navigate]);

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    try {
      // Prepare order data
      const orderData = {
        customer_name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        customer_email: shippingInfo.email,
        customer_phone: shippingInfo.phone,
        shipping_address: shippingInfo.address,
        city: shippingInfo.city,
        state: shippingInfo.state,
        zipCode: shippingInfo.zipCode,
        country: shippingInfo.country,
        payment_method: paymentInfo.method === 'card' ? 'Credit Card' : 
                        paymentInfo.method === 'paypal' ? 'PayPal' : 'Bank Transfer',
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
        })),
        subtotal: total,
        tax: tax,
        shipping_cost: shippingCost,
        total_amount: finalTotal,
      };

      // Create order via API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();
      
      // Clear cart and redirect
      clearCart();
      navigate(`/order-success?order=${result.order_number}`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert(language === 'fa' 
        ? 'خطا در ثبت سفارش. لطفا دوباره تلاش کنید.'
        : 'Error placing order. Please try again.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const stepVariants = {
    hidden: { x: dir === 'rtl' ? -50 : 50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    },
    exit: { 
      x: dir === 'rtl' ? 50 : -50, 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  const shippingCost = total > 500 ? 0 : 29.99;
  const tax = total * 0.08;
  const finalTotal = total + shippingCost + tax;

  if (items.length === 0) {
    return null; // Will redirect to cart
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir={dir}>
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className={`w-5 h-5 ${dir === 'rtl' ? 'ml-2' : 'mr-2'}`} />
            {language === 'fa' ? 'بازگشت به سبد خرید' : 'Back to Cart'}
          </Link>
          
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            {language === 'fa' ? 'تسویه حساب' : 'Checkout'}
          </h1>
          <p className="text-gray-600 mt-2">
            {language === 'fa' 
              ? 'فرآیند خرید را کامل کنید'
              : 'Complete your purchase'
            }
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className={`relative flex items-center justify-center w-12 h-12 rounded-full transition-all ${
                    step.completed || currentStep === step.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.completed ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Check className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                  
                  {currentStep === step.id && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-4 border-blue-300"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.2, opacity: 1 }}
                      transition={{ repeat: Infinity, repeatType: "reverse", duration: 1 }}
                    />
                  )}
                </motion.div>

                <div className={`ml-3 ${index === steps.length - 1 ? 'mr-0' : 'mr-8'}`}>
                  <p className={`text-sm font-medium ${
                    step.completed || currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 ${
                    step.completed ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Shipping Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <Truck className="w-6 h-6 text-blue-600" />
                        <span>{language === 'fa' ? 'اطل��عات ارسال' : 'Shipping Information'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName" className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>{language === 'fa' ? 'نام' : 'First Name'}</span>
                          </Label>
                          <Input
                            id="firstName"
                            value={shippingInfo.firstName}
                            onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                            className="mt-2"
                            placeholder={language === 'fa' ? 'نام خود را وارد کنید' : 'Enter your first name'}
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">
                            {language === 'fa' ? 'نام خانوادگی' : 'Last Name'}
                          </Label>
                          <Input
                            id="lastName"
                            value={shippingInfo.lastName}
                            onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                            className="mt-2"
                            placeholder={language === 'fa' ? 'نام خانوادگی خود را وارد کنید' : 'Enter your last name'}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="flex items-center space-x-2">
                            <Mail className="w-4 h-4" />
                            <span>{language === 'fa' ? 'ایمیل' : 'Email'}</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={shippingInfo.email}
                            onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
                            className="mt-2"
                            placeholder={language === 'fa' ? 'your@email.com' : 'your@email.com'}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="flex items-center space-x-2">
                            <Phone className="w-4 h-4" />
                            <span>{language === 'fa' ? 'تلفن' : 'Phone'}</span>
                          </Label>
                          <Input
                            id="phone"
                            value={shippingInfo.phone}
                            onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                            className="mt-2"
                            placeholder={language === 'fa' ? '+1 (555) 123-4567' : '+1 (555) 123-4567'}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="address" className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{language === 'fa' ? 'آدرس' : 'Address'}</span>
                        </Label>
                        <Input
                          id="address"
                          value={shippingInfo.address}
                          onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                          className="mt-2"
                          placeholder={language === 'fa' ? 'آدرس کامل خود را وارد کنید' : 'Enter your full address'}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="city">{language === 'fa' ? 'شهر' : 'City'}</Label>
                          <Input
                            id="city"
                            value={shippingInfo.city}
                            onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">{language === 'fa' ? 'ایالت' : 'State'}</Label>
                          <Input
                            id="state"
                            value={shippingInfo.state}
                            onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">{language === 'fa' ? 'کد پستی' : 'ZIP Code'}</Label>
                          <Input
                            id="zipCode"
                            value={shippingInfo.zipCode}
                            onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Payment Method */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <span>{language === 'fa' ? 'روش پرداخت' : 'Payment Method'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <RadioGroup 
                        value={paymentInfo.method} 
                        onValueChange={(value: 'card' | 'paypal' | 'bank') => 
                          setPaymentInfo({...paymentInfo, method: value})
                        }
                      >
                        <div className="space-y-4">
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <RadioGroupItem value="card" id="card" />
                            <Label htmlFor="card" className="flex items-center space-x-3 cursor-pointer flex-1">
                              <CreditCard className="w-5 h-5 text-blue-600" />
                              <span>{language === 'fa' ? 'کارت اعتباری' : 'Credit Card'}</span>
                            </Label>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal" className="flex items-center space-x-3 cursor-pointer flex-1">
                              <Building className="w-5 h-5 text-blue-600" />
                              <span>PayPal</span>
                            </Label>
                          </motion.div>

                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <RadioGroupItem value="bank" id="bank" />
                            <Label htmlFor="bank" className="flex items-center space-x-3 cursor-pointer flex-1">
                              <Building className="w-5 h-5 text-blue-600" />
                              <span>{language === 'fa' ? 'انتقال بانکی' : 'Bank Transfer'}</span>
                            </Label>
                          </motion.div>
                        </div>
                      </RadioGroup>

                      {paymentInfo.method === 'card' && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 p-4 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <Label htmlFor="cardName">{language === 'fa' ? 'نام روی کارت' : 'Name on Card'}</Label>
                            <Input
                              id="cardName"
                              value={paymentInfo.cardName}
                              onChange={(e) => setPaymentInfo({...paymentInfo, cardName: e.target.value})}
                              className="mt-2"
                              placeholder={language === 'fa' ? 'نام کامل' : 'Full Name'}
                            />
                          </div>

                          <div>
                            <Label htmlFor="cardNumber">{language === 'fa' ? 'شماره کارت' : 'Card Number'}</Label>
                            <Input
                              id="cardNumber"
                              value={paymentInfo.cardNumber}
                              onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                              className="mt-2"
                              placeholder="1234 5678 9012 3456"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="expiryDate">{language === 'fa' ? 'تاریخ انقضا' : 'Expiry Date'}</Label>
                              <Input
                                id="expiryDate"
                                value={paymentInfo.expiryDate}
                                onChange={(e) => setPaymentInfo({...paymentInfo, expiryDate: e.target.value})}
                                className="mt-2"
                                placeholder="MM/YY"
                              />
                            </div>
                            <div>
                              <Label htmlFor="cvv">CVV</Label>
                              <Input
                                id="cvv"
                                value={paymentInfo.cvv}
                                onChange={(e) => setPaymentInfo({...paymentInfo, cvv: e.target.value})}
                                className="mt-2"
                                placeholder="123"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Review Order */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <Check className="w-6 h-6 text-blue-600" />
                        <span>{language === 'fa' ? 'بررسی نهایی سفارش' : 'Review Your Order'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Shipping Info Review */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {language === 'fa' ? 'اطلاعات ارسال' : 'Shipping Information'}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep(1)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            {language === 'fa' ? 'ویرایش' : 'Edit'}
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>{shippingInfo.firstName} {shippingInfo.lastName}</p>
                          <p>{shippingInfo.address}</p>
                          <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                          <p>{shippingInfo.email}</p>
                          <p>{shippingInfo.phone}</p>
                        </div>
                      </div>

                      {/* Payment Info Review */}
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-900">
                            {language === 'fa' ? 'روش پرداخت' : 'Payment Method'}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentStep(2)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4 mr-1" />
                            {language === 'fa' ? 'ویرایش' : 'Edit'}
                          </Button>
                        </div>
                        <div className="text-sm text-gray-600">
                          {paymentInfo.method === 'card' && paymentInfo.cardNumber && (
                            <p>**** **** **** {paymentInfo.cardNumber.slice(-4)}</p>
                          )}
                          {paymentInfo.method === 'paypal' && <p>PayPal</p>}
                          {paymentInfo.method === 'bank' && <p>{language === 'fa' ? 'انتقال بانکی' : 'Bank Transfer'}</p>}
                        </div>
                      </div>

                      {/* Terms */}
                      <div className="flex items-start space-x-3">
                        <Checkbox id="terms" />
                        <Label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                          {language === 'fa' 
                            ? 'با شرایط و قوانین استفاده و سیاست حفظ حریم خصوصی موافقم'
                            : 'I agree to the Terms of Service and Privacy Policy'
                          }
                        </Label>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-between mt-8"
            >
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{language === 'fa' ? 'قبلی' : 'Previous'}</span>
              </Button>

              {currentStep < 3 ? (
                <Button
                  onClick={handleNextStep}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
                >
                  <span>{language === 'fa' ? 'بعدی' : 'Next'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 min-w-[120px]"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{language === 'fa' ? 'در حال پردازش...' : 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>{language === 'fa' ? 'ثبت سفارش' : 'Place Order'}</span>
                    </>
                  )}
                </Button>
              )}
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  <span>{language === 'fa' ? 'خلاصه سفارش' : 'Order Summary'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image_url}
                        alt={language === 'fa' ? item.name_fa : item.name_en}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">
                          {language === 'fa' ? item.name_fa : item.name_en}
                        </p>
                        <p className="text-sm text-gray-600">
                          {language === 'fa' ? 'تعداد:' : 'Qty:'} {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>{language === 'fa' ? 'جمع کل محصولات:' : 'Subtotal:'}</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{language === 'fa' ? 'هزینه ارسال:' : 'Shipping:'}</span>
                    <span>{shippingCost === 0 ? (language === 'fa' ? 'رایگان' : 'Free') : `$${shippingCost.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>{language === 'fa' ? 'مالیات:' : 'Tax:'}</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
                    <span>{language === 'fa' ? 'مجموع نهایی:' : 'Total:'}</span>
                    <span>${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {shippingCost === 0 && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 text-center font-medium">
                      🎉 {language === 'fa' ? 'ارسال رایگان!' : 'Free Shipping Unlocked!'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
