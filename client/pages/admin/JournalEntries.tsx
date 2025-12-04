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
import { Plus, Edit2, Trash2, Eye, FileText, Check, X, RotateCcw, Send, Printer } from 'lucide-react';

interface JournalLine {
  line_number: number;
  account_code: string;
  account_name: string;
  debit: number;
  credit: number;
  cost_center?: string;
  notes?: string;
}

interface JournalEntry {
  id: string;
  entry_number: string;
  entry_date: string;
  posting_date: string;
  journal_type: 'general' | 'sales' | 'purchase' | 'payment' | 'bank' | 'petty_cash';
  reference_number?: string;
  description: string;
  lines: JournalLine[];
  total_debit: number;
  total_credit: number;
  status: 'draft' | 'posted' | 'voided';
  posted_by?: string;
  posted_date?: string;
  notes?: string;
  attachment?: string;
  approval_required: boolean;
  approved_by?: string;
  approved_date?: string;
  created_by: string;
  created_date: string;
}

interface VoucherTemplate {
  id: string;
  name_en: string;
  name_fa: string;
  voucher_type: 'check' | 'receipt' | 'payment' | 'debit_note' | 'credit_note';
  number_sequence: string;
  last_number: number;
  active: boolean;
}

export default function JournalEntries() {
  const { language, dir } = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [templates, setTemplates] = useState<VoucherTemplate[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('journal-entries');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Journal Entry Dialog
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryForm, setEntryForm] = useState<Partial<JournalEntry>>({
    entry_date: new Date().toISOString().split('T')[0],
    journal_type: 'general',
    status: 'draft',
    lines: [],
    approval_required: false,
  });
  const [currentLine, setCurrentLine] = useState<Partial<JournalLine>>({});

  // Voucher Dialog
  const [voucherDialogOpen, setVoucherDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<VoucherTemplate | null>(null);
  const [voucherForm, setVoucherForm] = useState<Partial<VoucherTemplate>>({
    active: true,
  });

  // Details Dialog
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);

  useEffect(() => {
    fetchJournalEntries();
    fetchAccounts();
  }, [filterStatus]);

  const fetchJournalEntries = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'all') {
        params.append('status', filterStatus);
      }

      const response = await fetch(`/api/admin/journal-entries?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch journal entries');
      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/admin/accounts?status=active');
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const data = await response.json();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    }
  };

  const fetchJournalEntryDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/journal-entries/${id}`);
      if (!response.ok) throw new Error('Failed to fetch journal entry details');
      const data = await response.json();
      setSelectedEntry(data);
      setDetailsOpen(true);
    } catch (error) {
      console.error('Error fetching journal entry details:', error);
    }
  };

  const filtered = useMemo(() => {
    let result = entries;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(e =>
        e.entry_number.toLowerCase().includes(q) ||
        e.reference_number?.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }
    if (filterStatus !== 'all') {
      result = result.filter(e => e.status === filterStatus);
    }
    return result.sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime());
  }, [entries, search, filterStatus]);

  const addLineToEntry = () => {
    if (!currentLine.account_code || (!currentLine.debit && !currentLine.credit)) return;
    const newLine: JournalLine = {
      line_number: (entryForm.lines?.length || 0) + 1,
      account_code: currentLine.account_code || '',
      account_name: currentLine.account_name || '',
      debit: currentLine.debit || 0,
      credit: currentLine.credit || 0,
      cost_center: currentLine.cost_center,
      notes: currentLine.notes,
    };
    setEntryForm({
      ...entryForm,
      lines: [...(entryForm.lines || []), newLine],
      total_debit: (entryForm.total_debit || 0) + (currentLine.debit || 0),
      total_credit: (entryForm.total_credit || 0) + (currentLine.credit || 0),
    });
    setCurrentLine({});
  };

  const saveEntry = async () => {
    if (!entryForm.entry_date || !entryForm.description || !entryForm.lines?.length) return;
    if (Math.abs((entryForm.total_debit || 0) - (entryForm.total_credit || 0)) > 0.01) {
      alert(language === 'fa' ? 'مجموع بدهکار و بستانکار برابر نیست' : 'Debit and credit totals do not match');
      return;
    }

    try {
      const url = editingEntry
        ? `/api/admin/journal-entries/${editingEntry.id}`
        : '/api/admin/journal-entries';
      const method = editingEntry ? 'PUT' : 'POST';

      const payload = {
        entry_date: entryForm.entry_date,
        journal_type: entryForm.journal_type,
        reference_number: entryForm.reference_number,
        description: entryForm.description,
        lines: entryForm.lines,
        notes: entryForm.notes,
        approval_required: entryForm.approval_required,
        created_by: 'admin',
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save journal entry');
      }

      await fetchJournalEntries();
      setEntryDialogOpen(false);
      setEditingEntry(null);
      setEntryForm({
        entry_date: new Date().toISOString().split('T')[0],
        journal_type: 'general',
        status: 'draft',
        lines: [],
        approval_required: false,
      });
      setCurrentLine({});
    } catch (error: any) {
      console.error('Error saving journal entry:', error);
      alert(language === 'fa' ? `خطا: ${error.message}` : `Error: ${error.message}`);
    }
  };

  const postEntry = async (entryId: string) => {
    if (!confirm(language === 'fa' ? 'آیا از ثبت این دفتر اطمینان دارید؟' : 'Are you sure you want to post this entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/journal-entries/${entryId}/post`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posted_by: 'admin' }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post journal entry');
      }

      await fetchJournalEntries();
    } catch (error: any) {
      console.error('Error posting journal entry:', error);
      alert(language === 'fa' ? `خطا: ${error.message}` : `Error: ${error.message}`);
    }
  };

  const voidEntry = async (entryId: string) => {
    if (!confirm(language === 'fa' ? 'آیا از لغو این دفتر اطمینان دارید؟' : 'Are you sure you want to void this entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/journal-entries/${entryId}/void`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to void journal entry');
      }

      await fetchJournalEntries();
    } catch (error: any) {
      console.error('Error voiding journal entry:', error);
      alert(language === 'fa' ? `خطا: ${error.message}` : `Error: ${error.message}`);
    }
  };

  const saveVoucher = () => {
    if (!voucherForm.name_en || !voucherForm.voucher_type) return;
    if (editingVoucher) {
      setTemplates(prev =>
        prev.map(t => t.id === editingVoucher.id ? { ...t, ...voucherForm } as VoucherTemplate : t)
      );
    } else {
      const newId = String(templates.length + 1);
      setTemplates([{ id: newId, ...voucherForm } as VoucherTemplate, ...templates]);
    }
    setVoucherDialogOpen(false);
    setEditingVoucher(null);
    setVoucherForm({ active: true });
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-500',
    posted: 'bg-green-500',
    voided: 'bg-red-500',
  };

  const journalTypeIcons: Record<string, string> = {
    general: '📋',
    sales: '💳',
    purchase: '📦',
    payment: '💰',
    bank: '🏦',
    petty_cash: '💸',
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{language === 'fa' ? 'دفاتر روزنامه و سند' : 'Journal Entries & Vouchers'}</h2>
            <p className="text-gray-600">{language === 'fa' ? 'ثبت و مدیریت دفاتر روزنامه، صدور سند و تصمیم گیری' : 'Record journal entries, manage vouchers, and approvals'}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="journal-entries">{language === 'fa' ? 'دفاتر روزنامه' : 'Journal Entries'}</TabsTrigger>
            <TabsTrigger value="voucher-templates">{language === 'fa' ? 'قالب سند' : 'Voucher Templates'}</TabsTrigger>
          </TabsList>

          <TabsContent value="journal-entries" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> {language === 'fa' ? 'دفاتر روزنامه' : 'Journal Entries'}</CardTitle>
                <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> {language === 'fa' ? 'دفتر جدید' : 'New Entry'}</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl">
                    <DialogHeader>
                      <DialogTitle>{editingEntry ? (language === 'fa' ? 'ویرایش دفتر' : 'Edit Entry') : (language === 'fa' ? 'دفتر جدید' : 'New Journal Entry')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'تاریخ' : 'Entry Date'}</Label>
                          <Input
                            type="date"
                            value={entryForm.entry_date || ''}
                            onChange={(e) => setEntryForm({ ...entryForm, entry_date: e.target.value })}
                          />
                        </div>
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'نوع' : 'Type'}</Label>
                          <Select value={entryForm.journal_type || 'general'} onValueChange={(v) => setEntryForm({ ...entryForm, journal_type: v as any })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">{language === 'fa' ? 'عمومی' : 'General'}</SelectItem>
                              <SelectItem value="sales">{language === 'fa' ? 'فروش' : 'Sales'}</SelectItem>
                              <SelectItem value="purchase">{language === 'fa' ? 'خریداری' : 'Purchase'}</SelectItem>
                              <SelectItem value="payment">{language === 'fa' ? 'پرداخت' : 'Payment'}</SelectItem>
                              <SelectItem value="bank">{language === 'fa' ? 'بانک' : 'Bank'}</SelectItem>
                              <SelectItem value="petty_cash">{language === 'fa' ? 'صندوق' : 'Petty Cash'}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">{language === 'fa' ? 'مرجع' : 'Reference'}</Label>
                          <Input
                            value={entryForm.reference_number || ''}
                            onChange={(e) => setEntryForm({ ...entryForm, reference_number: e.target.value })}
                            placeholder="INV-001"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-sm">{language === 'fa' ? 'توضیح' : 'Description'}</Label>
                        <Textarea
                          value={entryForm.description || ''}
                          onChange={(e) => setEntryForm({ ...entryForm, description: e.target.value })}
                          placeholder={language === 'fa' ? 'توضیح دفتر روزنامه' : 'Journal entry description'}
                        />
                      </div>

                      <Separator />

                      <div>
                        <h4 className="font-semibold text-sm mb-3">{language === 'fa' ? 'خطوط دفتر' : 'Journal Lines'}</h4>
                        <div className="space-y-3 border p-3 rounded-lg bg-gray-50">
                          <div className="grid grid-cols-5 gap-2">
                            <div>
                              <Label className="text-xs">{language === 'fa' ? 'حساب' : 'Account'}</Label>
                              <Select
                                value={currentLine.account_code || ''}
                                onValueChange={(value) => {
                                  const account = accounts.find((a: any) => a.code === value);
                                  setCurrentLine({
                                    ...currentLine,
                                    account_code: value,
                                    account_name: account ? (language === 'fa' ? account.name_fa : account.name_en) : '',
                                  });
                                }}
                              >
                                <SelectTrigger className="text-xs h-8">
                                  <SelectValue placeholder={language === 'fa' ? 'انتخاب حساب' : 'Select account'} />
                                </SelectTrigger>
                                <SelectContent>
                                  {accounts.map((account: any) => (
                                    <SelectItem key={account.id} value={account.code}>
                                      {account.code} - {language === 'fa' ? account.name_fa : account.name_en}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="text-xs">{language === 'fa' ? 'نام حساب' : 'Account Name'}</Label>
                              <Input
                                value={currentLine.account_name || ''}
                                readOnly
                                className="text-xs bg-gray-50"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{language === 'fa' ? 'بدهکار' : 'Debit'}</Label>
                              <Input
                                type="number"
                                value={currentLine.debit || 0}
                                onChange={(e) => setCurrentLine({ ...currentLine, debit: parseFloat(e.target.value) || 0, credit: 0 })}
                                className="text-xs"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">{language === 'fa' ? 'بستانکار' : 'Credit'}</Label>
                              <Input
                                type="number"
                                value={currentLine.credit || 0}
                                onChange={(e) => setCurrentLine({ ...currentLine, credit: parseFloat(e.target.value) || 0, debit: 0 })}
                                className="text-xs"
                              />
                            </div>
                            <div className="flex items-end">
                              <Button size="sm" onClick={addLineToEntry}>{language === 'fa' ? 'اضافه' : 'Add'}</Button>
                            </div>
                          </div>

                          {entryForm.lines && entryForm.lines.length > 0 && (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">#</TableHead>
                                  <TableHead className="text-xs">{language === 'fa' ? 'حساب' : 'Account'}</TableHead>
                                  <TableHead className="text-xs text-right">{language === 'fa' ? 'بدهکار' : 'Debit'}</TableHead>
                                  <TableHead className="text-xs text-right">{language === 'fa' ? 'بستانکار' : 'Credit'}</TableHead>
                                  <TableHead className="text-xs">{language === 'fa' ? 'حذف' : 'Remove'}</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {entryForm.lines.map((line, idx) => (
                                  <TableRow key={idx}>
                                    <TableCell className="text-xs">{line.line_number}</TableCell>
                                    <TableCell className="text-xs">{line.account_code} - {line.account_name}</TableCell>
                                    <TableCell className="text-xs text-right">{line.debit > 0 ? formatCurrencyIRR(line.debit) : '-'}</TableCell>
                                    <TableCell className="text-xs text-right">{line.credit > 0 ? formatCurrencyIRR(line.credit) : '-'}</TableCell>
                                    <TableCell>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-6 px-2"
                                        onClick={() => {
                                          const newLines = entryForm.lines!.filter((_, i) => i !== idx);
                                          setEntryForm({
                                            ...entryForm,
                                            lines: newLines,
                                            total_debit: newLines.reduce((sum, l) => sum + l.debit, 0),
                                            total_credit: newLines.reduce((sum, l) => sum + l.credit, 0),
                                          });
                                        }}
                                      >
                                        <X className="w-3 h-3 text-red-600" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow className="font-bold bg-gray-100">
                                  <TableCell colSpan={2}>{language === 'fa' ? 'مجموع' : 'Total'}</TableCell>
                                  <TableCell className="text-right">{formatCurrencyIRR(entryForm.total_debit || 0)}</TableCell>
                                  <TableCell className="text-right">{formatCurrencyIRR(entryForm.total_credit || 0)}</TableCell>
                                  <TableCell></TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setEntryDialogOpen(false); setEditingEntry(null); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                        <Button onClick={saveEntry}>{language === 'fa' ? 'ذخیره' : 'Save'}</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder={language === 'fa' ? 'جستجو شماره یا توضیح' : 'Search entry or reference'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{language === 'fa' ? 'همه' : 'All'}</SelectItem>
                      <SelectItem value="draft">{language === 'fa' ? 'پیش نویس' : 'Draft'}</SelectItem>
                      <SelectItem value="posted">{language === 'fa' ? 'ثبت شده' : 'Posted'}</SelectItem>
                      <SelectItem value="voided">{language === 'fa' ? 'لغو شده' : 'Voided'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'شماره' : 'Entry #'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ' : 'Date'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'مرجع' : 'Reference'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'توضیح' : 'Description'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'بدهکار' : 'Debit'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'بستانکار' : 'Credit'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'وضعیت' : 'Status'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-2 text-gray-600">{language === 'fa' ? 'در حال بارگذاری...' : 'Loading...'}</p>
                          </TableCell>
                        </TableRow>
                      ) : filtered.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                            {language === 'fa' ? 'هیچ دفتری یافت نشد' : 'No journal entries found'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filtered.map(entry => (
                        <TableRow key={entry.id}>
                          <TableCell className="text-xs font-mono font-bold">{entry.entry_number}</TableCell>
                          <TableCell className="text-xs">{new Date(entry.entry_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell className="text-xs">{journalTypeIcons[entry.journal_type]} {entry.journal_type}</TableCell>
                          <TableCell className="text-xs">{entry.reference_number || '-'}</TableCell>
                          <TableCell className="text-xs max-w-xs truncate">{entry.description}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrencyIRR(entry.total_debit)}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrencyIRR(entry.total_credit)}</TableCell>
                          <TableCell className="text-xs">
                            <Badge className={statusColors[entry.status]}>{entry.status}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-6 px-2"
                                onClick={() => {
                                  fetchJournalEntryDetails(String(entry.id));
                                }}
                              >
                                <Eye className="w-3 h-3" />
                              </Button>
                              {entry.status === 'draft' && (
                                <>
                                  <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => postEntry(String(entry.id))} title={language === 'fa' ? 'ثبت دفتر' : 'Post'}>
                                    <Check className="w-3 h-3 text-green-600" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => { setEditingEntry(entry); setEntryForm(entry); setEntryDialogOpen(true); }}>
                                    <Edit2 className="w-3 h-3" />
                                  </Button>
                                </>
                              )}
                              {entry.status === 'posted' && (
                                <Button size="sm" variant="ghost" className="h-6 px-2" onClick={() => voidEntry(String(entry.id))}>
                                  <X className="w-3 h-3 text-red-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Journal Entry Details Dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-sm">{selectedEntry?.entry_number}</DialogTitle>
                </DialogHeader>
                {selectedEntry && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><strong>{language === 'fa' ? 'تاریخ' : 'Date'}:</strong> {new Date(selectedEntry.entry_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</div>
                      <div><strong>{language === 'fa' ? 'نوع' : 'Type'}:</strong> {selectedEntry.journal_type}</div>
                      <div><strong>{language === 'fa' ? 'وصف' : 'Description'}:</strong> {selectedEntry.description}</div>
                      <div><strong>{language === 'fa' ? 'وضعیت' : 'Status'}:</strong> <Badge className={statusColors[selectedEntry.status]}>{selectedEntry.status}</Badge></div>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs">{language === 'fa' ? 'حساب' : 'Account'}</TableHead>
                          <TableHead className="text-xs text-right">{language === 'fa' ? 'بدهکار' : 'Debit'}</TableHead>
                          <TableHead className="text-xs text-right">{language === 'fa' ? 'بستانکار' : 'Credit'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedEntry.lines && selectedEntry.lines.map((line: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="text-xs">{line.account_code} - {line.account_name}</TableCell>
                            <TableCell className="text-xs text-right">{line.debit > 0 ? formatCurrencyIRR(line.debit) : '-'}</TableCell>
                            <TableCell className="text-xs text-right">{line.credit > 0 ? formatCurrencyIRR(line.credit) : '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="voucher-templates">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> {language === 'fa' ? 'قالب سند' : 'Voucher Templates'}</CardTitle>
                <Dialog open={voucherDialogOpen} onOpenChange={setVoucherDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="w-4 h-4 mr-2" /> {language === 'fa' ? 'قالب جدید' : 'New Template'}</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>{editingVoucher ? (language === 'fa' ? 'ویرایش قالب' : 'Edit Template') : (language === 'fa' ? 'قالب جدید' : 'New Template')}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">{language === 'fa' ? 'نام انگلیسی' : 'Name (EN)'}</Label>
                        <Input
                          value={voucherForm.name_en || ''}
                          onChange={(e) => setVoucherForm({ ...voucherForm, name_en: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">{language === 'fa' ? 'نام فارسی' : 'Name (FA)'}</Label>
                        <Input
                          value={voucherForm.name_fa || ''}
                          onChange={(e) => setVoucherForm({ ...voucherForm, name_fa: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label className="text-sm">{language === 'fa' ? 'نوع سند' : 'Voucher Type'}</Label>
                        <Select value={voucherForm.voucher_type || ''} onValueChange={(v) => setVoucherForm({ ...voucherForm, voucher_type: v as any })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="check">{language === 'fa' ? 'چک' : 'Check'}</SelectItem>
                            <SelectItem value="receipt">{language === 'fa' ? 'رسید' : 'Receipt'}</SelectItem>
                            <SelectItem value="payment">{language === 'fa' ? 'پرداخت' : 'Payment'}</SelectItem>
                            <SelectItem value="debit_note">{language === 'fa' ? 'سند بدهی' : 'Debit Note'}</SelectItem>
                            <SelectItem value="credit_note">{language === 'fa' ? 'سند اعتباری' : 'Credit Note'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">{language === 'fa' ? 'پیشوند' : 'Prefix'}</Label>
                        <Input
                          value={voucherForm.number_sequence || ''}
                          onChange={(e) => setVoucherForm({ ...voucherForm, number_sequence: e.target.value })}
                          placeholder="CHK-"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setVoucherDialogOpen(false); setEditingVoucher(null); }}>{language === 'fa' ? 'انصراف' : 'Cancel'}</Button>
                        <Button onClick={saveVoucher}>{language === 'fa' ? 'ذخیره' : 'Save'}</Button>
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
                      <TableHead className="text-xs">{language === 'fa' ? 'نوع' : 'Type'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'پیشوند' : 'Prefix'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'آخرین شماره' : 'Last #'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'فعال' : 'Active'}</TableHead>
                      <TableHead className="text-xs">{language === 'fa' ? 'عملیات' : 'Actions'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map(template => (
                      <TableRow key={template.id}>
                        <TableCell className="text-xs font-medium">{language === 'fa' ? template.name_fa : template.name_en}</TableCell>
                        <TableCell className="text-xs">{template.voucher_type}</TableCell>
                        <TableCell className="text-xs font-mono">{template.number_sequence}</TableCell>
                        <TableCell className="text-xs font-bold">{template.last_number}</TableCell>
                        <TableCell className="text-xs">
                          <Badge className={template.active ? 'bg-green-500' : 'bg-gray-500'}>{template.active ? 'Yes' : 'No'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 px-2"
                            onClick={() => {
                              setEditingVoucher(template);
                              setVoucherForm(template);
                              setVoucherDialogOpen(true);
                            }}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
