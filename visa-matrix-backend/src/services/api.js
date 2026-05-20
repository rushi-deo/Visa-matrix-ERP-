const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const API_ROOT_URL = API_BASE_URL.endsWith("/api")
  ? API_BASE_URL.slice(0, -4)
  : API_BASE_URL;

const mockCustomers = [
  {
    id: "cus-001",
    name: "Aarav Mehta",
    email: "aarav.m@northbridge.com",
    phone: "+91 98765 32100",
    country: "India",
    status: "Active",
    segment: "Priority",
  },
  {
    id: "cus-002",
    name: "Sophia Chen",
    email: "sophia.chen@aurora.io",
    phone: "+1 604 555 0110",
    country: "Canada",
    status: "Pending Review",
    segment: "Corporate",
  },
  {
    id: "cus-003",
    name: "Omar Farouk",
    email: "omar.f@axisglobal.ae",
    phone: "+971 50 888 2211",
    country: "UAE",
    status: "Active",
    segment: "VIP",
  },
  {
    id: "cus-004",
    name: "Elena Petrova",
    email: "elena.p@metroline.eu",
    phone: "+44 20 7946 1101",
    country: "United Kingdom",
    status: "Documents Pending",
    segment: "Student",
  },
  {
    id: "cus-005",
    name: "Miguel Santos",
    email: "miguel.s@horizon.mx",
    phone: "+52 55 4477 1900",
    country: "Mexico",
    status: "Active",
    segment: "Family",
  },
  {
    id: "cus-006",
    name: "Layla Hassan",
    email: "layla.h@nova-eg.com",
    phone: "+20 100 555 7788",
    country: "Egypt",
    status: "Follow Up",
    segment: "Express",
  },
];

const mockApplications = [
  {
    id: "app-001",
    applicantName: "Aarav Mehta",
    country: "Canada",
    visaType: "Work Permit",
    status: "Processing",
    createdDate: "Mar 10, 2026",
    assignedAgent: "Mina Rao",
    priority: "High",
  },
  {
    id: "app-002",
    applicantName: "Sophia Chen",
    country: "Australia",
    visaType: "Business Visa",
    status: "Documents Pending",
    createdDate: "Mar 08, 2026",
    assignedAgent: "James Cole",
    priority: "Medium",
  },
  {
    id: "app-003",
    applicantName: "Omar Farouk",
    country: "United Kingdom",
    visaType: "Visitor Visa",
    status: "Submitted",
    createdDate: "Mar 07, 2026",
    assignedAgent: "Sana Ali",
    priority: "Low",
  },
  {
    id: "app-004",
    applicantName: "Elena Petrova",
    country: "Germany",
    visaType: "Student Visa",
    status: "Approved",
    createdDate: "Mar 05, 2026",
    assignedAgent: "Rohit Sen",
    priority: "High",
  },
  {
    id: "app-005",
    applicantName: "Miguel Santos",
    country: "Singapore",
    visaType: "Employment Pass",
    status: "Created",
    createdDate: "Mar 04, 2026",
    assignedAgent: "Mina Rao",
    priority: "Medium",
  },
  {
    id: "app-006",
    applicantName: "Layla Hassan",
    country: "United States",
    visaType: "Tourist Visa",
    status: "Rejected",
    createdDate: "Mar 01, 2026",
    assignedAgent: "James Cole",
    priority: "Critical",
  },
];

