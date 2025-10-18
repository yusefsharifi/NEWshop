import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from "@/components/AdminLayout";
import { formatCurrencyIRR } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  Users,
  FileText,
  TrendingUp,
  ShoppingCart,
  Quote,
  Send,
} from "lucide-react";

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  tax_id?: string;
  credit_limit: number;
  current_due: number;
  total_purchases: number;
  customer_type: "retail" | "wholesale" | "distributor" | "corporate";
  status: "active" | "inactive" | "suspended";
  created_date: string;
}

interface SalesOrder {
  id: string;
  order_number: string;
  customer_id: number;
  customer_name: string;
  order_date: string;
  delivery_date: string;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "cancelled";
  payment_status: "unpaid" | "partial" | "paid";
  created_date: string;
}

interface Quote {
  id: string;
  quote_number: string;
  customer_id: number;
  customer_name: string;
  quote_date: string;
  expiry_date: string;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total_amount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  created_date: string;
}

interface SalesOpportunity {
  id: string;
  opp_number: string;
  customer_id: number;
  customer_name: string;
  title: string;
  value: number;
  probability: number;
  stage: "lead" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  expected_close_date: string;
  created_date: string;
}

interface SalesRep {
  id: number;
  name: string;
  email: string;
  phone: string;
  territory: string;
  target_revenue: number;
  current_revenue: number;
  commission_rate: number;
}

