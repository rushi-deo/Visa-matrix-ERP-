import {
  Activity,
  Briefcase,
  BriefcaseBusiness,
  ChartColumnBig,
  CircleDollarSign,
  ClipboardList,
  FileCheck2,
  Globe2,
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

export const FRONTEND_ROLES: FrontendRole[] = [
  "Super Admin",
  "Admin",
  "HR",
  "Finance",
  "Sales",
  "Case Manager",
  "Employee",
] as const;

export const APPLICATION_STATUSES = [
  "Submitted",
  "Documents Review",
  "Processing",
  "Approved",
  "Rejected",
  "Visa Issued",
] as const;

export const SIDEBAR_NAVIGATION: NavigationItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    to: "/dashboard",
    roles: [
      "Super Admin",
      "Admin",
      "HR",
      "Finance",
      "Sales",
      "Case Manager",
      "Employee",
    ],
  },
  {
    label: "Applications",
    icon: BriefcaseBusiness,
    to: "/applications",
    roles: [
      "Super Admin",
      "Admin",
      "HR",
      "Finance",
      "Sales",
      "Case Manager",
      "Employee",
    ],
    requiredPermission: "edit_applications",
  },
  {
    label: "HR",
    icon: Briefcase,
    to: "/hr",
    roles: ["Super Admin", "Admin", "HR"],
  },
  {
    label: "Leads",
    icon: ClipboardList,
    to: "/leads",
    roles: ["Super Admin", "Admin", "HR", "Finance", "Sales", "Case Manager"],
    requiredPermission: "manage_crm",
  },
  {
    label: "Customers",
    icon: Users,
    to: "/customers",
    roles: ["Super Admin", "Admin", "HR", "Finance", "Sales", "Case Manager"],
    requiredPermission: "manage_crm",
  },
  {
    label: "Documents",
    icon: FileCheck2,
    to: "/documents",
    roles: ["Super Admin", "Admin", "HR", "Finance", "Sales", "Case Manager"],
    requiredPermission: "manage_documents",
  },
  {
    label: "Payments",
    icon: CircleDollarSign,
    to: "/payments",
    roles: ["Super Admin", "Admin", "Finance"],
    requiredPermission: "manage_payments",
  },
  {
    label: "Analytics",
    icon: ChartColumnBig,
    to: "/analytics",
    roles: ["Super Admin", "Admin"],
    requiredPermission: "view_reports",
  },
  {
    label: "Countries",
    icon: Globe2,
    to: "/countries",
    roles: [
      "Super Admin",
      "Admin",
      "HR",
      "Finance",
      "Sales",
      "Case Manager",
      "Employee",
    ],
  },
  {
    label: "Visa Management",
    icon: Workflow,
    to: "/workflows/builder",
    roles: ["Super Admin", "Admin", "HR"],
    requiredPermission: "manage_visas",
  },
  {
    label: "Tasks",
    icon: Activity,
    to: "/tasks",
    roles: ["Super Admin", "Admin", "HR", "Finance", "Sales", "Case Manager"],
  },
  {
    label: "Messages",
    icon: MessageSquareMore,
    to: "/messages",
    roles: [
      "Super Admin",
      "Admin",
      "HR",
      "Finance",
      "Sales",
      "Case Manager",
      "Employee",
    ],
  },
  {
    label: "Reports",
    icon: ChartColumnBig,
    to: "/reports",
    roles: ["Super Admin", "Admin"],
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
    roles: [
      "Super Admin",
      "Admin",
      "HR",
      "Finance",
      "Sales",
      "Case Manager",
      "Employee",
    ],
  },
];
