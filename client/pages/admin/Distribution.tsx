import { useEffect, useState } from 'react';
import { 
  Truck, Package, CheckCircle, Clock, Search, Filter, Eye, 
  Edit, MapPin, Phone, Mail, User, Calendar, FileText, 
  PackageCheck, PackageX, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface ShipmentItem {
  id: number;
  product_id: number;
  name_en: string;
  name_fa: string;
  image_url: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  prepared: boolean;
  prepared_at?: string;
}

interface Shipment {
  id: number;
  shipment_number: string;
  invoice_number: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  status: 'pending' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  shipping_method?: string;
  tracking_number?: string;
  carrier?: string;
  estimated_delivery_date?: string;
  actual_delivery_date?: string;
  shipping_address: string;
  notes?: string;
  prepared_by?: string;
  prepared_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  created_at: string;
  items_count?: number;
  items?: ShipmentItem[];
}

export default function Distribution() {
  const { t, dir, language } = useLanguage();
  const { toast } = useToast();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({
    status: '',
    tracking_number: '',
    carrier: '',
    shipping_method: '',
    notes: '',
  });

  useEffect(() => {
    fetchShipments();
  }, [statusFilter]);

  const fetchShipments = async () => {
    try {
      setLoading(true);
      const statusParam = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(`/api/admin/shipments${statusParam}`);
      if (!response.ok) throw new Error('Failed to fetch shipments');
      const data = await response.json();
      setShipments(data);
    } catch (error) {
      console.error('Error fetching shipments:', error);
      toast({
        title: language === 'fa' ? 'خطا' : 'Error',
        description: language === 'fa' ? 'خطا در بارگذاری اطلاعات توزیع' : 'Failed to load shipments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchShipmentDetails = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/shipments/${id}`);
      if (!response.ok) throw new Error('Failed to fetch shipment details');
      const data = await response.json();
      setSelectedShipment(data);
      setEditForm({
        status: data.status,
        tracking_number: data.tracking_number || '',
        carrier: data.carrier || '',
        shipping_method: data.shipping_method || '',
        notes: data.notes || '',
      });
      setDetailDialogOpen(true);
    } catch (error) {
      console.error('Error fetching shipment details:', error);
      toast({
        title: language === 'fa' ? 'خطا' : 'Error',
        description: language === 'fa' ? 'خطا در بارگذاری جزئیات' : 'Failed to load shipment details',
        variant: 'destructive',
      });
    }
  };

  const updateShipmentStatus = async () => {
    if (!selectedShipment) return;

    try {
      const response = await fetch(`/api/admin/shipments/${selectedShipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) throw new Error('Failed to update shipment');

      toast({
        title: language === 'fa' ? 'موفق' : 'Success',
        description: language === 'fa' ? 'وضعیت توزیع به‌روزرسانی شد' : 'Shipment updated successfully',
      });

      setEditDialogOpen(false);
      fetchShipments();
      if (detailDialogOpen) {
        fetchShipmentDetails(selectedShipment.id);
      }
    } catch (error) {
      console.error('Error updating shipment:', error);
      toast({
        title: language === 'fa' ? 'خطا' : 'Error',
        description: language === 'fa' ? 'خطا در به‌روزرسانی' : 'Failed to update shipment',
        variant: 'destructive',
      });
    }
  };

  const toggleItemPrepared = async (shipmentId: number, itemId: number, prepared: boolean) => {
    try {
      const response = await fetch(`/api/admin/shipments/${shipmentId}/items/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prepared: !prepared }),
      });

      if (!response.ok) throw new Error('Failed to update item');

      toast({
        title: language === 'fa' ? 'موفق' : 'Success',
        description: language === 'fa' ? 'وضعیت آیتم به‌روزرسانی شد' : 'Item status updated',
      });

      if (selectedShipment) {
        fetchShipmentDetails(selectedShipment.id);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast({
        title: language === 'fa' ? 'خطا' : 'Error',
        description: language === 'fa' ? 'خطا در به‌روزرسانی آیتم' : 'Failed to update item',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive', icon: any, color: string, label_fa: string, label_en: string }> = {
      pending: { variant: 'secondary', icon: Clock, color: 'text-yellow-600', label_fa: 'در انتظار', label_en: 'Pending' },
      preparing: { variant: 'default', icon: Package, color: 'text-blue-600', label_fa: 'در حال آماده‌سازی', label_en: 'Preparing' },
      ready: { variant: 'default', icon: PackageCheck, color: 'text-purple-600', label_fa: 'آماده ارسال', label_en: 'Ready' },
      shipped: { variant: 'default', icon: Truck, color: 'text-indigo-600', label_fa: 'ارسال شده', label_en: 'Shipped' },
      delivered: { variant: 'default', icon: CheckCircle, color: 'text-green-600', label_fa: 'تحویل شده', label_en: 'Delivered' },
      cancelled: { variant: 'destructive', icon: PackageX, color: 'text-red-600', label_fa: 'لغو شده', label_en: 'Cancelled' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {language === 'fa' ? config.label_fa : config.label_en}
      </Badge>
    );
  };

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      shipment.shipment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shipment.invoice_number.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
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

  const parseAddress = (addressString: string) => {
    try {
      return typeof addressString === 'string' ? JSON.parse(addressString) : addressString;
    } catch {
      return { address: addressString };
    }
  };

  const stats = {
    total: shipments.length,
    pending: shipments.filter(s => s.status === 'pending').length,
    preparing: shipments.filter(s => s.status === 'preparing').length,
    ready: shipments.filter(s => s.status === 'ready').length,
    shipped: shipments.filter(s => s.status === 'shipped').length,
    delivered: shipments.filter(s => s.status === 'delivered').length,
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
              {language === 'fa' ? 'ارسال و توزیع' : 'Distribution & Shipping'}
            </h2>
            <p className="text-gray-600">
              {language === 'fa' 
                ? 'مدیریت آماده‌سازی و ارسال سفارشات'
                : 'Manage order preparation and shipping'
              }
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[
            { title: language === 'fa' ? 'کل' : 'Total', value: stats.total, color: 'bg-blue-500' },
            { title: language === 'fa' ? 'در انتظار' : 'Pending', value: stats.pending, color: 'bg-yellow-500' },
            { title: language === 'fa' ? 'در حال آماده‌سازی' : 'Preparing', value: stats.preparing, color: 'bg-blue-500' },
            { title: language === 'fa' ? 'آماده ارسال' : 'Ready', value: stats.ready, color: 'bg-purple-500' },
            { title: language === 'fa' ? 'ارسال شده' : 'Shipped', value: stats.shipped, color: 'bg-indigo-500' },
            { title: language === 'fa' ? 'تحویل شده' : 'Delivered', value: stats.delivered, color: 'bg-green-500' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                      {stat.value}
                    </div>
                    <div className={`${dir === 'rtl' ? 'mr-3' : 'ml-3'}`}>
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
                    placeholder={language === 'fa' ? 'جستجو توزیع...' : 'Search shipments...'}
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
                    <SelectItem value="preparing">{language === 'fa' ? 'در حال آماده‌سازی' : 'Preparing'}</SelectItem>
                    <SelectItem value="ready">{language === 'fa' ? 'آماده ارسال' : 'Ready'}</SelectItem>
                    <SelectItem value="shipped">{language === 'fa' ? 'ارسال شده' : 'Shipped'}</SelectItem>
                    <SelectItem value="delivered">{language === 'fa' ? 'تحویل شده' : 'Delivered'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Shipments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'fa' ? 'توزیع‌ها' : 'Shipments'} ({filteredShipments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    {language === 'fa' ? 'بارگذاری توزیع‌ها...' : 'Loading shipments...'}
                  </p>
                </div>
              ) : filteredShipments.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {language === 'fa' ? 'هیچ توزیعی یافت نشد' : 'No shipments found'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'شماره توزیع' : 'Shipment #'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'فاکتور' : 'Invoice'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'مشتری' : 'Customer'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'وضعیت' : 'Status'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'تاریخ ایجاد' : 'Created'}
                        </th>
                        <th className={`${dir === 'rtl' ? 'text-right' : 'text-left'} py-3 px-4 font-medium text-gray-700`}>
                          {language === 'fa' ? 'عملیات' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShipments.map((shipment, index) => (
                        <motion.tr 
                          key={shipment.id} 
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{shipment.shipment_number}</div>
                            <div className="text-sm text-gray-500">
                              {shipment.items_count || 0} {language === 'fa' ? 'آیتم' : 'items'}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-600">{shipment.invoice_number}</div>
                            <div className="text-xs text-gray-500">{shipment.order_number}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">{shipment.customer_name}</div>
                            <div className="text-sm text-gray-500">{shipment.customer_email}</div>
                          </td>
                          <td className="py-4 px-4">
                            {getStatusBadge(shipment.status)}
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-600">{formatDate(shipment.created_at)}</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className={`flex items-center ${dir === 'rtl' ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => fetchShipmentDetails(shipment.id)}
                                title={language === 'fa' ? 'مشاهده جزئیات' : 'View details'}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  setSelectedShipment(shipment);
                                  setEditForm({
                                    status: shipment.status,
                                    tracking_number: shipment.tracking_number || '',
                                    carrier: shipment.carrier || '',
                                    shipping_method: shipment.shipping_method || '',
                                    notes: shipment.notes || '',
                                  });
                                  setEditDialogOpen(true);
                                }}
                                title={language === 'fa' ? 'ویرایش' : 'Edit'}
                              >
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

        {/* Shipment Details Dialog */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {language === 'fa' ? 'جزئیات توزیع' : 'Shipment Details'}
              </DialogTitle>
            </DialogHeader>
            {selectedShipment && (
              <div className="space-y-6">
                {/* Shipment Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">{language === 'fa' ? 'شماره توزیع' : 'Shipment Number'}</Label>
                    <p className="font-medium">{selectedShipment.shipment_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">{language === 'fa' ? 'فاکتور' : 'Invoice'}</Label>
                    <p className="font-medium">{selectedShipment.invoice_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">{language === 'fa' ? 'سفارش' : 'Order'}</Label>
                    <p className="font-medium">{selectedShipment.order_number}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">{language === 'fa' ? 'وضعیت' : 'Status'}</Label>
                    <div className="mt-1">{getStatusBadge(selectedShipment.status)}</div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">{language === 'fa' ? 'اطلاعات مشتری' : 'Customer Information'}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-gray-500 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {language === 'fa' ? 'نام' : 'Name'}
                      </Label>
                      <p className="font-medium">{selectedShipment.customer_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {language === 'fa' ? 'ایمیل' : 'Email'}
                      </Label>
                      <p className="font-medium">{selectedShipment.customer_email}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {language === 'fa' ? 'تلفن' : 'Phone'}
                      </Label>
                      <p className="font-medium">{selectedShipment.customer_phone}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-gray-500 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {language === 'fa' ? 'آدرس' : 'Address'}
                      </Label>
                      <p className="font-medium">
                        {(() => {
                          const addr = parseAddress(selectedShipment.shipping_address);
                          return typeof addr === 'object' 
                            ? `${addr.address || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zipCode || ''}`
                            : addr;
                        })()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Shipping Info */}
                {(selectedShipment.tracking_number || selectedShipment.carrier || selectedShipment.shipping_method) && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">{language === 'fa' ? 'اطلاعات ارسال' : 'Shipping Information'}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedShipment.tracking_number && (
                        <div>
                          <Label className="text-sm text-gray-500">{language === 'fa' ? 'کد پیگیری' : 'Tracking Number'}</Label>
                          <p className="font-medium">{selectedShipment.tracking_number}</p>
                        </div>
                      )}
                      {selectedShipment.carrier && (
                        <div>
                          <Label className="text-sm text-gray-500">{language === 'fa' ? 'پستچی' : 'Carrier'}</Label>
                          <p className="font-medium">{selectedShipment.carrier}</p>
                        </div>
                      )}
                      {selectedShipment.shipping_method && (
                        <div>
                          <Label className="text-sm text-gray-500">{language === 'fa' ? 'روش ارسال' : 'Shipping Method'}</Label>
                          <p className="font-medium">{selectedShipment.shipping_method}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Items */}
                {selectedShipment.items && selectedShipment.items.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">{language === 'fa' ? 'آیتم‌های سفارش' : 'Order Items'}</h4>
                    <div className="space-y-3">
                      {selectedShipment.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3 flex-1">
                            {item.image_url && (
                              <img src={item.image_url} alt={language === 'fa' ? item.name_fa : item.name_en} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{language === 'fa' ? item.name_fa : item.name_en}</p>
                              <p className="text-sm text-gray-500">
                                {language === 'fa' ? 'تعداد:' : 'Qty:'} {item.quantity} | 
                                {language === 'fa' ? ' SKU:' : ' SKU:'} {item.sku}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-medium">${item.total_price.toFixed(2)}</span>
                            <Button
                              variant={item.prepared ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleItemPrepared(selectedShipment.id, item.id, item.prepared)}
                            >
                              {item.prepared ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  {language === 'fa' ? 'آماده' : 'Prepared'}
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 mr-1" />
                                  {language === 'fa' ? 'آماده نشده' : 'Not Prepared'}
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Shipment Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'fa' ? 'ویرایش توزیع' : 'Edit Shipment'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{language === 'fa' ? 'وضعیت' : 'Status'}</Label>
                <Select value={editForm.status} onValueChange={(value) => setEditForm({...editForm, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{language === 'fa' ? 'در انتظار' : 'Pending'}</SelectItem>
                    <SelectItem value="preparing">{language === 'fa' ? 'در حال آماده‌سازی' : 'Preparing'}</SelectItem>
                    <SelectItem value="ready">{language === 'fa' ? 'آماده ارسال' : 'Ready'}</SelectItem>
                    <SelectItem value="shipped">{language === 'fa' ? 'ارسال شده' : 'Shipped'}</SelectItem>
                    <SelectItem value="delivered">{language === 'fa' ? 'تحویل شده' : 'Delivered'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'fa' ? 'کد پیگیری' : 'Tracking Number'}</Label>
                <Input
                  value={editForm.tracking_number}
                  onChange={(e) => setEditForm({...editForm, tracking_number: e.target.value})}
                  placeholder={language === 'fa' ? 'کد پیگیری' : 'Tracking number'}
                />
              </div>
              <div>
                <Label>{language === 'fa' ? 'پستچی' : 'Carrier'}</Label>
                <Input
                  value={editForm.carrier}
                  onChange={(e) => setEditForm({...editForm, carrier: e.target.value})}
                  placeholder={language === 'fa' ? 'پستچی' : 'Carrier name'}
                />
              </div>
              <div>
                <Label>{language === 'fa' ? 'روش ارسال' : 'Shipping Method'}</Label>
                <Input
                  value={editForm.shipping_method}
                  onChange={(e) => setEditForm({...editForm, shipping_method: e.target.value})}
                  placeholder={language === 'fa' ? 'روش ارسال' : 'Shipping method'}
                />
              </div>
              <div>
                <Label>{language === 'fa' ? 'یادداشت' : 'Notes'}</Label>
                <Textarea
                  value={editForm.notes}
                  onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                  placeholder={language === 'fa' ? 'یادداشت' : 'Notes'}
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  {language === 'fa' ? 'لغو' : 'Cancel'}
                </Button>
                <Button onClick={updateShipmentStatus}>
                  {language === 'fa' ? 'ذخیره' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}

