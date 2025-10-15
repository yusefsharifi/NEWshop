import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, TrendingUp, DollarSign, BarChart3, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLayout from '@/components/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Bar, BarChart, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalCustomers: number;
  revenue: number;
  aov: number;
  conversion: number;
}

export default function AdminDashboard() {
  const { language, dir } = useLanguage();
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalCustomers: 0,
    revenue: 0,
    aov: 0,
    conversion: 0
  });
  const [loading, setLoading] = useState(true);

  const salesData = [
    { label: 'W1', revenue: 8200, orders: 42 },
    { label: 'W2', revenue: 9100, orders: 47 },
    { label: 'W3', revenue: 7600, orders: 38 },
    { label: 'W4', revenue: 11200, orders: 55 },
    { label: 'W5', revenue: 13400, orders: 62 },
    { label: 'W6', revenue: 12800, orders: 59 },
    { label: 'W7', revenue: 14250, orders: 66 },
    { label: 'W8', revenue: 15120, orders: 70 },
  ];

  const topSellers = [
    { sku: 'PUMP-XL-001', name_en: 'Pool Pump XL', name_fa: 'پمپ استخر XL', units: 132, revenue: 39600000 },
    { sku: 'LED-LIGHT-RGB', name_en: 'LED Pool Light RGB', name_fa: 'چراغ LED استخر RGB', units: 98, revenue: 14700000 },
    { sku: 'FLT-SAND-200', name_en: 'Sand Filter 200', name_fa: 'فیلتر شنی ۲۰۰', units: 76, revenue: 22800000 },
  ];

  const lowSellers = [
    { sku: 'CHEM-CL-10', name_en: 'Chlorine 10kg', name_fa: 'کلر ۱۰ کیلو', units: 8, revenue: 800000 },
    { sku: 'NET-SKIM-01', name_en: 'Skimmer Net', name_fa: 'تور اسکیمر', units: 12, revenue: 360000 },
    { sku: 'PIPE-25MM', name_en: 'PVC Pipe 25mm', name_fa: 'لوله PVC ۲۵mm', units: 15, revenue: 600000 },
  ];

  const inventorySnapshot = {
    totalSkus: 420,
    lowStock: 17,
    incomingShipments: 3,
    availableUnits: 5390,
  };

  useEffect(() => {
    setTimeout(() => {
      const rev = salesData.reduce((s, d) => s + d.revenue, 0);
      const ord = salesData.reduce((s, d) => s + d.orders, 0);
      setStats({
        totalProducts: 156,
        totalOrders: ord,
        totalCustomers: 234,
        revenue: rev,
        aov: Math.round((rev / ord) * 100) / 100,
        conversion: 2.4,
      });
      setLoading(false);
    }, 400);
  }, []);

  const kpis = [
    {
      title: language === 'fa' ? 'درآمد (۸ هفته)' : 'Revenue (8w)',
      value: loading ? '...' : `₮${stats.revenue.toLocaleString()}`,
      icon: DollarSign,
      delta: '+12%'
    },
    {
      title: language === 'fa' ? 'تعداد سفارش' : 'Orders',
      value: loading ? '...' : stats.totalOrders.toString(),
      icon: ShoppingCart,
      delta: '+8%'
    },
    {
      title: language === 'fa' ? 'میانگین سبد' : 'AOV',
      value: loading ? '...' : `₮${stats.aov.toLocaleString()}`,
      icon: BarChart3,
      delta: '+3%'
    },
    {
      title: language === 'fa' ? 'نرخ تبدیل' : 'Conversion',
      value: loading ? '...' : `${stats.conversion}%`,
      icon: TrendingUp,
      delta: '+0.4%'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div>
          <h2 className="text-3xl font-bold text-gray-900">{language === 'fa' ? 'نمای کلی داشبورد' : 'Dashboard Overview'}</h2>
          <p className="text-gray-600">{language === 'fa' ? 'شاخص‌های کلیدی فروش، موجودی و عملکرد' : 'Key sales, inventory, and performance metrics'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((k, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{k.title}</CardTitle>
                <div className={`w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center`}>
                  <k.icon className={`w-4 h-4 text-blue-600`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-bold text-gray-900">{k.value}</div>
                  <div className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700">
                    <ArrowUpRight className="w-3 h-3" /> {k.delta}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>{language === 'fa' ? 'روند فروش' : 'Sales Performance'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ left: 12, right: 12, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot={false} name={language === 'fa' ? 'درآمد' : 'Revenue'} />
                    <Line type="monotone" dataKey="orders" stroke="#16a34a" strokeWidth={2} dot={false} name={language === 'fa' ? 'سفارش' : 'Orders'} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'fa' ? 'وضعیت انبار' : 'Inventory Snapshot'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-muted-foreground">{language === 'fa' ? 'تعداد SKU' : 'Total SKUs'}</TableCell>
                    <TableCell className="text-right font-medium">{inventorySnapshot.totalSkus}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">{language === 'fa' ? 'کمبود موجودی' : 'Low Stock'}</TableCell>
                    <TableCell className="text-right font-medium text-amber-600">{inventorySnapshot.lowStock}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">{language === 'fa' ? 'ورودی در راه' : 'Incoming Shipments'}</TableCell>
                    <TableCell className="text-right font-medium">{inventorySnapshot.incomingShipments}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-muted-foreground">{language === 'fa' ? 'موجودی قابل فر��ش' : 'Available Units'}</TableCell>
                    <TableCell className="text-right font-medium">{inventorySnapshot.availableUnits}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'fa' ? 'پرفروش‌ها' : 'Top Sellers'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>{language === 'fa' ? 'محصول' : 'Product'}</TableHead>
                    <TableHead className="text-right">{language === 'fa' ? 'تعداد' : 'Units'}</TableHead>
                    <TableHead className="text-right">{language === 'fa' ? 'درآمد' : 'Revenue'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topSellers.map((p) => (
                    <TableRow key={p.sku}>
                      <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                      <TableCell>{language === 'fa' ? p.name_fa : p.name_en}</TableCell>
                      <TableCell className="text-right">{p.units}</TableCell>
                      <TableCell className="text-right">₮{p.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'fa' ? 'کم‌فروش‌ها' : 'Low Sellers'}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>{language === 'fa' ? 'محصول' : 'Product'}</TableHead>
                    <TableHead className="text-right">{language === 'fa' ? 'تعداد' : 'Units'}</TableHead>
                    <TableHead className="text-right">{language === 'fa' ? 'درآمد' : 'Revenue'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowSellers.map((p) => (
                    <TableRow key={p.sku}>
                      <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                      <TableCell>{language === 'fa' ? p.name_fa : p.name_en}</TableCell>
                      <TableCell className="text-right">{p.units}</TableCell>
                      <TableCell className="text-right">₮{p.revenue.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'fa' ? 'سفارش‌ها به تفکیک هفته' : 'Orders by Week'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData} margin={{ left: 12, right: 12, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="orders" fill="#10b981" name={language === 'fa' ? 'سفارش' : 'Orders'} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'fa' ? 'فعالیت اخیر' : 'Recent Activity'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">{language === 'fa' ? 'سفارش جدید #1234' : 'New order #1234'}</span>
                    <span className="text-gray-500"> - 2 {language === 'fa' ? 'دقیقه پیش' : 'minutes ago'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">{language === 'fa' ? 'محصول افزوده شد: پمپ XL' : 'Product added: Pool Pump XL'}</span>
                    <span className="text-gray-500"> - 15 {language === 'fa' ? 'دقیقه پیش' : 'minutes ago'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">{language === 'fa' ? 'هشدار موجودی: فیلتر شنی' : 'Stock alert: Sand Filter'}</span>
                    <span className="text-gray-500"> - 1 {language === 'fa' ? 'ساعت پیش' : 'hour ago'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div className="text-sm">
                    <span className="font-medium">{language === 'fa' ? 'دریافت پیام مشتری' : 'Customer inquiry received'}</span>
                    <span className="text-gray-500"> - 2 {language === 'fa' ? 'ساعت پیش' : 'hours ago'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
