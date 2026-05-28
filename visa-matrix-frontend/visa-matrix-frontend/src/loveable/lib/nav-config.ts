import {
  LayoutDashboard, Users, UserCog, Building2, CalendarDays, Wallet,
  FileText, Plane, Globe, Folder, Receipt, ListChecks, MessagesSquare,
  BarChart3, Settings, ShieldCheck, ClipboardList, Briefcase, Mail,
  Bell, Megaphone, KanbanSquare, GitBranch, CheckSquare, CreditCard,
  TrendingUp, FileCheck2, Key, Server, History,
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
    label: "Overview",
    items: [
      { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
      { label: "HR Dashboard", to: "/dashboard/hr", icon: Briefcase, roles: ["super_admin", "hr"] },
      { label: "Finance Dashboard", to: "/dashboard/finance", icon: Wallet, roles: ["super_admin", "finance"] },
      { label: "CRM Dashboard", to: "/dashboard/crm", icon: TrendingUp, roles: ["super_admin", "crm"] },
      { label: "My Dashboard", to: "/dashboard/employee", icon: UserCog, roles: ["employee"] },
    ],
  },
  {
    label: "Visa Operations",
    items: [
      { label: "Applications", to: "/visa/applications", icon: Plane },
      { label: "New Application", to: "/visa/applications/new", icon: FileCheck2 },
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
    label: "HR Management",
    items: [
      { label: "Employees", to: "/hr/employees", icon: Users, roles: ["super_admin", "hr"] },
      { label: "Departments", to: "/hr/departments", icon: Building2, roles: ["super_admin", "hr"] },
      { label: "Attendance", to: "/hr/attendance", icon: CalendarDays, roles: ["super_admin", "hr"] },
      { label: "Leave Management", to: "/hr/leave", icon: ClipboardList, roles: ["super_admin", "hr"] },
      { label: "Payroll", to: "/hr/payroll", icon: Wallet, roles: ["super_admin", "hr", "finance"] },
    ],
  },
  {
    label: "Documents",
    items: [
      { label: "Document Center", to: "/documents", icon: Folder },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Invoices", to: "/finance/invoices", icon: Receipt },
      { label: "Payments", to: "/finance/payments", icon: CreditCard },
      { label: "Transactions", to: "/finance/transactions", icon: History },
      { label: "Expenses", to: "/finance/expenses", icon: FileText },
    ],
  },
  {
    label: "Workflow",
    items: [
      { label: "Task Board", to: "/tasks/board", icon: KanbanSquare },
      { label: "Workflows", to: "/tasks/workflows", icon: GitBranch },
      { label: "Pending Approvals", to: "/tasks/approvals", icon: ShieldCheck },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Team Chat", to: "/chat", icon: MessagesSquare },
      { label: "Notifications", to: "/notifications", icon: Bell },
      { label: "Email Center", to: "/email", icon: Mail },
      { label: "Announcements", to: "/announcements", icon: Megaphone },
    ],
  },
  {
    label: "Analytics",
    items: [{ label: "Reports", to: "/reports", icon: BarChart3 }],
  },
  {
    label: "Administration",
    items: [
      { label: "General Settings", to: "/settings", icon: Settings, roles: ["super_admin"] },
      { label: "Roles & Permissions", to: "/settings/roles", icon: Key, roles: ["super_admin"] },
      { label: "User Management", to: "/settings/users", icon: Users, roles: ["super_admin"] },
      { label: "Security", to: "/settings/security", icon: ShieldCheck, roles: ["super_admin"] },
      { label: "API Settings", to: "/settings/api", icon: Server, roles: ["super_admin"] },
      { label: "Audit Logs", to: "/settings/audit", icon: ListChecks, roles: ["super_admin"] },
    ],
  },
];