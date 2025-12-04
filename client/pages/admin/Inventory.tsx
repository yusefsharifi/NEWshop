import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useToast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrencyIRR } from '@/lib/utils';
import { Package, Plus, Minus, AlertTriangle, RefreshCcw, ClipboardList, TrendingUp, TrendingDown, Warehouse, FileText, BarChart3, Eye, Edit2, Download, QrCode, Users, Zap, CheckCircle, Truck, PieChart, Target, RotateCcw } from 'lucide-react';

interface InventoryItem {
  id: number;
  product_id: number;
  warehouse_id: number;
  sku: string;
  barcode?: string;
  name_en: string;
  name_fa: string;
  stock_on_hand: number;
  reserved_quantity: number;
  incoming_quantity: number;
  damaged_quantity: number;
  reorder_level: number;
  safety_stock: number;
  average_unit_cost: number;
  warehouse_code: string;
  warehouse_name: string;
  available_quantity: number;
  abc_class?: 'A' | 'B' | 'C';
  defect_rate?: number;
  last_count_date?: string;
}

interface StockMovement {
  id: number;
  product_id: number;
  warehouse_id: number;
  direction: 'inbound' | 'outbound';
  movement_type: string;
  quantity: number;
  reference_type?: string;
  reference_code?: string;
  note?: string;
  unit_cost?: number;
  created_at: string;
  created_by?: string;
  warehouse_name?: string;
  warehouse_code?: string;
  name_en: string;
  name_fa: string;
  sku: string;
}

interface InventoryReturn {
  id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number;
  source: string;
  reason?: string;
  reference_code?: string;
  status: string;
  disposition: string;
  note?: string;
  restock_movement_id?: number;
  restocked_at?: string;
  created_at: string;
  resolved_at?: string;
  name_en: string;
  name_fa: string;
  sku: string;
  warehouse_name: string;
}

