import axios, { type AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";

import { STORAGE_KEYS } from "../config/appConfig";
import {
  API_FALLBACK_BASE_URLS,
  API_ROOT_URL,
} from "../config/api";

const primaryBaseUrl = API_ROOT_URL;

const fallbackBaseUrls = [
  import.meta.env.VITE_API_FALLBACK_URL,
  ...API_FALLBACK_BASE_URLS,
].filter((value, index, list): value is string => {
  return Boolean(value) && value !== primaryBaseUrl && list.indexOf(value) === index;
});

const apiClient = axios.create({
  baseURL: primaryBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      const requestUrl = String(error.config?.url || "");
      const isAuthRequest = /\/auth\/(login|register|forgot-password)/.test(
        requestUrl
      );

      if (!isAuthRequest) {
        unauthorizedHandler?.();
      }
    }

    return Promise.reject(error);
  }
);

const DEV_MODE = import.meta.env.DEV;

function createMockResponse<T>(
  data: unknown,
  config: AxiosRequestConfig
): AxiosResponse<T> {
  return {
    data: data as T,
    status: 200,
    statusText: "OK",
    headers: {},
    config: config as any,
    request: {},
  };
}

function getDevMockResponse<T>(config: AxiosRequestConfig): AxiosResponse<T> | null {
  if (!DEV_MODE) {
    return null;
  }

  const requestUrl = String(config.url || "");
  const pathname = requestUrl.startsWith("http")
    ? new URL(requestUrl).pathname
    : requestUrl;
  const method = String(config.method || "get").toLowerCase();

  const adminUser = {
    id: "dev-admin",
    email: "dev@local",
    name: "Dev Admin",
    full_name: "Dev Admin",
    role: "Admin",
    rawRole: "Admin",
    permissions: ["*"],
  };

  const dashboardSummary = {
    total_applications: 22,
    applications_today: 4,
    pending_documents: 3,
    payments_pending: 2,
    visas_approved: 16,
    visas_rejected: 1,
  };

  const exampleApplication = {
    id: "dev-app-1",
    reference_no: "DEV-1001",
    client_name: "Acme Traveler",
    country: "United States",
    visa_type: "Tourist",
    status: "Pending",
    payment_status: "Paid",
    created_at: new Date().toISOString(),
    agent: "Dev Officer",
  };

  const roleList = [
    { id: "admin", name: "Admin", description: "Admin role", permissionCount: 12 },
    { id: "hr-manager", name: "HR Manager", description: "HR role", permissionCount: 8 },
  ];

  const permissionsList = [
    { id: "manage_users", name: "manage_users", description: "Manage users" },
    { id: "edit_applications", name: "edit_applications", description: "Edit applications" },
  ];

  const leadItems = [
    {
      id: "lead-001",
      name: "Regal Horizons",
      email: "enterprise@regalhorizons.com",
      status: "Qualified",
      country: "United Kingdom",
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: "lead-002",
      name: "Noble Passage",
      email: "contact@noblep.com",
      status: "Contacted",
      country: "United States",
      created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];

  const customerItems = [
    {
      id: "cust-001",
      name: "Luxe Travel Partners",
      email: "info@luxetravel.com",
      phone: "+1 212-555-0198",
      country: "Canada",
      status: "Active",
    },
    {
      id: "cust-002",
      name: "Summit Visa Services",
      email: "sales@summitvisa.com",
      phone: "+44 20 7946 0958",
      country: "United Kingdom",
      status: "Active",
    },
  ];

  const visaRequirements = [
    {
      id: "req-001",
      country: "United States",
      visa_type: "Business",
      requirement: "Invitation letter, passport valid 6+ months",
      status: "Published",
    },
    {
      id: "req-002",
      country: "Germany",
      visa_type: "Tourist",
      requirement: "Proof of accommodation, travel itinerary",
      status: "Published",
    },
  ];

  const documentItems = [
    {
      id: "doc-001",
      document_name: "Passport copy",
      application_id: "DEV-1001",
      status: "Verified",
      uploaded_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const invoiceItems = [
    {
      id: "inv-001",
      invoice_no: "INV-2026-001",
      customer: "Luxe Travel Partners",
      amount: 14250,
      status: "Paid",
      created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    },
  ];

  const transactionItems = [
    {
      id: "txn-001",
      provider_ref: "TXN-1001",
      application_id: "DEV-1001",
      amount: 14250,
      payment_status: "Completed",
      created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
  ];

  const accountItems = [
    {
      id: "acct-001",
      account_name: "Corporate Travel Ledger",
      customer: "Luxe Travel Partners",
      balance: 28500,
      status: "Open",
      updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const taskItems = [
    {
      id: "task-001",
      title: "Review Visa application DEV-1001",
      assignee: "Dev Officer",
      priority: "High",
      status: "In Progress",
      due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
  ];

  const messageItems = [
    {
      id: "msg-001",
      subject: "Visa case update required",
      sender: "operations@visamatrix.com",
      status: "Unread",
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const notificationItems = [
    {
      id: "note-001",
      title: "New document uploaded for DEV-1001",
      type: "Document",
      status: "New",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const reportItems = [
    {
      id: "report-001",
      name: "Executive visa performance summary",
      type: "Dashboard",
      status: "Ready",
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const workflowItems = [
    {
      id: "workflow-001",
      name: "Standard visa approval flow",
      trigger: "Application submission",
      status: "Active",
      updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];

  const auditLogs = [
    {
      id: "audit-001",
      actor: "Dev Admin",
      action: "Updated user permissions",
      target: "HR Manager",
      created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
  ];

  const accessLogs = [
    {
      id: "access-001",
      actor: "Dev Admin",
      ip_address: "127.0.0.1",
      status: "Success",
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  const complianceItems = [
    {
      id: "compliance-001",
      rule: "KYC Document Retention",
      owner: "Compliance Team",
      status: "Compliant",
      updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ];

  const apiKeys = [
    {
      id: "key-001",
      name: "Integration Key A",
      scope: "Payments",
      status: "Active",
      updated_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    },
  ];

  const systemLogs = [
    {
      id: "log-001",
      level: "info",
      message: "Dev environment loaded for UI testing.",
      service: "frontend",
      created_at: new Date(Date.now() - 600000).toISOString(),
    },
  ];

  if (pathname.endsWith("/auth/login") && method === "post") {
    return createMockResponse(
      {
        success: true,
        data: {
          token: "dev-token",
          user: adminUser,
        },
      },
      config,
    );
  }

  if (pathname.endsWith("/auth/register") && method === "post") {
    return createMockResponse(
      {
        success: true,
        data: { message: "Dev registration bypass active." },
      },
      config,
    );
  }

  if (pathname.endsWith("/auth/me") && method === "get") {
    return createMockResponse(
      {
        success: true,
        data: {
          user: adminUser,
          role: "Admin",
          permissions: ["*"],
        },
      },
      config,
    );
  }

  if (pathname.endsWith("/auth/logout") && method === "post") {
    return createMockResponse(
      { success: true, data: { message: "Logged out from dev bypass." } },
      config,
    );
  }

  if (pathname.endsWith("/admin/dashboard/summary") && method === "get") {
    return createMockResponse(dashboardSummary as unknown as T, config);
  }

  if (pathname.endsWith("/admin/applications") && method === "get") {
    return createMockResponse(
      {
        applications: [exampleApplication],
        pagination: {
          page: Number(config.params?.page ?? 1),
          limit: Number(config.params?.limit ?? 10),
          total: 1,
          total_pages: 1,
        },
      } as unknown as T,
      config,
    );
  }

  if (/\/admin\/application\/.+/.test(pathname) && method === "get") {
    return createMockResponse(
      {
        ...exampleApplication,
        documents: [],
        payment: { amount: 120, currency: "USD", payment_status: "Paid" },
        profile: { nationality: "United States", passport_number: "D1234567" },
      } as unknown as T,
      config,
    );
  }

  if (pathname.endsWith("/admin/roles") && method === "get") {
    return createMockResponse(
      { items: roleList },
      config,
    );
  }

  if (/\/admin\/roles\/[^/]+$/.test(pathname) && method === "get") {
    return createMockResponse(
      { id: "admin", name: "Admin", description: "Admin role", permissions: ["*"] },
      config,
    );
  }

  if (pathname.endsWith("/admin/permissions") && method === "get") {
    return createMockResponse(
      { items: permissionsList },
      config,
    );
  }

  if (/\/admin\/roles\/[^/]+\/permissions$/.test(pathname) && method === "get") {
    return createMockResponse(
      { role: { id: "admin", name: "Admin" }, permissions: permissionsList },
      config,
    );
  }

  if (pathname.includes("/admin/roles/") && pathname.includes("/permissions") && ["post", "delete"].includes(method)) {
    return createMockResponse(
      { message: "Dev RBAC bypass successful." },
      config,
    );
  }

  if (pathname.endsWith("/countries") && method === "get") {
    return createMockResponse(
      [
        { id: "us", name: "United States", country_name: "United States", code: "US", region: "Americas" },
      ] as unknown as T,
      config,
    );
  }

  if (pathname.endsWith("/visa-types") && method === "get") {
    return createMockResponse(
      [
        { id: "tourist", visa_type: "Tourist", name: "Tourist Visa", title: "Tourist" },
      ] as unknown as T,
      config,
    );
  }

  if (pathname.endsWith("/leads") && method === "get") {
    return createMockResponse({ items: leadItems } as unknown as T, config);
  }

  if (pathname.endsWith("/customers") && method === "get") {
    return createMockResponse({ items: customerItems } as unknown as T, config);
  }

  if (pathname.endsWith("/visa-requirements") && method === "get") {
    return createMockResponse({ items: visaRequirements } as unknown as T, config);
  }

  if (pathname.endsWith("/documents") && method === "get") {
    return createMockResponse({ items: documentItems } as unknown as T, config);
  }

  if (pathname.endsWith("/invoices") && method === "get") {
    return createMockResponse({ items: invoiceItems } as unknown as T, config);
  }

  if (pathname.endsWith("/transactions") && method === "get") {
    return createMockResponse({ items: transactionItems } as unknown as T, config);
  }

  if (pathname.endsWith("/accounts") && method === "get") {
    return createMockResponse({ items: accountItems } as unknown as T, config);
  }

  if (pathname.endsWith("/tasks") && method === "get") {
    return createMockResponse({ items: taskItems } as unknown as T, config);
  }

  if (pathname.endsWith("/messages") && method === "get") {
    return createMockResponse({ items: messageItems } as unknown as T, config);
  }

  if (pathname.endsWith("/notifications") && method === "get") {
    return createMockResponse({ items: notificationItems } as unknown as T, config);
  }

  if (pathname.endsWith("/reports") && method === "get") {
    return createMockResponse({ items: reportItems } as unknown as T, config);
  }

  if (pathname.endsWith("/workflows") && method === "get") {
    return createMockResponse({ items: workflowItems } as unknown as T, config);
  }

  if (pathname.endsWith("/audit-logs") && method === "get") {
    return createMockResponse({ items: auditLogs } as unknown as T, config);
  }

  if (pathname.endsWith("/access-logs") && method === "get") {
    return createMockResponse({ items: accessLogs } as unknown as T, config);
  }

  if (pathname.endsWith("/compliance") && method === "get") {
    return createMockResponse({ items: complianceItems } as unknown as T, config);
  }

  if (pathname.endsWith("/admin/api-keys") && method === "get") {
    return createMockResponse({ items: apiKeys } as unknown as T, config);
  }

  if (pathname.endsWith("/admin/logs") && method === "get") {
    return createMockResponse({ items: systemLogs } as unknown as T, config);
  }

  if (pathname.endsWith("/application") && method === "post") {
    return createMockResponse(
      { id: "dev-app-1", reference_no: "DEV-1001", status: "Pending" } as unknown as T,
      config,
    );
  }

  if (method === "get") {
    return createMockResponse({} as T, config);
  }

  return createMockResponse({ success: true, data: {} } as unknown as T, config);
}

function shouldRetry(error: AxiosError) {
  return !error.response || error.response.status === 404;
}

function extractErrorMessage(error: AxiosError) {
  const payload = error.response?.data;

  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }
  }

  return error.message || "Request failed";
}

export async function requestWithFallback<T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> {
  if (DEV_MODE) {
    const devResponse = getDevMockResponse<T>(config);
    if (devResponse) {
      return devResponse;
    }
  }

  const baseUrls = [primaryBaseUrl, ...fallbackBaseUrls];
  let lastError: AxiosError | null = null;

  for (let index = 0; index < baseUrls.length; index += 1) {
    const baseURL = baseUrls[index];

    try {
      return await apiClient.request<T>({
        ...config,
        baseURL,
      });
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        throw error;
      }

      lastError = error;

      if (!shouldRetry(error) || index === baseUrls.length - 1) {
        throw new Error(extractErrorMessage(error));
      }
    }
  }

  throw new Error(lastError ? extractErrorMessage(lastError) : "Request failed");
}

export default apiClient;
