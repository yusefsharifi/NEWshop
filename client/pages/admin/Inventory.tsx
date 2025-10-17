import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrencyIRR } from '@/lib/utils';
import { Package, Plus, Minus, AlertTriangle, RefreshCcw, ClipboardList, TrendingUp, TrendingDown, Warehouse, FileText, BarChart3, Eye, Edit2, Download, QrCode, Users, Zap, CheckCircle, Truck, PieChart, Target, RotateCcw } from 'lucide-react';

interface InventoryItem {
  id: number;
  sku: string;
  barcode?: string;
  name_en: string;
  name_fa: string;
  stock: number;
  reserved: number;
  reorder_level: number;
  incoming: number;
  location?: string;
  category?: string;
  unit_cost?: number;
  unit_price?: number;
  expiry_date?: string;
  batch?: string;
  warehouse?: string;
  abc_class?: 'A' | 'B' | 'C';
  supplier_id?: number;
  lead_time_days?: number;
  defect_rate?: number;
  last_count_date?: string;
}

interface StockMovement {
  id: string;
  sku: string;
  productId: number;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'damage' | 'return';
  quantity: number;
  note?: string;
  reference?: string;
  from_location?: string;
  to_location?: string;
  unit_cost?: number;
  createdAt: string;
  createdBy?: string;
}

interface Supplier {
  id: number;
  name_en: string;
  name_fa: string;
  email: string;
  phone: string;
  lead_time_days: number;
  rating: number;
  total_orders: number;
  on_time_delivery: number;
}

interface PurchaseOrder {
  id: string;
  supplier_id: number;
  po_number: string;
  items: { product_id: number; quantity: number; unit_cost: number }[];
  total_amount: number;
  status: 'draft' | 'pending' | 'received' | 'partial';
  order_date: string;
  expected_delivery: string;
  created_at: string;
}

interface QualityControl {
  id: string;
  product_id: number;
  batch: string;
  received_qty: number;
  inspected_qty: number;
  defect_qty: number;
  defect_reason?: string;
  inspection_date: string;
  inspected_by: string;
  status: 'pass' | 'fail' | 'conditional';
}

interface StockTake {
  id: string;
  name_fa: string;
  name_en: string;
  scheduled_date: string;
  status: 'planned' | 'in_progress' | 'completed';
  counted_items: number;
  total_items: number;
  variance_amount: number;
  created_at: string;
}

interface StockAlert {
  id: string;
  type: 'low_stock' | 'overstock' | 'expiry_soon' | 'no_movement' | 'high_defect';
  severity: 'warning' | 'critical';
  itemId: number;
  message_en: string;
  message_fa: string;
  createdAt: string;
  resolved: boolean;
}

