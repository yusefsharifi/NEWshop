import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrencyIRR } from '@/lib/utils';
import { Plus, Edit2, Trash2, Eye, CheckCircle, Download, AlertTriangle, Clock, FileText, TrendingUp } from 'lucide-react';

interface BillLineItem {
  id?: number;
  ap_bill_id?: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

interface Bill {
  id: number;
  bill_number: string;
  vendor_name: string;
  vendor_email?: string;
  vendor_phone?: string;
  bill_date: string;
  due_date: string;
  items: BillLineItem[];
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: 'draft' | 'received' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  payment_terms?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  payments?: BillPayment[];
}

interface BillPayment {
  id: number;
  payment_number: string;
  ap_bill_id: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
  payment_amount: number;
  reference_number?: string;
  notes?: string;
  created_at?: string;
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  payment_terms: string;
  tax_id?: string;
  current_due: number;
  total_purchased: number;
  status: 'active' | 'inactive' | 'suspended';
}

export default function AccountsPayable() {
  const { language, dir } = useLanguage();
  const [bills, setBills] = useState<Bill[]>([]);
  const [billPayments, setBillPayments] = useState<BillPayment[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('bills');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [agingData, setAgingData] = useState<any[]>([]);

  // Payment Dialog
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<{
    payment_date?: string;
    payment_method?: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
    amount?: number;
    reference_number?: string;
    notes?: string;
  }>({
    payment_date: new Date().toISOString().split('T')[0],
    payment_method: 'bank_transfer',
  });
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<Bill | null>(null);

  // Fetch AP Bills
  const fetchBills = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/admin/ap/bills?${params}`);
      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      setBills(data);
      
      // Extract all payments from bills
      const allPayments: BillPayment[] = [];
      data.forEach((bill: Bill) => {
        if (bill.payments) {
          allPayments.push(...bill.payments);
        }
      });
      setBillPayments(allPayments);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Aging Report
  const fetchAging = async () => {
    try {
      const response = await fetch('/api/admin/ap/aging');
      if (!response.ok) throw new Error('Failed to fetch aging report');
      const data = await response.json();
      setAgingData(data);
    } catch (error) {
      console.error('Error fetching aging report:', error);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchAging();
  }, [filterStatus]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchBills();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    return bills.sort((a, b) => new Date(b.bill_date).getTime() - new Date(a.bill_date).getTime());
  }, [bills]);

  const totalBilled = bills.reduce((sum, bill) => sum + bill.total_amount, 0);
  const totalPaid = bills.reduce((sum, bill) => sum + (bill.paid_amount || 0), 0);
  const totalDue = bills.reduce((sum, bill) => sum + bill.balance_amount, 0);
  const overdue = bills.filter(b => b.status === 'overdue').reduce((sum, bill) => sum + bill.balance_amount, 0);

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    received: 'bg-blue-500',
    partial: 'bg-yellow-500',
    paid: 'bg-green-500',
    overdue: 'bg-red-500',
    cancelled: 'bg-gray-500',
  };

  const recordPayment = async () => {
    if (!selectedBillForPayment || !paymentForm.amount || paymentForm.amount <= 0) return;
    
    try {
      const response = await fetch('/api/admin/ap/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ap_bill_id: selectedBillForPayment.id,
          payment_date: paymentForm.payment_date || new Date().toISOString().split('T')[0],
          payment_method: paymentForm.payment_method || 'bank_transfer',
          payment_amount: paymentForm.amount,
          reference_number: paymentForm.reference_number,
          notes: paymentForm.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to record payment');
      
      // Refresh bills
      await fetchBills();
      await fetchAging();

      setPaymentDialogOpen(false);
      setSelectedBillForPayment(null);
      setPaymentForm({
        payment_date: new Date().toISOString().split('T')[0],
        payment_method: 'bank_transfer',
        amount: undefined,
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      alert(language === 'fa' ? 'خطا در ثبت پرداخت' : 'Error recording payment');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{language === 'fa' ? 'حسابهای پرداختنی' : 'Accounts Payable'}</h2>
            <p className="text-gray-600">{language === 'fa' ? 'فاکتورهای فروشندگان، پرداخت‌ها و مدیریت بدهی' : 'Vendor bills, payments, and debt management'}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'کل خریداری' : 'Total Purchases'}</p>
              <p className="text-2xl font-bold mt-2">{formatCurrencyIRR(totalBilled)}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'پرداخت شده' : 'Total Paid'}</p>
              <p className="text-2xl font-bold mt-2">{formatCurrencyIRR(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'مستحق پرداخت' : 'Outstanding'}</p>
              <p className="text-2xl font-bold mt-2">{formatCurrencyIRR(totalDue)}</p>
            </CardContent>
          </Card>
          <Card className="bg-red-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'سررسید' : 'Overdue'}</p>
              <p className="text-2xl font-bold mt-2">{formatCurrencyIRR(overdue)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bills">{language === 'fa' ? 'فاکتورها' : 'Bills'}</TabsTrigger>
            <TabsTrigger value="payments">{language === 'fa' ? 'پرداخت‌ها' : 'Payments'}</TabsTrigger>
            <TabsTrigger value="aging">{language === 'fa' ? 'تحلیل سن' : 'Aging Analysis'}</TabsTrigger>
          </TabsList>

          <TabsContent value="bills" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> {language === 'fa' ? 'فاکتورهای فروشندگان' : 'Vendor Bills'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder={language === 'fa' ? 'جستجو فاکتور یا فروشندگان' : 'Search bill or vendor'} value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'fa' ? 'همه' : 'All'}</SelectItem>
                      <SelectItem value="draft">{language === 'fa' ? 'پیش نویس' : 'Draft'}</SelectItem>
                      <SelectItem value="approved">{language === 'fa' ? 'تایید شده' : 'Approved'}</SelectItem>
                      <SelectItem value="partially_paid">{language === 'fa' ? 'جزئی پرداخت' : 'Partial'}</SelectItem>
                      <SelectItem value="paid">{language === 'fa' ? 'پرداخت شده' : 'Paid'}</SelectItem>
                      <SelectItem value="overdue">{language === 'fa' ? 'سررسید' : 'Overdue'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'شماره' : 'Bill #'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'فروشندگان' : 'Vendor'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'سررسید' : 'Due'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'کل' : 'Total'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'پرداخت' : 'Paid'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'باقی' : 'Balance'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'وضعیت' : 'Status'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(bill => (
                        <TableRow key={bill.id}>
                          <TableCell className="text-xs font-mono font-bold">{bill.bill_number}</TableCell>
                          <TableCell className="text-xs">{bill.vendor_name}</TableCell>
                          <TableCell className="text-xs">{new Date(bill.bill_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell className="text-xs">{new Date(bill.due_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrencyIRR(bill.total_amount)}</TableCell>
                          <TableCell className="text-xs text-right text-green-700 font-semibold">{formatCurrencyIRR(bill.paid_amount)}</TableCell>
                          <TableCell className="text-xs text-right font-bold">{formatCurrencyIRR(bill.balance_amount)}</TableCell>
                          <TableCell className="text-xs">
                            <Badge className={statusColors[bill.status]}>{bill.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-1">
                              {bill.status !== 'paid' && bill.status !== 'cancelled' && (
                                <Dialog open={paymentDialogOpen && selectedBillForPayment?.id === bill.id} onOpenChange={(o) => { if (o) { setSelectedBillForPayment(bill); setPaymentDialogOpen(true); } else setPaymentDialogOpen(false); }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 px-2" title={language === 'fa' ? 'ثبت پرداخت' : 'Record Payment'}>
                                      <CheckCircle className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle className="text-sm">{language === 'fa' ? 'ثبت پرداخت' : 'Record Payment'}</DialogTitle>
                                      <DialogDescription>{bill.bill_number}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-xs">{language === 'fa' ? 'مبلغ' : 'Amount'}</Label>
                                        <Input type="number" value={paymentForm.amount || ''} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} max={bill.balance_amount} />
                                      </div>
                                      <div>
                                        <Label className="text-xs">{language === 'fa' ? 'روش پرداخت' : 'Payment Method'}</Label>
                                        <Select value={paymentForm.payment_method || 'bank_transfer'} onValueChange={(v) => setPaymentForm({ ...paymentForm, payment_method: v as any })}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="bank_transfer">{language === 'fa' ? 'انتقال بانکی' : 'Bank Transfer'}</SelectItem>
                                            <SelectItem value="check">{language === 'fa' ? 'چک' : 'Check'}</SelectItem>
                                            <SelectItem value="credit_card">{language === 'fa' ? 'کارت اعتباری' : 'Credit Card'}</SelectItem>
                                            <SelectItem value="cash">{language === 'fa' ? 'نقد' : 'Cash'}</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label className="text-xs">{language === 'fa' ? 'شماره مرجع' : 'Reference #'}</Label>
                                        <Input value={paymentForm.reference_number || ''} onChange={(e) => setPaymentForm({ ...paymentForm, reference_number: e.target.value })} />
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button variant="outline" size="sm" onClick={() => { setPaymentDialogOpen(false); setSelectedBillForPayment(null); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                                        <Button size="sm" onClick={recordPayment}>{language === 'fa' ? 'ثبت' : 'Record'}</Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
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

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{language === 'fa' ? 'سابقه پرداخت' : 'Payment History'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'فاکتور' : 'Bill'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'مبلغ' : 'Amount'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'روش' : 'Method'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'مرجع' : 'Reference'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {billPayments.map(pay => {
                        const bill = bills.find(b => b.id === pay.ap_bill_id);
                        return (
                          <TableRow key={pay.id}>
                            <TableCell className="text-xs">{new Date(pay.payment_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                            <TableCell className="text-xs font-mono">{bill?.bill_number || pay.ap_bill_id}</TableCell>
                            <TableCell className="text-xs font-bold text-green-700">{formatCurrencyIRR(pay.payment_amount)}</TableCell>
                            <TableCell className="text-xs">{pay.payment_method}</TableCell>
                            <TableCell className="text-xs">{pay.reference_number || '-'}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aging">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> {language === 'fa' ? 'تحلیل سن حسابها' : 'Accounts Payable Aging'}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{language === 'fa' ? 'دسته سن' : 'Aging Period'}</TableHead>
                      <TableHead className="text-xs text-right">{language === 'fa' ? 'مبلغ' : 'Amount'}</TableHead>
                      <TableHead className="text-xs text-right">{language === 'fa' ? 'درصد' : 'Percent'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow className="bg-green-50">
                      <TableCell className="text-xs font-medium">{language === 'fa' ? 'جاری (0-30 روز)' : 'Current (0-30 days)'}</TableCell>
                      {agingData.length > 0 ? (
                        <>
                          <TableRow className="bg-green-50">
                            <TableCell className="text-xs font-medium">{language === 'fa' ? 'جاری (0-30 روز)' : 'Current (0-30 days)'}</TableCell>
                            <TableCell className="text-xs text-right font-bold">{formatCurrencyIRR(agingData.filter((a: any) => a.aging_category === 'current').reduce((sum: number, a: any) => sum + a.balance_amount, 0))}</TableCell>
                            <TableCell className="text-xs text-right">{totalDue > 0 ? ((agingData.filter((a: any) => a.aging_category === 'current').reduce((sum: number, a: any) => sum + a.balance_amount, 0) / totalDue) * 100).toFixed(1) : 0}%</TableCell>
                          </TableRow>
                          <TableRow className="bg-red-50">
                            <TableCell className="text-xs font-medium">{language === 'fa' ? 'سررسید شده' : 'Overdue'}</TableCell>
                            <TableCell className="text-xs text-right font-bold">{formatCurrencyIRR(agingData.filter((a: any) => a.aging_category === 'overdue').reduce((sum: number, a: any) => sum + a.balance_amount, 0))}</TableCell>
                            <TableCell className="text-xs text-right">{totalDue > 0 ? ((agingData.filter((a: any) => a.aging_category === 'overdue').reduce((sum: number, a: any) => sum + a.balance_amount, 0) / totalDue) * 100).toFixed(1) : 0}%</TableCell>
                          </TableRow>
                        </>
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-xs text-center text-gray-500">{language === 'fa' ? 'داده‌ای یافت نشد' : 'No data found'}</TableCell>
                        </TableRow>
                      )}
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
