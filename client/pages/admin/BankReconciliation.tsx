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
import { Plus, Edit2, Trash2, CheckCircle, XCircle, AlertTriangle, Download, FileText, TrendingUp } from 'lucide-react';

interface BankTransaction {
  id: string;
  transaction_date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  type: 'deposit' | 'withdrawal' | 'fee' | 'interest' | 'other';
  matched: boolean;
  matched_to?: string;
  reconciled: boolean;
}

interface GLTransaction {
  id: string;
  transaction_date: string;
  description: string;
  debit: number;
  credit: number;
  reference: string;
  status: 'cleared' | 'outstanding' | 'cancelled';
  matched: boolean;
  matched_to?: string;
  bank_posting_date?: string;
}

interface BankAccount {
  id: string;
  account_name: string;
  account_number: string;
  bank_name: string;
  currency: string;
  current_balance: number;
  last_reconciliation_date?: string;
  reconciliation_status: 'pending' | 'in_progress' | 'completed';
}

interface Reconciliation {
  id: string;
  account_id: string;
  statement_date: string;
  statement_balance: number;
  gl_balance: number;
  reconciled_balance: number;
  outstanding_deposits: number;
  outstanding_checks: number;
  bank_fees: number;
  interest_earned: number;
  variance: number;
  status: 'pending' | 'completed' | 'rejected';
  created_date: string;
  completed_date?: string;
  notes?: string;
}

