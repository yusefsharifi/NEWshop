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
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from "@/components/AdminLayout";
import { formatCurrencyIRR } from "@/lib/utils";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  FileText,
  TrendingUp,
  ShoppingCart,
} from "lucide-react";

interface PurchaseRequisition {
  id: string;
  pr_number: string;
  department: string;
  requested_by: string;
  request_date: string;
  items: { item_name: string; quantity: number; estimated_cost: number }[];
  total_amount: number;
  status: "draft" | "submitted" | "approved" | "rejected" | "converted";
  created_date: string;
}

interface PurchaseOrder {
  id: string;
  po_number: string;
  supplier_id: number;
  supplier_name: string;
  pr_reference?: string;
  order_date: string;
  expected_delivery: string;
  items: {
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }[];
  subtotal: number;
  tax: number;
  total_amount: number;
  status:
    | "draft"
    | "sent"
    | "acknowledged"
    | "received_partial"
    | "received_full"
    | "cancelled";
  created_date: string;
}

interface Supplier {
  id: number;
  name: string;
  email: string;
  phone: string;
  rating: number;
  on_time_rate: number;
  total_orders: number;
  total_spent: number;
  status: "active" | "inactive";
}

export default function Procurement() {
  const { language, dir } = useLanguage();
  const [prs, setPRs] = useState<PurchaseRequisition[]>([]);
  const [pos, setPOs] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("requisitions");

  // PR Dialog
  const [prDialogOpen, setPRDialogOpen] = useState(false);
  const [prForm, setPRForm] = useState<Partial<PurchaseRequisition>>({
    status: "draft",
  });

  // PO Dialog
  const [poDialogOpen, setPODialogOpen] = useState(false);
  const [poForm, setPOForm] = useState<Partial<PurchaseOrder>>({
    status: "draft",
  });

  useEffect(() => {
    const sampleSuppliers: Supplier[] = [
      {
        id: 1,
        name: "Global Pool Systems",
        email: "sales@globalpools.com",
        phone: "+1-555-2001",
        rating: 4.8,
        on_time_rate: 98,
        total_orders: 45,
        total_spent: 12000000,
        status: "active",
      },
      {
        id: 2,
        name: "AquaTech Supplies",
        email: "orders@aquatech.com",
        phone: "+1-555-2002",
        rating: 4.5,
        on_time_rate: 94,
        total_orders: 32,
        total_spent: 8000000,
        status: "active",
      },
      {
        id: 3,
        name: "Chemical Solutions Inc",
        email: "info@chemsol.com",
        phone: "+1-555-2003",
        rating: 4.6,
        on_time_rate: 96,
        total_orders: 67,
        total_spent: 5500000,
        status: "active",
      },
    ];
    setSuppliers(sampleSuppliers);

    const samplePRs: PurchaseRequisition[] = [
      {
        id: "pr1",
        pr_number: "PR-2024-001",
        department: "Operations",
        requested_by: "Ali Karimi",
        request_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        items: [
          { item_name: "Pool Pump XL", quantity: 10, estimated_cost: 1200000 },
        ],
        total_amount: 12000000,
        status: "approved",
        created_date: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
      {
        id: "pr2",
        pr_number: "PR-2024-002",
        department: "Sales",
        requested_by: "Reza Ahmadi",
        request_date: new Date().toISOString().split("T")[0],
        items: [
          { item_name: "LED Lights", quantity: 20, estimated_cost: 500000 },
        ],
        total_amount: 10000000,
        status: "submitted",
        created_date: new Date().toISOString(),
      },
    ];
    setPRs(samplePRs);

    const samplePOs: PurchaseOrder[] = [
      {
        id: "po1",
        po_number: "PO-2024-001",
        supplier_id: 1,
        supplier_name: "Global Pool Systems",
        pr_reference: "PR-2024-001",
        order_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        expected_delivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        items: [
          {
            description: "Pool Pump XL",
            quantity: 10,
            unit_price: 1200000,
            line_total: 12000000,
          },
        ],
        subtotal: 12000000,
        tax: 1080000,
        total_amount: 13080000,
        status: "sent",
        created_date: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];
    setPOs(samplePOs);
  }, [language]);

  const filteredPRs = useMemo(() => {
    const q = search.toLowerCase();
    return prs.filter(
      (pr) =>
        pr.pr_number.includes(q) || pr.department.toLowerCase().includes(q),
    );
  }, [prs, search]);

  const filteredPOs = useMemo(() => {
    const q = search.toLowerCase();
    return pos.filter(
      (po) =>
        po.po_number.includes(q) || po.supplier_name.toLowerCase().includes(q),
    );
  }, [pos, search]);

  const totalPending = prs.filter(
    (pr) => pr.status === "submitted" || pr.status === "draft",
  ).length;
  const totalOrders = pos.length;
  const totalSpent = pos.reduce((sum, po) => sum + po.total_amount, 0);

  const savePR = () => {
    if (!prForm.department || !prForm.requested_by) return;
    const newId = "pr" + (prs.length + 1);
    const newNumber = `PR-${new Date().getFullYear()}-${String(prs.length + 1).padStart(3, "0")}`;
    setPRs([
      {
        id: newId,
        pr_number: newNumber,
        status: "draft",
        items: [],
        total_amount: 0,
        created_date: new Date().toISOString(),
        ...prForm,
      } as PurchaseRequisition,
      ...prs,
    ]);
    setPRDialogOpen(false);
    setPRForm({ status: "draft" });
  };

  const savePO = () => {
    if (!poForm.supplier_id) return;
    const newId = "po" + (pos.length + 1);
    const newNumber = `PO-${new Date().getFullYear()}-${String(pos.length + 1).padStart(3, "0")}`;
    setPOs([
      {
        id: newId,
        po_number: newNumber,
        status: "draft",
        items: [],
        subtotal: 0,
        tax: 0,
        total_amount: 0,
        created_date: new Date().toISOString(),
        ...poForm,
      } as PurchaseOrder,
      ...pos,
    ]);
    setPODialogOpen(false);
    setPOForm({ status: "draft" });
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === "fa" ? "خریدو تدارکات" : "Procurement"}
            </h2>
            <p className="text-gray-600">
              {language === "fa"
                ? "درخواست خریدار، سفارش خریدار و مدیریت تأمین‌کنندگان"
                : "Requisitions, Orders, and Supplier Management"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <FileText className="w-4 h-4" />{" "}
                {language === "fa" ? "درخواست در انتظار" : "Pending PRs"}
              </p>
              <p className="text-2xl font-bold mt-2">{totalPending}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />{" "}
                {language === "fa" ? "کل سفارشات" : "Total POs"}
              </p>
              <p className="text-2xl font-bold mt-2">{totalOrders}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />{" "}
                {language === "fa" ? "کل هزینه" : "Total Spent"}
              </p>
              <p className="text-lg font-bold mt-2">
                {formatCurrencyIRR(totalSpent)}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />{" "}
                {language === "fa" ? "تأمین‌کنندگان فعال" : "Active Suppliers"}
              </p>
              <p className="text-2xl font-bold mt-2">
                {suppliers.filter((s) => s.status === "active").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="requisitions">
              {language === "fa" ? "درخواست‌ها" : "Requisitions"}
            </TabsTrigger>
            <TabsTrigger value="orders">
              {language === "fa" ? "سفارشات" : "Orders"}
            </TabsTrigger>
            <TabsTrigger value="suppliers">
              {language === "fa" ? "تأمین‌کنندگان" : "Suppliers"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requisitions" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />{" "}
                  {language === "fa"
                    ? "درخواست‌های خریدار"
                    : "Purchase Requisitions"}
                </CardTitle>
                <Dialog open={prDialogOpen} onOpenChange={setPRDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {language === "fa" ? "درخواست جدید" : "New PR"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>
                        {language === "fa"
                          ? "درخواست جدید"
                          : "New Purchase Requisition"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "بخش" : "Department"}
                        </Label>
                        <Input
                          value={prForm.department || ""}
                          onChange={(e) =>
                            setPRForm({ ...prForm, department: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "درخواست کننده" : "Requested By"}
                        </Label>
                        <Input
                          value={prForm.requested_by || ""}
                          onChange={(e) =>
                            setPRForm({
                              ...prForm,
                              requested_by: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setPRDialogOpen(false)}
                        >
                          {language === "fa" ? "انصراف" : "Cancel"}
                        </Button>
                        <Button onClick={savePR}>
                          {language === "fa" ? "ایجاد" : "Create"}
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
                      ? "جستجو شماره یا بخش"
                      : "Search PR # or department"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">
                          {language === "fa" ? "شماره" : "PR #"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "بخش" : "Department"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "درخواست کننده" : "Requested By"}
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
                      {filteredPRs.map((pr) => (
                        <TableRow key={pr.id}>
                          <TableCell className="text-xs font-mono">
                            {pr.pr_number}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pr.department}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pr.requested_by}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {formatCurrencyIRR(pr.total_amount)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                pr.status === "approved"
                                  ? "bg-green-500"
                                  : pr.status === "rejected"
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                              }
                            >
                              {pr.status}
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

          <TabsContent value="orders">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />{" "}
                  {language === "fa" ? "سفارش‌های خریدار" : "Purchase Orders"}
                </CardTitle>
                <Dialog open={poDialogOpen} onOpenChange={setPODialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {language === "fa" ? "سفارش جدید" : "New PO"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>
                        {language === "fa"
                          ? "سفارش جدید"
                          : "New Purchase Order"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "تأمین‌کننده" : "Supplier"}
                        </Label>
                        <Select
                          value={String(poForm.supplier_id || "")}
                          onValueChange={(v) => {
                            const sup = suppliers.find(
                              (s) => s.id === parseInt(v),
                            );
                            setPoForm({
                              ...poForm,
                              supplier_id: parseInt(v),
                              supplier_name: sup?.name,
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {suppliers.map((s) => (
                              <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setPODialogOpen(false)}
                        >
                          {language === "fa" ? "انصراف" : "Cancel"}
                        </Button>
                        <Button onClick={savePO}>
                          {language === "fa" ? "ایجاد" : "Create"}
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
                      ? "جستجو شماره یا تأمین‌کننده"
                      : "Search PO # or supplier"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">
                          {language === "fa" ? "شماره" : "PO #"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "تأمین‌کننده" : "Supplier"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "تاریخ سفارش" : "Order Date"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa"
                            ? "تحویل انتظار"
                            : "Expected Delivery"}
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
                      {filteredPOs.map((po) => (
                        <TableRow key={po.id}>
                          <TableCell className="text-xs font-mono">
                            {po.po_number}
                          </TableCell>
                          <TableCell className="text-xs">
                            {po.supplier_name}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(po.order_date).toLocaleDateString(
                              language === "fa" ? "fa-IR" : "en-US",
                            )}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(po.expected_delivery).toLocaleDateString(
                              language === "fa" ? "fa-IR" : "en-US",
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold">
                            {formatCurrencyIRR(po.total_amount)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                po.status === "received_full"
                                  ? "bg-green-500"
                                  : po.status === "sent"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                              }
                            >
                              {po.status}
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

          <TabsContent value="suppliers">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "fa" ? "تأمین‌کنندگان" : "Suppliers"}
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
                          {language === "fa" ? "ایمیل" : "Email"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "امتیاز" : "Rating"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "به موقع" : "On-Time"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "کل سفارشات" : "Total Orders"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "کل هزینه" : "Total Spent"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "وضعیت" : "Status"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {suppliers.map((sup) => (
                        <TableRow key={sup.id}>
                          <TableCell className="text-xs font-medium">
                            {sup.name}
                          </TableCell>
                          <TableCell className="text-xs">{sup.email}</TableCell>
                          <TableCell className="text-xs">
                            <Badge variant="outline" className="text-xs">
                              {sup.rating} ⭐
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                sup.on_time_rate >= 95
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }
                              className="text-xs"
                            >
                              {sup.on_time_rate}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold">
                            {sup.total_orders}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {formatCurrencyIRR(sup.total_spent)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                sup.status === "active"
                                  ? "bg-green-500"
                                  : "bg-gray-500"
                              }
                            >
                              {sup.status}
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
        </Tabs>
      </div>
    </AdminLayout>
  );
}
