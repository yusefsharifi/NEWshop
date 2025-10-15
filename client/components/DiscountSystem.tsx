import { useState, useEffect } from 'react';
import { 
  Tag, Gift, Percent, Calendar, Users, ShoppingCart, 
  Check, X, AlertCircle, Copy, Share2, Sparkles, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrencyIRR } from '@/lib/utils';

interface Coupon {
  id: string;
  code: string;
  title_en: string;
  title_fa: string;
  description_en: string;
  description_fa: string;
  type: 'percentage' | 'fixed' | 'free_shipping' | 'buy_x_get_y';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  usage_limit?: number;
  usage_count: number;
  user_usage_limit?: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  applicable_categories?: string[];
  applicable_products?: number[];
  excluded_categories?: string[];
  excluded_products?: number[];
  new_customers_only?: boolean;
  auto_apply?: boolean;
  stackable?: boolean;
  buy_quantity?: number;
  get_quantity?: number;
}

interface DiscountSystemProps {
  showAvailableCoupons?: boolean;
  showCouponInput?: boolean;
  appliedCoupons?: string[];
  onCouponsChange?: (coupons: string[]) => void;
  orderTotal?: number;
  cartItems?: any[];
}

export default function DiscountSystem({
  showAvailableCoupons = true,
  showCouponInput = true,
  appliedCoupons = [],
  onCouponsChange,
  orderTotal = 0,
  cartItems = []
}: DiscountSystemProps) {
  const { language, dir } = useLanguage();
  const { items } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [validationStatus, setValidationStatus] = useState<'success' | 'error' | null>(null);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [userCoupons, setUserCoupons] = useState<Coupon[]>([]);

  // Mock coupons data
  const mockCoupons: Coupon[] = [
    {
      id: '1',
      code: 'WELCOME20',
      title_en: 'Welcome Discount',
      title_fa: 'تخفیف خوش‌آمدگویی',
      description_en: '20% off your first order',
      description_fa: '۲۰٪ تخفیف برای اولین خرید',
      type: 'percentage',
      value: 20,
      min_order_amount: 500000,
      max_discount_amount: 500000,
      usage_limit: 1000,
      usage_count: 245,
      user_usage_limit: 1,
      valid_from: '2024-01-01',
      valid_until: '2024-12-31',
      is_active: true,
      new_customers_only: true,
      auto_apply: false,
      stackable: false
    },
    {
      id: '2',
      code: 'SUMMER2024',
      title_en: 'Summer Sale',
      title_fa: 'حراج تابستانی',
      description_en: 'Fixed 300,000 Toman discount',
      description_fa: '۳۰۰,۰۰۰ تومان تخفیف ثابت',
      type: 'fixed',
      value: 300000,
      min_order_amount: 1000000,
      usage_limit: 500,
      usage_count: 89,
      user_usage_limit: 3,
      valid_from: '2024-06-01',
      valid_until: '2024-08-31',
      is_active: true,
      applicable_categories: ['pumps', 'filters'],
      auto_apply: false,
      stackable: true
    },
    {
      id: '3',
      code: 'FREESHIP',
      title_en: 'Free Shipping',
      title_fa: 'ارسال رایگان',
      description_en: 'Free shipping on orders over 2M Toman',
      description_fa: 'ارسال رایگان برای خریدهای بالای ۲ میلیون تومان',
      type: 'free_shipping',
      value: 0,
      min_order_amount: 2000000,
      usage_limit: undefined,
      usage_count: 1256,
      valid_from: '2024-01-01',
      valid_until: '2024-12-31',
      is_active: true,
      auto_apply: true,
      stackable: true
    },
    {
      id: '4',
      code: 'BUY2GET1',
      title_en: 'Buy 2 Get 1 Free',
      title_fa: 'خرید ۲ عدد، یکی رایگان',
      description_en: 'Buy 2 chemical products, get 1 free',
      description_fa: 'با خرید ۲ محصول شیمیایی، یکی رایگان',
      type: 'buy_x_get_y',
      value: 100,
      buy_quantity: 2,
      get_quantity: 1,
      usage_limit: 200,
      usage_count: 45,
      valid_from: '2024-01-15',
      valid_until: '2024-03-15',
      is_active: true,
      applicable_categories: ['chemicals'],
      auto_apply: false,
      stackable: false
    },
    {
      id: '5',
      code: 'VIP15',
      title_en: 'VIP Customer Discount',
      title_fa: 'تخفیف مشتریان VIP',
      description_en: '15% discount for loyal customers',
      description_fa: '۱۵٪ تخفیف ��رای مشتریان وفادار',
      type: 'percentage',
      value: 15,
      min_order_amount: 1500000,
      max_discount_amount: 750000,
      usage_limit: undefined,
      usage_count: 0,
      user_usage_limit: 5,
      valid_from: '2024-01-01',
      valid_until: '2024-12-31',
      is_active: true,
      auto_apply: false,
      stackable: true
    }
  ];

  useEffect(() => {
    // Filter available coupons based on user and order conditions
    const available = mockCoupons.filter(coupon => {
      // Check if coupon is active
      if (!coupon.is_active) return false;
      
      // Check date validity
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = new Date(coupon.valid_until);
      if (now < validFrom || now > validUntil) return false;
      
      // Check if for new customers only
      if (coupon.new_customers_only && isAuthenticated && user) {
        // In real app, check if user has made previous orders
        return false;
      }
      
      // Check minimum order amount
      if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) return false;
      
      // Check usage limits
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) return false;
      
      return true;
    });

    setAvailableCoupons(available);
    
    // User's personal coupons (earned through loyalty program, etc.)
    const userSpecific = available.filter(coupon => 
      coupon.code.includes('VIP') || coupon.new_customers_only
    );
    setUserCoupons(userSpecific);
  }, [orderTotal, isAuthenticated, user]);

  const validateCoupon = async (code: string): Promise<{ isValid: boolean; message: string; coupon?: Coupon }> => {
    const coupon = mockCoupons.find(c => c.code.toLowerCase() === code.toLowerCase());
    
    if (!coupon) {
      return { 
        isValid: false, 
        message: language === 'fa' ? 'کد تخفیف نامعتبر است' : 'Invalid coupon code' 
      };
    }

    // Check if already applied
    if (appliedCoupons.includes(coupon.code)) {
      return { 
        isValid: false, 
        message: language === 'fa' ? 'این کد تخفیف قبلاً اعمال شده است' : 'This coupon is already applied' 
      };
    }

    // Check if active
    if (!coupon.is_active) {
      return { 
        isValid: false, 
        message: language === 'fa' ? 'این کد تخفیف غ��رفعال است' : 'This coupon is inactive' 
      };
    }

    // Check date validity
    const now = new Date();
    const validFrom = new Date(coupon.valid_from);
    const validUntil = new Date(coupon.valid_until);
    
    if (now < validFrom) {
      return { 
        isValid: false, 
        message: language === 'fa' ? 'این کد تخفیف هنوز فعال نشده است' : 'This coupon is not yet active' 
      };
    }
    
    if (now > validUntil) {
      return { 
        isValid: false, 
        message: language === 'fa' ? 'این کد تخفیف منقضی شده است' : 'This coupon has expired' 
      };
    }

    // Check minimum order amount
    if (coupon.min_order_amount && orderTotal < coupon.min_order_amount) {
      const minAmount = new Intl.NumberFormat('fa-IR').format(coupon.min_order_amount);
      return { 
        isValid: false, 
        message: language === 'fa' 
          ? `حداقل مبلغ سفارش برای این کد تخفیف ${minAmount} تومان است`
          : `Minimum order amount for this coupon is ${minAmount} Toman`
      };
    }

    // Check new customers only
    if (coupon.new_customers_only && isAuthenticated) {
      return { 
        isValid: false, 
        message: language === 'fa' ? 'این کد تخفی�� فقط برای مشتریان جدید است' : 'This coupon is for new customers only' 
      };
    }

    // Check usage limits
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { 
        isValid: false, 
        message: language === 'fa' ? 'ظرفیت استفاده از این کد تخفیف تمام شده است' : 'This coupon usage limit has been reached' 
      };
    }

    // Check stackability
    if (!coupon.stackable && appliedCoupons.length > 0) {
      return { 
        isValid: false, 
        message: language === 'fa' ? 'این کد تخفیف قابل ترکیب با سایر کدها نیست' : 'This coupon cannot be combined with other coupons' 
      };
    }

    return { 
      isValid: true, 
      message: language === 'fa' ? 'کد تخفیف با موفقیت اعمال شد' : 'Coupon applied successfully',
      coupon 
    };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsValidating(true);
    setValidationMessage('');
    setValidationStatus(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = await validateCoupon(couponCode.trim());
    
    setValidationStatus(result.isValid ? 'success' : 'error');
    setValidationMessage(result.message);
    
    if (result.isValid && result.coupon) {
      const newCoupons = [...appliedCoupons, result.coupon.code];
      onCouponsChange?.(newCoupons);
      setCouponCode('');
    }
    
    setIsValidating(false);
  };

  const handleRemoveCoupon = (code: string) => {
    const newCoupons = appliedCoupons.filter(c => c !== code);
    onCouponsChange?.(newCoupons);
  };

  const handleApplyAvailableCoupon = (coupon: Coupon) => {
    const newCoupons = [...appliedCoupons, coupon.code];
    onCouponsChange?.(newCoupons);
  };

  const calculateDiscount = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage':
        const percentageDiscount = (orderTotal * coupon.value) / 100;
        return coupon.max_discount_amount 
          ? Math.min(percentageDiscount, coupon.max_discount_amount)
          : percentageDiscount;
      
      case 'fixed':
        return Math.min(coupon.value, orderTotal);
      
      case 'free_shipping':
        return 50000; // Assume shipping cost is 50k Toman
      
      case 'buy_x_get_y':
        // Simplified calculation - in real app, check cart items
        return 0;
      
      default:
        return 0;
    }
  };

  const getTotalDiscount = () => {
    return appliedCoupons.reduce((total, code) => {
      const coupon = mockCoupons.find(c => c.code === code);
      return total + (coupon ? calculateDiscount(coupon) : 0);
    }, 0);
  };

  const formatPrice = (price: number) => formatCurrencyIRR(price);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US').format(date);
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage': return Percent;
      case 'fixed': return Tag;
      case 'free_shipping': return ShoppingCart;
      case 'buy_x_get_y': return Gift;
      default: return Tag;
    }
  };

  const getDiscountTypeLabel = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% ${language === 'fa' ? 'تخفیف' : 'OFF'}`;
      case 'fixed':
        return formatPrice(coupon.value);
      case 'free_shipping':
        return language === 'fa' ? 'ارسال رایگان' : 'Free Shipping';
      case 'buy_x_get_y':
        return `${coupon.buy_quantity}+${coupon.get_quantity} ${language === 'fa' ? 'رایگان' : 'Free'}`;
      default:
        return '';
    }
  };

  const CouponCard = ({ coupon, isApplied = false, showApplyButton = true }: { 
    coupon: Coupon; 
    isApplied?: boolean;
    showApplyButton?: boolean;
  }) => {
    const Icon = getDiscountTypeIcon(coupon.type);
    const title = language === 'fa' ? coupon.title_fa : coupon.title_en;
    const description = language === 'fa' ? coupon.description_fa : coupon.description_en;
    const isExpiringSoon = new Date(coupon.valid_until).getTime() - Date.now() < 7 * 24 * 60 * 60 * 1000;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`relative overflow-hidden rounded-xl border-2 ${
          isApplied ? 'border-green-300 bg-green-50' : 'border-gray-200 bg-white'
        } hover:shadow-lg transition-all duration-300`}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
        </div>

        <div className="relative p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${
                isApplied ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            
            {isExpiringSoon && (
              <Badge variant="destructive" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                {language === 'fa' ? 'به زودی منقضی' : 'Expiring Soon'}
              </Badge>
            )}
          </div>

          {/* Coupon Code */}
          <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="font-mono font-bold text-lg">{coupon.code}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(coupon.code)}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>

          {/* Discount Value */}
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {getDiscountTypeLabel(coupon)}
            </div>
            {coupon.min_order_amount && (
              <p className="text-xs text-gray-500 mt-1">
                {language === 'fa' ? 'حداقل خرید:' : 'Min order:'} {formatPrice(coupon.min_order_amount)}
              </p>
            )}
          </div>

          {/* Usage Progress */}
          {coupon.usage_limit && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{language === 'fa' ? 'استفاده شده' : 'Used'}</span>
                <span>{coupon.usage_count} / {coupon.usage_limit}</span>
              </div>
              <Progress 
                value={(coupon.usage_count / coupon.usage_limit) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Expiry Date */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="w-3 h-3" />
              <span>
                {language === 'fa' ? 'تا' : 'Until'} {formatDate(coupon.valid_until)}
              </span>
            </div>
            {coupon.stackable && (
              <Badge variant="outline" className="text-xs">
                {language === 'fa' ? 'قابل ترکیب' : 'Stackable'}
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            {showApplyButton && !isApplied && (
              <Button 
                className="flex-1" 
                onClick={() => handleApplyAvailableCoupon(coupon)}
                disabled={appliedCoupons.includes(coupon.code)}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'اعمال کد' : 'Apply'}
              </Button>
            )}
            
            {isApplied && (
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => handleRemoveCoupon(coupon.code)}
              >
                <X className="w-4 h-4 mr-2" />
                {language === 'fa' ? 'حذف' : 'Remove'}
              </Button>
            )}
            
            <Button variant="ghost" size="sm">
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Coupon Input */}
      {showCouponInput && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Tag className="w-5 h-5" />
              <span>{language === 'fa' ? 'کد تخفیف' : 'Discount Code'}</span>
            </CardTitle>
            <CardDescription>
              {language === 'fa' 
                ? 'کد تخفیف خود را وارد کنید تا از تخفیف برخوردار شوید'
                : 'Enter your discount code to get a discount'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder={language === 'fa' ? 'کد تخفیف را وارد کنید' : 'Enter discount code'}
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  className="font-mono"
                />
              </div>
              <Button 
                onClick={handleApplyCoupon}
                disabled={!couponCode.trim() || isValidating}
              >
                {isValidating ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'اعمال' : 'Apply'}
                  </>
                )}
              </Button>
            </div>

            {/* Validation Message */}
            <AnimatePresence>
              {validationMessage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert className={validationStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
                    {validationStatus === 'success' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <AlertDescription className={validationStatus === 'success' ? 'text-green-700' : 'text-red-700'}>
                      {validationMessage}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Applied Coupons */}
            {appliedCoupons.length > 0 && (
              <div className="space-y-3">
                <Separator />
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">
                    {language === 'fa' ? 'کدهای اعمال شده' : 'Applied Coupons'}
                  </h4>
                  <div className="space-y-2">
                    {appliedCoupons.map((code) => {
                      const coupon = mockCoupons.find(c => c.code === code);
                      if (!coupon) return null;
                      
                      return (
                        <div key={code} className="flex items-center justify-between bg-green-50 p-3 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span className="font-mono font-medium">{code}</span>
                            <span className="text-sm text-gray-600">
                              -{formatPrice(calculateDiscount(coupon))}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCoupon(code)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Total Discount */}
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-900">
                        {language === 'fa' ? 'مجموع تخفیف' : 'Total Discount'}
                      </span>
                      <span className="font-bold text-blue-600 text-lg">
                        -{formatPrice(getTotalDiscount())}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Available Coupons */}
      {showAvailableCoupons && availableCoupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gift className="w-5 h-5" />
              <span>{language === 'fa' ? 'کدهای تخفیف موجود' : 'Available Coupons'}</span>
            </CardTitle>
            <CardDescription>
              {language === 'fa' 
                ? 'از کدهای تخفیف زیر برای صرفه‌جویی بیشتر استفاده کنید'
                : 'Use the coupons below to save more on your order'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableCoupons.map((coupon) => (
                <CouponCard 
                  key={coupon.id} 
                  coupon={coupon} 
                  isApplied={appliedCoupons.includes(coupon.code)}
                  showApplyButton={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Personal Coupons */}
      {userCoupons.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>{language === 'fa' ? 'کدهای تخفیف شخصی شما' : 'Your Personal Coupons'}</span>
            </CardTitle>
            <CardDescription>
              {language === 'fa' 
                ? 'کدهای تخفیف اختصاصی شما بر اساس برنامه وفاداری'
                : 'Your exclusive coupons based on loyalty program'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userCoupons.map((coupon) => (
                <CouponCard 
                  key={coupon.id} 
                  coupon={coupon} 
                  isApplied={appliedCoupons.includes(coupon.code)}
                  showApplyButton={true}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
