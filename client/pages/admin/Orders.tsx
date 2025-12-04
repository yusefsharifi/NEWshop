import { useEffect, useState } from 'react';
import { Eye, Edit, Trash2, Search, Filter, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_method: string;
  created_at: string;
  items_count?: number;
}

export default function AdminOrders() {
  const { t, dir, language } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/orders');
      if (!response.ok) throw new Error('Failed to fetch orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock, color: 'text-yellow-600' },
      processing: { variant: 'default' as const, icon: Package, color: 'text-blue-600' },
      shipped: { variant: 'default' as const, icon: Package, color: 'text-purple-600' },
      delivered: { variant: 'default' as const, icon: CheckCircle, color: 'text-green-600' },
      cancelled: { variant: 'destructive' as const, icon: XCircle, color: 'text-red-600' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || Clock;

    return (
      <Badge variant={config?.variant || 'secondary'} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {language === 'fa' ? 
          (status === 'pending' ? 'در انتظار' :
           status === 'processing' ? 'در حال پردازش' :
           status === 'shipped' ? 'ارسال شده' :
           status === 'delivered' ? 'تحویل شده' :
           status === 'cancelled' ? 'لغو شده' : status) : 
          status.charAt(0).toUpperCase() + status.slice(1)
        }
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      paid: 'default' as const,
      pending: 'secondary' as const,
      failed: 'destructive' as const
    };

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {language === 'fa' ? 
          (status === 'paid' ? 'پرداخت شده' :
           status === 'pending' ? 'در انتظار پرداخت' :
           status === 'failed' ? 'پرداخت ناموفق' : status) : 
          status.charAt(0).toUpperCase() + status.slice(1)
        }
      </Badge>
    );
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer_email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === 'fa' ? 'مدیریت سفارشات' : 'Orders Management'}
            </h2>
            <p className="text-gray-600">
              {language === 'fa' 
                ? 'مشاهده و مدیریت سفارشات مشتریان'
                : 'View and manage customer orders'
              }
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: language === 'fa' ? 'کل سفارشات' : 'Total Orders', value: orders.length, color: 'bg-blue-500' },
            { title: language === 'fa' ? 'در انتظار' : 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'bg-yellow-500' },
            { title: language === 'fa' ? 'در حال پردازش' : 'Processing', value: orders.filter(o => o.status === 'processing').length, color: 'bg-purple-500' },
            { title: language === 'fa' ? 'تحویل شده' : 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                      {stat.value}
                    </div>
                    <div className={`${dir === 'rtl' ? 'mr-4' : 'ml-4'}`}>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className={`absolute ${dir === 'rtl' ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4`} />
                  <Input
                    placeholder={language === 'fa' ? 'جستجو سفارشات...' : 'Search orders...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`${dir === 'rtl' ? 'pr-10' : 'pl-10'}`}
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder={language === 'fa' ? 'فیلتر وضعیت' : 'Filter by status'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'fa' ? 'همه وضعیت‌ها' : 'All Statuses'}</SelectItem>
                    <SelectItem value="pending">{language === 'fa' ? 'در انتظار' : 'Pending'}</SelectItem>
                    <SelectItem value="processing">{language === 'fa' ? 'در حال پردازش' : 'Processing'}</SelectItem>
                    <SelectItem value="shipped">{language === 'fa' ? 'ارسال شده' : 'Shipped'}</SelectItem>
                    <SelectItem value="delivered">{language === 'fa' ? 'تحویل شده' : 'Delivered'}</SelectItem>
                    <SelectItem value="cancelled">{language === 'fa' ? 'لغو شده' : 'Cancelled'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'fa' ? 'سفارشات' : 'Orders'} ({filteredOrders.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    {language === 'fa' ? 'بارگذاری سفارشات...' : 'Loading orders...'}
                  </p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {language === 'fa' ? 'هیچ سفارشی یافت نشد' : 'No orders found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'شماره سفارش' : 'Order #'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'مشتری' : 'Customer'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'مبلغ' : 'Amount'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'وضعیت' : 'Status'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'پرداخت' : 'Payment'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'تاریخ' : 'Date'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'عملیات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, index) => (
                        <motion.tr 
                          key={order.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{order.order_number}</div>
                              <div className="text-sm text-gray-500">
                                {order.items_count} {language === 'fa' ? 'آیتم' : 'items'}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{order.customer_name}</div>
                              <div className="text-sm text-gray-500">{order.customer_email}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium text-gray-900">${order.total_amount}</span>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="py-4 px-4">
                            {getPaymentStatusBadge(order.payment_status)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{formatDate(order.created_at)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                              <Button variant="ghost" size="sm" title={language === 'fa' ? 'مشاهده جزئیات' : 'View details'}>
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title={language === 'fa' ? 'ویرایش' : 'Edit'}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
}
