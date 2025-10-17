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
import { Package, Plus, Minus, AlertTriangle, RefreshCcw, ClipboardList, TrendingUp, TrendingDown, Warehouse, FileText, BarChart3, Eye, Edit2, Download } from 'lucide-react';

interface InventoryItem {
  id: number;
  sku: string;
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
}

interface StockMovement {
  id: string;
  sku: string;
  productId: number;
  type: 'in' | 'out' | 'adjustment' | 'transfer' | 'damage';
  quantity: number;
  note?: string;
  reference?: string;
  from_location?: string;
  to_location?: string;
  unit_cost?: number;
  createdAt: string;
  createdBy?: string;
}

interface StockAlert {
  id: string;
  type: 'low_stock' | 'overstock' | 'expiry_soon' | 'no_movement';
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
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Stock Entry Dialog
  const [entryOpen, setEntryOpen] = useState(false);
  const [entryItem, setEntryItem] = useState<InventoryItem | null>(null);
  const [entryQty, setEntryQty] = useState<number>(0);
  const [entryUnitCost, setEntryUnitCost] = useState<number>(0);
  const [entryReference, setEntryReference] = useState('');
  const [entryNote, setEntryNote] = useState('');
  const [entryBatch, setEntryBatch] = useState('');

  // Stock Exit Dialog
  const [exitOpen, setExitOpen] = useState(false);
  const [exitItem, setExitItem] = useState<InventoryItem | null>(null);
  const [exitQty, setExitQty] = useState<number>(0);
  const [exitType, setExitType] = useState<'out' | 'damage' | 'loss'>('out');
  const [exitReference, setExitReference] = useState('');
  const [exitNote, setExitNote] = useState('');

  // Stock Adjustment Dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNote, setAdjustNote] = useState('');

