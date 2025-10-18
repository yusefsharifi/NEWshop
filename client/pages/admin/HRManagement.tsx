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
  Building2,
  Briefcase,
  DollarSign,
  Calendar,
  UserCheck,
  Mail,
} from "lucide-react";

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number;
  position_id: number;
  hire_date: string;
  status: "active" | "inactive" | "on_leave" | "terminated";
  salary: number;
  salary_currency: string;
  employment_type: "full_time" | "part_time" | "contract" | "temporary";
  date_of_birth?: string;
  address?: string;
  national_id?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  created_date: string;
}

interface Department {
  id: number;
  name_en: string;
  name_fa: string;
  code: string;
  manager_id?: number;
  description?: string;
  employee_count: number;
  budget: number;
  status: "active" | "inactive";
}

interface Position {
  id: number;
  name_en: string;
  name_fa: string;
  code: string;
  department_id: number;
  salary_grade: string;
  description?: string;
  status: "active" | "inactive";
}

interface PayrollRecord {
  id: string;
  employee_id: number;
  employee_name: string;
  payroll_period: string;
  basic_salary: number;
  allowances: number;
  deductions: number;
  tax_withheld: number;
  net_salary: number;
  status: "draft" | "approved" | "paid" | "pending";
  paid_date?: string;
  created_date: string;
}

