import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Package, Heart, Settings, LogOut, Eye, Download, 
  Star, MapPin, Phone, Mail, Edit3, Calendar, TrendingUp,
  ShoppingBag, Clock, CheckCircle, XCircle, Truck, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

interface Order {
  id: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: Array<{
    id: string;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }>;
  trackingNumber?: string;
}

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
  discount?: number;
}

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const { language, dir } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data - in production, fetch from API
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 1250000,
      items: [
        { id: '1', name: 'پمپ آب استخر', image: '/placeholder.svg', quantity: 1, price: 850000 },
        { id: '2', name: 'فیلتر شنی', image: '/placeholder.svg', quantity: 1, price: 400000 }
      ],
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-002',
      date: '2024-01-10',
      status: 'shipped',
      total: 650000,
      items: [
        { id: '3', name: 'کلرزن استخر', image: '/placeholder.svg', quantity: 2, price: 325000 }
      ],
      trackingNumber: 'TRK987654321'
    }
  ]);

  const [wishlist] = useState<WishlistItem[]>([
    { id: '1', name: 'هیتر استخر برقی', price: 2500000, image: '/placeholder.svg', inStock: true, discount: 15 },
    { id: '2', name: 'نورافکن LED زیرآبی', price: 450000, image: '/placeholder.svg', inStock: false },
    { id: '3', name: 'سیستم تصفیه اتوماتیک', price: 3200000, image: '/placeholder.svg', inStock: true, discount: 20 }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      fa: {
        pending: 'در انتظار تایید',
        processing: 'در حال پردازش',
        shipped: 'ارسال شده',
        delivered: 'تحویل داده شده',
        cancelled: 'لغو شده'
      },
      en: {
        pending: 'Pending',
        processing: 'Processing',
        shipped: 'Shipped',
        delivered: 'Delivered',
        cancelled: 'Cancelled'
      }
    };
    return statusTexts[language][status as keyof typeof statusTexts.fa] || status;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'fa' ? 'fa-IR' : 'en-US').format(date);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    wishlistItems: wishlist.length,
    totalSpent: orders.reduce((sum, order) => sum + order.total, 0)
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

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl font-bold">
                    {user.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {language === 'fa' ? `سلام ${user.username}` : `Hello ${user.username}`}
                  </h1>
                  <p className="text-gray-600">
                    {language === 'fa' ? 'خوش آمدید به پنل کاربری آکواپرو' : 'Welcome to your AquaPro dashboard'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{language === 'fa' ? 'خروج' : 'Logout'}</span>
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">
                      {language === 'fa' ? 'کل سفارشات' : 'Total Orders'}
                    </p>
                    <p className="text-3xl font-bold">{stats.totalOrders}</p>
                  </div>
                  <Package className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-sm">
                      {language === 'fa' ? 'در انتظار' : 'Pending'}
                    </p>
                    <p className="text-3xl font-bold">{stats.pendingOrders}</p>
                  </div>
                  <Clock className="w-8 h-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm">
                      {language === 'fa' ? 'علاقه‌مندی‌ها' : 'Wishlist'}
                    </p>
                    <p className="text-3xl font-bold">{stats.wishlistItems}</p>
                  </div>
                  <Heart className="w-8 h-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">
                      {language === 'fa' ? 'کل خرید' : 'Total Spent'}
                    </p>
                    <p className="text-lg font-bold">{formatPrice(stats.totalSpent)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div variants={itemVariants}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>{language === 'fa' ? 'نمای کلی' : 'Overview'}</span>
                </TabsTrigger>
                <TabsTrigger value="orders" className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>{language === 'fa' ? 'سفارشات' : 'Orders'}</span>
                </TabsTrigger>
                <TabsTrigger value="wishlist" className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>{language === 'fa' ? 'علاقه‌مندی‌ها' : 'Wishlist'}</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>{language === 'fa' ? 'تنظیمات' : 'Settings'}</span>
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Recent Orders */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="w-5 h-5" />
                        <span>{language === 'fa' ? 'سفارشات اخیر' : 'Recent Orders'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">#{order.id}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                            <Badge className={getStatusColor(order.status)}>
                              {getStatusText(order.status)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatPrice(order.total)}</p>
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/orders/${order.id}`}>
                                {language === 'fa' ? 'مشاهده' : 'View'}
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/account?tab=orders">
                          {language === 'fa' ? 'مشاهده همه سفارشات' : 'View All Orders'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Wishlist Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="w-5 h-5" />
                        <span>{language === 'fa' ? 'علاقه‌مندی‌ها' : 'Wishlist Items'}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {wishlist.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-sm font-bold text-blue-600">{formatPrice(item.price)}</p>
                            {!item.inStock && (
                              <Badge variant="destructive" className="text-xs">
                                {language === 'fa' ? 'ناموجود' : 'Out of Stock'}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/account?tab=wishlist">
                          {language === 'fa' ? 'مشاهده همه' : 'View All'}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Orders Tab */}
              <TabsContent value="orders" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'fa' ? 'سفارشات من' : 'My Orders'}</CardTitle>
                    <CardDescription>
                      {language === 'fa' ? 'مشاهده و پیگیری سفارشات خود' : 'View and track your orders'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <motion.div
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border rounded-xl p-6 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-lg">#{order.id}</h3>
                              <p className="text-sm text-gray-600">{formatDate(order.date)}</p>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusText(order.status)}
                              </Badge>
                              <p className="font-bold text-lg mt-1">{formatPrice(order.total)}</p>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-3">
                            {order.items.map((item) => (
                              <div key={item.id} className="flex items-center space-x-4">
                                <img 
                                  src={item.image} 
                                  alt={item.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {language === 'fa' ? 'تعداد:' : 'Qty:'} {item.quantity}
                                  </p>
                                  <p className="font-bold text-blue-600">{formatPrice(item.price)}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t">
                            {order.trackingNumber && (
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Truck className="w-4 h-4" />
                                <span>
                                  {language === 'fa' ? 'کد پیگیری:' : 'Tracking:'} {order.trackingNumber}
                                </span>
                              </div>
                            )}
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                {language === 'fa' ? 'جزئیات' : 'Details'}
                              </Button>
                              {order.status === 'delivered' && (
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4 mr-1" />
                                  {language === 'fa' ? 'فاکتور' : 'Invoice'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wishlist Tab */}
              <TabsContent value="wishlist" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'fa' ? 'لیست علاقه‌مندی‌ها' : 'My Wishlist'}</CardTitle>
                    <CardDescription>
                      {language === 'fa' ? 'محصولات مورد علاقه شما' : 'Your favorite products'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="border rounded-xl overflow-hidden"
                        >
                          <div className="relative">
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-48 object-cover"
                            />
                            {item.discount && (
                              <Badge className="absolute top-2 left-2 bg-red-500">
                                {item.discount}% {language === 'fa' ? 'تخفیف' : 'OFF'}
                              </Badge>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="absolute top-2 right-2 bg-white/80"
                            >
                              <Heart className="w-4 h-4 text-red-500 fill-current" />
                            </Button>
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-medium">{item.name}</h3>
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-lg text-blue-600">{formatPrice(item.price)}</p>
                              {!item.inStock && (
                                <Badge variant="destructive">
                                  {language === 'fa' ? 'ناموجود' : 'Out of Stock'}
                                </Badge>
                              )}
                            </div>
                            <Button 
                              className="w-full" 
                              disabled={!item.inStock}
                              variant={item.inStock ? "default" : "secondary"}
                            >
                              <ShoppingBag className="w-4 h-4 mr-2" />
                              {item.inStock 
                                ? (language === 'fa' ? 'افزودن به سبد' : 'Add to Cart')
                                : (language === 'fa' ? 'ناموجود' : 'Out of Stock')
                              }
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{language === 'fa' ? 'اطلاعات حساب' : 'Account Information'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {language === 'fa' ? 'نام کاربری' : 'Username'}
                        </Label>
                        <Input value={user.username} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          {language === 'fa' ? 'ایمیل' : 'Email'}
                        </Label>
                        <Input value={user.email} disabled />
                      </div>
                      <Button className="w-full">
                        <Edit3 className="w-4 h-4 mr-2" />
                        {language === 'fa' ? 'ویرایش اطلاعات' : 'Edit Information'}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{language === 'fa' ? 'تنظیمات' : 'Preferences'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>{language === 'fa' ? 'اطلاع‌رسانی ایمیل' : 'Email Notifications'}</span>
                        <Switch />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>{language === 'fa' ? 'اطلاع‌رسانی SMS' : 'SMS Notifications'}</span>
                        <Switch />
                      </div>
                      <Separator />
                      <Button variant="destructive" className="w-full">
                        {language === 'fa' ? 'حذف حساب کاربری' : 'Delete Account'}
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
