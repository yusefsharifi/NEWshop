import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, 
  Eye, Download, Share2, ArrowRight, Calendar, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrencyIRR } from '@/lib/utils';

interface TrackingEvent {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  location: string;
  status: 'completed' | 'current' | 'pending';
  icon: 'package' | 'truck' | 'check' | 'clock';
}

interface OrderDetails {
  id: string;
  date: string;
  status: string;
  total: number;
  estimatedDelivery: string;
  trackingNumber: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  shipping: {
    address: string;
    method: string;
    cost: number;
  };
  events: TrackingEvent[];
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const { language, dir } = useLanguage();
  const [trackingQuery, setTrackingQuery] = useState(orderId || '');
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTracking, setIsTracking] = useState(!!orderId);

  // Mock order data
  const mockOrders: { [key: string]: OrderDetails } = {
    'ORD-001': {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'shipped',
      total: 1250000,
      estimatedDelivery: '2024-01-18',
      trackingNumber: 'TRK123456789',
      items: [
        { id: '1', name: 'پمپ آب استخر Pentair SuperFlow', image: '/placeholder.svg', quantity: 1, price: 850000 },
        { id: '2', name: 'فیلتر شنی Hayward Pro Series', image: '/placeholder.svg', quantity: 1, price: 400000 }
      ],
      shipping: {
        address: 'تهران، خیابان ولیعصر، پلاک ۱۲۳',
        method: 'پست پیشتاز',
        cost: 50000
      },
      events: [
        {
          id: '1',
          title: language === 'fa' ? 'سفارش ثبت شد' : 'Order Placed',
          description: language === 'fa' ? 'سفارش شما با موفقیت ثبت و پردازش شد' : 'Your order has been placed and processed',
          timestamp: '2024-01-15T10:30:00Z',
          location: 'تهران، دفتر م��کزی آکواپرو',
          status: 'completed',
          icon: 'package'
        },
        {
          id: '2',
          title: language === 'fa' ? 'بسته‌بندی و آماده‌سازی' : 'Packaging',
          description: language === 'fa' ? 'محصولات بسته‌بندی و برای ارسال آماده شدند' : 'Items have been packaged and prepared for shipping',
          timestamp: '2024-01-15T15:45:00Z',
          location: 'تهران، انبار آکواپرو',
          status: 'completed',
          icon: 'package'
        },
        {
          id: '3',
          title: language === 'fa' ? 'ارسال از مبدأ' : 'Shipped from Origin',
          description: language === 'fa' ? 'بسته از انبار ارسال و به شرکت حمل‌ونقل تحویل داده شد' : 'Package has been shipped from warehouse to carrier',
          timestamp: '2024-01-16T09:00:00Z',
          location: 'تهران، ترمینال بار',
          status: 'completed',
          icon: 'truck'
        },
        {
          id: '4',
          title: language === 'fa' ? 'در حال حمل‌ونقل' : 'In Transit',
          description: language === 'fa' ? 'بسته در مسیر حمل‌ونقل قرار دارد' : 'Package is currently in transit',
          timestamp: '2024-01-17T14:20:00Z',
          location: 'کرج، مرکز توزیع',
          status: 'current',
          icon: 'truck'
        },
        {
          id: '5',
          title: language === 'fa' ? 'آماده تحویل' : 'Out for Delivery',
          description: language === 'fa' ? 'بسته به پیک تحویل داده شده و در مسیر تحویل است' : 'Package is out for delivery',
          timestamp: '',
          location: 'تهران، مرکز توزیع محلی',
          status: 'pending',
          icon: 'truck'
        },
        {
          id: '6',
          title: language === 'fa' ? 'تحویل داده شد' : 'Delivered',
          description: language === 'fa' ? 'بسته با موفقیت تحویل داده شد' : 'Package has been successfully delivered',
          timestamp: '',
          location: 'آدرس مقصد',
          status: 'pending',
          icon: 'check'
        }
      ]
    },
    'ORD-002': {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'delivered',
      total: 650000,
      estimatedDelivery: '2024-01-13',
      trackingNumber: 'TRK987654321',
      items: [
        { id: '3', name: 'کلرزن استخر اتوماتیک', image: '/placeholder.svg', quantity: 2, price: 325000 }
      ],
      shipping: {
        address: 'اصفهان، خیابان چهارباغ، پلاک ۴۵۶',
        method: 'باربری سریع',
        cost: 35000
      },
      events: [
        {
          id: '1',
          title: language === 'fa' ? 'سفارش ثبت شد' : 'Order Placed',
          description: language === 'fa' ? 'سفارش شما با موفقیت ثبت شد' : 'Your order has been placed',
          timestamp: '2024-01-10T11:00:00Z',
          location: 'تهران، دفتر مرکزی',
          status: 'completed',
          icon: 'package'
        },
        {
          id: '2',
          title: language === 'fa' ? 'ارسال شد' : 'Shipped',
          description: language === 'fa' ? 'بسته ارسال شد' : 'Package has been shipped',
          timestamp: '2024-01-11T08:30:00Z',
          location: 'تهران',
          status: 'completed',
          icon: 'truck'
        },
        {
          id: '3',
          title: language === 'fa' ? 'تحویل داده شد' : 'Delivered',
          description: language === 'fa' ? 'بسته با موفقیت تحویل داده شد' : 'Package delivered successfully',
          timestamp: '2024-01-13T16:45:00Z',
          location: 'اصفهان',
          status: 'completed',
          icon: 'check'
        }
      ]
    }
  };

  const handleTrackOrder = async () => {
    if (!trackingQuery.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const foundOrder = mockOrders[trackingQuery] || mockOrders['TRK123456789'] ? 
      Object.values(mockOrders).find(o => o.trackingNumber === trackingQuery) : null;
    
    setOrder(foundOrder || null);
    setIsTracking(true);
    setIsLoading(false);
  };

  useEffect(() => {
    if (orderId) {
      setTrackingQuery(orderId);
      handleTrackOrder();
    }
  }, [orderId]);

  const getStatusIcon = (icon: string) => {
    switch (icon) {
      case 'package': return Package;
      case 'truck': return Truck;
      case 'check': return CheckCircle;
      case 'clock': return Clock;
      default: return Package;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'current': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-gray-400 bg-gray-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const formatPrice = (price: number) => formatCurrencyIRR(price);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const calculateProgress = () => {
    if (!order) return 0;
    const completedEvents = order.events.filter(e => e.status === 'completed').length;
    return (completedEvents / order.events.length) * 100;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'fa' ? 'پیگیری سفارش' : 'Track Your Order'}
            </h1>
            <p className="text-gray-600">
              {language === 'fa' 
                ? 'وضعیت سفارش خود را به صورت زنده دنبال کنید'
                : 'Follow your order status in real-time'
              }
            </p>
          </motion.div>

          {/* Search Box */}
          {!isTracking && (
            <motion.div variants={itemVariants}>
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-center">
                    {language === 'fa' ? 'شماره پیگیری را وارد کنید' : 'Enter Tracking Number'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="tracking">
                      {language === 'fa' ? 'شماره سفارش یا کد پیگیری' : 'Order ID or Tracking Number'}
                    </Label>
                    <Input
                      id="tracking"
                      value={trackingQuery}
                      onChange={(e) => setTrackingQuery(e.target.value)}
                      placeholder={language === 'fa' ? 'مثال: ORD-001 یا TRK123456789' : 'e.g., ORD-001 or TRK123456789'}
                      className="mt-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleTrackOrder()}
                    />
                  </div>
                  <Button 
                    onClick={handleTrackOrder} 
                    disabled={isLoading || !trackingQuery.trim()}
                    className="w-full"
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>{language === 'fa' ? 'در حال جستجو...' : 'Searching...'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Package className="w-4 h-4" />
                        <span>{language === 'fa' ? 'پیگیری سفارش' : 'Track Order'}</span>
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Order Details */}
          <AnimatePresence>
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {language === 'fa' ? 'سفارش' : 'Order'} #{order.id}
                        </CardTitle>
                        <CardDescription>
                          {language === 'fa' ? 'تاریخ ثبت:' : 'Order Date:'} {formatDate(order.date)}
                        </CardDescription>
                      </div>
                      <Badge className="text-lg px-4 py-2">
                        {order.status === 'delivered' ? (language === 'fa' ? 'تحویل شده' : 'Delivered') :
                         order.status === 'shipped' ? (language === 'fa' ? 'ارسال شده' : 'Shipped') :
                         (language === 'fa' ? 'در حال پردازش' : 'Processing')}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>{language === 'fa' ? 'پیشرفت سفارش' : 'Order Progress'}</span>
                        <span>{Math.round(calculateProgress())}%</span>
                      </div>
                      <Progress value={calculateProgress()} className="h-2" />
                    </div>

                    {/* Order Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Package className="w-5 h-5 text-blue-600" />
                          <span className="font-medium">
                            {language === 'fa' ? 'کد پیگیری' : 'Tracking Number'}
                          </span>
                        </div>
                        <p className="text-sm font-mono">{order.trackingNumber}</p>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Calendar className="w-5 h-5 text-green-600" />
                          <span className="font-medium">
                            {language === 'fa' ? 'تحو��ل تخمینی' : 'Estimated Delivery'}
                          </span>
                        </div>
                        <p className="text-sm">{formatDate(order.estimatedDelivery)}</p>
                      </div>

                      <div className="bg-purple-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Truck className="w-5 h-5 text-purple-600" />
                          <span className="font-medium">
                            {language === 'fa' ? 'روش ارسال' : 'Shipping Method'}
                          </span>
                        </div>
                        <p className="text-sm">{order.shipping.method}</p>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <MapPin className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">
                          {language === 'fa' ? 'آدرس تحویل' : 'Delivery Address'}
                        </span>
                      </div>
                      <p className="text-sm">{order.shipping.address}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'fa' ? 'مراحل ارسال' : 'Shipping Timeline'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {order.events.map((event, index) => {
                        const IconComponent = getStatusIcon(event.icon);
                        const isLast = index === order.events.length - 1;
                        
                        return (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative flex items-start space-x-4"
                          >
                            {/* Timeline Line */}
                            {!isLast && (
                              <div className={`absolute ${dir === 'rtl' ? 'right-6' : 'left-6'} top-12 w-0.5 h-16 ${
                                event.status === 'completed' ? 'bg-green-300' : 'bg-gray-300'
                              }`} />
                            )}
                            
                            {/* Event Icon */}
                            <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            
                            {/* Event Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                                {event.timestamp && (
                                  <span className="text-sm text-gray-500">
                                    {formatDate(event.timestamp)}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 mt-1">{event.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">{event.location}</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'fa' ? 'اقلام سفارش' : 'Order Items'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="font-medium">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              {language === 'fa' ? 'تعداد:' : 'Quantity:'} {item.quantity}
                            </p>
                            <p className="font-bold text-blue-600">{formatPrice(item.price)}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    {/* Order Summary */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>{language === 'fa' ? 'جمع اقلام' : 'Subtotal'}</span>
                        <span>{formatPrice(order.total - order.shipping.cost)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{language === 'fa' ? 'هزینه ارسال' : 'Shipping'}</span>
                        <span>{formatPrice(order.shipping.cost)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>{language === 'fa' ? 'مجموع' : 'Total'}</span>
                        <span>{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex flex-wrap gap-4 justify-center">
                  <Button variant="outline">
                    <Share2 className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'اشتراک‌گذاری' : 'Share'}
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'دانلود فاکتور' : 'Download Invoice'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsTracking(false)}>
                    <Package className="w-4 h-4 mr-2" />
                    {language === 'fa' ? 'پیگیری سفارش دیگر' : 'Track Another Order'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Order Found */}
          {isTracking && !order && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {language === 'fa' ? 'سفارش پیدا نشد' : 'Order Not Found'}
              </h2>
              <p className="text-gray-600 mb-6">
                {language === 'fa' 
                  ? 'شماره وارد شده صحیح نیست یا سفارش وجود ندارد'
                  : 'The tracking number entered is invalid or does not exist'
                }
              </p>
              <Button onClick={() => setIsTracking(false)} variant="outline">
                {language === 'fa' ? 'تلاش دوباره' : 'Try Again'}
              </Button>
            </motion.div>
          )}

          {/* Back to Home */}
          <motion.div variants={itemVariants} className="text-center">
            <Link
              to="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowRight className={`w-4 h-4 ${dir === 'rtl' ? 'ml-1 rotate-180' : 'mr-1'}`} />
              {language === 'fa' ? 'بازگشت به صفحه اصلی' : 'Back to homepage'}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