export default function SalesAndCRM() {
  const { language, dir } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [opportunities, setOpportunities] = useState<SalesOpportunity[]>([]);
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("customers");

  // Customer Dialog
  const [custDialogOpen, setCustDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [custForm, setCustForm] = useState<Partial<Customer>>({
    customer_type: "retail",
    status: "active",
    credit_limit: 0,
    current_due: 0,
  });

  // Quote Dialog
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteForm, setQuoteForm] = useState<Partial<Quote>>({
    status: "draft",
  });

  useEffect(() => {
    const sampleCustomers: Customer[] = [
      {
        id: 1,
        name: "Aqua Solutions Inc",
        email: "contact@aqua.com",
        phone: "+1-555-0001",
        address: "123 Water St",
        city: "New York",
        country: "USA",
        credit_limit: 50000000,
        current_due: 3500000,
        total_purchases: 18000000,
        customer_type: "corporate",
        status: "active",
        created_date: new Date("2022-01-15").toISOString(),
      },
      {
        id: 2,
        name: "Pool Perfect LLC",
        email: "sales@poolperfect.com",
        phone: "+1-555-0002",
        address: "456 Pool Ave",
        city: "Los Angeles",
        country: "USA",
        credit_limit: 30000000,
        current_due: 1200000,
        total_purchases: 12000000,
        customer_type: "distributor",
        status: "active",
        created_date: new Date("2022-03-10").toISOString(),
      },
      {
        id: 3,
        name: "Swim Pro Shop",
        email: "info@swimpro.com",
        phone: "+1-555-0003",
        address: "789 Swim Rd",
        city: "Miami",
        country: "USA",
        credit_limit: 20000000,
        current_due: 0,
        total_purchases: 8500000,
        customer_type: "retail",
        status: "active",
        created_date: new Date("2022-06-20").toISOString(),
      },
    ];
    setCustomers(sampleCustomers);

    const sampleOrders: SalesOrder[] = [
      {
        id: "so1",
        order_number: "SO-2024-001",
        customer_id: 1,
        customer_name: "Aqua Solutions Inc",
        order_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        delivery_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        items: [
          {
            product_id: 1,
            product_name: "Pool Pump XL",
            quantity: 5,
            unit_price: 1200000,
            line_total: 6000000,
          },
        ],
        subtotal: 6000000,
        discount: 0,
        tax: 540000,
        total_amount: 6540000,
        status: "confirmed",
        payment_status: "partial",
        created_date: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];
    setOrders(sampleOrders);

    const sampleQuotes: Quote[] = [
      {
        id: "q1",
        quote_number: "QT-2024-001",
        customer_id: 2,
        customer_name: "Pool Perfect LLC",
        quote_date: new Date().toISOString().split("T")[0],
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        items: [
          {
            product_id: 3,
            product_name: "LED Pool Light RGB",
            quantity: 10,
            unit_price: 500000,
            line_total: 5000000,
          },
        ],
        subtotal: 5000000,
        discount: 500000,
        tax: 405000,
        total_amount: 4905000,
        status: "sent",
        created_date: new Date().toISOString(),
      },
    ];
    setQuotes(sampleQuotes);

    const sampleOpportunities: SalesOpportunity[] = [
      {
        id: "opp1",
        opp_number: "OPP-2024-001",
        customer_id: 3,
        customer_name: "Swim Pro Shop",
        title: "New Equipment Order",
        value: 8000000,
        probability: 75,
        stage: "proposal",
        expected_close_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        created_date: new Date().toISOString(),
      },
    ];
    setOpportunities(sampleOpportunities);

    const sampleSalesReps: SalesRep[] = [
      {
        id: 1,
        name: "John Smith",
        email: "john@company.com",
        phone: "+1-555-1001",
        territory: "East Coast",
        target_revenue: 100000000,
        current_revenue: 45000000,
        commission_rate: 5,
      },
      {
        id: 2,
        name: "Sarah Johnson",
        email: "sarah@company.com",
        phone: "+1-555-1002",
        territory: "West Coast",
        target_revenue: 100000000,
        current_revenue: 38000000,
        commission_rate: 5,
      },
    ];
    setSalesReps(sampleSalesReps);
  }, [language]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total_amount, 0);
  const activeOrders = orders.filter(
    (o) => o.status === "confirmed" || o.status === "shipped",
  ).length;
  const pipelineValue = opportunities.reduce(
    (sum, o) => sum + (o.value * o.probability) / 100,
    0,
  );

  const saveCustomer = () => {
    if (!custForm.name) return;

    if (editingCustomer) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === editingCustomer.id ? ({ ...c, ...custForm } as Customer) : c,
        ),
      );
    } else {
      const newId = Math.max(...customers.map((c) => c.id), 0) + 1;
      setCustomers([
        {
          id: newId,
          status: "active",
          customer_type: "retail",
          credit_limit: 0,
          current_due: 0,
          total_purchases: 0,
          created_date: new Date().toISOString(),
          ...custForm,
        } as Customer,
        ...customers,
      ]);
    }
    setCustDialogOpen(false);
    setEditingCustomer(null);
    setCustForm({ customer_type: "retail", status: "active" });
  };

  const saveQuote = () => {
    if (!quoteForm.customer_id) return;

    const newId = "q" + (quotes.length + 1);
    const newNumber = `QT-${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, "0")}`;
    setQuotes([
      {
        id: newId,
        quote_number: newNumber,
        status: "draft",
        created_date: new Date().toISOString(),
        items: [],
        subtotal: 0,
        discount: 0,
        tax: 0,
        ...quoteForm,
      } as Quote,
      ...quotes,
    ]);
    setQuoteDialogOpen(false);
    setQuoteForm({ status: "draft" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === "fa" ? "فروش و CRM" : "Sales & CRM"}
            </h2>
            <p className="text-gray-600">
              {language === "fa"
                ? "مشتریان، سفارشات، پیشنهادات و فرصت‌های فروش"
                : "Customers, Orders, Quotes, and Sales Opportunities"}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />{" "}
                {language === "fa" ? "کل مشتریان" : "Total Customers"}
              </p>
              <p className="text-2xl font-bold mt-2">{customers.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />{" "}
                {language === "fa" ? "سفارشات فعال" : "Active Orders"}
              </p>
              <p className="text-2xl font-bold mt-2">{activeOrders}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />{" "}
                {language === "fa" ? "کل درآمد" : "Total Revenue"}
              </p>
              <p className="text-lg font-bold mt-2">
                {formatCurrencyIRR(totalRevenue)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />{" "}
                {language === "fa" ? "Pipeline" : "Pipeline Value"}
              </p>
              <p className="text-lg font-bold mt-2">
                {formatCurrencyIRR(pipelineValue)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="customers">
              {language === "fa" ? "مشتریان" : "Customers"}
            </TabsTrigger>
            <TabsTrigger value="orders">
              {language === "fa" ? "سفارشات" : "Orders"}
            </TabsTrigger>
            <TabsTrigger value="quotes">
              {language === "fa" ? "پیشنهادات" : "Quotes"}
            </TabsTrigger>
            <TabsTrigger value="opportunities">
              {language === "fa" ? "فرصت‌ها" : "Opportunities"}
            </TabsTrigger>
            <TabsTrigger value="sales-reps">
              {language === "fa" ? "نمایندگان" : "Sales Reps"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />{" "}
                  {language === "fa" ? "مشتریان" : "Customers"}
                </CardTitle>
                <Dialog open={custDialogOpen} onOpenChange={setCustDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {language === "fa" ? "مشتری جدید" : "New Customer"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCustomer
                          ? language === "fa"
                            ? "ویرایش مشتری"
                            : "Edit Customer"
                          : language === "fa"
                            ? "مشتری جدید"
                            : "New Customer"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <Label className="text-sm">
                            {language === "fa" ? "نام" : "Name"}
                          </Label>
                          <Input
                            value={custForm.name || ""}
                            onChange={(e) =>
                              setCustForm({ ...custForm, name: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "ایمیل" : "Email"}
                          </Label>
                          <Input
                            value={custForm.email || ""}
                            onChange={(e) =>
                              setCustForm({
                                ...custForm,
                                email: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "تلفن" : "Phone"}
                          </Label>
                          <Input
                            value={custForm.phone || ""}
                            onChange={(e) =>
                              setCustForm({
                                ...custForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "شهر" : "City"}
                          </Label>
                          <Input
                            value={custForm.city || ""}
                            onChange={(e) =>
                              setCustForm({ ...custForm, city: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "کشور" : "Country"}
                          </Label>
                          <Input
                            value={custForm.country || ""}
                            onChange={(e) =>
                              setCustForm({
                                ...custForm,
                                country: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-sm">
                            {language === "fa" ? "آدرس" : "Address"}
                          </Label>
                          <Textarea
                            value={custForm.address || ""}
                            onChange={(e) =>
                              setCustForm({
                                ...custForm,
                                address: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "نوع مشتری" : "Customer Type"}
                          </Label>
                          <Select
                            value={custForm.customer_type || "retail"}
                            onValueChange={(v) =>
                              setCustForm({
                                ...custForm,
                                customer_type: v as any,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="retail">
                                {language === "fa" ? "خرده فروشی" : "Retail"}
                              </SelectItem>
                              <SelectItem value="wholesale">
                                {language === "fa" ? "عمده فروشی" : "Wholesale"}
                              </SelectItem>
                              <SelectItem value="distributor">
                                {language === "fa"
                                  ? "توزیع‌کننده"
                                  : "Distributor"}
                              </SelectItem>
                              <SelectItem value="corporate">
                                {language === "fa" ? "شرکتی" : "Corporate"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "حد اعتباری" : "Credit Limit"}
                          </Label>
                          <Input
                            type="number"
                            value={custForm.credit_limit || ""}
                            onChange={(e) =>
                              setCustForm({
                                ...custForm,
                                credit_limit: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCustDialogOpen(false);
                            setEditingCustomer(null);
                          }}
                        >
                          {language === "fa" ? "انصراف" : "Cancel"}
                        </Button>
                        <Button onClick={saveCustomer}>
                          {language === "fa" ? "ذخیره" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder={
                    language === "fa"
                      ? "جستجو نام یا ایمیل"
                      : "Search name or email"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">
                          {language === "fa" ? "نام" : "Name"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "ایمیل" : "Email"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "نوع" : "Type"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "کل خریدها" : "Total Purchases"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "بدهی" : "Current Due"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "وضعیت" : "Status"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "عملیات" : "Actions"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((cust) => (
                        <TableRow key={cust.id}>
                          <TableCell className="text-xs font-medium">
                            {cust.name}
                          </TableCell>
                          <TableCell className="text-xs">
                            {cust.email}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {cust.customer_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {formatCurrencyIRR(cust.total_purchases)}
                          </TableCell>
                          <TableCell className="text-xs text-right font-semibold text-orange-600">
                            {formatCurrencyIRR(cust.current_due)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                cust.status === "active"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }
                            >
                              {cust.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 px-2"
                              onClick={() => {
                                setEditingCustomer(cust);
                                setCustForm(cust);
                                setCustDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-3 h-3" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />{" "}
                  {language === "fa" ? "سفارشات فروش" : "Sales Orders"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">
                          {language === "fa" ? "شماره" : "Order #"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "مشتری" : "Customer"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "تاریخ" : "Date"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "مبلغ" : "Amount"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "وضعیت" : "Status"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "پرداخت" : "Payment"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="text-xs font-mono">
                            {order.order_number}
                          </TableCell>
                          <TableCell className="text-xs">
                            {order.customer_name}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(order.order_date).toLocaleDateString(
                              language === "fa" ? "fa-IR" : "en-US",
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold">
                            {formatCurrencyIRR(order.total_amount)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                order.status === "delivered"
                                  ? "bg-green-500"
                                  : order.status === "confirmed"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                              }
                            >
                              {order.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {order.payment_status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quotes">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Quote className="w-5 h-5" />{" "}
                  {language === "fa" ? "پیشنهادات" : "Quotes"}
                </CardTitle>
                <Dialog
                  open={quoteDialogOpen}
                  onOpenChange={setQuoteDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {language === "fa" ? "پیشنهاد جدید" : "New Quote"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>
                        {language === "fa" ? "پیشنهاد جدید" : "New Quote"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "مشتری" : "Customer"}
                        </Label>
                        <Select
                          value={String(quoteForm.customer_id || "")}
                          onValueChange={(v) => {
                            const cust = customers.find(
                              (c) => c.id === parseInt(v),
                            );
                            setQuoteForm({
                              ...quoteForm,
                              customer_id: parseInt(v),
                              customer_name: cust?.name,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {customers.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setQuoteDialogOpen(false)}
                        >
                          {language === "fa" ? "انصراف" : "Cancel"}
                        </Button>
                        <Button onClick={saveQuote}>
                          {language === "fa" ? "ایجاد" : "Create"}
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
                        <TableHead className="text-xs">
                          {language === "fa" ? "شماره" : "Quote #"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "مشتری" : "Customer"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "تاریخ" : "Date"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "انقضا" : "Expiry"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "مبلغ" : "Amount"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "وضعیت" : "Status"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quotes.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell className="text-xs font-mono">
                            {quote.quote_number}
                          </TableCell>
                          <TableCell className="text-xs">
                            {quote.customer_name}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(quote.quote_date).toLocaleDateString(
                              language === "fa" ? "fa-IR" : "en-US",
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(quote.expiry_date).toLocaleDateString(
                              language === "fa" ? "fa-IR" : "en-US",
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold">
                            {formatCurrencyIRR(quote.total_amount)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                quote.status === "accepted"
                                  ? "bg-green-500"
                                  : quote.status === "sent"
                                    ? "bg-blue-500"
                                    : "bg-gray-500"
                              }
                            >
                              {quote.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="opportunities">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />{" "}
                  {language === "fa" ? "فرصت‌های فروش" : "Sales Opportunities"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">
                          {language === "fa" ? "عنوان" : "Title"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "مشتری" : "Customer"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "ارزش" : "Value"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "احتمال" : "Probability"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "مرحله" : "Stage"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "انتظار بسته" : "Expected Close"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {opportunities.map((opp) => (
                        <TableRow key={opp.id}>
                          <TableCell className="text-xs font-medium">
                            {opp.title}
                          </TableCell>
                          <TableCell className="text-xs">
                            {opp.customer_name}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {formatCurrencyIRR(opp.value)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {opp.probability}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">{opp.stage}</TableCell>
                          <TableCell className="text-xs">
                            {new Date(
                              opp.expected_close_date,
                            ).toLocaleDateString(
                              language === "fa" ? "fa-IR" : "en-US",
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales-reps">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "fa"
                    ? "نمایندگان فروش"
                    : "Sales Representatives"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">
                          {language === "fa" ? "نام" : "Name"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "منطقه" : "Territory"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "هدف" : "Target"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "دستیافته" : "Achieved"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "درصد" : "%"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "کمیسیون" : "Commission"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salesReps.map((rep) => {
                        const percent =
                          (rep.current_revenue / rep.target_revenue) * 100;
                        return (
                          <TableRow key={rep.id}>
                            <TableCell className="text-xs font-medium">
                              {rep.name}
                            </TableCell>
                            <TableCell className="text-xs">
                              {rep.territory}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              {formatCurrencyIRR(rep.target_revenue)}
                            </TableCell>
                            <TableCell className="text-xs text-right font-bold text-green-700">
                              {formatCurrencyIRR(rep.current_revenue)}
                            </TableCell>
                            <TableCell className="text-xs text-right">
                              <Badge
                                className={
                                  percent >= 80
                                    ? "bg-green-500"
                                    : percent >= 60
                                      ? "bg-yellow-500"
                                      : "bg-orange-500"
                                }
                                className="text-xs"
                              >
                                {percent.toFixed(0)}%
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              {rep.commission_rate}%
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