const mockCountries = [
  {
    id: "country-001",
    name: "Canada",
    region: "North America",
    processingTime: "4-6 weeks",
    visaRequired: "Yes",
    visaTypes: ["Study Permit", "Work Permit", "Visitor Visa"],
    requirements: [
      "Passport valid for at least 6 months",
      "Recent bank statements",
      "Employment or admission proof",
      "Biometrics appointment",
    ],
    successRate: 92,
    queue: "Balanced",
  },
  {
    id: "country-002",
    name: "Australia",
    region: "Oceania",
    processingTime: "3-5 weeks",
    visaRequired: "Yes",
    visaTypes: ["Business Visa", "Subclass 500", "Visitor Visa"],
    requirements: [
      "Travel history declaration",
      "Health insurance evidence",
      "Income documentation",
      "Statement of purpose",
    ],
    successRate: 88,
    queue: "Elevated",
  },
  {
    id: "country-003",
    name: "United Kingdom",
    region: "Europe",
    processingTime: "2-4 weeks",
    visaRequired: "Yes",
    visaTypes: ["Student Visa", "Skilled Worker", "Standard Visitor"],
    requirements: [
      "TB certificate if applicable",
      "CAS or sponsor reference",
      "Proof of funds",
      "Travel and accommodation plan",
    ],
    successRate: 90,
    queue: "Normal",
  },
  {
    id: "country-004",
    name: "Germany",
    region: "Europe",
    processingTime: "4-8 weeks",
    visaRequired: "Yes",
    visaTypes: ["Job Seeker", "Blue Card", "Schengen Visa"],
    requirements: [
      "Blocked account proof",
      "Academic transcripts",
      "Travel medical insurance",
      "Appointment confirmation",
    ],
    successRate: 85,
    queue: "High Volume",
  },
];

const mockDocuments = [
  {
    id: "doc-001",
    customer: "Aarav Mehta",
    documentType: "Passport Copy",
    uploadDate: "Mar 10, 2026",
    status: "Verified",
    application: "Canada Work Permit",
  },
  {
    id: "doc-002",
    customer: "Sophia Chen",
    documentType: "Bank Statement",
    uploadDate: "Mar 09, 2026",
    status: "Pending Review",
    application: "Australia Business Visa",
  },
  {
    id: "doc-003",
    customer: "Omar Farouk",
    documentType: "Invitation Letter",
    uploadDate: "Mar 08, 2026",
    status: "Approved",
    application: "UK Visitor Visa",
  },
  {
    id: "doc-004",
    customer: "Elena Petrova",
    documentType: "CAS Letter",
    uploadDate: "Mar 05, 2026",
    status: "Missing Signature",
    application: "Germany Student Visa",
  },
  {
    id: "doc-005",
    customer: "Miguel Santos",
    documentType: "Employment Contract",
    uploadDate: "Mar 03, 2026",
    status: "Uploaded",
    application: "Singapore Employment Pass",
  },
];

const mockPayments = [
  {
    id: "pay-001",
    customer: "Aarav Mehta",
    application: "Canada Work Permit",
    amount: 4200,
    currency: "USD",
    status: "Paid",
    date: "Mar 10, 2026",
    invoice: "INV-1201",
  },
  {
    id: "pay-002",
    customer: "Sophia Chen",
    application: "Australia Business Visa",
    amount: 2750,
    currency: "USD",
    status: "Pending",
    date: "Mar 09, 2026",
    invoice: "INV-1202",
  },
  {
    id: "pay-003",
    customer: "Omar Farouk",
    application: "UK Visitor Visa",
    amount: 1600,
    currency: "GBP",
    status: "Paid",
    date: "Mar 07, 2026",
    invoice: "INV-1203",
  },
  {
    id: "pay-004",
    customer: "Elena Petrova",
    application: "Germany Student Visa",
    amount: 3100,
    currency: "EUR",
    status: "Paid",
    date: "Mar 06, 2026",
    invoice: "INV-1204",
  },
  {
    id: "pay-005",
    customer: "Layla Hassan",
    application: "US Tourist Visa",
    amount: 1250,
    currency: "USD",
    status: "Failed",
    date: "Mar 02, 2026",
    invoice: "INV-1205",
  },
];