  // Stock Transfer Dialog
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferItem, setTransferItem] = useState<InventoryItem | null>(null);
  const [transferQty, setTransferQty] = useState<number>(0);
  const [transferFromLoc, setTransferFromLoc] = useState('');
  const [transferToLoc, setTransferToLoc] = useState('');
  const [transferNote, setTransferNote] = useState('');

  // Item Details Dialog
  const [detailsItem, setDetailsItem] = useState<InventoryItem | null>(null);
  const [itemMovements, setItemMovements] = useState<StockMovement[]>([]);

  // Edit Item Dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});

  useEffect(() => {
    const seed: InventoryItem[] = [
      { id: 1, sku: 'PUMP-XL-001', name_en: 'Pool Pump XL', name_fa: 'پمپ استخر XL', stock: 32, reserved: 3, reorder_level: 10, incoming: 20, location: 'A-01', category: 'pumps', unit_cost: 500000, unit_price: 1200000, warehouse: 'Main', batch: 'B001' },
      { id: 2, sku: 'FLT-SAND-200', name_en: 'Sand Filter 200', name_fa: 'فیلتر شنی ۲۰۰', stock: 8, reserved: 1, reorder_level: 12, incoming: 0, location: 'B-04', category: 'filters', unit_cost: 300000, unit_price: 750000, warehouse: 'Main', batch: 'B002' },
      { id: 3, sku: 'LED-LIGHT-RGB', name_en: 'LED Pool Light RGB', name_fa: 'چراغ LED استخر RGB', stock: 54, reserved: 5, reorder_level: 15, incoming: 40, location: 'C-02', category: 'lights', unit_cost: 200000, unit_price: 500000, warehouse: 'Main', batch: 'B003', expiry_date: '2025-12-31' },
      { id: 4, sku: 'CHEM-CL-10', name_en: 'Chlorine 10kg', name_fa: 'کلر ۱۰ کیلو', stock: 5, reserved: 0, reorder_level: 20, incoming: 50, location: 'D-07', category: 'chemicals', unit_cost: 150000, unit_price: 350000, warehouse: 'Main', batch: 'B004', expiry_date: '2025-06-30' },
      { id: 5, sku: 'PIPE-PVC-50', name_en: 'PVC Pipe 50mm', name_fa: 'لوله PVC ۵۰ میلی', stock: 120, reserved: 10, reorder_level: 30, incoming: 0, location: 'A-03', category: 'pipes', unit_cost: 50000, unit_price: 120000, warehouse: 'Secondary', batch: 'B005' },
    ];
    setItems(seed);

    const seedMovements: StockMovement[] = [
      { id: 'm1', sku: 'PUMP-XL-001', productId: 1, type: 'out', quantity: -2, note: 'Sales Order', reference: '#1001', createdAt: new Date(Date.now() - 86400000).toISOString(), createdBy: 'Admin' },
      { id: 'm2', sku: 'FLT-SAND-200', productId: 2, type: 'damage', quantity: -1, note: 'Damaged unit', reference: '', createdAt: new Date(Date.now() - 172800000).toISOString(), createdBy: 'Admin' },
      { id: 'm3', sku: 'LED-LIGHT-RGB', productId: 3, type: 'in', quantity: 40, note: 'Incoming shipment', reference: 'PO-2024-001', unit_cost: 200000, createdAt: new Date(Date.now() - 259200000).toISOString(), createdBy: 'Supplier' },
      { id: 'm4', sku: 'CHEM-CL-10', productId: 4, type: 'adjustment', quantity: 3, note: 'Stock reconciliation', reference: '', createdAt: new Date(Date.now() - 345600000).toISOString(), createdBy: 'Admin' },
      { id: 'm5', sku: 'PIPE-PVC-50', productId: 5, type: 'transfer', quantity: 25, note: 'Transfer to Secondary warehouse', from_location: 'A-03', to_location: 'B-01', createdAt: new Date(Date.now() - 432000000).toISOString(), createdBy: 'Admin' },
    ];
    setMovements(seedMovements);

    const seedAlerts: StockAlert[] = [
      { id: 'a1', type: 'low_stock', severity: 'critical', itemId: 2, message_en: 'Stock below reorder level', message_fa: 'موجودی زیر حد سفارش', createdAt: new Date().toISOString(), resolved: false },
      { id: 'a2', type: 'low_stock', severity: 'warning', itemId: 4, message_en: 'Stock approaching reorder level', message_fa: 'موجودی نزدیک به حد سفارش', createdAt: new Date().toISOString(), resolved: false },
      { id: 'a3', type: 'expiry_soon', severity: 'warning', itemId: 4, message_en: 'Product expiry in 90 days', message_fa: 'انقضای محصول در ۹۰ روز', createdAt: new Date().toISOString(), resolved: false },
    ];
    setAlerts(seedAlerts);
  }, [language]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i =>
      i.sku.toLowerCase().includes(q) ||
      i.name_en.toLowerCase().includes(q) ||
      i.name_fa.toLowerCase().includes(q)
    );
  }, [items, search]);

  const lowStock = (it: InventoryItem) => it.stock <= it.reorder_level;
  const available = (it: InventoryItem) => Math.max(0, it.stock - it.reserved);
  const totalValue = (it: InventoryItem) => (it.unit_cost || 0) * it.stock;

  const handleStockEntry = () => {
    if (!entryItem || entryQty <= 0) return;
    setItems(prev => prev.map(it => it.id === entryItem.id ? { ...it, stock: it.stock + entryQty, incoming: Math.max(0, it.incoming - entryQty) } : it));
    setMovements(prev => [{
      id: 'm' + (prev.length + 1),
      sku: entryItem.sku,
      productId: entryItem.id,
      type: 'in',
      quantity: entryQty,
      unit_cost: entryUnitCost || entryItem.unit_cost,
      note: entryNote || (language === 'fa' ? 'ورود محموله' : 'Stock entry'),
      reference: entryReference,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
    }, ...prev]);
    setEntryOpen(false);
    setEntryItem(null);
    setEntryQty(0);
    setEntryUnitCost(0);
    setEntryReference('');
    setEntryNote('');
    setEntryBatch('');
  };

  const handleStockExit = () => {
    if (!exitItem || exitQty <= 0) return;
    const exitQuantity = exitQty * (exitType === 'out' ? -1 : -1);
    setItems(prev => prev.map(it => it.id === exitItem.id ? { ...it, stock: Math.max(0, it.stock + exitQuantity) } : it));
    setMovements(prev => [{
      id: 'm' + (prev.length + 1),
      sku: exitItem.sku,
      productId: exitItem.id,
      type: exitType === 'out' ? 'out' : exitType === 'damage' ? 'damage' : 'adjustment',
      quantity: exitQuantity,
      note: exitNote || (exitType === 'damage' ? (language === 'fa' ? 'واحد معیوب' : 'Damaged unit') : language === 'fa' ? 'خروج موجودی' : 'Stock exit'),
      reference: exitReference,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
    }, ...prev]);
    setExitOpen(false);
    setExitItem(null);
    setExitQty(0);
    setExitType('out');
    setExitReference('');
    setExitNote('');
  };

  const handleAdjustment = () => {
    if (!adjustItem || !Number.isFinite(adjustQty) || adjustQty === 0) return;
    setItems(prev => prev.map(it => it.id === adjustItem.id ? { ...it, stock: Math.max(0, it.stock + adjustQty) } : it));
    setMovements(prev => [{
      id: 'm' + (prev.length + 1),
      sku: adjustItem.sku,
      productId: adjustItem.id,
      type: 'adjustment',
      quantity: adjustQty,
      note: adjustNote || (language === 'fa' ? 'اصلاح موجودی' : 'Stock adjustment'),
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
    }, ...prev]);
    setAdjustOpen(false);
    setAdjustItem(null);
    setAdjustQty(0);
    setAdjustReason('');
    setAdjustNote('');
  };

  const handleStockTransfer = () => {
    if (!transferItem || transferQty <= 0 || !transferFromLoc || !transferToLoc) return;
    setMovements(prev => [{
      id: 'm' + (prev.length + 1),
      sku: transferItem.sku,
      productId: transferItem.id,
      type: 'transfer',
      quantity: transferQty,
      note: transferNote,
      from_location: transferFromLoc,
      to_location: transferToLoc,
      createdAt: new Date().toISOString(),
      createdBy: 'Admin',
    }, ...prev]);
    setTransferOpen(false);
    setTransferItem(null);
    setTransferQty(0);
    setTransferFromLoc('');
    setTransferToLoc('');
    setTransferNote('');
  };

  const handleEditItem = () => {
    if (!editItem) return;
    setItems(prev => prev.map(it => it.id === editItem.id ? { ...it, ...editData } : it));
    setEditOpen(false);
    setEditItem(null);
    setEditData({});
  };

  const viewItemDetails = (item: InventoryItem) => {
    setDetailsItem(item);
    setItemMovements(movements.filter(m => m.productId === item.id));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true } : a));
  };

  const downloadInventoryReport = () => {
    const data = items.map(item => ({
      SKU: item.sku,
      Product: language === 'fa' ? item.name_fa : item.name_en,
      Stock: item.stock,
      Reserved: item.reserved,
      Available: available(item),
      'Reorder Level': item.reorder_level,
      'Unit Cost': item.unit_cost,
      'Total Value': totalValue(item),
      Location: item.location,
      Category: item.category,
      Warehouse: item.warehouse,
      'Batch/Lot': item.batch,
      'Expiry Date': item.expiry_date || '-',
    }));
    const csv = [Object.keys(data[0]), ...data.map(row => Object.values(row))].map(row => row.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const downloadMovementReport = () => {
    const data = movements.map(m => ({
      Date: new Date(m.createdAt).toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US'),
      SKU: m.sku,
      Type: m.type,
      Quantity: m.quantity,
      Reference: m.reference || '-',
      Note: m.note || '-',
      'Unit Cost': m.unit_cost || '-',
      'Created By': m.createdBy || '-',
    }));
    const csv = [Object.keys(data[0]), ...data.map(row => Object.values(row))].map(row => row.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = `movements-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const statsCards = [
    {
      title_en: 'Total Items',
      title_fa: 'کل محصولات',
      value: items.length,
      icon: Package,
      color: 'blue',
    },
    {
      title_en: 'Total Value',
      title_fa: 'کل ارزش موجودی',
      value: formatCurrencyIRR(items.reduce((sum, it) => sum + totalValue(it), 0)),
      icon: TrendingUp,
      color: 'green',
    },
    {
      title_en: 'Low Stock Items',
      title_fa: 'موارد کمبود',
      value: items.filter(lowStock).length,
      icon: AlertTriangle,
      color: 'red',
    },
    {
      title_en: 'Incoming Stock',
      title_fa: 'موجودی در راه',
      value: items.reduce((sum, it) => sum + it.incoming, 0),
      icon: TrendingDown,
      color: 'purple',
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{language === 'fa' ? 'مدیریت انبار جامع' : 'Comprehensive Inventory Management'}</h2>
            <p className="text-gray-600">{language === 'fa' ? 'کنترل موجودی، ورود/خروج، انتقال، اصلاح و گزارش سازی' : 'Stock control, entry/exit, transfers, adjustments, and reporting'}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={downloadInventoryReport}>
              <Download className="w-4 h-4 mr-2" /> {language === 'fa' ? 'گزارش موجودی' : 'Inventory Report'}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadMovementReport}>
              <Download className="w-4 h-4 mr-2" /> {language === 'fa' ? 'گزارش حرکات' : 'Movements Report'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            const bgColor = stat.color === 'blue' ? 'bg-blue-50' : stat.color === 'green' ? 'bg-green-50' : stat.color === 'red' ? 'bg-red-50' : 'bg-purple-50';
            const iconColor = stat.color === 'blue' ? 'text-blue-600' : stat.color === 'green' ? 'text-green-600' : stat.color === 'red' ? 'text-red-600' : 'text-purple-600';
            return (
              <Card key={idx} className={bgColor}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{language === 'fa' ? stat.title_fa : stat.title_en}</p>
                      <p className="text-2xl font-bold mt-2">{stat.value}</p>
                    </div>
                    <Icon className={`w-8 h-8 ${iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">{language === 'fa' ? 'نمای کلی' : 'Overview'}</TabsTrigger>
            <TabsTrigger value="movements">{language === 'fa' ? 'حرکات' : 'Movements'}</TabsTrigger>
            <TabsTrigger value="alerts">{language === 'fa' ? 'هشدارها' : 'Alerts'}</TabsTrigger>
            <TabsTrigger value="analytics">{language === 'fa' ? 'آمار' : 'Analytics'}</TabsTrigger>
            <TabsTrigger value="settings">{language === 'fa' ? 'تنظیمات' : 'Settings'}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{language === 'fa' ? 'موجودی کالا' : 'Stock Levels'}</CardTitle>
                <div className="flex items-center gap-3">
                  <Input placeholder={language === 'fa' ? 'جستجو بر اساس نام یا کد' : 'Search by name or SKU'} value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>SKU</TableHead>
                        <TableHead>{language === 'fa' ? 'محصول' : 'Product'}</TableHead>
                        <TableHead>{language === 'fa' ? 'موجودی' : 'Stock'}</TableHead>
                        <TableHead>{language === 'fa' ? 'رزرو' : 'Reserved'}</TableHead>
                        <TableHead>{language === 'fa' ? 'قابل فروش' : 'Available'}</TableHead>
                        <TableHead>{language === 'fa' ? 'حد سفارش' : 'Reorder'}</TableHead>
                        <TableHead>{language === 'fa' ? 'ورودی' : 'Incoming'}</TableHead>
                        <TableHead>{language === 'fa' ? 'ارزش کل' : 'Total Value'}</TableHead>
                        <TableHead>{language === 'fa' ? 'مکان' : 'Location'}</TableHead>
                        <TableHead>{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(it => (
                        <TableRow key={it.id}>
                          <TableCell className="font-mono text-xs">{it.sku}</TableCell>
                          <TableCell className="font-medium">{language === 'fa' ? it.name_fa : it.name_en}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{it.stock}</span>
                              {lowStock(it) && <Badge variant="destructive" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" /> {language === 'fa' ? 'کمبود' : 'Low'}</Badge>}
                            </div>
                          </TableCell>
                          <TableCell>{it.reserved}</TableCell>
                          <TableCell className="font-medium">{available(it)}</TableCell>
                          <TableCell>{it.reorder_level}</TableCell>
                          <TableCell><Badge variant="outline">{it.incoming}</Badge></TableCell>
                          <TableCell>{formatCurrencyIRR(totalValue(it))}</TableCell>
                          <TableCell className="text-xs text-gray-600">{it.location}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Dialog open={entryOpen && entryItem?.id === it.id} onOpenChange={(o) => { if (!o) { setEntryOpen(false); setEntryItem(null); setEntryQty(0); setEntryUnitCost(0); setEntryReference(''); setEntryNote(''); } else { setEntryItem(it); setEntryOpen(true); } }}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 px-2" title={language === 'fa' ? 'ورود موجودی' : 'Stock Entry'}>
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{language === 'fa' ? 'ورود موجودی' : 'Stock Entry'}</DialogTitle>
                                    <DialogDescription>
                                      {it.sku} - {language === 'fa' ? it.name_fa : it.name_en}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>{language === 'fa' ? 'تعداد' : 'Quantity'}</Label>
                                      <Input type="number" value={entryQty} onChange={(e) => setEntryQty(parseInt(e.target.value || '0', 10))} />
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'هزینه واحد' : 'Unit Cost'}</Label>
                                      <Input type="number" value={entryUnitCost} onChange={(e) => setEntryUnitCost(parseFloat(e.target.value || '0'))} />
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'شماره حواله/سفارش' : 'Reference (PO/Invoice)'}</Label>
                                      <Input value={entryReference} onChange={(e) => setEntryReference(e.target.value)} placeholder="PO-2024-001" />
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'دسته/لات' : 'Batch/Lot'}</Label>
                                      <Input value={entryBatch} onChange={(e) => setEntryBatch(e.target.value)} placeholder="Batch001" />
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'یادداشت' : 'Note'}</Label>
                                      <Textarea value={entryNote} onChange={(e) => setEntryNote(e.target.value)} placeholder={language === 'fa' ? 'توضیحات اضافی' : 'Additional notes'} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => { setEntryOpen(false); setEntryItem(null); setEntryQty(0); setEntryUnitCost(0); setEntryReference(''); setEntryNote(''); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                      <Button onClick={handleStockEntry}>{language === 'fa' ? 'ثبت ورود' : 'Record Entry'}</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={exitOpen && exitItem?.id === it.id} onOpenChange={(o) => { if (!o) { setExitOpen(false); setExitItem(null); setExitQty(0); setExitType('out'); setExitReference(''); setExitNote(''); } else { setExitItem(it); setExitOpen(true); } }}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 px-2" title={language === 'fa' ? 'خروج موجودی' : 'Stock Exit'}>
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{language === 'fa' ? 'خروج موجودی' : 'Stock Exit'}</DialogTitle>
                                    <DialogDescription>
                                      {it.sku} - {language === 'fa' ? it.name_fa : it.name_en}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>{language === 'fa' ? 'نوع خروج' : 'Exit Type'}</Label>
                                      <Select value={exitType} onValueChange={(v) => setExitType(v as 'out' | 'damage' | 'loss')}>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="out">{language === 'fa' ? 'فروش' : 'Sales'}</SelectItem>
                                          <SelectItem value="damage">{language === 'fa' ? 'معیوب' : 'Damage'}</SelectItem>
                                          <SelectItem value="loss">{language === 'fa' ? 'گم شده' : 'Loss'}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'تعداد' : 'Quantity'}</Label>
                                      <Input type="number" value={exitQty} onChange={(e) => setExitQty(parseInt(e.target.value || '0', 10))} max={available(it)} />
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'شماره سفارش/مرجع' : 'Reference (Order/Ref)'}</Label>
                                      <Input value={exitReference} onChange={(e) => setExitReference(e.target.value)} placeholder="#ORDER-001" />
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'یادداشت' : 'Note'}</Label>
                                      <Textarea value={exitNote} onChange={(e) => setExitNote(e.target.value)} placeholder={language === 'fa' ? 'دلیل خروج' : 'Reason for exit'} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => { setExitOpen(false); setExitItem(null); setExitQty(0); setExitType('out'); setExitReference(''); setExitNote(''); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                      <Button onClick={handleStockExit}>{language === 'fa' ? 'ثبت خروج' : 'Record Exit'}</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={adjustOpen && adjustItem?.id === it.id} onOpenChange={(o) => { if (!o) { setAdjustOpen(false); setAdjustItem(null); setAdjustQty(0); setAdjustReason(''); setAdjustNote(''); } else { setAdjustItem(it); setAdjustOpen(true); } }}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 px-2" title={language === 'fa' ? 'اصلاح موجودی' : 'Adjust'}>
                                    <RefreshCcw className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{language === 'fa' ? 'اصلاح موجودی' : 'Adjust Stock'}</DialogTitle>
                                    <DialogDescription>
                                      {it.sku} - {language === 'fa' ? it.name_fa : it.name_en}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>{language === 'fa' ? 'تعداد تغییر' : 'Quantity Change'}</Label>
                                      <Input type="number" value={adjustQty} onChange={(e) => setAdjustQty(parseInt(e.target.value || '0', 10))} />
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'دلیل اصلاح' : 'Reason'}</Label>
                                      <Select value={adjustReason} onValueChange={setAdjustReason}>
                                        <SelectTrigger>
                                          <SelectValue placeholder={language === 'fa' ? 'انتخاب دلیل' : 'Select reason'} />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="reconciliation">{language === 'fa' ? 'تطابق موجودی' : 'Reconciliation'}</SelectItem>
                                          <SelectItem value="damage">{language === 'fa' ? 'معیوب' : 'Damage'}</SelectItem>
                                          <SelectItem value="loss">{language === 'fa' ? 'گم شده' : 'Loss'}</SelectItem>
                                          <SelectItem value="correction">{language === 'fa' ? 'اصلاح خطا' : 'Correction'}</SelectItem>
                                          <SelectItem value="other">{language === 'fa' ? 'سایر' : 'Other'}</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div>
                                      <Label>{language === 'fa' ? 'یادداشت' : 'Note'}</Label>
                                      <Textarea value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} placeholder={language === 'fa' ? 'توضیحات بیشتری' : 'More details'} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                      <Button variant="outline" onClick={() => { setAdjustOpen(false); setAdjustItem(null); setAdjustQty(0); setAdjustReason(''); setAdjustNote(''); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                      <Button onClick={handleAdjustment}>{language === 'fa' ? 'اعمال اصلاح' : 'Apply Adjustment'}</Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={detailsItem?.id === it.id} onOpenChange={(o) => { if (!o) setDetailsItem(null); else viewItemDetails(it); }}>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 px-2" title={language === 'fa' ? 'نمایش جزئیات' : 'Details'}>
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>{language === 'fa' ? 'جزئیات محصول' : 'Product Details'}</DialogTitle>
                                  </DialogHeader>
                                  {detailsItem && (
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'نام' : 'Name'}</p>
                                          <p className="font-semibold">{language === 'fa' ? detailsItem.name_fa : detailsItem.name_en}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">SKU</p>
                                          <p className="font-semibold">{detailsItem.sku}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'موجودی' : 'Stock'}</p>
                                          <p className="font-semibold">{detailsItem.stock}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'قابل فروش' : 'Available'}</p>
                                          <p className="font-semibold">{available(detailsItem)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'دسته' : 'Category'}</p>
                                          <p className="font-semibold">{detailsItem.category}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'انبار' : 'Warehouse'}</p>
                                          <p className="font-semibold">{detailsItem.warehouse}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'مکان' : 'Location'}</p>
                                          <p className="font-semibold">{detailsItem.location}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'دسته/لات' : 'Batch'}</p>
                                          <p className="font-semibold">{detailsItem.batch || '-'}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'تاریخ انقضا' : 'Expiry Date'}</p>
                                          <p className="font-semibold">{detailsItem.expiry_date || '-'}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'قیمت واحد' : 'Unit Price'}</p>
                                          <p className="font-semibold">{formatCurrencyIRR(detailsItem.unit_price || 0)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'هزینه واحد' : 'Unit Cost'}</p>
                                          <p className="font-semibold">{formatCurrencyIRR(detailsItem.unit_cost || 0)}</p>
                                        </div>
                                        <div>
                                          <p className="text-sm text-gray-600">{language === 'fa' ? 'ارزش کل' : 'Total Value'}</p>
                                          <p className="font-semibold">{formatCurrencyIRR(totalValue(detailsItem))}</p>
                                        </div>
                                      </div>
                                      <Separator />
                                      <div>
                                        <h3 className="font-semibold mb-3">{language === 'fa' ? 'تاریخچه حرکات' : 'Movement History'}</h3>
                                        <div className="max-h-64 overflow-y-auto">
                                          <Table>
                                            <TableHeader>
                                              <TableRow>
                                                <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                                                <TableHead className="text-xs">{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                                                <TableHead className="text-xs">{language === 'fa' ? 'تعداد' : 'Qty'}</TableHead>
                                                <TableHead className="text-xs">{language === 'fa' ? 'یادداشت' : 'Note'}</TableHead>
                                              </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                              {itemMovements.map(m => (
                                                <TableRow key={m.id}>
                                                  <TableCell className="text-xs">{new Date(m.createdAt).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                                                  <TableCell className="text-xs"><Badge variant="outline">{m.type}</Badge></TableCell>
                                                  <TableCell className={`text-xs font-semibold ${m.quantity < 0 ? 'text-red-600' : 'text-green-700'}`}>{m.quantity}</TableCell>
                                                  <TableCell className="text-xs">{m.note || '-'}</TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="movements">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> {language === 'fa' ? 'سوابق حرکات موجودی' : 'Stock Movement History'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>{language === 'fa' ? 'محصول' : 'Product'}</TableHead>
                        <TableHead>{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                        <TableHead>{language === 'fa' ? 'تعداد' : 'Quantity'}</TableHead>
                        <TableHead>{language === 'fa' ? 'هزینه واحد' : 'Unit Cost'}</TableHead>
                        <TableHead>{language === 'fa' ? 'مرجع' : 'Reference'}</TableHead>
                        <TableHead>{language === 'fa' ? 'یادداشت' : 'Note'}</TableHead>
                        <TableHead>{language === 'fa' ? 'کاربر' : 'User'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map(m => {
                        const item = items.find(it => it.id === m.productId);
                        return (
                          <TableRow key={m.id}>
                            <TableCell>{new Date(m.createdAt).toLocaleString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                            <TableCell className="font-mono text-xs">{m.sku}</TableCell>
                            <TableCell>{language === 'fa' ? item?.name_fa : item?.name_en}</TableCell>
                            <TableCell>
                              <Badge variant={m.type === 'in' ? 'default' : 'secondary'}>
                                {m.type === 'in' ? (language === 'fa' ? 'ورود' : 'In') : m.type === 'out' ? (language === 'fa' ? 'خروج' : 'Out') : m.type === 'damage' ? (language === 'fa' ? 'معیوب' : 'Damage') : m.type === 'transfer' ? (language === 'fa' ? 'انتقال' : 'Transfer') : (language === 'fa' ? 'اصلاح' : 'Adjust')}
                              </Badge>
                            </TableCell>
                            <TableCell className={m.quantity < 0 ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>{m.quantity > 0 ? '+' : ''}{m.quantity}</TableCell>
                            <TableCell>{m.unit_cost ? formatCurrencyIRR(m.unit_cost) : '-'}</TableCell>
                            <TableCell className="text-xs text-gray-600">{m.reference || '-'}</TableCell>
                            <TableCell className="text-sm max-w-xs">{m.note || '-'}</TableCell>
                            <TableCell className="text-xs text-gray-600">{m.createdBy || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {language === 'fa' ? 'هشدار ها و اعلانات' : 'Alerts & Notifications'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.filter(a => !a.resolved).length === 0 ? (
                  <div className="text-center py-8 text-gray-600">{language === 'fa' ? 'هیچ هشداری وجود ندارد' : 'No active alerts'}</div>
                ) : (
                  <div className="space-y-3">
                    {alerts.filter(a => !a.resolved).map(alert => {
                      const item = items.find(it => it.id === alert.itemId);
                      const isWarning = alert.severity === 'warning';
                      return (
                        <div key={alert.id} className={`flex items-center justify-between p-4 rounded-lg border ${isWarning ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
                          <div className="flex items-center gap-3">
                            <AlertTriangle className={`w-5 h-5 ${isWarning ? 'text-yellow-700' : 'text-red-700'}`} />
                            <div>
                              <p className="font-medium">{item ? (language === 'fa' ? item.name_fa : item.name_en) : 'Unknown'} - {item?.sku}</p>
                              <p className="text-sm text-gray-600">{language === 'fa' ? alert.message_fa : alert.message_en}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => resolveAlert(alert.id)}>{language === 'fa' ? 'حل شد' : 'Resolve'}</Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> {language === 'fa' ? 'آمار موجودی' : 'Inventory Analytics'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-gray-600">{language === 'fa' ? 'میانگین سطح موجودی' : 'Average Stock Level'}</p>
                      <p className="text-2xl font-bold mt-2">{(items.reduce((sum, it) => sum + it.stock, 0) / items.length).toFixed(1)}</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-600">{language === 'fa' ? 'تعداد تحرک دار' : 'Moving Items'}</p>
                      <p className="text-2xl font-bold mt-2">{items.filter(it => movements.some(m => m.productId === it.id)).length}</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <p className="text-sm text-gray-600">{language === 'fa' ? 'کل حرکات' : 'Total Movements'}</p>
                      <p className="text-2xl font-bold mt-2">{movements.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{language === 'fa' ? 'محصولات پرتحرک' : 'Top Moving Products'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'fa' ? 'محصول' : 'Product'}</TableHead>
                        <TableHead>{language === 'fa' ? 'تعداد حرکات' : 'Movements'}</TableHead>
                        <TableHead>{language === 'fa' ? 'کل تغییر' : 'Total Change'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items
                        .map(it => ({
                          item: it,
                          moveCount: movements.filter(m => m.productId === it.id).length,
                          totalChange: movements.filter(m => m.productId === it.id).reduce((sum, m) => sum + m.quantity, 0),
                        }))
                        .sort((a, b) => b.moveCount - a.moveCount)
                        .slice(0, 5)
                        .map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell className="font-medium">{language === 'fa' ? row.item.name_fa : row.item.name_en}</TableCell>
                            <TableCell>{row.moveCount}</TableCell>
                            <TableCell className={row.totalChange < 0 ? 'text-red-600 font-semibold' : 'text-green-700 font-semibold'}>{row.totalChange}</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'fa' ? 'تنظیمات انبار' : 'Inventory Settings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">{language === 'fa' ? 'مدیریت محصولات' : 'Product Management'}</h3>
                  <div className="space-y-3">
                    {items.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div>
                          <p className="font-medium">{language === 'fa' ? item.name_fa : item.name_en} ({item.sku})</p>
                          <p className="text-xs text-gray-600">{language === 'fa' ? `انبار: ${item.warehouse}` : `Warehouse: ${item.warehouse}`}</p>
                        </div>
                        <Dialog open={editOpen && editItem?.id === item.id} onOpenChange={(o) => { if (!o) { setEditOpen(false); setEditItem(null); setEditData({}); } else { setEditItem(item); setEditData({ ...item }); setEditOpen(true); } }}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="ghost"><Edit2 className="w-4 h-4" /></Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>{language === 'fa' ? 'ویرایش محصول' : 'Edit Product'}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>{language === 'fa' ? 'حد سفارش' : 'Reorder Level'}</Label>
                                <Input type="number" value={editData.reorder_level || 0} onChange={(e) => setEditData({ ...editData, reorder_level: parseInt(e.target.value || '0', 10) })} />
                              </div>
                              <div>
                                <Label>{language === 'fa' ? 'مکان ذخیره' : 'Location'}</Label>
                                <Input value={editData.location || ''} onChange={(e) => setEditData({ ...editData, location: e.target.value })} />
                              </div>
                              <div>
                                <Label>{language === 'fa' ? 'انبار' : 'Warehouse'}</Label>
                                <Input value={editData.warehouse || ''} onChange={(e) => setEditData({ ...editData, warehouse: e.target.value })} />
                              </div>
                              <div>
                                <Label>{language === 'fa' ? 'هزینه واحد' : 'Unit Cost'}</Label>
                                <Input type="number" value={editData.unit_cost || 0} onChange={(e) => setEditData({ ...editData, unit_cost: parseFloat(e.target.value || '0') })} />
                              </div>
                              <div>
                                <Label>{language === 'fa' ? 'قیمت فروش' : 'Unit Price'}</Label>
                                <Input type="number" value={editData.unit_price || 0} onChange={(e) => setEditData({ ...editData, unit_price: parseFloat(e.target.value || '0') })} />
                              </div>
                              <div>
                                <Label>{language === 'fa' ? 'تاریخ انقضا' : 'Expiry Date'}</Label>
                                <Input type="date" value={editData.expiry_date || ''} onChange={(e) => setEditData({ ...editData, expiry_date: e.target.value })} />
                              </div>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => { setEditOpen(false); setEditItem(null); setEditData({}); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                <Button onClick={handleEditItem}>{language === 'fa' ? 'ذخیره' : 'Save'}</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