export default function HRManagement() {
  const { language, dir } = useLanguage();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("employees");

  // Employee Dialog
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeForm, setEmployeeForm] = useState<Partial<Employee>>({
    status: "active",
    employment_type: "full_time",
    salary_currency: "IRR",
  });

  // Department Dialog
  const [deptDialogOpen, setDeptDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deptForm, setDeptForm] = useState<Partial<Department>>({
    status: "active",
    budget: 0,
  });

  // Position Dialog
  const [posDialogOpen, setPosDialogOpen] = useState(false);
  const [editingPos, setEditingPos] = useState<Position | null>(null);
  const [posForm, setPosForm] = useState<Partial<Position>>({
    status: "active",
  });

  useEffect(() => {
    const sampleDepts: Department[] = [
      {
        id: 1,
        name_en: "Sales",
        name_fa: "فروش",
        code: "SALES",
        manager_id: 2,
        employee_count: 8,
        budget: 500000000,
        status: "active",
      },
      {
        id: 2,
        name_en: "HR",
        name_fa: "منابع انسانی",
        code: "HR",
        employee_count: 3,
        budget: 200000000,
        status: "active",
      },
      {
        id: 3,
        name_en: "IT",
        name_fa: "فناوری اطلاعات",
        code: "IT",
        employee_count: 5,
        budget: 300000000,
        status: "active",
      },
      {
        id: 4,
        name_en: "Finance",
        name_fa: "مالی",
        code: "FIN",
        employee_count: 4,
        budget: 250000000,
        status: "active",
      },
      {
        id: 5,
        name_en: "Operations",
        name_fa: "عملیات",
        code: "OPS",
        employee_count: 10,
        budget: 600000000,
        status: "active",
      },
    ];
    setDepartments(sampleDepts);

    const samplePositions: Position[] = [
      {
        id: 1,
        name_en: "Sales Manager",
        name_fa: "مدیر فروش",
        code: "SM",
        department_id: 1,
        salary_grade: "Grade A",
        status: "active",
      },
      {
        id: 2,
        name_en: "Sales Executive",
        name_fa: "کارشناس فروش",
        code: "SE",
        department_id: 1,
        salary_grade: "Grade B",
        status: "active",
      },
      {
        id: 3,
        name_en: "HR Manager",
        name_fa: "مدیر HR",
        code: "HRM",
        department_id: 2,
        salary_grade: "Grade A",
        status: "active",
      },
      {
        id: 4,
        name_en: "IT Manager",
        name_fa: "مدیر IT",
        code: "ITM",
        department_id: 3,
        salary_grade: "Grade A",
        status: "active",
      },
      {
        id: 5,
        name_en: "Accountant",
        name_fa: "حسابدار",
        code: "ACC",
        department_id: 4,
        salary_grade: "Grade B",
        status: "active",
      },
      {
        id: 6,
        name_en: "Operations Manager",
        name_fa: "مدیر عملیات",
        code: "OPM",
        department_id: 5,
        salary_grade: "Grade A",
        status: "active",
      },
    ];
    setPositions(samplePositions);

    const sampleEmployees: Employee[] = [
      {
        id: 1,
        employee_id: "EMP-001",
        first_name: "رضا",
        last_name: "احمدی",
        email: "reza.ahmadi@company.com",
        phone: "+98-912-3456789",
        department_id: 1,
        position_id: 1,
        hire_date: "2021-01-15",
        status: "active",
        salary: 10000000,
        salary_currency: "IRR",
        employment_type: "full_time",
        date_of_birth: "1985-05-20",
        national_id: "0123456789",
        address: "تهران",
        created_date: new Date("2021-01-15").toISOString(),
      },
      {
        id: 2,
        employee_id: "EMP-002",
        first_name: "فاطمه",
        last_name: "محمدی",
        email: "fateme.mohammadi@company.com",
        phone: "+98-912-9876543",
        department_id: 2,
        position_id: 3,
        hire_date: "2020-03-01",
        status: "active",
        salary: 8500000,
        salary_currency: "IRR",
        employment_type: "full_time",
        date_of_birth: "1988-07-10",
        national_id: "0987654321",
        address: "تهران",
        created_date: new Date("2020-03-01").toISOString(),
      },
      {
        id: 3,
        employee_id: "EMP-003",
        first_name: "علی",
        last_name: "کریمی",
        email: "ali.karimi@company.com",
        phone: "+98-913-5555555",
        department_id: 1,
        position_id: 2,
        hire_date: "2022-06-10",
        status: "active",
        salary: 6000000,
        salary_currency: "IRR",
        employment_type: "full_time",
        date_of_birth: "1992-12-05",
        national_id: "1234567890",
        address: "تهران",
        created_date: new Date("2022-06-10").toISOString(),
      },
      {
        id: 4,
        employee_id: "EMP-004",
        first_name: "مریم",
        last_name: "حسنی",
        email: "maryam.hasani@company.com",
        phone: "+98-911-2222222",
        department_id: 3,
        position_id: 4,
        hire_date: "2021-09-01",
        status: "active",
        salary: 9500000,
        salary_currency: "IRR",
        employment_type: "full_time",
        date_of_birth: "1990-03-15",
        national_id: "5678901234",
        address: "تهران",
        created_date: new Date("2021-09-01").toISOString(),
      },
      {
        id: 5,
        employee_id: "EMP-005",
        first_name: "محمد",
        last_name: "نوری",
        email: "mohammad.nouri@company.com",
        phone: "+98-910-3333333",
        department_id: 4,
        position_id: 5,
        hire_date: "2023-01-10",
        status: "active",
        salary: 5500000,
        salary_currency: "IRR",
        employment_type: "full_time",
        date_of_birth: "1995-08-20",
        national_id: "9012345678",
        address: "تهران",
        created_date: new Date("2023-01-10").toISOString(),
      },
    ];
    setEmployees(sampleEmployees);

    const samplePayroll: PayrollRecord[] = [
      {
        id: "pay1",
        employee_id: 1,
        employee_name: "رضا احمدی",
        payroll_period: "1403-01",
        basic_salary: 10000000,
        allowances: 1000000,
        deductions: 500000,
        tax_withheld: 1200000,
        net_salary: 8300000,
        status: "paid",
        paid_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        created_date: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      },
    ];
    setPayroll(samplePayroll);
  }, [language]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter(
      (e) =>
        e.employee_id.toLowerCase().includes(q) ||
        e.first_name.toLowerCase().includes(q) ||
        e.last_name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q),
    );
  }, [employees, search]);

  const totalEmployees = employees.filter((e) => e.status === "active").length;
  const totalPayroll = employees.reduce((sum, e) => sum + e.salary, 0);
  const avgSalary = totalEmployees > 0 ? totalPayroll / totalEmployees : 0;

  const saveEmployee = () => {
    if (
      !employeeForm.first_name ||
      !employeeForm.last_name ||
      !employeeForm.department_id ||
      !employeeForm.position_id
    )
      return;

    if (editingEmployee) {
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === editingEmployee.id
            ? ({ ...e, ...employeeForm } as Employee)
            : e,
        ),
      );
    } else {
      const newId = Math.max(...employees.map((e) => e.id), 0) + 1;
      const empId = `EMP-${String(newId).padStart(3, "0")}`;
      setEmployees([
        {
          id: newId,
          employee_id: empId,
          created_date: new Date().toISOString(),
          ...employeeForm,
        } as Employee,
        ...employees,
      ]);
    }
    setEmployeeDialogOpen(false);
    setEditingEmployee(null);
    setEmployeeForm({
      status: "active",
      employment_type: "full_time",
      salary_currency: "IRR",
    });
  };

  const saveDepartment = () => {
    if (!deptForm.name_en || !deptForm.code) return;

    if (editingDept) {
      setDepartments((prev) =>
        prev.map((d) =>
          d.id === editingDept.id ? ({ ...d, ...deptForm } as Department) : d,
        ),
      );
    } else {
      const newId = Math.max(...departments.map((d) => d.id), 0) + 1;
      setDepartments([
        {
          id: newId,
          employee_count: 0,
          status: "active",
          budget: 0,
          ...deptForm,
        } as Department,
        ...departments,
      ]);
    }
    setDeptDialogOpen(false);
    setEditingDept(null);
    setDeptForm({ status: "active", budget: 0 });
  };

  const savePosition = () => {
    if (!posForm.name_en || !posForm.code || !posForm.department_id) return;

    if (editingPos) {
      setPositions((prev) =>
        prev.map((p) =>
          p.id === editingPos.id ? ({ ...p, ...posForm } as Position) : p,
        ),
      );
    } else {
      const newId = Math.max(...positions.map((p) => p.id), 0) + 1;
      setPositions([
        { id: newId, status: "active", ...posForm } as Position,
        ...positions,
      ]);
    }
    setPosDialogOpen(false);
    setEditingPos(null);
    setPosForm({ status: "active" });
  };

  const deleteEmployee = (id: number) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <AdminLayout>
      <div className="space-y-6" dir={dir}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {language === "fa" ? "مدیریت منابع انسانی" : "HR Management"}
            </h2>
            <p className="text-gray-600">
              {language === "fa"
                ? "کارکنان، دپارتمان‌ها، مشاغل و حقوق و دستمزد"
                : "Employees, Departments, Positions, and Payroll"}
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />{" "}
                {language === "fa" ? "کل کارکنان" : "Total Employees"}
              </p>
              <p className="text-2xl font-bold mt-2">{totalEmployees}</p>
            </CardContent>
          </Card>
          <Card className="bg-green-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <Building2 className="w-4 h-4" />{" "}
                {language === "fa" ? "تعداد دپارتمان" : "Departments"}
              </p>
              <p className="text-2xl font-bold mt-2">{departments.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-purple-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />{" "}
                {language === "fa" ? "تعداد مشاغل" : "Positions"}
              </p>
              <p className="text-2xl font-bold mt-2">{positions.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-xs text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />{" "}
                {language === "fa" ? "میانگین حقوق" : "Avg Salary"}
              </p>
              <p className="text-lg font-bold mt-2">
                {formatCurrencyIRR(avgSalary)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="employees">
              {language === "fa" ? "کارکنان" : "Employees"}
            </TabsTrigger>
            <TabsTrigger value="departments">
              {language === "fa" ? "دپارتمان‌ها" : "Departments"}
            </TabsTrigger>
            <TabsTrigger value="positions">
              {language === "fa" ? "مشاغل" : "Positions"}
            </TabsTrigger>
            <TabsTrigger value="payroll">
              {language === "fa" ? "حقوق و دستمزد" : "Payroll"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />{" "}
                  {language === "fa" ? "لیست کارکنان" : "Employee List"}
                </CardTitle>
                <Dialog
                  open={employeeDialogOpen}
                  onOpenChange={setEmployeeDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {language === "fa" ? "کارکن جدید" : "New Employee"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingEmployee
                          ? language === "fa"
                            ? "ویرایش کارکن"
                            : "Edit Employee"
                          : language === "fa"
                            ? "کارکن جدید"
                            : "New Employee"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "نام" : "First Name"}
                          </Label>
                          <Input
                            value={employeeForm.first_name || ""}
                            onChange={(e) =>
                              setEmployeeForm({
                                ...employeeForm,
                                first_name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "نام خانوادگی" : "Last Name"}
                          </Label>
                          <Input
                            value={employeeForm.last_name || ""}
                            onChange={(e) =>
                              setEmployeeForm({
                                ...employeeForm,
                                last_name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "ایمیل" : "Email"}
                          </Label>
                          <Input
                            value={employeeForm.email || ""}
                            onChange={(e) =>
                              setEmployeeForm({
                                ...employeeForm,
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
                            value={employeeForm.phone || ""}
                            onChange={(e) =>
                              setEmployeeForm({
                                ...employeeForm,
                                phone: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "دپارتمان" : "Department"}
                          </Label>
                          <Select
                            value={String(employeeForm.department_id || "")}
                            onValueChange={(v) =>
                              setEmployeeForm({
                                ...employeeForm,
                                department_id: parseInt(v),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {departments.map((d) => (
                                <SelectItem key={d.id} value={String(d.id)}>
                                  {language === "fa" ? d.name_fa : d.name_en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "شغل" : "Position"}
                          </Label>
                          <Select
                            value={String(employeeForm.position_id || "")}
                            onValueChange={(v) =>
                              setEmployeeForm({
                                ...employeeForm,
                                position_id: parseInt(v),
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {positions.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {language === "fa" ? p.name_fa : p.name_en}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "تاریخ استخدام" : "Hire Date"}
                          </Label>
                          <Input
                            type="date"
                            value={employeeForm.hire_date || ""}
                            onChange={(e) =>
                              setEmployeeForm({
                                ...employeeForm,
                                hire_date: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "حقوق" : "Salary"}
                          </Label>
                          <Input
                            type="number"
                            value={employeeForm.salary || ""}
                            onChange={(e) =>
                              setEmployeeForm({
                                ...employeeForm,
                                salary: parseFloat(e.target.value),
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa"
                              ? "نوع اشتغال"
                              : "Employment Type"}
                          </Label>
                          <Select
                            value={employeeForm.employment_type || "full_time"}
                            onValueChange={(v) =>
                              setEmployeeForm({
                                ...employeeForm,
                                employment_type: v as any,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full_time">
                                {language === "fa" ? "تمام وقت" : "Full Time"}
                              </SelectItem>
                              <SelectItem value="part_time">
                                {language === "fa" ? "پاره وقت" : "Part Time"}
                              </SelectItem>
                              <SelectItem value="contract">
                                {language === "fa" ? "قرارداد" : "Contract"}
                              </SelectItem>
                              <SelectItem value="temporary">
                                {language === "fa" ? "موقت" : "Temporary"}
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm">
                            {language === "fa" ? "شناسنامه" : "National ID"}
                          </Label>
                          <Input
                            value={employeeForm.national_id || ""}
                            onChange={(e) =>
                              setEmployeeForm({
                                ...employeeForm,
                                national_id: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEmployeeDialogOpen(false);
                            setEditingEmployee(null);
                          }}
                        >
                          {language === "fa" ? "انصراف" : "Cancel"}
                        </Button>
                        <Button onClick={saveEmployee}>
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
                    language === "fa" ? "جستجو نام یا کد" : "Search name or ID"
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">
                          {language === "fa" ? "کد" : "ID"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "نام" : "Name"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "ایمیل" : "Email"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "دپارتمان" : "Department"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "شغل" : "Position"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "حقوق" : "Salary"}
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
                      {filtered.map((emp) => {
                        const dept = departments.find(
                          (d) => d.id === emp.department_id,
                        );
                        const pos = positions.find(
                          (p) => p.id === emp.position_id,
                        );
                        return (
                          <TableRow key={emp.id}>
                            <TableCell className="text-xs font-mono">
                              {emp.employee_id}
                            </TableCell>
                            <TableCell className="text-xs">
                              {emp.first_name} {emp.last_name}
                            </TableCell>
                            <TableCell className="text-xs">
                              {emp.email}
                            </TableCell>
                            <TableCell className="text-xs">
                              {language === "fa"
                                ? dept?.name_fa
                                : dept?.name_en}
                            </TableCell>
                            <TableCell className="text-xs">
                              {language === "fa" ? pos?.name_fa : pos?.name_en}
                            </TableCell>
                            <TableCell className="text-xs text-right font-semibold">
                              {formatCurrencyIRR(emp.salary)}
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge
                                className={
                                  emp.status === "active"
                                    ? "bg-green-500"
                                    : emp.status === "on_leave"
                                      ? "bg-yellow-500"
                                      : "bg-gray-500"
                                }
                              >
                                {emp.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2"
                                  onClick={() => {
                                    setEditingEmployee(emp);
                                    setEmployeeForm(emp);
                                    setEmployeeDialogOpen(true);
                                  }}
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-red-600"
                                  onClick={() => deleteEmployee(emp.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
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

          <TabsContent value="departments">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />{" "}
                  {language === "fa" ? "دپارتمان‌ها" : "Departments"}
                </CardTitle>
                <Dialog open={deptDialogOpen} onOpenChange={setDeptDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {language === "fa" ? "دپارتمان جدید" : "New Department"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDept
                          ? language === "fa"
                            ? "ویرایش دپارتمان"
                            : "Edit Department"
                          : language === "fa"
                            ? "دپارتمان جدید"
                            : "New Department"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "نام انگلیسی" : "Name (EN)"}
                        </Label>
                        <Input
                          value={deptForm.name_en || ""}
                          onChange={(e) =>
                            setDeptForm({
                              ...deptForm,
                              name_en: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "نام فارسی" : "Name (FA)"}
                        </Label>
                        <Input
                          value={deptForm.name_fa || ""}
                          onChange={(e) =>
                            setDeptForm({
                              ...deptForm,
                              name_fa: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "کد" : "Code"}
                        </Label>
                        <Input
                          value={deptForm.code || ""}
                          onChange={(e) =>
                            setDeptForm({ ...deptForm, code: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "بودجه" : "Budget"}
                        </Label>
                        <Input
                          type="number"
                          value={deptForm.budget || ""}
                          onChange={(e) =>
                            setDeptForm({
                              ...deptForm,
                              budget: parseFloat(e.target.value),
                            })
                          }
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setDeptDialogOpen(false);
                            setEditingDept(null);
                          }}
                        >
                          {language === "fa" ? "انصراف" : "Cancel"}
                        </Button>
                        <Button onClick={saveDepartment}>
                          {language === "fa" ? "ذخیره" : "Save"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {departments.map((dept) => (
                    <div key={dept.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">
                            {language === "fa" ? dept.name_fa : dept.name_en}
                          </p>
                          <p className="text-xs text-gray-500">{dept.code}</p>
                        </div>
                        <Badge
                          className={
                            dept.status === "active"
                              ? "bg-green-500"
                              : "bg-gray-500"
                          }
                        >
                          {dept.status}
                        </Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-600">
                            {language === "fa" ? "کارکنان" : "Employees"}
                          </p>
                          <p className="font-bold">{dept.employee_count}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">
                            {language === "fa" ? "بودجه" : "Budget"}
                          </p>
                          <p className="font-bold">
                            {formatCurrencyIRR(dept.budget)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full mt-3"
                        onClick={() => {
                          setEditingDept(dept);
                          setDeptForm(dept);
                          setDeptDialogOpen(true);
                        }}
                      >
                        {language === "fa" ? "ویرایش" : "Edit"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />{" "}
                  {language === "fa" ? "مشاغل" : "Positions"}
                </CardTitle>
                <Dialog open={posDialogOpen} onOpenChange={setPosDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />{" "}
                      {language === "fa" ? "شغل جدید" : "New Position"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPos
                          ? language === "fa"
                            ? "ویرایش شغل"
                            : "Edit Position"
                          : language === "fa"
                            ? "شغل جدید"
                            : "New Position"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "نام انگلیسی" : "Name (EN)"}
                        </Label>
                        <Input
                          value={posForm.name_en || ""}
                          onChange={(e) =>
                            setPosForm({ ...posForm, name_en: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "نام فارسی" : "Name (FA)"}
                        </Label>
                        <Input
                          value={posForm.name_fa || ""}
                          onChange={(e) =>
                            setPosForm({ ...posForm, name_fa: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "کد" : "Code"}
                        </Label>
                        <Input
                          value={posForm.code || ""}
                          onChange={(e) =>
                            setPosForm({ ...posForm, code: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-sm">
                          {language === "fa" ? "دپارتمان" : "Department"}
                        </Label>
                        <Select
                          value={String(posForm.department_id || "")}
                          onValueChange={(v) =>
                            setPosForm({
                              ...posForm,
                              department_id: parseInt(v),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((d) => (
                              <SelectItem key={d.id} value={String(d.id)}>
                                {language === "fa" ? d.name_fa : d.name_en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setPosDialogOpen(false);
                            setEditingPos(null);
                          }}
                        >
                          {language === "fa" ? "انصراف" : "Cancel"}
                        </Button>
                        <Button onClick={savePosition}>
                          {language === "fa" ? "ذخیره" : "Save"}
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
                          {language === "fa" ? "کد" : "Code"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "نام" : "Name"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "دپارتمان" : "Department"}
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
                      {positions.map((pos) => {
                        const dept = departments.find(
                          (d) => d.id === pos.department_id,
                        );
                        return (
                          <TableRow key={pos.id}>
                            <TableCell className="text-xs font-mono">
                              {pos.code}
                            </TableCell>
                            <TableCell className="text-xs">
                              {language === "fa" ? pos.name_fa : pos.name_en}
                            </TableCell>
                            <TableCell className="text-xs">
                              {language === "fa"
                                ? dept?.name_fa
                                : dept?.name_en}
                            </TableCell>
                            <TableCell className="text-xs">
                              <Badge
                                className={
                                  pos.status === "active"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                                }
                              >
                                {pos.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2"
                                onClick={() => {
                                  setEditingPos(pos);
                                  setPosForm(pos);
                                  setPosDialogOpen(true);
                                }}
                              >
                                <Edit2 className="w-3 h-3" />
                              </Button>
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

          <TabsContent value="payroll">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />{" "}
                  {language === "fa" ? "حقوق و دستمزد" : "Payroll Records"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">
                          {language === "fa" ? "کارکن" : "Employee"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "دوره" : "Period"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "حقوق پایه" : "Basic"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "کسور" : "Deductions"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "مالیات" : "Tax"}
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          {language === "fa" ? "خالص" : "Net"}
                        </TableHead>
                        <TableHead className="text-xs">
                          {language === "fa" ? "وضعیت" : "Status"}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payroll.map((pay) => (
                        <TableRow key={pay.id}>
                          <TableCell className="text-xs">
                            {pay.employee_name}
                          </TableCell>
                          <TableCell className="text-xs">
                            {pay.payroll_period}
                          </TableCell>
                          <TableCell className="text-xs text-right">
                            {formatCurrencyIRR(pay.basic_salary)}
                          </TableCell>
                          <TableCell className="text-xs text-right text-red-600">
                            {formatCurrencyIRR(pay.deductions)}
                          </TableCell>
                          <TableCell className="text-xs text-right text-red-600">
                            {formatCurrencyIRR(pay.tax_withheld)}
                          </TableCell>
                          <TableCell className="text-xs text-right font-bold text-green-700">
                            {formatCurrencyIRR(pay.net_salary)}
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              className={
                                pay.status === "paid"
                                  ? "bg-green-500"
                                  : "bg-yellow-500"
                              }
                            >
                              {pay.status}
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