export default function BankReconciliation() {
  const { language, dir } = useLanguage();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [glTransactions, setGlTransactions] = useState<GLTransaction[]>([]);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [activeTab, setActiveTab] = useState('accounts');
  const [search, setSearch] = useState('');

  // Reconciliation Dialog
  const [reconcileDialogOpen, setReconcileDialogOpen] = useState(false);
  const [reconcileForm, setReconcileForm] = useState<Partial<Reconciliation>>({
    status: 'pending',
  });

  useEffect(() => {
    const sampleAccounts: BankAccount[] = [
      {
        id: 'acc1',
        account_name: 'Main Operating Account',
        account_number: '****5678',
        bank_name: 'National Bank',
        currency: 'IRR',
        current_balance: 5000000,
        last_reconciliation_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reconciliation_status: 'completed',
      },
      {
        id: 'acc2',
        account_name: 'Savings Account',
        account_number: '****9012',
        bank_name: 'International Bank',
        currency: 'USD',
        current_balance: 50000,
        last_reconciliation_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reconciliation_status: 'pending',
      },
    ];
    setBankAccounts(sampleAccounts);
    setSelectedAccount(sampleAccounts[0].id);

    const sampleBankTransactions: BankTransaction[] = [
      {
        id: 'bt1',
        transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Customer Deposit - INV-001',
        debit: 2000000,
        credit: 0,
        balance: 5000000,
        type: 'deposit',
        matched: true,
        matched_to: 'gl1',
        reconciled: true,
      },
      {
        id: 'bt2',
        transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Wire Transfer - Vendor Payment',
        debit: 0,
        credit: 1500000,
        balance: 3500000,
        type: 'withdrawal',
        matched: true,
        matched_to: 'gl2',
        reconciled: true,
      },
      {
        id: 'bt3',
        transaction_date: new Date().toISOString().split('T')[0],
        description: 'Monthly Service Fee',
        debit: 0,
        credit: 50000,
        balance: 3450000,
        type: 'fee',
        matched: false,
        reconciled: false,
      },
      {
        id: 'bt4',
        transaction_date: new Date().toISOString().split('T')[0],
        description: 'Interest Credit',
        debit: 150000,
        credit: 0,
        balance: 3600000,
        type: 'interest',
        matched: false,
        reconciled: false,
      },
      {
        id: 'bt5',
        transaction_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Pending Deposit - INV-003',
        debit: 5450000,
        credit: 0,
        balance: 9050000,
        type: 'deposit',
        matched: false,
        reconciled: false,
      },
    ];
    setBankTransactions(sampleBankTransactions);

    const sampleGLTransactions: GLTransaction[] = [
      {
        id: 'gl1',
        transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Customer Deposit - INV-001',
        debit: 2000000,
        credit: 0,
        reference: 'DEP-001',
        status: 'cleared',
        matched: true,
        matched_to: 'bt1',
        bank_posting_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        id: 'gl2',
        transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Wire Transfer - Vendor Payment',
        debit: 0,
        credit: 1500000,
        reference: 'WIRE-P001',
        status: 'cleared',
        matched: true,
        matched_to: 'bt2',
        bank_posting_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      {
        id: 'gl3',
        transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Check #1234 - Office Supply',
        debit: 0,
        credit: 500000,
        reference: 'CHK-1234',
        status: 'outstanding',
        matched: false,
      },
      {
        id: 'gl4',
        transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Customer Deposit - INV-003',
        debit: 5450000,
        credit: 0,
        reference: 'DEP-003',
        status: 'outstanding',
        matched: false,
      },
    ];
    setGlTransactions(sampleGLTransactions);

    const sampleReconciliations: Reconciliation[] = [
      {
        id: 'rec1',
        account_id: 'acc1',
        statement_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statement_balance: 3450000,
        gl_balance: 3500000,
        reconciled_balance: 3450000,
        outstanding_deposits: 0,
        outstanding_checks: 500000,
        bank_fees: 50000,
        interest_earned: 150000,
        variance: 0,
        status: 'completed',
        created_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        completed_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Monthly reconciliation completed',
      },
    ];
    setReconciliations(sampleReconciliations);
  }, [language]);

  const currentAccount = bankAccounts.find(a => a.id === selectedAccount);
  const accountBankTransactions = bankTransactions.filter(t => true); // Filter by account if needed
  const accountGLTransactions = glTransactions.filter(t => true); // Filter by account if needed

  const bankBalance = accountBankTransactions.reduce((sum, t) => sum + t.debit - t.credit, 0);
  const glBalance = accountGLTransactions.reduce((sum, t) => sum + t.debit - t.credit, 0);
  const outstandingChecks = accountGLTransactions
    .filter(t => t.status === 'outstanding' && t.credit > 0)
    .reduce((sum, t) => sum + t.credit, 0);
  const outstandingDeposits = accountGLTransactions
    .filter(t => t.status === 'outstanding' && t.debit > 0)
    .reduce((sum, t) => sum + t.debit, 0);
  const variance = bankBalance - (glBalance - outstandingChecks + outstandingDeposits);

  const matchTransactions = (bankId: string, glId: string) => {
    setBankTransactions(prev =>
      prev.map(t => t.id === bankId ? { ...t, matched: true, matched_to: glId, reconciled: true } : t)
    );
    setGlTransactions(prev =>
      prev.map(t => t.id === glId ? { ...t, matched: true, matched_to: bankId, status: 'cleared' } : t)
    );
  };

  const unmatchTransactions = (bankId: string, glId: string) => {
    setBankTransactions(prev =>
      prev.map(t => t.id === bankId ? { ...t, matched: false, matched_to: undefined, reconciled: false } : t)
    );
    setGlTransactions(prev =>
      prev.map(t => t.id === glId ? { ...t, matched: false, matched_to: undefined, status: 'outstanding' } : t)
    );
  };

  const completeReconciliation = () => {
    if (!selectedAccount || variance !== 0) {
      alert(language === 'fa' ? 'حساب باید متوازن باشد' : 'Account must be balanced');
      return;
    }

    const newRec: Reconciliation = {
      id: 'rec' + (reconciliations.length + 1),
      account_id: selectedAccount,
      statement_date: reconcileForm.statement_date || new Date().toISOString().split('T')[0],
      statement_balance: bankBalance,
      gl_balance: glBalance,
      reconciled_balance: bankBalance,
      outstanding_deposits: outstandingDeposits,
      outstanding_checks: outstandingChecks,
      bank_fees: accountBankTransactions.filter(t => t.type === 'fee').reduce((sum, t) => sum + t.credit, 0),
      interest_earned: accountBankTransactions.filter(t => t.type === 'interest').reduce((sum, t) => sum + t.debit, 0),
      variance: 0,
      status: 'completed',
      created_date: new Date().toISOString(),
      completed_date: new Date().toISOString(),
      notes: reconcileForm.notes,
    };

    setReconciliations([newRec, ...reconciliations]);
    setBankAccounts(prev =>
      prev.map(a =>
        a.id === selectedAccount
          ? { ...a, last_reconciliation_date: new Date().toISOString().split('T')[0], reconciliation_status: 'completed' }
          : a
      )
    );

    setReconcileDialogOpen(false);
    setReconcileForm({ status: 'pending' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{language === 'fa' ? 'تطابق حسابات بانکی' : 'Bank Reconciliation'}</h2>
            <p className="text-gray-600">{language === 'fa' ? 'تطابق صورت حساب بانکی و دفتر کل' : 'Match bank statements with General Ledger'}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="accounts">{language === 'fa' ? 'حساب‌ها' : 'Accounts'}</TabsTrigger>
            <TabsTrigger value="matching">{language === 'fa' ? 'تطابق' : 'Matching'}</TabsTrigger>
            <TabsTrigger value="history">{language === 'fa' ? 'سابقه' : 'History'}</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bankAccounts.map(account => (
                <Card
                  key={account.id}
                  className={`cursor-pointer transition ${selectedAccount === account.id ? 'border-blue-500 border-2' : ''}`}
                  onClick={() => setSelectedAccount(account.id)}
                >
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{account.account_name}</p>
                        <p className="text-xs text-gray-500">{account.account_number}</p>
                        <p className="text-xs text-gray-500">{account.bank_name}</p>
                      </div>
                      <Badge
                        className={
                          account.reconciliation_status === 'completed'
                            ? 'bg-green-500'
                            : account.reconciliation_status === 'in_progress'
                            ? 'bg-yellow-500'
                            : 'bg-gray-500'
                        }
                      >
                        {account.reconciliation_status}
                      </Badge>
                    </div>
                    <Separator className="my-3" />
                    <p className="text-2xl font-bold">{formatCurrencyIRR(account.current_balance)}</p>
                    {account.last_reconciliation_date && (
                      <p className="text-xs text-gray-600 mt-2">
                        {language === 'fa' ? 'آخرین تطابق: ' : 'Last Reconciliation: '}
                        {new Date(account.last_reconciliation_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {currentAccount && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{currentAccount.account_name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded bg-blue-50">
                      <p className="text-xs text-gray-600">{language === 'fa' ? 'موجودی بانک' : 'Bank Balance'}</p>
                      <p className="text-xl font-bold mt-1">{formatCurrencyIRR(bankBalance)}</p>
                    </div>
                    <div className="p-3 border rounded bg-green-50">
                      <p className="text-xs text-gray-600">{language === 'fa' ? 'موجودی دفتر' : 'GL Balance'}</p>
                      <p className="text-xl font-bold mt-1">{formatCurrencyIRR(glBalance)}</p>
                    </div>
                    <div className="p-3 border rounded bg-orange-50">
                      <p className="text-xs text-gray-600">{language === 'fa' ? 'چک معلق' : 'Outstanding Checks'}</p>
                      <p className="text-xl font-bold mt-1">({formatCurrencyIRR(outstandingChecks)})</p>
                    </div>
                    <div className={`p-3 border rounded ${variance === 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className="text-xs text-gray-600">{language === 'fa' ? 'تفاوت' : 'Variance'}</p>
                      <p className={`text-xl font-bold mt-1 ${variance === 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatCurrencyIRR(Math.abs(variance))}
                      </p>
                    </div>
                  </div>

                  {variance === 0 && (
                    <Dialog open={reconcileDialogOpen} onOpenChange={setReconcileDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full"><CheckCircle className="w-4 h-4 mr-2" /> {language === 'fa' ? 'اتمام تطابق' : 'Complete Reconciliation'}</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>{language === 'fa' ? 'تأیید تطابق' : 'Confirm Reconciliation'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm">{language === 'fa' ? 'تاریخ صورت حساب' : 'Statement Date'}</Label>
                            <Input
                              type="date"
                              value={reconcileForm.statement_date || ''}
                              onChange={(e) => setReconcileForm({ ...reconcileForm, statement_date: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label className="text-sm">{language === 'fa' ? 'یادداشت‌ها' : 'Notes'}</Label>
                            <Textarea
                              value={reconcileForm.notes || ''}
                              onChange={(e) => setReconcileForm({ ...reconcileForm, notes: e.target.value })}
                              placeholder={language === 'fa' ? 'یادداشت‌های تطابق' : 'Reconciliation notes'}
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setReconcileDialogOpen(false)}>
                              {language === 'fa' ? 'انصراف' : 'Cancel'}
                            </Button>
                            <Button onClick={completeReconciliation}>{language === 'fa' ? 'تأیید' : 'Confirm'}</Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="matching" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bank Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{language === 'fa' ? 'تراکنش‌های بانکی' : 'Bank Transactions'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {accountBankTransactions
                      .filter(t => !t.reconciled)
                      .map(trans => (
                        <div key={trans.id} className={`p-3 border rounded ${trans.matched ? 'bg-green-50' : 'bg-gray-50'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-xs font-semibold">{trans.description}</p>
                              <p className="text-xs text-gray-600">{new Date(trans.transaction_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs font-bold ${trans.debit > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {trans.debit > 0 ? '+' : '-'}{formatCurrencyIRR(Math.max(trans.debit, trans.credit))}
                              </p>
                            </div>
                          </div>
                          {trans.matched && trans.matched_to && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="w-full mt-2 text-xs"
                              onClick={() => unmatchTransactions(trans.id, trans.matched_to!)}
                            >
                              {language === 'fa' ? 'لغو تطابق' : 'Unmatch'}
                            </Button>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* GL Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">{language === 'fa' ? 'تراکنش‌های دفتر کل' : 'GL Transactions'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {accountGLTransactions
                      .filter(t => !t.matched && t.status === 'outstanding')
                      .map(trans => (
                        <div key={trans.id} className="p-3 border rounded bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="text-xs font-semibold">{trans.description}</p>
                              <p className="text-xs text-gray-600">{trans.reference}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xs font-bold ${trans.debit > 0 ? 'text-green-700' : 'text-red-700'}`}>
                                {trans.debit > 0 ? '+' : '-'}{formatCurrencyIRR(Math.max(trans.debit, trans.credit))}
                              </p>
                            </div>
                          </div>
                          <Select defaultValue="" onValueChange={(bankId) => matchTransactions(bankId, trans.id)}>
                            <SelectTrigger className="w-full mt-2 text-xs h-8">
                              <SelectValue placeholder={language === 'fa' ? 'انتخاب تراکنش بانکی' : 'Match bank transaction'} />
                            </SelectTrigger>
                            <SelectContent>
                              {accountBankTransactions
                                .filter(
                                  b =>
                                    !b.matched &&
                                    Math.max(b.debit, b.credit) === Math.max(trans.debit, trans.credit)
                                )
                                .map(bt => (
                                  <SelectItem key={bt.id} value={bt.id}>
                                    {bt.description} ({new Date(bt.transaction_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')})
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{language === 'fa' ? 'سابقه تطابق' : 'Reconciliation History'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ صورت' : 'Statement Date'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'موجودی صورت' : 'Statement Balance'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'موجودی دفتر' : 'GL Balance'}</TableHead>
                        <TableHead className="text-xs text-right">{language === 'fa' ? 'تفاوت' : 'Variance'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'وضعیت' : 'Status'}</TableHead>
                        <TableHead className="text-xs">{language === 'fa' ? 'تاریخ تطابق' : 'Completed'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reconciliations.map(rec => (
                        <TableRow key={rec.id}>
                          <TableCell className="text-xs">{new Date(rec.statement_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrencyIRR(rec.statement_balance)}</TableCell>
                          <TableCell className="text-xs text-right">{formatCurrencyIRR(rec.gl_balance)}</TableCell>
                          <TableCell className={`text-xs text-right font-bold ${rec.variance === 0 ? 'text-green-700' : 'text-red-700'}`}>
                            {formatCurrencyIRR(Math.abs(rec.variance))}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge className={rec.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'}>
                              {rec.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            {rec.completed_date
                              ? new Date(rec.completed_date).toLocaleDateString(language === 'fa' ? 'fa-IR' : 'en-US')
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