const mockTasks = [
  {
    id: "task-001",
    title: "Verify employer sponsorship",
    dueDate: "Mar 12, 2026",
    status: "In Progress",
    assignedAgent: "Mina Rao",
    application: "Canada Work Permit",
    priority: "High",
  },
  {
    id: "task-002",
    title: "Request updated bank statement",
    dueDate: "Mar 13, 2026",
    status: "Open",
    assignedAgent: "James Cole",
    application: "Australia Business Visa",
    priority: "Medium",
  },
  {
    id: "task-003",
    title: "Schedule biometrics slot",
    dueDate: "Mar 14, 2026",
    status: "Completed",
    assignedAgent: "Sana Ali",
    application: "UK Visitor Visa",
    priority: "Low",
  },
  {
    id: "task-004",
    title: "Review blocked account receipt",
    dueDate: "Mar 15, 2026",
    status: "Escalated",
    assignedAgent: "Rohit Sen",
    application: "Germany Student Visa",
    priority: "Critical",
  },
  {
    id: "task-005",
    title: "Confirm interview readiness",
    dueDate: "Mar 16, 2026",
    status: "In Progress",
    assignedAgent: "Mina Rao",
    application: "US Tourist Visa",
    priority: "High",
  },
];

const mockDashboard = {
  cpuUsage: [
    { time: "08:00", value: 24 },
    { time: "09:00", value: 42 },
    { time: "10:00", value: 36 },
    { time: "11:00", value: 58 },
    { time: "12:00", value: 49 },
    { time: "13:00", value: 67 },
    { time: "14:00", value: 54 },
  ],
  memoryUsage: [
    { time: "08:00", used: 44, cache: 18 },
    { time: "09:00", used: 48, cache: 20 },
    { time: "10:00", used: 52, cache: 22 },
    { time: "11:00", used: 61, cache: 25 },
    { time: "12:00", used: 59, cache: 24 },
    { time: "13:00", used: 66, cache: 27 },
    { time: "14:00", used: 62, cache: 26 },
  ],
  networkTraffic: [
    { time: "08:00", inbound: 180, outbound: 120 },
    { time: "09:00", inbound: 260, outbound: 164 },
    { time: "10:00", inbound: 320, outbound: 212 },
    { time: "11:00", inbound: 410, outbound: 240 },
    { time: "12:00", inbound: 355, outbound: 219 },
    { time: "13:00", inbound: 470, outbound: 308 },
    { time: "14:00", inbound: 430, outbound: 274 },
  ],
  logs: [
    {
      id: "log-001",
      level: "INFO",
      message: "server started",
      source: "core-api",
      timestamp: "09:02:11",
    },
    {
      id: "log-002",
      level: "INFO",
      message: "workers running",
      source: "workflow-engine",
      timestamp: "09:04:26",
    },
    {
      id: "log-003",
      level: "WARN",
      message: "memory usage high",
      source: "metrics-proxy",
      timestamp: "09:16:40",
    },
    {
      id: "log-004",
      level: "ERROR",
      message: "job failed",
      source: "notification-worker",
      timestamp: "09:18:02",
    },
    {
      id: "log-005",
      level: "INFO",
      message: "audit stream synchronized",
      source: "admin-ops",
      timestamp: "09:22:50",
    },
  ],
  markers: [
    {
      name: "Toronto",
      coordinates: [-79.3832, 43.6532],
      activity: "Processing",
      volume: 24,
    },
    {
      name: "London",
      coordinates: [-0.1276, 51.5072],
      activity: "Submitted",
      volume: 18,
    },
    {
      name: "Sydney",
      coordinates: [151.2093, -33.8688],
      activity: "Documents Pending",
      volume: 12,
    },
    {
      name: "Dubai",
      coordinates: [55.2708, 25.2048],
      activity: "Priority Intake",
      volume: 15,
    },
    {
      name: "Singapore",
      coordinates: [103.8198, 1.3521],
      activity: "Approved",
      volume: 10,
    },
  ],
};

const mockReports = {
  applicationsByCountry: [
    { country: "Canada", total: 24 },
    { country: "Australia", total: 19 },
    { country: "United Kingdom", total: 17 },
    { country: "Germany", total: 13 },
    { country: "Singapore", total: 11 },
  ],
  revenueSeries: [
    { label: "Oct", revenue: 28000, collected: 22000 },
    { label: "Nov", revenue: 34000, collected: 27100 },
    { label: "Dec", revenue: 37000, collected: 30500 },
    { label: "Jan", revenue: 41000, collected: 33600 },
    { label: "Feb", revenue: 46000, collected: 38900 },
    { label: "Mar", revenue: 49500, collected: 41800 },
  ],
  agentPerformance: [
    { agent: "Mina Rao", completed: 32, open: 4, sla: 96 },
    { agent: "James Cole", completed: 28, open: 7, sla: 91 },
    { agent: "Sana Ali", completed: 24, open: 3, sla: 94 },
    { agent: "Rohit Sen", completed: 21, open: 5, sla: 89 },
  ],
};

