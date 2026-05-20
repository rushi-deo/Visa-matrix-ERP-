import type {
  ActivityItem,
  ApplicationDetail,
  ApplicationListItem,
  AuthUser,
  DashboardSummary,
  FrontendRole,
  Permission,
  ResourceCollection,
  ResourceItem,
} from "../types";

export function normalizeRole(role?: string | null): FrontendRole {
  const normalized = String(role || "").trim();

  // Check for exact matches first
  if (
    normalized === "Super Admin" ||
    normalized === "super_admin" ||
    normalized === "Admin" ||
    normalized === "admin"
  ) {
    return normalized === "Super Admin" ? "Super Admin" : "Admin";
  }

  if (normalized === "HR" || normalized === "hr") {
    return "HR";
  }

  if (normalized === "Finance" || normalized === "finance") {
    return "Finance";
  }

  if (normalized === "Sales" || normalized === "sales") {
    return "Sales";
  }

  if (
    normalized === "Case Manager" ||
    normalized === "case_manager" ||
    normalized === "visa_officer"
  ) {
    return "Case Manager";
  }

  return "Employee";
}

export function normalizeAuthUser(record: {
  id?: string | number;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  permissions?: Permission[] | string[];
}): AuthUser {
  // Filter and validate permissions
  const validPermissions = Array.isArray(record.permissions)
    ? (record.permissions.filter((p): p is Permission => {
        const validPerms: Permission[] = [
          "manage_users",
          "manage_roles",
          "assign_roles",
          "manage_employees",
          "manage_visas",
          "manage_documents",
          "manage_payments",
          "view_reports",
          "manage_crm",
          "edit_applications",
        ];
        return validPerms.includes(p as Permission);
      }) as Permission[])
    : [];

  return {
    id: String(record.id || record.email || crypto.randomUUID()),
    name: record.full_name || record.name || record.email || "Visa Matrix User",
    email: record.email || "",
    role: normalizeRole(record.role),
    permissions: validPermissions,
    rawRole: record.role || "Employee",
  };
}

export function extractCollection<T extends ResourceItem = ResourceItem>(
  payload: unknown,
): ResourceCollection<T> {
  if (Array.isArray(payload)) {
    return { items: payload as T[] };
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.data)) {
      return { items: record.data as T[] };
    }

    if (Array.isArray(record.items)) {
      return {
        items: record.items as T[],
        pagination:
          (record.pagination as ResourceCollection<T>["pagination"]) || {},
      };
    }

    if (Array.isArray(record.applications)) {
      return {
        items: record.applications as T[],
        pagination:
          (record.pagination as ResourceCollection<T>["pagination"]) || {},
      };
    }
  }

  return { items: [] };
}

export function buildActivityFeed(
  applications: ApplicationListItem[],
  fallbackLabel = "Application updated",
): ActivityItem[] {
  return applications.slice(0, 6).map((application, index) => ({
    id: `${application.reference_no}-${index}`,
    title: application.client_name || fallbackLabel,
    description: `${application.reference_no} is currently ${application.status || "in review"}.`,
    timestamp: application.created_at,
    status: application.status,
  }));
}

export function summarizeDashboard(
  summary?: Partial<DashboardSummary> | null,
): DashboardSummary {
  return {
    total_applications: Number(summary?.total_applications || 0),
    applications_today: Number(summary?.applications_today || 0),
    pending_documents: Number(summary?.pending_documents || 0),
    payments_pending: Number(summary?.payments_pending || 0),
    visas_approved: Number(summary?.visas_approved || 0),
    visas_rejected: Number(summary?.visas_rejected || 0),
  };
}

export function normalizeApplicationDetail(
  payload: ApplicationDetail | ApplicationListItem,
) {
  const detailPayload = payload as ApplicationDetail;

  return {
    ...payload,
    documents: detailPayload.documents || [],
    payment: detailPayload.payment || {},
    profile: detailPayload.profile || {},
  } as ApplicationDetail;
}
