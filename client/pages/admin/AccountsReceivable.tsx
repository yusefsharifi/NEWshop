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
import { Plus, Edit2, Trash2, Eye, Download, AlertTriangle, Clock, CheckCircle, XCircle, FileText, TrendingUp } from 'lucide-react';

interface InvoiceLineItem {
  id?: number;
  ar_invoice_id?: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  order_id?: number;
  invoice_id?: number;
  order_number?: string;
  original_invoice_number?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  invoice_date: string;
  due_date: string;
  items: InvoiceLineItem[];
  subtotal: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  balance_amount: number;
  status: 'draft' | 'sent' | 'partial' | 'paid' | 'overdue' | 'cancelled';
  payment_terms?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  payments?: Payment[];
}

interface Payment {
  id: number;
  payment_number: string;
  ar_invoice_id: number;
  payment_date: string;
  payment_method: 'cash' | 'bank_transfer' | 'check' | 'credit_card';
  payment_amount: number;
  reference_number?: string;
  notes?: string;
  created_at?: string;
}

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  credit_limit: number;
  current_due: number;
  total_invoiced: number;
  status: 'active' | 'inactive' | 'suspended';
}

export default function AccountsReceivable() {
  const { language, dir } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('invoices');
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
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);

  // Fetch AR Invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (search) params.append('search', search);
      
      const response = await fetch(`/api/admin/ar/invoices?${params}`);
      if (!response.ok) throw new Error('Failed to fetch invoices');
      const data = await response.json();
      setInvoices(data);
      
      // Extract all payments from invoices
      const allPayments: Payment[] = [];
      data.forEach((inv: Invoice) => {
        if (inv.payments) {
          allPayments.push(...inv.payments);
        }
      });
      setPayments(allPayments);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Aging Report
  const fetchAging = async () => {
    try {
      const response = await fetch('/api/admin/ar/aging');
      if (!response.ok) throw new Error('Failed to fetch aging report');
      const data = await response.json();
      setAgingData(data);
    } catch (error) {
      console.error('Error fetching aging report:', error);
    }
  };

  useEffect(() => {
    fetchInvoices();
    fetchAging();
  }, [filterStatus]);

  useEffect(() => {
    // Debounce search
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    return invoices.sort((a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime());
  }, [invoices]);

  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.paid_amount || 0), 0);
  const totalDue = invoices.reduce((sum, inv) => sum + inv.balance_amount, 0);
  const overdue = invoices.filter(i => i.status === 'overdue').reduce((sum, inv) => sum + inv.balance_amount, 0);

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    sent: 'bg-blue-500',
    partial: 'bg-yellow-500',
    paid: 'bg-green-500',
    overdue: 'bg-red-500',
    cancelled: 'bg-gray-500',
  };

  const recordPayment = async () => {
    if (!selectedInvoiceForPayment || !paymentForm.amount || paymentForm.amount <= 0) return;
    
    try {
      const response = await fetch('/api/admin/ar/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ar_invoice_id: selectedInvoiceForPayment.id,
          payment_date: paymentForm.payment_date || new Date().toISOString().split('T')[0],
          payment_method: paymentForm.payment_method || 'bank_transfer',
          payment_amount: paymentForm.amount,
          reference_number: paymentForm.reference_number,
          notes: paymentForm.notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to record payment');
      
      // Refresh invoices
      await fetchInvoices();
      await fetchAging();

      setPaymentDialogOpen(false);
      setSelectedInvoiceForPayment(null);
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
            <h2 className="text-3xl font-bold text-gray-900">{language === 'fa' ? 'حسابهای دریافتنی' : 'Accounts Receivable'}</h2>
            <p className="text-gray-600">{language === 'fa' ? 'فاکتورها، پرداخت‌ها و ردیابی مشتریان' : 'Invoices, payments, and customer tracking'}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'کل صادره' : 'Total Invoiced'}</p>
              <p className="text-2xl font-bold mt-2">{formatCurrencyIRR(totalInvoiced)}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'دریافت شده' : 'Total Paid'}</p>
              <p className="text-2xl font-bold mt-2">{formatCurrencyIRR(totalPaid)}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600">{language === 'fa' ? 'مستحق الدفع' : 'Outstanding'}</p>
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
            <TabsTrigger value="invoices">{language === 'fa' ? 'فاکتورها' : 'Invoices'}</TabsTrigger>
            <TabsTrigger value="payments">{language === 'fa' ? 'پرداخت‌ها' : 'Payments'}</TabsTrigger>
            <TabsTrigger value="aging">{language === 'fa' ? 'تحلیل سن' : 'Aging Analysis'}</TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> {language === 'fa' ? 'فاکتورها' : 'Invoices'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input placeholder={language === 'fa' ? 'جستجو فاکتور یا مشتری' : 'Search invoice or customer'} value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1" />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'fa' ? 'همه' : 'All'}</SelectItem>
                      <SelectItem value="draft">{language === 'fa' ? 'پیش نویس' : 'Draft'}</SelectItem>
                      <SelectItem value="sent">{language === 'fa' ? 'فرستاده شده' : 'Sent'}</SelectItem>
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
                        <TableHead className="text-xs">{language === 'fa' ? 'شماره' : 'Invoice #'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'مشتری' : 'Customer'}</TableHead>
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
                      {filtered.map(inv => (
                        <TableRow key={inv.id}>
                          <TableCell className="text-xs font-mono font-bold">{inv.invoice_number}</TableCell>
                          <TableCell className="text-xs">{inv.customer_name}</TableCell>
                          <TableCell className="text-xs">{new Date(inv.invoice_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell className="text-xs">{new Date(inv.due_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrencyIRR(inv.total_amount)}</TableCell>
                          <TableCell className="text-xs text-right text-green-700 font-semibold">{formatCurrencyIRR(inv.paid_amount)}</TableCell>
                          <TableCell className="text-xs text-right font-bold">{formatCurrencyIRR(inv.balance_amount)}</TableCell>
                          <TableCell className="text-xs">
                            <Badge className={statusColors[inv.status]}>{inv.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-1">
                              {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                                <Dialog open={paymentDialogOpen && selectedInvoiceForPayment?.id === inv.id} onOpenChange={(o) => { if (o) { setSelectedInvoiceForPayment(inv); setPaymentDialogOpen(true); } else setPaymentDialogOpen(false); }}>
                                  <DialogTrigger asChild>
                                    <Button size="sm" variant="ghost" className="h-6 px-2" title={language === 'fa' ? 'ثبت پرداخت' : 'Record Payment'}>
                                      <CheckCircle className="w-3 h-3" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle className="text-sm">{language === 'fa' ? 'ثبت پرداخت' : 'Record Payment'}</DialogTitle>
                                      <DialogDescription>{inv.invoice_number}</DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-xs">{language === 'fa' ? 'مبلغ' : 'Amount'}</Label>
                                        <Input type="number" value={paymentForm.amount || ''} onChange={(e) => setPaymentForm({ ...paymentForm, amount: parseFloat(e.target.value) || 0 })} max={inv.balance_amount} />
                                      </div>
                                      <div>
                                        <Label className="text-xs">{language === 'fa' ? 'روش پرداخت' : 'Payment Method'}</Label>
                                        <Select value={paymentForm.payment_method || 'bank_transfer'} onValueChange={(v) => setPaymentForm({ ...paymentForm, payment_method: v as any })}>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="bank_transfer">{language === 'fa' ? 'انتقال ��انکی' : 'Bank Transfer'}</SelectItem>
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
                                        <Button variant="outline" size="sm" onClick={() => { setPaymentDialogOpen(false); setSelectedInvoiceForPayment(null); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
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
                <CardTitle className="text-sm">{language === 'fa' ? 'سابقه پرداخت‌ها' : 'Payment History'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'فاکتور' : 'Invoice'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'مبلغ' : 'Amount'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'روش' : 'Method'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'مرجع' : 'Reference'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map(pay => {
                        const invoice = invoices.find(inv => inv.id === pay.ar_invoice_id);
                        return (
                          <TableRow key={pay.id}>
                            <TableCell className="text-xs">{new Date(pay.payment_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                            <TableCell className="text-xs font-mono">{invoice?.invoice_number || pay.ar_invoice_id}</TableCell>
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
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> {language === 'fa' ? 'تحلیل سن حسابها' : 'Accounts Receivable Aging'}</CardTitle>
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