const mockAdmin = {
  users: [
    {
      id: "usr-001",
      name: "Ava Miller",
      email: "ava.miller@visamatrix.io",
      role: "Administrator",
      status: "Active",
      lastSeen: "5 mins ago",
    },
    {
      id: "usr-002",
      name: "Mina Rao",
      email: "mina.rao@visamatrix.io",
      role: "Case Manager",
      status: "Active",
      lastSeen: "12 mins ago",
    },
    {
      id: "usr-003",
      name: "James Cole",
      email: "james.cole@visamatrix.io",
      role: "Agent",
      status: "Review",
      lastSeen: "31 mins ago",
    },
    {
      id: "usr-004",
      name: "Noah Price",
      email: "noah.price@visamatrix.io",
      role: "Finance",
      status: "Active",
      lastSeen: "1 hour ago",
    },
  ],
  auditLogs: [
    {
      id: "audit-001",
      level: "INFO",
      message: "role permissions updated",
      source: "rbac",
      timestamp: "10:01:09",
    },
    {
      id: "audit-002",
      level: "WARN",
      message: "2fa disabled for sandbox user",
      source: "security",
      timestamp: "10:07:22",
    },
    {
      id: "audit-003",
      level: "INFO",
      message: "invoice export completed",
      source: "billing",
      timestamp: "10:12:46",
    },
    {
      id: "audit-004",
      level: "ERROR",
      message: "policy sync timeout",
      source: "settings",
      timestamp: "10:19:08",
    },
  ],
  settings: {
    supportEmail: "ops@visamatrix.io",
    sessionTimeout: "30 minutes",
    storageRegion: "ap-south-1",
    autoAssign: "Enabled",
  },
};

const statusLabel = (value, fallback = "Active") => {
  return String(value || fallback)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatDate = (value, fallback = "Mar 11, 2026") => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const currencyAmount = (amount) => {
  const numericValue = Number(amount || 0);
  return Number.isFinite(numericValue) ? numericValue : 0;
};

const unwrapItems = (payload) => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

const fallbackForIndex = (items, index) => items[index % items.length] || {};

const normalizeCollection = (payload, fallbackItems, normalizer) => {
  const liveItems = unwrapItems(payload);

  if (!liveItems.length) {
    return fallbackItems;
  }

  return liveItems.map((item, index) =>
    normalizer(item, fallbackForIndex(fallbackItems, index))
  );
};

const authToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return (
    window.localStorage.getItem("visa_matrix_token") ||
    window.localStorage.getItem("token") ||
    ""
  );
};

const request = async (endpoint, fallback, options = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && method !== "GET") {
    headers.set("Content-Type", "application/json");
  }

  const token = authToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      method,
      headers,
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    if (response.status === 204) {
      return { data: fallback, source: "live", error: null };
    }

    const payload = await response.json();

    return {
      data: payload?.data ?? payload ?? fallback,
      source: "live",
      error: null,
    };
  } catch (error) {
    return {
      data: fallback,
      source: "mock",
      error: error.message,
    };
  }
};

const isUuidLike = (value) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(value || "")
  );

const normalizeCustomer = (item, fallback) => ({
  id: item.id || fallback.id,
  name: item.full_name || item.name || fallback.name,
  email: item.email || fallback.email,
  phone: item.phone || fallback.phone,
  country: item.nationality || item.country || fallback.country,
  status: statusLabel(item.status || fallback.status),
  segment: item.segment || fallback.segment,
});

