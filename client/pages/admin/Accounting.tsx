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
import { useLanguage } from '@/contexts/LanguageContext';
import AdminLayout from '@/components/AdminLayout';
import { formatCurrencyIRR } from '@/lib/utils';
import { Plus, Edit2, Trash2, Eye, Copy, FileText, BarChart3, TrendingUp, AlertCircle, Filter, Download } from 'lucide-react';

interface ChartAccount {
  id: number;
  code: string;
  name_en: string;
  name_fa: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  balance: number;
  debit_balance: number;
  credit_balance: number;
  status: 'active' | 'inactive' | 'archived';
  parent_id?: number;
  description_en?: string;
  description_fa?: string;
  created_date: string;
  is_control_account: boolean;
  bank_account?: string;
}

interface GLEntry {
  id: string;
  date: string;
  reference_number: string;
  journal_type: 'general' | 'sales' | 'purchase' | 'payment' | 'bank' | 'petty_cash';
  account_code: string;
  account_name: string;
  debit_amount: number;
  credit_amount: number;
  description: string;
  cost_center?: string;
  department?: string;
  posted_by: string;
  posted_date: string;
  status: 'draft' | 'posted' | 'voided';
  line_number: number;
  document_reference?: string;
}

export default function AdminAccounting() {
  const { language, dir } = useLanguage();
  const [accounts, setAccounts] = useState<ChartAccount[]>([]);
  const [glEntries, setGlEntries] = useState<GLEntry[]>([]);
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('chart-of-accounts');
  const [filterType, setFilterType] = useState<string>('all');

  // Account Dialog
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartAccount | null>(null);
  const [formData, setFormData] = useState<Partial<ChartAccount>>({});

  useEffect(() => {
    fetchAccounts();
    if (activeTab === 'general-ledger') {
      fetchGeneralLedger();
    } else if (activeTab === 'trial-balance') {
      fetchTrialBalance();
    }
  }, [filterType, activeTab]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterType !== 'all') {
        params.append('type', filterType);
      }
      params.append('status', 'all');

      const response = await fetch(`/api/admin/accounts?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGeneralLedger = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/general-ledger');
      if (!response.ok) throw new Error('Failed to fetch general ledger');
      const data = await response.json();
      setGlEntries(data);
    } catch (error) {
      console.error('Error fetching general ledger:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/trial-balance');
      if (!response.ok) throw new Error('Failed to fetch trial balance');
      const data = await response.json();
      setTrialBalance(data);
    } catch (error) {
      console.error('Error fetching trial balance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = accounts;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(a => 
        a.code.toLowerCase().includes(q) ||
        a.name_en.toLowerCase().includes(q) ||
        a.name_fa.toLowerCase().includes(q)
      );
    }
    if (filterType !== 'all') {
      result = result.filter(a => a.type === filterType);
    }
    return result;
  }, [accounts, search, filterType]);

  const handleSaveAccount = async () => {
    if (!formData.code || !formData.name_en) return;

    try {
      const url = editingAccount
        ? `/api/admin/accounts/${editingAccount.id}`
        : '/api/admin/accounts';
      const method = editingAccount ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save account');
      }

      await fetchAccounts();
      setAccountDialogOpen(false);
      setEditingAccount(null);
      setFormData({});
    } catch (error: any) {
      console.error('Error saving account:', error);
      alert(language === 'fa' ? `خطا: ${error.message}` : `Error: ${error.message}`);
    }
  };

  const deleteAccount = async (id: number) => {
    if (!confirm(language === 'fa' ? 'آیا از حذف این حساب اطمینان دارید؟' : 'Are you sure you want to delete this account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/accounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete account');
      }

      await fetchAccounts();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(language === 'fa' ? `خطا: ${error.message}` : `Error: ${error.message}`);
    }
  };

  const totalDebit = filtered.reduce((sum, a) => sum + a.debit_balance, 0);
  const totalCredit = filtered.reduce((sum, a) => sum + a.credit_balance, 0);

  const typeColors: Record<string, string> = {
    asset: 'bg-blue-50',
    liability: 'bg-red-50',
    equity: 'bg-green-50',
    revenue: 'bg-purple-50',
    expense: 'bg-orange-50',
  };

  const typeIcons: Record<string, string> = {
    asset: '📊',
    liability: '📉',
    equity: '📈',
    revenue: '💰',
    expense: '💸',
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{language === 'fa' ? 'حسابداری' : 'Accounting'}</h2>
            <p className="text-gray-600">{language === 'fa' ? 'دفتر کل، خطة حسابها و ثبت روزنامه' : 'General Ledger, Chart of Accounts and Journal Entries'}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chart-of-accounts">{language === 'fa' ? 'خطة حساب' : 'Chart of Accounts'}</TabsTrigger>
            <TabsTrigger value="general-ledger">{language === 'fa' ? 'دفتر کل' : 'General Ledger'}</TabsTrigger>
            <TabsTrigger value="trial-balance">{language === 'fa' ? 'میزان آزمایشی' : 'Trial Balance'}</TabsTrigger>
          </TabsList>

          <TabsContent value="chart-of-accounts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" /> {language === 'fa' ? 'خطة حساب' : 'Chart of Accounts'}</CardTitle>
                <Dialog open={accountDialogOpen} onOpenChange={setAccountDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> {language === 'fa' ? 'حساب جدید' : 'New Account'}</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingAccount ? (language === 'fa' ? 'ویرایش حساب' : 'Edit Account') : (language === 'fa' ? 'حساب جدید' : 'New Account')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'کد حساب' : 'Account Code'}</Label>
                          <Input 
                            value={formData.code || ''} 
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="1000"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'نام انگلیسی' : 'Name (English)'}</Label>
                          <Input 
                            value={formData.name_en || ''} 
                            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                            placeholder="Cash & Equivalents"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'نام فارسی' : 'Name (Persian)'}</Label>
                          <Input 
                            value={formData.name_fa || ''} 
                            onChange={(e) => setFormData({ ...formData, name_fa: e.target.value })}
                            placeholder="نقد و اسکناس"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'نوع حساب' : 'Account Type'}</Label>
                          <Select value={formData.type || 'asset'} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="asset">{language === 'fa' ? 'دارایی' : 'Asset'}</SelectItem>
                              <SelectItem value="liability">{language === 'fa' ? 'بدهی' : 'Liability'}</SelectItem>
                              <SelectItem value="equity">{language === 'fa' ? 'حقوق صاحبان' : 'Equity'}</SelectItem>
                              <SelectItem value="revenue">{language === 'fa' ? 'درآمد' : 'Revenue'}</SelectItem>
                              <SelectItem value="expense">{language === 'fa' ? 'هزینه' : 'Expense'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'دسته بندی' : 'Category'}</Label>
                          <Input 
                            value={formData.category || ''} 
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="current_assets"
                          />
                        </div>
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'وضعیت' : 'Status'}</Label>
                          <Select value={formData.status || 'active'} onValueChange={(v) => setFormData({ ...formData, status: v as any })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">{language === 'fa' ? 'فعال' : 'Active'}</SelectItem>
                              <SelectItem value="inactive">{language === 'fa' ? 'غیرفعال' : 'Inactive'}</SelectItem>
                              <SelectItem value="archived">{language === 'fa' ? 'بایگانی شده' : 'Archived'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setAccountDialogOpen(false); setEditingAccount(null); setFormData({}); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                        <Button onClick={handleSaveAccount}>{language === 'fa' ? 'ذخیره' : 'Save'}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input 
                    placeholder={language === 'fa' ? 'جستجو کد یا نام' : 'Search code or name'} 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'fa' ? 'همه' : 'All'}</SelectItem>
                      <SelectItem value="asset">{language === 'fa' ? 'دارایی' : 'Assets'}</SelectItem>
                      <SelectItem value="liability">{language === 'fa' ? 'بدهی' : 'Liabilities'}</SelectItem>
                      <SelectItem value="equity">{language === 'fa' ? 'حقوق' : 'Equity'}</SelectItem>
                      <SelectItem value="revenue">{language === 'fa' ? 'درآمد' : 'Revenue'}</SelectItem>
                      <SelectItem value="expense">{language === 'fa' ? 'هزینه' : 'Expense'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'کد' : 'Code'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'نام' : 'Name'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'بدهکار' : 'Debit'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'بستانکار' : 'Credit'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'موجودی' : 'Balance'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'وضعیت' : 'Status'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(account => (
                        <TableRow key={account.id}>
                          <TableCell className="font-mono text-xs font-semibold">{account.code}</TableCell>
                          <TableCell className="text-xs">
                            <div className="font-medium">{language === 'fa' ? account.name_fa : account.name_en}</div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline">{typeIcons[account.type]} {language === 'fa' ? (account.type === 'asset' ? 'دارایی' : account.type === 'liability' ? 'بدهی' : account.type === 'equity' ? 'حقوق' : account.type === 'revenue' ? 'درآمد' : 'هزینه') : account.type}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right">{formatCurrencyIRR(account.debit_balance)}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrencyIRR(account.credit_balance)}</TableCell>
                          <TableCell className="text-xs text-right font-bold">{formatCurrencyIRR(account.balance)}</TableCell>
                          <TableCell className="text-xs">
                            <Badge className={account.status === 'active' ? 'bg-green-500' : account.status === 'inactive' ? 'bg-yellow-500' : 'bg-gray-500'}>
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2"
                                onClick={() => {
                                  setEditingAccount(account);
                                  setFormData(account);
                                  setAccountDialogOpen(true);
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-7 px-2 text-red-600"
                                onClick={() => deleteAccount(account.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-gray-50">
                        <TableCell colSpan={3}>{language === 'fa' ? 'مجموع' : 'Total'}</TableCell>
                        <TableCell className="text-right">{formatCurrencyIRR(totalDebit)}</TableCell>
                        <TableCell className="text-right">{formatCurrencyIRR(totalCredit)}</TableCell>
                        <TableCell className="text-right">{formatCurrencyIRR(totalDebit - totalCredit)}</TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="general-ledger">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> {language === 'fa' ? 'دفتر کل' : 'General Ledger'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'مرجع' : 'Reference'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'کد' : 'Code'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'حساب' : 'Account'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'بدهکار' : 'Debit'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'بستانکار' : 'Credit'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'توضیح' : 'Description'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {glEntries.map(entry => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs">{new Date(entry.date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell className="text-xs font-mono">{entry.reference_number}</TableCell>
                          <TableCell className="text-xs"><Badge variant="outline" className="text-xs">{entry.journal_type}</Badge></TableCell>
                          <TableCell className="text-xs font-mono">{entry.account_code}</TableCell>
                          <TableCell className="text-xs">{entry.account_name}</TableCell>
                          <TableCell className="text-xs text-right">{entry.debit_amount > 0 ? formatCurrencyIRR(entry.debit_amount) : '-'}</TableCell>
                          <TableCell className="text-xs text-right">{entry.credit_amount > 0 ? formatCurrencyIRR(entry.credit_amount) : '-'}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{entry.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trial-balance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" /> {language === 'fa' ? 'میزان آزمایشی' : 'Trial Balance'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'کد' : 'Code'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'نام حساب' : 'Account Name'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'بدهکار' : 'Debit'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'بستانکار' : 'Credit'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">{language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}</p>
                          </TableCell>
                        </TableRow>
                      ) : trialBalance.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                            {language === 'fa' ? 'داده‌ای یافت نشد' : 'No data found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {trialBalance.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-xs font-mono">{item.code}</TableCell>
                              <TableCell className="text-xs">{language === 'fa' ? item.name_fa : item.name_en}</TableCell>
                              <TableCell className="text-xs text-right">{item.total_debit > 0 ? formatCurrencyIRR(item.total_debit) : '-'}</TableCell>
                              <TableCell className="text-xs text-right">{item.total_credit > 0 ? formatCurrencyIRR(item.total_credit) : '-'}</TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="font-bold bg-gray-50">
                            <TableCell colSpan={2}>{language === 'fa' ? 'مجموع' : 'Total'}</TableCell>
                            <TableCell className="text-right">{formatCurrencyIRR(trialBalance.reduce((sum: number, a: any) => sum + (a.total_debit || 0), 0))}</TableCell>
                            <TableCell className="text-right">{formatCurrencyIRR(trialBalance.reduce((sum: number, a: any) => sum + (a.total_credit || 0), 0))}</TableCell>
                          </TableRow>
                        </>
                      )}
                    </TableBody>
                  </Table>
                </div>
                {!loading && trialBalance.length > 0 && (
                  <div className={`mt-6 p-4 rounded-lg ${
                    Math.abs(
                      trialBalance.reduce((sum: number, a: any) => sum + (a.total_debit || 0), 0) -
                      trialBalance.reduce((sum: number, a: any) => sum + (a.total_credit || 0), 0)
                    ) < 0.01
                      ? 'bg-green-50'
                      : 'bg-red-50'
                  }`}>
                    <p className={`text-sm ${
                      Math.abs(
                        trialBalance.reduce((sum: number, a: any) => sum + (a.total_debit || 0), 0) -
                        trialBalance.reduce((sum: number, a: any) => sum + (a.total_credit || 0), 0)
                      ) < 0.01
                        ? 'text-green-900'
                        : 'text-red-900'
                    }`}>
                      {Math.abs(
                        trialBalance.reduce((sum: number, a: any) => sum + (a.total_debit || 0), 0) -
                        trialBalance.reduce((sum: number, a: any) => sum + (a.total_credit || 0), 0)
                      ) < 0.01
                        ? (language === 'fa' ? '✓ میزان آزمایشی برابر است' : '✓ Trial Balance is balanced')
                        : (language === 'fa' ? '✗ میزان آزمایشی برابر نیست' : '✗ Trial Balance is not balanced')
                      }
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