export default function AdminInventory() {
  const { language, dir } = useLanguage();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [qualityControls, setQualityControls] = useState<QualityControl[]>([]);
  const [stockTakes, setStockTakes] = useState<StockTake[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Stock Entry/Exit/Adjust Dialogs
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryItem, setEntryItem] = useState<InventoryItem | null>(null);
  const [entryQty, setEntryQty] = useState<number>(0);
  const [entryUnitCost, setEntryUnitCost] = useState<number>(0);
  const [entryReference, setEntryReference] = useState('');
  const [entryNote, setEntryNote] = useState('');
  const [entryBatch, setEntryBatch] = useState('');

  const [exitOpen, setExitOpen] = useState(false);
  const [exitItem, setExitItem] = useState<InventoryItem | null>(null);
  const [exitQty, setExitQty] = useState<number>(0);
  const [exitType, setExitType] = useState<'out' | 'damage' | 'return'>('out');
  const [exitReference, setExitReference] = useState('');
  const [exitNote, setExitNote] = useState('');

  // QC Dialog
  const [qcOpen, setQcOpen] = useState(false);
  const [qcItem, setQcItem] = useState<InventoryItem | null>(null);
  const [qcReceivedQty, setQcReceivedQty] = useState<number>(0);
  const [qcInspectedQty, setQcInspectedQty] = useState<number>(0);
  const [qcDefectQty, setQcDefectQty] = useState<number>(0);
  const [qcDefectReason, setQcDefectReason] = useState('');

  // Stock Take Dialog
  const [stockTakeOpen, setStockTakeOpen] = useState(false);
  const [stockTakeName, setStockTakeName] = useState('');
  const [stockTakeDate, setStockTakeDate] = useState('');

  // PO Dialog
  const [poOpen, setPoOpen] = useState(false);
  const [poSupplier, setPoSupplier] = useState<string>('');
  const [poItems, setPoItems] = useState<{ product_id: number; quantity: number; unit_cost: number }[]>([]);

  // Item Details
  const [detailsItem, setDetailsItem] = useState<InventoryItem | null>(null);
  const [itemMovements, setItemMovements] = useState<StockMovement[]>([]);

  // Edit Item
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});

  useEffect(() => {
    const seed: InventoryItem[] = [
      { 
        id: 1, sku: 'PUMP-XL-001', barcode: '8714235009211', name_en: 'Pool Pump XL', name_fa: 'پمپ استخر XL', 
        stock: 32, reserved: 3, reorder_level: 10, incoming: 20, location: 'A-01', category: 'pumps', 
        unit_cost: 500000, unit_price: 1200000, warehouse: 'Main', batch: 'B001',
        abc_class: 'A', supplier_id: 1, lead_time_days: 14, defect_rate: 0.5, last_count_date: '2024-01-15'
      },
      { 
        id: 2, sku: 'FLT-SAND-200', barcode: '8714235009228', name_en: 'Sand Filter 200', name_fa: 'فیلتر شنی ۲۰۰', 
        stock: 8, reserved: 1, reorder_level: 12, incoming: 0, location: 'B-04', category: 'filters', 
        unit_cost: 300000, unit_price: 750000, warehouse: 'Main', batch: 'B002',
        abc_class: 'B', supplier_id: 2, lead_time_days: 21, defect_rate: 1.2, last_count_date: '2024-01-10'
      },
      { 
        id: 3, sku: 'LED-LIGHT-RGB', barcode: '8714235009235', name_en: 'LED Pool Light RGB', name_fa: 'چراغ LED استخر RGB', 
        stock: 54, reserved: 5, reorder_level: 15, incoming: 40, location: 'C-02', category: 'lights', 
        unit_cost: 200000, unit_price: 500000, warehouse: 'Main', batch: 'B003', expiry_date: '2025-12-31',
        abc_class: 'A', supplier_id: 1, lead_time_days: 7, defect_rate: 0.3, last_count_date: '2024-01-20'
      },
      { 
        id: 4, sku: 'CHEM-CL-10', barcode: '8714235009242', name_en: 'Chlorine 10kg', name_fa: 'کلر ۱۰ کیلو', 
        stock: 5, reserved: 0, reorder_level: 20, incoming: 50, location: 'D-07', category: 'chemicals', 
        unit_cost: 150000, unit_price: 350000, warehouse: 'Main', batch: 'B004', expiry_date: '2025-06-30',
        abc_class: 'B', supplier_id: 3, lead_time_days: 10, defect_rate: 0, last_count_date: '2024-01-05'
      },
      { 
        id: 5, sku: 'PIPE-PVC-50', barcode: '8714235009259', name_en: 'PVC Pipe 50mm', name_fa: 'لوله PVC ۵۰ میلی', 
        stock: 120, reserved: 10, reorder_level: 30, incoming: 0, location: 'A-03', category: 'pipes', 
        unit_cost: 50000, unit_price: 120000, warehouse: 'Secondary', batch: 'B005',
        abc_class: 'C', supplier_id: 2, lead_time_days: 28, defect_rate: 0.1, last_count_date: '2023-12-15'
      },
    ];
    setItems(seed);

    const seedSuppliers: Supplier[] = [
      { id: 1, name_en: 'Global Pool Systems', name_fa: 'سیستم های استخر جهانی', email: 'sales@globalpools.com', phone: '+1-234-567-8900', lead_time_days: 14, rating: 4.8, total_orders: 45, on_time_delivery: 98 },
      { id: 2, name_en: 'AquaTech Supplies', name_fa: 'تامین کنندگان آکوا تک', email: 'info@aquatech.com', phone: '+1-234-567-8901', lead_time_days: 21, rating: 4.5, total_orders: 32, on_time_delivery: 94 },
      { id: 3, name_en: 'Chemical Solutions Inc', name_fa: 'شرکت راهکارهای شیمیایی', email: 'orders@chemsol.com', phone: '+1-234-567-8902', lead_time_days: 10, rating: 4.6, total_orders: 67, on_time_delivery: 96 },
    ];
    setSuppliers(seedSuppliers);

    const seedMovements: StockMovement[] = [
      { id: 'm1', sku: 'PUMP-XL-001', productId: 1, type: 'out', quantity: -2, note: 'Sales Order', reference: '#1001', createdAt: new Date(Date.now() - 86400000).toISOString(), createdBy: 'Admin' },
      { id: 'm2', sku: 'FLT-SAND-200', productId: 2, type: 'damage', quantity: -1, note: 'Damaged unit', reference: '', createdAt: new Date(Date.now() - 172800000).toISOString(), createdBy: 'Admin' },
      { id: 'm3', sku: 'LED-LIGHT-RGB', productId: 3, type: 'in', quantity: 40, note: 'Incoming shipment', reference: 'PO-2024-001', unit_cost: 200000, createdAt: new Date(Date.now() - 259200000).toISOString(), createdBy: 'Supplier' },
      { id: 'm4', sku: 'CHEM-CL-10', productId: 4, type: 'adjustment', quantity: 3, note: 'Stock reconciliation', reference: '', createdAt: new Date(Date.now() - 345600000).toISOString(), createdBy: 'Admin' },
      { id: 'm5', sku: 'PIPE-PVC-50', productId: 5, type: 'transfer', quantity: 25, note: 'Transfer to Secondary warehouse', from_location: 'A-03', to_location: 'B-01', createdAt: new Date(Date.now() - 432000000).toISOString(), createdBy: 'Admin' },
    ];
    setMovements(seedMovements);

    const seedPO: PurchaseOrder[] = [
      { id: 'po1', supplier_id: 1, po_number: 'PO-2024-001', items: [{ product_id: 3, quantity: 40, unit_cost: 200000 }], total_amount: 8000000, status: 'received', order_date: '2024-01-01', expected_delivery: '2024-01-08', created_at: '2024-01-01' },
      { id: 'po2', supplier_id: 2, po_number: 'PO-2024-002', items: [{ product_id: 2, quantity: 25, unit_cost: 300000 }], total_amount: 7500000, status: 'pending', order_date: '2024-01-15', expected_delivery: '2024-02-05', created_at: '2024-01-15' },
      { id: 'po3', supplier_id: 3, po_number: 'PO-2024-003', items: [{ product_id: 4, quantity: 50, unit_cost: 150000 }], total_amount: 7500000, status: 'pending', order_date: '2024-01-18', expected_delivery: '2024-01-28', created_at: '2024-01-18' },
    ];
    setPurchaseOrders(seedPO);

    const seedQC: QualityControl[] = [
      { id: 'qc1', product_id: 3, batch: 'B003', received_qty: 40, inspected_qty: 40, defect_qty: 1, defect_reason: 'Minor scratch', inspection_date: '2024-01-08', inspected_by: 'Ahmed', status: 'pass' },
      { id: 'qc2', product_id: 1, batch: 'B001', received_qty: 35, inspected_qty: 35, defect_qty: 0, inspection_date: '2024-01-12', inspected_by: 'Fatima', status: 'pass' },
    ];
    setQualityControls(seedQC);

    const seedAlerts: StockAlert[] = [
      { id: 'a1', type: 'low_stock', severity: 'critical', itemId: 2, message_en: 'Stock below reorder level', message_fa: 'موجودی زیر حد سفارش', createdAt: new Date().toISOString(), resolved: false },
      { id: 'a2', type: 'high_defect', severity: 'warning', itemId: 2, message_en: 'High defect rate detected', message_fa: 'میزان عیب بالا شناسایی شد', createdAt: new Date().toISOString(), resolved: false },
    ];
    setAlerts(seedAlerts);

    const seedStockTakes: StockTake[] = [
      { id: 'st1', name_fa: 'شمارش سالانه', name_en: 'Annual Count', scheduled_date: '2024-02-01', status: 'planned', counted_items: 0, total_items: 5, variance_amount: 0, created_at: new Date().toISOString() },
      { id: 'st2', name_fa: 'شمارش سه ماهه Q1', name_en: 'Q1 Quarterly Count', scheduled_date: '2024-01-20', status: 'completed', counted_items: 5, total_items: 5, variance_amount: 2500, created_at: '2024-01-20' },
    ];
    setStockTakes(seedStockTakes);
  }, [language]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.sku.toLowerCase().includes(q) ||
      i.name_en.toLowerCase().includes(q) ||
      i.name_fa.toLowerCase().includes(q) ||
      i.barcode?.includes(q)
    );
  }, [items, search]);

  const lowStock = (it: InventoryItem) => it.stock <= it.reorder_level;
  const available = (it: InventoryItem) => Math.max(0, it.stock - it.reserved);
  const totalValue = (it: InventoryItem) => (it.unit_cost || 0) * it.stock;

  const abcAnalysis = useMemo(() => {
    const itemsWithValue = items.map(it => ({ ...it, totalValue: totalValue(it) })).sort((a, b) => b.totalValue - a.totalValue);
    const total = itemsWithValue.reduce((sum, it) => sum + it.totalValue, 0);
    let cumulative = 0;
    return itemsWithValue.map(it => {
      cumulative += it.totalValue;
      const percent = (cumulative / total) * 100;
      let classif: 'A' | 'B' | 'C' = 'C';
      if (percent <= 80) classif = 'A';
      else if (percent <= 95) classif = 'B';
      return { ...it, abc_class: classif };
    });
  }, [items]);

  const calculateKPIs = () => {
    const totalValue = items.reduce((sum, it) => sum + totalValue(it), 0);
    const totalCost = items.reduce((sum, it) => sum + ((it.unit_cost || 0) * it.stock), 0);
    const totalSold = movements.filter(m => m.type === 'out').reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const avgStock = items.reduce((sum, it) => sum + it.stock, 0) / items.length;
    const turnoverRatio = totalSold > 0 ? (totalSold / avgStock).toFixed(2) : '0';
    const defectRate = items.reduce((sum, it) => sum + (it.defect_rate || 0), 0) / items.length;
    
    return { totalValue, totalCost, totalSold, avgStock, turnoverRatio, defectRate: defectRate.toFixed(2) };
  };

  const handleQC = () => {
    if (!qcItem || qcInspectedQty <= 0) return;
    const qcRecord: QualityControl = {
      id: 'qc' + (qualityControls.length + 1),
      product_id: qcItem.id,
      batch: qcItem.batch || '',
      received_qty: qcReceivedQty,
      inspected_qty: qcInspectedQty,
      defect_qty: qcDefectQty,
      defect_reason: qcDefectReason,
      inspection_date: new Date().toISOString(),
      inspected_by: 'QC Team',
      status: qcDefectQty === 0 ? 'pass' : qcDefectQty <= qcInspectedQty * 0.05 ? 'conditional' : 'fail',
    };
    setQualityControls([qcRecord, ...qualityControls]);
    
    if (qcDefectQty > 0) {
      setItems(prev => prev.map(it => it.id === qcItem.id ? { ...it, defect_rate: ((it.defect_rate || 0) + (qcDefectQty / qcInspectedQty)) / 2 } : it));
    }
    
    setQcOpen(false);
    setQcItem(null);
    setQcReceivedQty(0);
    setQcInspectedQty(0);
    setQcDefectQty(0);
    setQcDefectReason('');
  };

  const handleStockTake = () => {
    if (!stockTakeName || !stockTakeDate) return;
    const newStockTake: StockTake = {
      id: 'st' + (stockTakes.length + 1),
      name_fa: stockTakeName,
      name_en: stockTakeName,
      scheduled_date: stockTakeDate,
      status: 'planned',
      counted_items: 0,
      total_items: items.length,
      variance_amount: 0,
      created_at: new Date().toISOString(),
    };
    setStockTakes([newStockTake, ...stockTakes]);
    setStockTakeOpen(false);
    setStockTakeName('');
    setStockTakeDate('');
  };

  const generateBarcode = (sku: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sku)}`;
  };

  const exportABCAnalysis = () => {
    const data = abcAnalysis.map(item => ({
      SKU: item.sku,
      Product: language === 'fa' ? item.name_fa : item.name_en,
      'Total Value': formatCurrencyIRR(item.totalValue),
      'ABC Class': item.abc_class,
      Stock: item.stock,
      'Unit Cost': formatCurrencyIRR(item.unit_cost || 0),
    }));
    const csv = [Object.keys(data[0]), ...data.map(row => Object.values(row))].map(row => row.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `abc-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const kpis = calculateKPIs();

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{language === 'fa' ? 'مدیریت انبار حرفه ای' : 'Professional Inventory Management'}</h2>
            <p className="text-gray-600">{language === 'fa' ? 'نظام جامع شامل تامین کننده، تجزیه ABC، کنترل کیفیت و تحلیل KPI' : 'Comprehensive system with suppliers, ABC analysis, QC, and KPI analytics'}</p>
          </div>
        </div>

        {/* KPI Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'ارزش کل' : 'Total Value'}</p>
              <p className="text-lg font-bold mt-1">{formatCurrencyIRR(kpis.totalValue)}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'نسبت گردش' : 'Turnover Ratio'}</p>
              <p className="text-lg font-bold mt-1">{kpis.turnoverRatio}x</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'فروخته شده' : 'Sold Units'}</p>
              <p className="text-lg font-bold mt-1">{kpis.totalSold}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'موجودی متوسط' : 'Avg Stock'}</p>
              <p className="text-lg font-bold mt-1">{kpis.avgStock.toFixed(0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'نرخ عیب' : 'Defect Rate'}</p>
              <p className="text-lg font-bold mt-1">{kpis.defectRate}%</p>
            </CardContent>
          </Card>
          <Card className="bg-indigo-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'کل اقلام' : 'Total Items'}</p>
              <p className="text-lg font-bold mt-1">{items.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs">{language === 'fa' ? 'نمای کلی' : 'Overview'}</TabsTrigger>
            <TabsTrigger value="abc" className="text-xs">{language === 'fa' ? 'تجزیه ABC' : 'ABC Analysis'}</TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs">{language === 'fa' ? 'تامین' : 'Suppliers'}</TabsTrigger>
            <TabsTrigger value="qc" className="text-xs">{language === 'fa' ? 'کنترل کیفیت' : 'QC'}</TabsTrigger>
            <TabsTrigger value="stocktake" className="text-xs">{language === 'fa' ? 'شمارش' : 'Stock Take'}</TabsTrigger>
            <TabsTrigger value="movements" className="text-xs">{language === 'fa' ? 'حرکات' : 'Movements'}</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">{language === 'fa' ? 'هشدارها' : 'Alerts'}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{language === 'fa' ? 'موجودی کالا' : 'Stock Inventory'}</CardTitle>
                <Input placeholder={language === 'fa' ? 'کد یا نام' : 'SKU or name'} value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">SKU</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'کد' : 'Barcode'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'محصول' : 'Product'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'موجودی' : 'Stock'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'قابل فروش' : 'Available'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'ارزش' : 'Value'}</TableHead>
                        <TableHead className="text-xs">ABC</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'عیب' : 'Defect'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(it => {
                        const abcItem = abcAnalysis.find(a => a.id === it.id);
                        return (
                          <TableRow key={it.id}>
                            <TableCell className="text-xs font-mono">{it.sku}</TableCell>
                            <TableCell>
                              {it.barcode ? (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 px-2">
                                      <QrCode className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-xs">
                                    <DialogHeader>
                                      <DialogTitle className="text-sm">{it.sku}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex justify-center p-4">
                                      <img src={generateBarcode(it.sku)} alt="barcode" className="w-40 h-40" />
                                    </div>
                                    <p className="text-xs text-center text-gray-600">{it.barcode}</p>
                                  </DialogContent>
                                </Dialog>
                              ) : <span className="text-xs text-gray-400">-</span>}
                            </TableCell>
                            <TableCell className="text-xs font-medium">{language === 'fa' ? it.name_fa : it.name_en}</TableCell>
                            <TableCell className="text-xs">{it.stock} {lowStock(it) && <Badge className="ml-1 text-xs" variant="destructive">Low</Badge>}</TableCell>
                            <TableCell className="text-xs font-semibold">{available(it)}</TableCell>
                            <TableCell className="text-xs">{formatCurrencyIRR(totalValue(it))}</TableCell>
                            <TableCell><Badge className={abcItem?.abc_class === 'A' ? 'bg-red-500' : abcItem?.abc_class === 'B' ? 'bg-yellow-500' : 'bg-green-500'} className="text-xs">{abcItem?.abc_class}</Badge></TableCell>
                            <TableCell className="text-xs">{(it.defect_rate || 0).toFixed(1)}%</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Dialog open={entryOpen && entryItem?.id === it.id} onOpenChange={(o) => { if (o) { setEntryItem(it); setEntryOpen(true); } else { setEntryOpen(false); setEntryItem(null); } }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 px-2"><Plus className="w-3 h-3" /></Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle className="text-sm">{language === 'fa' ? 'ورود موجودی' : 'Stock Entry'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-xs">{language === 'fa' ? 'تعداد' : 'Quantity'}</Label>
                                        <Input type="number" value={entryQty} onChange={(e) => setEntryQty(parseInt(e.target.value || '0', 10))} className="text-xs" />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => { setEntryOpen(false); setEntryItem(null); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                        <Button size="sm" onClick={() => { setItems(prev => prev.map(x => x.id === it.id ? { ...x, stock: x.stock + entryQty } : x)); setEntryOpen(false); setEntryItem(null); setEntryQty(0); }}>{language === 'fa' ? 'ثبت' : 'Save'}</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog open={exitOpen && exitItem?.id === it.id} onOpenChange={(o) => { if (o) { setExitItem(it); setExitOpen(true); } else { setExitOpen(false); setExitItem(null); } }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 px-2"><Minus className="w-3 h-3" /></Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle className="text-sm">{language === 'fa' ? 'خروج موجودی' : 'Stock Exit'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                      <div>
                                        <Label className="text-xs">{language === 'fa' ? 'تعداد' : 'Quantity'}</Label>
                                        <Input type="number" value={exitQty} onChange={(e) => setExitQty(parseInt(e.target.value || '0', 10))} className="text-xs" />
                                      </div>
                                      <div className="flex gap-2">
                                        <Button size="sm" variant="outline" onClick={() => { setExitOpen(false); setExitItem(null); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                        <Button size="sm" onClick={() => { setItems(prev => prev.map(x => x.id === it.id ? { ...x, stock: Math.max(0, x.stock - exitQty) } : x)); setExitOpen(false); setExitItem(null); setExitQty(0); }}>{language === 'fa' ? 'ثبت' : 'Save'}</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>

                                <Dialog open={detailsItem?.id === it.id} onOpenChange={(o) => { if (!o) setDetailsItem(null); else { setDetailsItem(it); setItemMovements(movements.filter(m => m.productId === it.id)); } }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 px-2"><Eye className="w-3 h-3" /></Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle className="text-sm">{language === 'fa' ? 'جزئیات' : 'Details'}</DialogTitle>
                                    </DialogHeader>
                                    {detailsItem && <div className="grid grid-cols-2 gap-3 text-xs"><div><p className="font-semibold">{language === 'fa' ? 'نام' : 'Name'}</p><p>{language === 'fa' ? detailsItem.name_fa : detailsItem.name_en}</p></div><div><p className="font-semibold">SKU</p><p>{detailsItem.sku}</p></div><div><p className="font-semibold">{language === 'fa' ? 'موجودی' : 'Stock'}</p><p>{detailsItem.stock}</p></div><div><p className="font-semibold">{language === 'fa' ? 'ارزش' : 'Value'}</p><p>{formatCurrencyIRR(totalValue(detailsItem))}</p></div></div>}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="abc">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><PieChart className="w-4 h-4" /> {language === 'fa' ? 'تجزیه ABC' : 'ABC Inventory Analysis'}</CardTitle>
                <Button size="sm" variant="outline" onClick={exportABCAnalysis}><Download className="w-3 h-3 mr-1" /> {language === 'fa' ? 'صادرات' : 'Export'}</Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg bg-red-50">
                    <p className="text-sm font-semibold text-red-700">{language === 'fa' ? 'کلاس A' : 'Class A'}</p>
                    <p className="text-xs text-gray-600 mt-1">{language === 'fa' ? '80% ارزش' : '80% of value'}</p>
                    <p className="text-lg font-bold mt-2">{abcAnalysis.filter(a => a.abc_class === 'A').length} {language === 'fa' ? 'مورد' : 'items'}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-yellow-50">
                    <p className="text-sm font-semibold text-yellow-700">{language === 'fa' ? 'کلاس B' : 'Class B'}</p>
                    <p className="text-xs text-gray-600 mt-1">{language === 'fa' ? '15% ارزش' : '15% of value'}</p>
                    <p className="text-lg font-bold mt-2">{abcAnalysis.filter(a => a.abc_class === 'B').length} {language === 'fa' ? 'مورد' : 'items'}</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-green-50">
                    <p className="text-sm font-semibold text-green-700">{language === 'fa' ? 'کلاس C' : 'Class C'}</p>
                    <p className="text-xs text-gray-600 mt-1">{language === 'fa' ? '5% ارزش' : '5% of value'}</p>
                    <p className="text-lg font-bold mt-2">{abcAnalysis.filter(a => a.abc_class === 'C').length} {language === 'fa' ? 'مورد' : 'items'}</p>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">SKU</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'محصول' : 'Product'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'موجودی' : 'Stock'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'ارزش کل' : 'Total Value'}</TableHead>
                      <TableHead className="text-xs">%</TableHead>
                      <TableHead className="text-xs">ABC</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {abcAnalysis.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs">{item.sku}</TableCell>
                        <TableCell className="text-xs">{language === 'fa' ? item.name_fa : item.name_en}</TableCell>
                        <TableCell className="text-xs">{item.stock}</TableCell>
                        <TableCell className="text-xs">{formatCurrencyIRR(item.totalValue)}</TableCell>
                        <TableCell className="text-xs">{((item.totalValue / abcAnalysis.reduce((s, a) => s + a.totalValue, 0)) * 100).toFixed(1)}%</TableCell>
                        <TableCell><Badge className={item.abc_class === 'A' ? 'bg-red-500' : item.abc_class === 'B' ? 'bg-yellow-500' : 'bg-green-500'} className="text-xs">{item.abc_class}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-4 h-4" /> {language === 'fa' ? 'تامین کنندگان' : 'Suppliers'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{language === 'fa' ? 'نام' : 'Name'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'ایمیل' : 'Email'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'موقعیت' : 'Lead Time'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'امتیاز' : 'Rating'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'سفارشات' : 'Orders'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'به موقع' : 'On-Time'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suppliers.map(sup => (
                      <TableRow key={sup.id}>
                        <TableCell className="text-xs font-medium">{language === 'fa' ? sup.name_fa : sup.name_en}</TableCell>
                        <TableCell className="text-xs">{sup.email}</TableCell>
                        <TableCell className="text-xs">{sup.lead_time_days} {language === 'fa' ? 'روز' : 'days'}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{sup.rating} ⭐</Badge></TableCell>
                        <TableCell className="text-xs">{sup.total_orders}</TableCell>
                        <TableCell className="text-xs font-semibold text-green-700">{sup.on_time_delivery}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qc">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {language === 'fa' ? 'کنترل کیفیت' : 'Quality Control'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-2">
                  {filtered.map(it => (
                    <Dialog key={it.id} open={qcOpen && qcItem?.id === it.id} onOpenChange={(o) => { if (o) { setQcItem(it); setQcOpen(true); } else { setQcOpen(false); setQcItem(null); } }}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">{it.sku}</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle className="text-sm">{language === 'fa' ? 'فرم کنترل کیفیت' : 'QC Form'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label className="text-xs">{language === 'fa' ? 'تعداد دریافتی' : 'Received Qty'}</Label>
                            <Input type="number" value={qcReceivedQty} onChange={(e) => setQcReceivedQty(parseInt(e.target.value || '0', 10))} className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">{language === 'fa' ? 'تعداد بازرسی شده' : 'Inspected Qty'}</Label>
                            <Input type="number" value={qcInspectedQty} onChange={(e) => setQcInspectedQty(parseInt(e.target.value || '0', 10))} className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">{language === 'fa' ? 'عیب یافت' : 'Defects Found'}</Label>
                            <Input type="number" value={qcDefectQty} onChange={(e) => setQcDefectQty(parseInt(e.target.value || '0', 10))} className="text-xs" />
                          </div>
                          <div>
                            <Label className="text-xs">{language === 'fa' ? 'دلیل عیب' : 'Defect Reason'}</Label>
                            <Textarea value={qcDefectReason} onChange={(e) => setQcDefectReason(e.target.value)} className="text-xs" />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => { setQcOpen(false); setQcItem(null); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                            <Button size="sm" onClick={handleQC}>{language === 'fa' ? 'ثبت QC' : 'Record QC'}</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ))}
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">SKU</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'دسته' : 'Batch'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'بازرسی شده' : 'Inspected'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'عیب' : 'Defects'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'وضعیت' : 'Status'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {qualityControls.map(qc => {
                      const item = items.find(it => it.id === qc.product_id);
                      return (
                        <TableRow key={qc.id}>
                          <TableCell className="text-xs">{item?.sku}</TableCell>
                          <TableCell className="text-xs">{qc.batch}</TableCell>
                          <TableCell className="text-xs">{qc.inspected_qty}</TableCell>
                          <TableCell className="text-xs font-semibold">{qc.defect_qty}</TableCell>
                          <TableCell className="text-xs">{new Date(qc.inspection_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell><Badge className={qc.status === 'pass' ? 'bg-green-500' : qc.status === 'conditional' ? 'bg-yellow-500' : 'bg-red-500'} className="text-xs">{qc.status}</Badge></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stocktake">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><RotateCcw className="w-4 h-4" /> {language === 'fa' ? 'شمارش موجودی' : 'Stock Take'}</CardTitle>
                <Dialog open={stockTakeOpen} onOpenChange={setStockTakeOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="default"><Plus className="w-3 h-3 mr-1" /> {language === 'fa' ? 'جدید' : 'New'}</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle className="text-sm">{language === 'fa' ? 'شمارش جدید' : 'New Stock Take'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs">{language === 'fa' ? 'نام شمارش' : 'Name'}</Label>
                        <Input value={stockTakeName} onChange={(e) => setStockTakeName(e.target.value)} placeholder={language === 'fa' ? 'مثلا: شمارش سالانه' : 'e.g. Annual Count'} className="text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</Label>
                        <Input type="date" value={stockTakeDate} onChange={(e) => setStockTakeDate(e.target.value)} className="text-xs" />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setStockTakeOpen(false); setStockTakeName(''); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                        <Button size="sm" onClick={handleStockTake}>{language === 'fa' ? 'شروع' : 'Start'}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{language === 'fa' ? 'نام' : 'Name'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'تاریخ برنامه ریزی' : 'Scheduled Date'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'وضعیت' : 'Status'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'شمارش شده' : 'Counted'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'نتیجه' : 'Variance'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockTakes.map(st => (
                      <TableRow key={st.id}>
                        <TableCell className="text-xs font-medium">{language === 'fa' ? st.name_fa : st.name_en}</TableCell>
                        <TableCell className="text-xs">{new Date(st.scheduled_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                        <TableCell><Badge className={st.status === 'completed' ? 'bg-green-500' : st.status === 'in_progress' ? 'bg-yellow-500' : 'bg-gray-500'} className="text-xs">{st.status}</Badge></TableCell>
                        <TableCell className="text-xs">{st.counted_items}/{st.total_items}</TableCell>
                        <TableCell className="text-xs font-semibold">{formatCurrencyIRR(st.variance_amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{language === 'fa' ? 'حرکات موجودی' : 'Stock Movements'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead className="text-xs">SKU</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'تعداد' : 'Qty'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'یادداشت' : 'Note'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.slice(0, 10).map(m => (
                        <TableRow key={m.id}>
                          <TableCell className="text-xs">{new Date(m.createdAt).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell className="text-xs">{m.sku}</TableCell>
                          <TableCell className="text-xs"><Badge variant="outline" className="text-xs">{m.type}</Badge></TableCell>
                          <TableCell className={`text-xs font-semibold ${m.quantity < 0 ? 'text-red-600' : 'text-green-700'}`}>{m.quantity}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{m.note || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{language === 'fa' ? 'هشدار ها' : 'Alerts'}</CardTitle>
              </CardHeader>
              <CardContent>
                {alerts.filter(a => !a.resolved).length === 0 ? (
                  <p className="text-xs text-gray-600 text-center py-4">{language === 'fa' ? 'بدون هشدار فعال' : 'No active alerts'}</p>
                ) : (
                  <div className="space-y-2">
                    {alerts.filter(a => !a.resolved).map(alert => (
                      <div key={alert.id} className="flex items-center justify-between p-3 border rounded text-xs bg-yellow-50">
                        <div>
                          <p className="font-semibold">{alert.type}</p>
                          <p className="text-gray-600">{language === 'fa' ? alert.message_fa : alert.message_en}</p>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => resolveAlert(alert.id)}>✓</Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );

  function resolveAlert(alertId: string) {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  }
}