const normalizeApplication = (item, fallback) => ({
  id: item.id || fallback.id,
  applicantName:
    item.applicant_name ||
    item.customer_name ||
    item.full_name ||
    item.reference_no ||
    fallback.applicantName,
  country:
    item.country_name ||
    (isUuidLike(item.country_id) ? fallback.country : item.country_id) ||
    item.country ||
    fallback.country,
  visaType:
    item.visa_type_name ||
    item.visa_type ||
    (isUuidLike(item.visa_type_id) ? fallback.visaType : item.visa_type_id) ||
    fallback.visaType,
  status: statusLabel(item.status || item.application_status || fallback.status),
  createdDate: formatDate(item.created_at, fallback.createdDate),
  assignedAgent: item.assigned_to || item.agent_name || fallback.assignedAgent,
  priority: statusLabel(item.priority || fallback.priority),
});

const normalizeCountry = (item, fallback) => ({
  id: item.id || fallback.id,
  name: item.country_name || item.name || fallback.name,
  region: item.region || fallback.region,
  processingTime: item.processing_time || fallback.processingTime,
  visaRequired:
    typeof item.visa_required === "boolean"
      ? item.visa_required
        ? "Yes"
        : "No"
      : fallback.visaRequired,
  visaTypes: Array.isArray(item.visa_types) ? item.visa_types : fallback.visaTypes,
  requirements: Array.isArray(item.requirements)
    ? item.requirements
    : fallback.requirements,
  successRate: Number(item.success_rate || fallback.successRate),
  queue: statusLabel(item.queue || fallback.queue),
});

const normalizeDocument = (item, fallback) => ({
  id: item.id || fallback.id,
  customer: item.customer_name || item.customer || fallback.customer,
  documentType: item.document_type || item.documentType || fallback.documentType,
  uploadDate: formatDate(item.created_at, fallback.uploadDate),
  status: statusLabel(item.status || item.verification_status || fallback.status),
  application: item.application_name || fallback.application,
});

const normalizePayment = (item, fallback) => ({
  id: item.id || fallback.id,
  customer: item.customer_name || fallback.customer,
  application: item.application_name || fallback.application,
  amount: currencyAmount(item.amount, item.currency || fallback.currency),
  currency: item.currency || fallback.currency,
  status: statusLabel(item.payment_status || item.status || fallback.status),
  date: formatDate(item.created_at, fallback.date),
  invoice: item.invoice_number || fallback.invoice,
});

const normalizeTask = (item, fallback) => ({
  id: item.id || fallback.id,
  title: item.task_title || item.title || fallback.title,
  dueDate: formatDate(item.due_date, fallback.dueDate),
  status: statusLabel(item.status || fallback.status),
  assignedAgent: item.assigned_to || item.agent_name || fallback.assignedAgent,
  application: item.application_name || fallback.application,
  priority: statusLabel(item.priority || fallback.priority),
});

const buildApplicationsByCountry = (payload) => {
  const entries = Object.entries(payload?.byCountry || {});

  if (!entries.length) {
    return mockReports.applicationsByCountry;
  }

  return entries.slice(0, 5).map(([country, total], index) => ({
    country: isUuidLike(country)
      ? mockReports.applicationsByCountry[index]?.country || `Region ${index + 1}`
      : statusLabel(country, country),
    total: Number(total || 0),
  }));
};

const buildRevenueSeries = (payload) => {
  const currencies = Array.isArray(payload?.currencies) ? payload.currencies : [];

  if (!currencies.length) {
    return mockReports.revenueSeries;
  }

  return currencies.map((entry, index) => ({
    label: entry.currency || mockReports.revenueSeries[index]?.label || `Bucket ${index + 1}`,
    revenue: currencyAmount(entry.totalAmount),
    collected: currencyAmount(entry.paidAmount),
  }));
};

const buildAgentPerformance = (payload) => {
  const agents = Array.isArray(payload?.agents) ? payload.agents : [];

  if (!agents.length) {
    return mockReports.agentPerformance;
  }

  return agents.map((entry) => ({
    agent: entry.fullName || entry.name || "Unassigned",
    completed: Number(entry.completedTasks || 0),
    open: Number(entry.assignedTasks || 0) - Number(entry.completedTasks || 0),
    sla: Number(entry.sla || 90),
  }));
};

