import {
  LayoutDashboard, Users, UserCog, Building2, CalendarDays, Wallet,
  FileText, Plane, Globe, Receipt, ListChecks,
  BarChart3, Settings, ShieldCheck, ClipboardList, Briefcase,
  Bell, Megaphone, KanbanSquare, CheckSquare, CreditCard,
  TrendingUp, FileCheck2, Key, Server, History, UserPlus, PlusCircle,
} from "lucide-react";

export type Role = "super_admin" | "hr" | "finance" | "crm" | "employee";

export interface NavItem {
  label: string;
  to: string;
  icon: any;
  roles?: Role[];
}
export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navGroups: NavGroup[] = [
  {
    label: "Dashboard",
    items: [
      { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
      { label: "HR Dashboard", to: "/dashboard/hr", icon: Briefcase, roles: ["super_admin", "hr"] },
      { label: "Finance Dashboard", to: "/dashboard/finance", icon: Wallet, roles: ["super_admin", "finance"] },
      { label: "CRM Dashboard", to: "/dashboard/crm", icon: TrendingUp, roles: ["super_admin", "crm"] },
    ],
  },
  {
    label: "Visa Operations",
    items: [
      { label: "Applications", to: "/visa/applications", icon: Plane },
      { label: "New Application", to: "/visa/applications/new", icon: PlusCircle },
      { label: "Approval Center", to: "/visa/approvals", icon: ShieldCheck },
      { label: "Countries & Rules", to: "/countries", icon: Globe },
      { label: "Visa Categories", to: "/countries/categories", icon: ClipboardList },
    ],
  },
  {
    label: "CRM",
    items: [
      { label: "Leads", to: "/crm/leads", icon: Users },
      { label: "Customers", to: "/crm/customers", icon: UserCog },
      { label: "Pipeline", to: "/crm/pipeline", icon: KanbanSquare },
      { label: "Follow-ups", to: "/crm/tasks", icon: CheckSquare },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Payments", to: "/finance/payments", icon: CreditCard },
      { label: "Invoices", to: "/finance/invoices", icon: Receipt },
      { label: "Expenses", to: "/finance/expenses", icon: FileText },
      { label: "Transactions", to: "/finance/transactions", icon: History },
      { label: "Reports", to: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "HR Management",
    items: [
      { label: "Employees", to: "/hr/employees", icon: Users, roles: ["super_admin", "hr"] },
      { label: "Attendance", to: "/hr/attendance", icon: CalendarDays, roles: ["super_admin", "hr"] },
      { label: "Payroll", to: "/hr/payroll", icon: Wallet, roles: ["super_admin", "hr", "finance"] },
      { label: "Leave", to: "/hr/leave", icon: ClipboardList, roles: ["super_admin", "hr"] },
      { label: "Departments", to: "/hr/departments", icon: Building2, roles: ["super_admin", "hr"] },
    ],
  },
  {
    label: "System",
    items: [
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
      { label: "Settings", to: "/settings", icon: Settings, roles: ["super_admin"] },
      { label: "Users", to: "/settings/users", icon: UserPlus, roles: ["super_admin"] },
      { label: "Roles", to: "/settings/roles", icon: Key, roles: ["super_admin"] },
      { label: "Security", to: "/settings/security", icon: ShieldCheck, roles: ["super_admin"] },
      { label: "API Management", to: "/settings/api", icon: Server, roles: ["super_admin"] },
      { label: "Audit Logs", to: "/settings/audit", icon: ListChecks, roles: ["super_admin"] },
    ],
  },
  {
    label: "My Work",
    items: [
      { label: "My Dashboard", to: "/dashboard/employee", icon: UserCog, roles: ["employee"] },
      { label: "Task Board", to: "/tasks/board", icon: KanbanSquare, roles: ["employee"] },
    ],
  },
];
