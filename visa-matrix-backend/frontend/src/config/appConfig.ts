import {
  Activity,
  Briefcase,
  BriefcaseBusiness,
  ChartColumnBig,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  Globe2,
  Landmark,
  LayoutDashboard,
  MessageSquareMore,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

import {
  API_FALLBACK_BASE_URLS as API_BASE_URL_FALLBACKS,
  API_ROOT_URL,
} from "./api";
import { MODULE_PERMISSION_KEYS } from "./rbac";
import type { FrontendRole, NavigationItem, Permission } from "../types";

export const APP_NAME = "Visa Matrix";
export const BRAND_COLORS = {
  primaryBlue: "#1E5BB8",
  darkNavy: "#0B2E59",
  lightBackground: "#F5F7FA",
  accentBlue: "#2F80ED",
} as const;

export const DEFAULT_API_BASE_URL = API_ROOT_URL;
export const API_FALLBACK_BASE_URLS = API_BASE_URL_FALLBACKS;

export const STORAGE_KEYS = {
  token: "visa-matrix.token",
  user: "visa-matrix.user",
} as const;

export { ENTERPRISE_ROLES as FRONTEND_ROLES } from "./rbac";

export const APPLICATION_STATUSES = [
  "Submitted",
  "Documents Review",
  "Processing",
  "Approved",
  "Rejected",
  "Visa Issued",
] as const;

const STAFF_ROLES: FrontendRole[] = [
  "Super Admin",
  "Admin",
  "HR Manager",
  "Finance Manager",
  "Visa Officer",
  "Employee",
];

export const SIDEBAR_NAVIGATION: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
    roles: STAFF_ROLES,
  },
  {
    label: "Applications",
    icon: BriefcaseBusiness,
    to: "/applications",
    roles: STAFF_ROLES,
    requiredPermission: "edit_applications",
  },
  {
    label: "HR",
    icon: Briefcase,
    to: "/hr",
    roles: ["Super Admin", "Admin", "HR Manager"],
    requiredPermission: "hr:view",
  },
  {
    label: "Employees",
    icon: Users,
    to: "/hr/employees",
    roles: ["Super Admin", "Admin", "HR Manager"],
    requiredPermission: "manage_employees",
  },
  {
    label: "Leads",
    icon: ClipboardList,
    to: "/leads",
    roles: [
      "Super Admin",
      "Admin",
      "HR Manager",
      "Visa Officer",
      "Finance Manager",
    ],
    requiredPermission: "manage_crm",
  },
  {
    label: "Customers",
    icon: Users,
    to: "/customers",
    roles: [
      "Super Admin",
      "Admin",
      "HR Manager",
      "Visa Officer",
      "Finance Manager",
    ],
    requiredPermission: "manage_crm",
  },
  {
    label: "Documents",
    icon: FileCheck2,
    to: "/documents",
    roles: [
      "Super Admin",
      "Admin",
      "HR Manager",
      "Visa Officer",
      "Finance Manager",
    ],
    requiredPermission: "manage_documents",
  },
  {
    label: "Accounts",
    icon: Landmark,
    to: "/accounts/dashboard",
    roles: ["Super Admin", "Admin", "Finance Manager"],
    requiredPermission: MODULE_PERMISSION_KEYS.accounts.view,
    children: [
      {
        label: "Dashboard",
        to: "/accounts/dashboard",
        roles: ["Super Admin", "Admin", "Finance Manager"],
        requiredPermission: MODULE_PERMISSION_KEYS.accounts.view,
      },
      {
        label: "Invoices",
        to: "/accounts/invoices",
        roles: ["Super Admin", "Admin", "Finance Manager"],
        requiredPermission: MODULE_PERMISSION_KEYS.accounts.view,
      },
      {
        label: "Transactions",
        to: "/accounts/transactions",
        roles: ["Super Admin", "Admin", "Finance Manager"],
        requiredPermission: MODULE_PERMISSION_KEYS.accounts.view,
      },
      {
        label: "Expenses",
        to: "/accounts/expenses",
        roles: ["Super Admin", "Admin", "Finance Manager"],
        requiredPermission: MODULE_PERMISSION_KEYS.accounts.view,
      },
      {
        label: "Reports",
        to: "/accounts/reports",
        roles: ["Super Admin", "Admin", "Finance Manager"],
        requiredPermission: MODULE_PERMISSION_KEYS.accounts.view,
      },
    ],
  },
  {
    label: "Analytics",
    icon: ChartColumnBig,
    to: "/analytics",
    roles: ["Super Admin", "Admin", "Finance Manager"],
    requiredPermission: "view_reports",
  },
  {
    label: "Countries",
    icon: Globe2,
    to: "/countries",
    roles: STAFF_ROLES,
    requiredPermission: "countries:view",
  },
  {
    label: "Visa Management",
    icon: Workflow,
    to: "/workflows/builder",
    roles: ["Super Admin", "Admin", "HR Manager", "Visa Officer"],
    requiredPermission: "manage_visas",
  },
  {
    label: "Tasks",
    icon: Activity,
    to: "/tasks",
    roles: [
      "Super Admin",
      "Admin",
      "HR Manager",
      "Visa Officer",
      "Finance Manager",
    ],
    requiredPermission: "tasks:view",
  },
  {
    label: "Messages",
    icon: MessageSquareMore,
    to: "/messages",
    roles: STAFF_ROLES,
    requiredPermission: "notifications:view",
  },
  {
    label: "Reports",
    icon: ChartColumnBig,
    to: "/reports",
    roles: ["Super Admin", "Admin", "Finance Manager"],
    requiredPermission: "view_reports",
  },
  {
    label: "Admin",
    icon: ShieldCheck,
    to: "/admin",
    roles: ["Super Admin", "Admin"],
    requiredPermission: "manage_users",
  },
  {
    label: "Settings",
    icon: Settings,
    to: "/settings",
    roles: STAFF_ROLES,
  },
];