export const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const getDashboardSeed = () => ({
  ...mockDashboard,
  cpuUsage: [...mockDashboard.cpuUsage],
  memoryUsage: [...mockDashboard.memoryUsage],
  networkTraffic: [...mockDashboard.networkTraffic],
  logs: [...mockDashboard.logs],
  markers: [...mockDashboard.markers],
});

export const getCustomers = async () => {
  const result = await request("/customers", { items: mockCustomers });

  return {
    items: normalizeCollection(result.data, mockCustomers, normalizeCustomer),
    source: result.source,
    error: result.error,
  };
};

export const getApplications = async () => {
  const result = await request("/applications", { items: mockApplications });

  return {
    items: normalizeCollection(result.data, mockApplications, normalizeApplication),
    source: result.source,
    error: result.error,
  };
};

export const getCountries = async () => {
  const result = await request("/countries", { items: mockCountries });

  return {
    items: normalizeCollection(result.data, mockCountries, normalizeCountry),
    source: result.source,
    error: result.error,
  };
};

export const getDocuments = async () => {
  const result = await request("/documents", { items: mockDocuments });

  return {
    items: normalizeCollection(result.data, mockDocuments, normalizeDocument),
    source: result.source,
    error: result.error,
  };
};

export const getPayments = async () => {
  const result = await request("/payments", { items: mockPayments });

  return {
    items: normalizeCollection(result.data, mockPayments, normalizePayment),
    source: result.source,
    error: result.error,
  };
};

export const getTasks = async () => {
  const result = await request("/tasks", { items: mockTasks });

  return {
    items: normalizeCollection(result.data, mockTasks, normalizeTask),
    source: result.source,
    error: result.error,
  };
};

export const getReports = async () => {
  const directReport = await request("/reports", null);

  if (directReport.source === "live" && directReport.data) {
    return {
      source: "live",
      applicationsByCountry: directReport.data.applicationsByCountry || mockReports.applicationsByCountry,
      revenueSeries: directReport.data.revenueSeries || mockReports.revenueSeries,
      agentPerformance: directReport.data.agentPerformance || mockReports.agentPerformance,
      error: null,
    };
  }

  const [applicationsReport, revenueReport, agentsReport] = await Promise.all([
    request("/reports/applications", null),
    request("/reports/revenue", null),
    request("/reports/agents", null),
  ]);

  const sources = [
    applicationsReport.source,
    revenueReport.source,
    agentsReport.source,
  ];

  const source = sources.every((entry) => entry === "live")
    ? "live"
    : sources.some((entry) => entry === "live")
      ? "mixed"
      : "mock";

  return {
    source,
    applicationsByCountry: buildApplicationsByCountry(applicationsReport.data),
    revenueSeries: buildRevenueSeries(revenueReport.data),
    agentPerformance: buildAgentPerformance(agentsReport.data),
    error:
      applicationsReport.error || revenueReport.error || agentsReport.error || directReport.error,
  };
};

export const getAdminSnapshot = async () => {
  const result = await request("/admin", mockAdmin);
  const payload = result.data || mockAdmin;

  return {
    source: result.source,
    users: Array.isArray(payload.users) ? payload.users : mockAdmin.users,
    auditLogs: Array.isArray(payload.auditLogs) ? payload.auditLogs : mockAdmin.auditLogs,
    settings: payload.settings || mockAdmin.settings,
    error: result.error,
  };
};

export const getSystemStatus = async () => {
  try {
    const response = await fetch(`${API_ROOT_URL}/health`);

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const payload = await response.json();
    const timestamp = payload?.data?.timestamp
      ? new Date(payload.data.timestamp).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Live";

    return {
      ok: true,
      label: "API connected",
      detail: `Health check passed at ${timestamp}`,
    };
  } catch (error) {
    return {
      ok: false,
      label: "Fallback mode",
      detail: `Unable to reach API health endpoint: ${error.message}`,
    };
  }
};