interface Warehouse {
  id: number;
  code: string;
  name: string;
  city?: string;
  allow_negatives: number;
  is_active: number;
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
  const { toast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [qualityControls, setQualityControls] = useState<QualityControl[]>([]);
  const [stockTakes, setStockTakes] = useState<StockTake[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [warehouseFilter, setWarehouseFilter] = useState('all');
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [submittingMovement, setSubmittingMovement] = useState(false);
  const [inventoryReturns, setInventoryReturns] = useState<InventoryReturn[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);

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

  // Return Dialog
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnInventoryId, setReturnInventoryId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [returnReason, setReturnReason] = useState('');
  const [returnSource, setReturnSource] = useState<'customer' | 'supplier'>('customer');
  const [returnReference, setReturnReference] = useState('');
  const [returnDisposition, setReturnDisposition] = useState<'pending' | 'restock' | 'scrap'>('pending');
  const [returnNote, setReturnNote] = useState('');
  const [creatingReturn, setCreatingReturn] = useState(false);
  const [restockingReturnId, setRestockingReturnId] = useState<number | null>(null);

  // Item Details
  const [detailsItem, setDetailsItem] = useState<InventoryItem | null>(null);
  const [itemMovements, setItemMovements] = useState<StockMovement[]>([]);

  // Edit Item
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editData, setEditData] = useState<Partial<InventoryItem>>({});

  const fetchWarehouses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/warehouses');
      if (!res.ok) throw new Error('Failed to load warehouses');
      const data = await res.json();
      setWarehouses(data);
    } catch (error) {
      console.error(error);
      toast({
        title: language === 'fa' ? 'خطا در بارگذاری انبارها' : 'Warehouse load failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    }
  }, [language, toast]);

  const fetchInventoryItems = useCallback(async () => {
    setLoadingInventory(true);
    try {
      const res = await fetch('/api/admin/inventory/items');
      if (!res.ok) throw new Error('Failed to load inventory items');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error(error);
      toast({
        title: language === 'fa' ? 'خطا در بارگذاری موجودی' : 'Inventory load failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoadingInventory(false);
    }
  }, [language, toast]);

  const fetchMovements = useCallback(async () => {
    setLoadingMovements(true);
    try {
      const res = await fetch('/api/admin/inventory/movements?limit=100');
      if (!res.ok) throw new Error('Failed to load stock movements');
      const data = await res.json();
      setMovements(data);
    } catch (error) {
      console.error(error);
      toast({
        title: language === 'fa' ? 'خطا در بارگذاری گردش' : 'Movements load failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoadingMovements(false);
    }
  }, [language, toast]);

  const fetchReturns = useCallback(async () => {
    setLoadingReturns(true);
    try {
      const res = await fetch('/api/admin/inventory/returns');
      if (!res.ok) throw new Error('Failed to load returns');
      const data = await res.json();
      setInventoryReturns(data);
    } catch (error) {
      console.error(error);
      toast({
        title: language === 'fa' ? 'خطا در بارگذاری مرجوعی' : 'Returns load failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setLoadingReturns(false);
    }
  }, [language, toast]);

  const refreshInventoryData = useCallback(() => {
    fetchInventoryItems();
    fetchMovements();
    fetchReturns();
  }, [fetchInventoryItems, fetchMovements, fetchReturns]);

  useEffect(() => {
    fetchWarehouses();
    fetchInventoryItems();
    fetchMovements();
    fetchReturns();
  }, [fetchWarehouses, fetchInventoryItems, fetchMovements, fetchReturns]);

  useEffect(() => {
    const seedSuppliers: Supplier[] = [
      { id: 1, name_en: 'Global Pool Systems', name_fa: 'سیستم های استخر جهانی', email: 'sales@globalpools.com', phone: '+1-234-567-8900', lead_time_days: 14, rating: 4.8, total_orders: 45, on_time_delivery: 98 },
      { id: 2, name_en: 'AquaTech Supplies', name_fa: 'تامین کنندگان آکوا تک', email: 'info@aquatech.com', phone: '+1-234-567-8901', lead_time_days: 21, rating: 4.5, total_orders: 32, on_time_delivery: 94 },
      { id: 3, name_en: 'Chemical Solutions Inc', name_fa: 'شرکت راهکارهای شیمیایی', email: 'orders@chemsol.com', phone: '+1-234-567-8902', lead_time_days: 10, rating: 4.6, total_orders: 67, on_time_delivery: 96 },
    ];
    setSuppliers(seedSuppliers);

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
    return items.filter(i => {
      const matchesSearch =
        !q ||
        i.sku.toLowerCase().includes(q) ||
        i.name_en.toLowerCase().includes(q) ||
        i.name_fa.toLowerCase().includes(q) ||
        i.barcode?.includes(q);
      const matchesWarehouse =
        warehouseFilter === 'all' || String(i.warehouse_id) === warehouseFilter;
      return matchesSearch && matchesWarehouse;
    });
  }, [items, search, warehouseFilter]);

  const lowStock = (it: InventoryItem) => (it.stock_on_hand || 0) <= (it.reorder_level || 0);
  const available = (it: InventoryItem) => Math.max(0, (it.stock_on_hand || 0) - (it.reserved_quantity || 0));
  const totalValue = (it: InventoryItem) => (it.average_unit_cost || 0) * (it.stock_on_hand || 0);

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
    if (items.length === 0) {
      return { totalValue: 0, totalCost: 0, totalSold: 0, avgStock: 0, turnoverRatio: '0', defectRate: '0.00' };
    }
    const inventoryValue = items.reduce((sum, it) => sum + totalValue(it), 0);
    const totalCost = inventoryValue;
    const totalSold = movements
      .filter(m => m.direction === 'outbound')
      .reduce((sum, m) => sum + Math.abs(m.quantity), 0);
    const avgStock = items.reduce((sum, it) => sum + (it.stock_on_hand || 0), 0) / items.length;
    const turnoverRatio = totalSold > 0 && avgStock > 0 ? (totalSold / avgStock).toFixed(2) : '0';
    const defectRate = items.reduce((sum, it) => sum + (it.defect_rate || 0), 0) / items.length;

    return { totalValue: inventoryValue, totalCost, totalSold, avgStock, turnoverRatio, defectRate: defectRate.toFixed(2) };
  };

  const handleQC = () => {
    if (!qcItem || qcInspectedQty <= 0) return;
    const qcRecord: QualityControl = {
      id: 'qc' + (qualityControls.length + 1),
      product_id: qcItem.product_id,
      batch: qcItem.barcode || 'N/A',
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

  const resetEntryDialog = () => {
    setEntryOpen(false);
    setEntryItem(null);
    setEntryQty(0);
    setEntryUnitCost(0);
    setEntryReference('');
    setEntryNote('');
    setEntryBatch('');
  };

  const resetExitDialog = () => {
    setExitOpen(false);
    setExitItem(null);
    setExitQty(0);
    setExitReference('');
    setExitNote('');
    setExitType('out');
  };

  const handleEntrySubmit = async () => {
    if (!entryItem || entryQty <= 0) {
      toast({
        title: language === 'fa' ? 'اطلاعات ناقص' : 'Missing data',
        description: language === 'fa' ? 'تعداد ورودی باید بیشتر از صفر باشد.' : 'Quantity must be greater than zero.',
        variant: 'destructive',
      });
      return;
    }
    setSubmittingMovement(true);
    try {
      const res = await fetch('/api/admin/inventory/movements/inbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: entryItem.product_id,
          warehouse_id: entryItem.warehouse_id,
          quantity: entryQty,
          unit_cost: entryUnitCost || undefined,
          reference_code: entryReference || undefined,
          note: entryNote || undefined,
          batch_number: entryBatch || undefined,
          movement_type: 'adjustment',
          created_by: 'Admin Portal',
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to record stock entry');
      }
      toast({
        title: language === 'fa' ? 'ورود ثبت شد' : 'Entry recorded',
        description: language === 'fa' ? 'موجودی کالا به روز شد.' : 'Inventory updated successfully.',
      });
      resetEntryDialog();
      refreshInventoryData();
    } catch (error) {
      toast({
        title: language === 'fa' ? 'عدم موفقیت' : 'Operation failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingMovement(false);
    }
  };

  const handleExitSubmit = async () => {
    if (!exitItem || exitQty <= 0) {
      toast({
        title: language === 'fa' ? 'اطلاعات ناقص' : 'Missing data',
        description: language === 'fa' ? 'تعداد خروج باید بیشتر از صفر باشد.' : 'Quantity must be greater than zero.',
        variant: 'destructive',
      });
      return;
    }
    setSubmittingMovement(true);
    try {
      const res = await fetch('/api/admin/inventory/movements/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: exitItem.product_id,
          warehouse_id: exitItem.warehouse_id,
          quantity: exitQty,
          movement_type: exitType,
          reference_code: exitReference || undefined,
          note: exitNote || undefined,
          created_by: 'Admin Portal',
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to record stock issue');
      }
      toast({
        title: language === 'fa' ? 'خروج ثبت شد' : 'Issue recorded',
        description: language === 'fa' ? 'موجودی کالا کاهش یافت.' : 'Inventory decremented successfully.',
      });
      resetExitDialog();
      refreshInventoryData();
    } catch (error) {
      toast({
        title: language === 'fa' ? 'عدم موفقیت' : 'Operation failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setSubmittingMovement(false);
    }
  };

  const resetReturnDialog = () => {
    setReturnDialogOpen(false);
    setReturnInventoryId('');
    setReturnQty(1);
    setReturnReason('');
    setReturnSource('customer');
    setReturnReference('');
    setReturnDisposition('pending');
    setReturnNote('');
  };

  const handleCreateReturn = async () => {
    const targetItem = items.find(it => String(it.id) === returnInventoryId);
    if (!targetItem || returnQty <= 0) {
      toast({
        title: language === 'fa' ? 'اطلاعات ناقص' : 'Missing data',
        description: language === 'fa' ? 'کالا، انبار و تعداد را مشخص کنید.' : 'Please choose an item and quantity.',
        variant: 'destructive',
      });
      return;
    }
    setCreatingReturn(true);
    try {
      const res = await fetch('/api/admin/inventory/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: targetItem.product_id,
          warehouse_id: targetItem.warehouse_id,
          quantity: returnQty,
          source: returnSource,
          reason: returnReason || undefined,
          reference_code: returnReference || undefined,
          disposition: returnDisposition,
          note: returnNote || undefined,
          restock_now: returnDisposition === 'restock',
          created_by: 'Admin Portal',
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to create return');
      }
      toast({
        title: language === 'fa' ? 'مرجوعی ثبت شد' : 'Return recorded',
        description: language === 'fa' ? 'درخواست مرجوعی ذخیره شد.' : 'Return request saved.',
      });
      resetReturnDialog();
      refreshInventoryData();
    } catch (error) {
      toast({
        title: language === 'fa' ? 'عدم موفقیت' : 'Operation failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setCreatingReturn(false);
    }
  };

  const handleRestockReturn = async (returnId: number) => {
    setRestockingReturnId(returnId);
    try {
      const res = await fetch(`/api/admin/inventory/returns/${returnId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restock: true, created_by: 'Admin Portal' }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Failed to restock return');
      }
      toast({
        title: language === 'fa' ? 'انبار شد' : 'Restocked',
        description: language === 'fa' ? 'کالا به موجودی بازگشت.' : 'Item returned to stock.',
      });
      refreshInventoryData();
    } catch (error) {
      toast({
        title: language === 'fa' ? 'عدم موفقیت' : 'Operation failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    } finally {
      setRestockingReturnId(null);
    }
  };

  const generateBarcode = (sku: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sku)}`;
  };

  const exportABCAnalysis = () => {
    if (abcAnalysis.length === 0) {
      toast({
        title: language === 'fa' ? 'داده‌ای برای خروجی نیست' : 'No data to export',
        description: language === 'fa' ? 'ابتدا موجودی را بارگذاری کنید.' : 'Load inventory before exporting.',
      });
      return;
    }
    const data = abcAnalysis.map(item => ({
      SKU: item.sku,
      Product: language === 'fa' ? item.name_fa : item.name_en,
      'Total Value': formatCurrencyIRR(item.totalValue),
      'ABC Class': item.abc_class,
      Stock: item.stock_on_hand || 0,
      'Unit Cost': formatCurrencyIRR(item.average_unit_cost || 0),
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
          <TabsList className="grid w-full grid-cols-8 overflow-x-auto">
            <TabsTrigger value="overview" className="text-xs">{language === 'fa' ? 'نمای کلی' : 'Overview'}</TabsTrigger>
            <TabsTrigger value="abc" className="text-xs">{language === 'fa' ? 'تجزیه ABC' : 'ABC Analysis'}</TabsTrigger>
            <TabsTrigger value="suppliers" className="text-xs">{language === 'fa' ? 'تامین' : 'Suppliers'}</TabsTrigger>
            <TabsTrigger value="qc" className="text-xs">{language === 'fa' ? 'کنترل کیفیت' : 'QC'}</TabsTrigger>
            <TabsTrigger value="stocktake" className="text-xs">{language === 'fa' ? 'شمارش' : 'Stock Take'}</TabsTrigger>
            <TabsTrigger value="movements" className="text-xs">{language === 'fa' ? 'حرکات' : 'Movements'}</TabsTrigger>
            <TabsTrigger value="returns" className="text-xs">{language === 'fa' ? 'مرجوعی' : 'Returns'}</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs">{language === 'fa' ? 'هشدارها' : 'Alerts'}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle>{language === 'fa' ? 'موجودی کالا' : 'Stock Inventory'}</CardTitle>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Input
                    placeholder={language === 'fa' ? 'کد یا نام' : 'SKU or name'}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="sm:w-48"
                  />
                  <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
                    <SelectTrigger className="sm:w-48 text-xs">
                      <SelectValue placeholder={language === 'fa' ? 'همه انبارها' : 'All warehouses'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'fa' ? 'همه انبارها' : 'All warehouses'}</SelectItem>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={refreshInventoryData}>
                    <RefreshCcw className="w-4 h-4 mr-1" />
                    {language === 'fa' ? 'به‌روزرسانی' : 'Refresh'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">SKU</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'کد' : 'Barcode'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'محصول' : 'Product'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'انبار' : 'Warehouse'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'موجودی' : 'Stock'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'قابل فروش' : 'Available'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'ارزش' : 'Value'}</TableHead>
                        <TableHead className="text-xs">ABC</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'عیب' : 'Defect'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingInventory ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-xs py-6 text-center text-gray-500">
                            {language === 'fa' ? 'در حال بارگذاری موجودی...' : 'Loading inventory...'}
                          </TableCell>
                        </TableRow>
                      ) : filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="text-xs py-6 text-center text-gray-500">
                            {language === 'fa' ? 'آیتمی یافت نشد' : 'No items found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map(it => {
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
                              <TableCell className="text-xs">{it.warehouse_name}</TableCell>
                              <TableCell className="text-xs">
                                {it.stock_on_hand}{' '}
                                {lowStock(it) && <Badge className="ml-1 text-xs" variant="destructive">{language === 'fa' ? 'کم' : 'Low'}</Badge>}
                              </TableCell>
                              <TableCell className="text-xs font-semibold">{available(it)}</TableCell>
                              <TableCell className="text-xs">{formatCurrencyIRR(totalValue(it))}</TableCell>
                              <TableCell>
                                <Badge className={`text-xs ${abcItem?.abc_class === 'A' ? 'bg-red-500' : abcItem?.abc_class === 'B' ? 'bg-yellow-500' : 'bg-green-500'}`}>
                                  {abcItem?.abc_class || '-'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs">{(it.defect_rate || 0).toFixed(1)}%</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Dialog
                                    open={entryOpen && entryItem?.id === it.id}
                                    onOpenChange={(o) => {
                                      if (o) {
                                        setEntryItem(it);
                                        setEntryQty(0);
                                        setEntryUnitCost(it.average_unit_cost || 0);
                                        setEntryReference('');
                                        setEntryNote('');
                                        setEntryBatch('');
                                        setEntryOpen(true);
                                      } else {
                                        resetEntryDialog();
                                      }
                                    }}
                                  >
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
                                        <div>
                                          <Label className="text-xs">{language === 'fa' ? 'قیمت واحد' : 'Unit cost'}</Label>
                                          <Input type="number" value={entryUnitCost} onChange={(e) => setEntryUnitCost(parseFloat(e.target.value || '0'))} className="text-xs" />
                                        </div>
                                        <div>
                                          <Label className="text-xs">{language === 'fa' ? 'ارجاع' : 'Reference'}</Label>
                                          <Input value={entryReference} onChange={(e) => setEntryReference(e.target.value)} className="text-xs" />
                                        </div>
                                        <div>
                                          <Label className="text-xs">{language === 'fa' ? 'سری ساخت' : 'Batch'}</Label>
                                          <Input value={entryBatch} onChange={(e) => setEntryBatch(e.target.value)} className="text-xs" />
                                        </div>
                                        <div>
                                          <Label className="text-xs">{language === 'fa' ? 'یادداشت' : 'Note'}</Label>
                                          <Textarea value={entryNote} onChange={(e) => setEntryNote(e.target.value)} className="text-xs" />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button size="sm" variant="outline" onClick={resetEntryDialog}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                          <Button size="sm" onClick={handleEntrySubmit} disabled={submittingMovement}>
                                            {submittingMovement ? (language === 'fa' ? 'در حال ثبت...' : 'Saving...') : (language === 'fa' ? 'ثبت' : 'Save')}
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  <Dialog
                                    open={exitOpen && exitItem?.id === it.id}
                                    onOpenChange={(o) => {
                                      if (o) {
                                        setExitItem(it);
                                        setExitQty(0);
                                        setExitReference('');
                                        setExitNote('');
                                        setExitType('out');
                                        setExitOpen(true);
                                      } else {
                                        resetExitDialog();
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-6 px-2"><Minus className="w-3 h-3" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-sm">
                                      <DialogHeader>
                                        <DialogTitle className="text-sm">{language === 'fa' ? 'خروج موجودی' : 'Stock Exit'}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-3">
                                        <div>
                                          <Label className="text-xs">{language === 'fa' ? 'نوع خروج' : 'Issue type'}</Label>
                                          <Select value={exitType} onValueChange={(v: 'out' | 'damage' | 'return') => setExitType(v)}>
                                            <SelectTrigger className="text-xs">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="out">{language === 'fa' ? 'فروش / خروج' : 'Sale / Issue'}</SelectItem>
                                              <SelectItem value="damage">{language === 'fa' ? 'خرابی' : 'Damage'}</SelectItem>
                                              <SelectItem value="return">{language === 'fa' ? 'مرجوعی' : 'Return'}</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label className="text-xs">{language === 'fa' ? 'تعداد' : 'Quantity'}</Label>
                                          <Input type="number" value={exitQty} onChange={(e) => setExitQty(parseInt(e.target.value || '0', 10))} className="text-xs" />
                                        </div>
                                        <div>
                                          <Label className="text-xs">{language === 'fa' ? 'ارجاع' : 'Reference'}</Label>
                                          <Input value={exitReference} onChange={(e) => setExitReference(e.target.value)} className="text-xs" />
                                        </div>
                                        <div>
                                          <Label className="text-xs">{language === 'fa' ? 'یادداشت' : 'Note'}</Label>
                                          <Textarea value={exitNote} onChange={(e) => setExitNote(e.target.value)} className="text-xs" />
                                        </div>
                                        <div className="flex gap-2">
                                          <Button size="sm" variant="outline" onClick={resetExitDialog}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                          <Button size="sm" onClick={handleExitSubmit} disabled={submittingMovement}>
                                            {submittingMovement ? (language === 'fa' ? 'در حال ثبت...' : 'Saving...') : (language === 'fa' ? 'ثبت' : 'Save')}
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>

                                  <Dialog
                                    open={detailsItem?.id === it.id}
                                    onOpenChange={(o) => {
                                      if (!o) {
                                        setDetailsItem(null);
                                      } else {
                                        setDetailsItem(it);
                                        setItemMovements(movements.filter(m => m.product_id === it.product_id && m.warehouse_id === it.warehouse_id));
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="ghost" className="h-6 px-2"><Eye className="w-3 h-3" /></Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl">
                                      <DialogHeader>
                                        <DialogTitle className="text-sm">{language === 'fa' ? 'جزئیات' : 'Details'}</DialogTitle>
                                      </DialogHeader>
                                      {detailsItem && (
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                          <div>
                                            <p className="font-semibold">{language === 'fa' ? 'نام' : 'Name'}</p>
                                            <p>{language === 'fa' ? detailsItem.name_fa : detailsItem.name_en}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold">SKU</p>
                                            <p>{detailsItem.sku}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold">{language === 'fa' ? 'انبار' : 'Warehouse'}</p>
                                            <p>{detailsItem.warehouse_name}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold">{language === 'fa' ? 'موجودی' : 'Stock'}</p>
                                            <p>{detailsItem.stock_on_hand}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold">{language === 'fa' ? 'ارزش' : 'Value'}</p>
                                            <p>{formatCurrencyIRR(totalValue(detailsItem))}</p>
                                          </div>
                                        </div>
                                      )}
                                      <div className="mt-4">
                                        <p className="text-xs font-semibold mb-2">{language === 'fa' ? 'آخرین حرکات' : 'Recent movements'}</p>
                                        <div className="max-h-48 overflow-y-auto">
                                          <table className="w-full text-[11px]">
                                            <thead>
                                              <tr className="text-left text-gray-500">
                                                <th>{language === 'fa' ? 'تاریخ' : 'Date'}</th>
                                                <th>{language === 'fa' ? 'نوع' : 'Type'}</th>
                                                <th>{language === 'fa' ? 'تعداد' : 'Qty'}</th>
                                                <th>{language === 'fa' ? 'ارجاع' : 'Ref'}</th>
                                              </tr>
                                            </thead>
                                            <tbody>
                                              {itemMovements.length === 0 ? (
                                                <tr>
                                                  <td colSpan={4} className="text-center py-2 text-gray-500">
                                                    {language === 'fa' ? 'حرکتی ثبت نشده است' : 'No movements yet'}
                                                  </td>
                                                </tr>
                                              ) : (
                                                itemMovements.map(m => (
                                                  <tr key={m.id}>
                                                    <td>{new Date(m.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</td>
                                                    <td>{m.movement_type}</td>
                                                    <td className={m.direction === 'outbound' ? 'text-red-600' : 'text-green-600'}>
                                                      {m.direction === 'outbound' ? '-' : '+'}{m.quantity}
                                                    </td>
                                                    <td>{m.reference_code || '-'}</td>
                                                  </tr>
                                                ))
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
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
                        <TableCell className="text-xs">{item.stock_on_hand || 0}</TableCell>
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
                        <TableHead className="text-xs">{language === 'fa' ? 'انبار' : 'Warehouse'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'تعداد' : 'Qty'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'یادداشت' : 'Note'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingMovements ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-xs text-gray-500 py-4">
                            {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
                          </TableCell>
                        </TableRow>
                      ) : movements.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-xs text-gray-500 py-4">
                            {language === 'fa' ? 'حرکتی یافت نشد' : 'No movements'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        movements.slice(0, 20).map(m => (
                          <TableRow key={m.id}>
                            <TableCell className="text-xs">{new Date(m.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                            <TableCell className="text-xs">{m.sku}</TableCell>
                            <TableCell className="text-xs">{m.warehouse_name}</TableCell>
                            <TableCell className="text-xs">
                              <Badge variant="outline" className="text-xs">{m.movement_type}</Badge>
                            </TableCell>
                            <TableCell className={`text-xs font-semibold ${m.direction === 'outbound' ? 'text-red-600' : 'text-green-700'}`}>
                              {m.direction === 'outbound' ? '-' : '+'}{m.quantity}
                            </TableCell>
                            <TableCell className="text-xs max-w-xs truncate">{m.note || '-'}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns">
            <Card>
              <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />
                  {language === 'fa' ? 'مدیریت مرجوعی' : 'Returns Management'}
                </CardTitle>
                <Dialog
                  open={returnDialogOpen}
                  onOpenChange={(open) => {
                    if (open) {
                      setReturnDialogOpen(true);
                      setReturnInventoryId('');
                      setReturnQty(1);
                      setReturnReason('');
                      setReturnSource('customer');
                      setReturnReference('');
                      setReturnDisposition('pending');
                      setReturnNote('');
                    } else {
                      resetReturnDialog();
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    <Button size="sm" disabled={items.length === 0}>
                      <Plus className="w-3 h-3 mr-1" />
                      {language === 'fa' ? 'ثبت مرجوعی' : 'New Return'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-sm">{language === 'fa' ? 'ثبت مرجوعی جدید' : 'Create Return'}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-xs">
                      <div>
                        <Label>{language === 'fa' ? 'کالا و انبار' : 'Item & warehouse'}</Label>
                        <Select value={returnInventoryId} onValueChange={setReturnInventoryId}>
                          <SelectTrigger className="text-xs">
                            <SelectValue placeholder={language === 'fa' ? 'انتخاب کنید' : 'Select'} />
                          </SelectTrigger>
                          <SelectContent>
                            {items.map(item => (
                              <SelectItem key={item.id} value={String(item.id)}>
                                {item.sku} • {item.warehouse_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label>{language === 'fa' ? 'مقدار' : 'Quantity'}</Label>
                          <Input type="number" value={returnQty} onChange={e => setReturnQty(parseInt(e.target.value || '0', 10))} />
                        </div>
                        <div>
                          <Label>{language === 'fa' ? 'منبع' : 'Source'}</Label>
                          <Select value={returnSource} onValueChange={(v: 'customer' | 'supplier') => setReturnSource(v)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer">{language === 'fa' ? 'مشتری' : 'Customer'}</SelectItem>
                              <SelectItem value="supplier">{language === 'fa' ? 'تامین‌کننده' : 'Supplier'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>{language === 'fa' ? 'ارجاع/فاکتور' : 'Reference'}</Label>
                        <Input value={returnReference} onChange={e => setReturnReference(e.target.value)} />
                      </div>
                      <div>
                        <Label>{language === 'fa' ? 'دلیل' : 'Reason'}</Label>
                        <Input value={returnReason} onChange={e => setReturnReason(e.target.value)} />
                      </div>
                      <div>
                        <Label>{language === 'fa' ? 'وضعیت' : 'Disposition'}</Label>
                        <Select value={returnDisposition} onValueChange={v => setReturnDisposition(v as 'pending' | 'restock' | 'scrap')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">{language === 'fa' ? 'در انتظار' : 'Pending'}</SelectItem>
                            <SelectItem value="restock">{language === 'fa' ? 'بازگشت به انبار' : 'Restock'}</SelectItem>
                            <SelectItem value="scrap">{language === 'fa' ? 'اسقاط' : 'Scrap'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>{language === 'fa' ? 'یادداشت' : 'Note'}</Label>
                        <Textarea value={returnNote} onChange={e => setReturnNote(e.target.value)} />
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={resetReturnDialog}>
                          {language === 'fa' ? 'انصراف' : 'Cancel'}
                        </Button>
                        <Button size="sm" onClick={handleCreateReturn} disabled={creatingReturn}>
                          {creatingReturn ? (language === 'fa' ? 'در حال ثبت...' : 'Saving...') : (language === 'fa' ? 'ثبت' : 'Save')}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead className="text-xs">SKU</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'انبار' : 'Warehouse'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'تعداد' : 'Qty'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'منبع' : 'Source'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'وضعیت' : 'Status'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'تصمیم' : 'Disposition'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loadingReturns ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-xs text-gray-500 py-4">
                            {language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}
                          </TableCell>
                        </TableRow>
                      ) : inventoryReturns.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-xs text-gray-500 py-4">
                            {language === 'fa' ? 'مرجوعی ثبت نشده' : 'No returns recorded'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        inventoryReturns.map(ret => {
                          const canRestock = ret.disposition === 'restock' && ret.status !== 'restocked';
                          return (
                            <TableRow key={ret.id}>
                              <TableCell className="text-xs">{new Date(ret.created_at).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                              <TableCell className="text-xs">{ret.sku}</TableCell>
                              <TableCell className="text-xs">{ret.warehouse_name}</TableCell>
                              <TableCell className="text-xs">{ret.quantity}</TableCell>
                              <TableCell className="text-xs capitalize">{language === 'fa' ? (ret.source === 'customer' ? 'مشتری' : 'تامین‌کننده') : ret.source}</TableCell>
                              <TableCell className="text-xs">
                                <Badge variant="outline" className="text-xs">{ret.status}</Badge>
                              </TableCell>
                              <TableCell className="text-xs capitalize">{ret.disposition}</TableCell>
                              <TableCell className="text-xs">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs"
                                  disabled={!canRestock || restockingReturnId === ret.id}
                                  onClick={() => handleRestockReturn(ret.id)}
                                >
                                  {restockingReturnId === ret.id
                                    ? (language === 'fa' ? 'در حال پردازش' : 'Working...')
                                    : (language === 'fa' ? 'بازگشت به انبار' : 'Restock')}
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
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
