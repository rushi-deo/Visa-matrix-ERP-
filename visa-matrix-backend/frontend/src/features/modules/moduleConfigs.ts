type ModuleConfig = {
  title: string;
  description: string;
  endpoint: string;
  columns: { key: string; header: string }[];
  helperText: string;
};

export const moduleConfigs: Record<string, ModuleConfig> = {
  leads: {
    title: "Lead pipeline",
    description: "Track acquisition opportunities, visa interest, and conversion stages.",
    endpoint: "/leads",
    helperText: "Leads help your CRM team track prospects before they become customers.",
    columns: [
      { key: "name", header: "Lead" },
      { key: "email", header: "Email" },
      { key: "status", header: "Stage" },
      { key: "country", header: "Country" },
      { key: "created_at", header: "Created" },
    ],
  },
  customers: {
    title: "Customers",
    description: "Manage active customer accounts, timelines, and visa engagement history.",
    endpoint: "/customers",
    helperText: "Customer accounts aggregate communication, documents, and visa case history.",
    columns: [
      { key: "name", header: "Customer" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Phone" },
      { key: "country", header: "Country" },
      { key: "status", header: "Status" },
    ],
  },
  customerProfile: {
    title: "Customer profile",
    description: "Customer-level timeline, notes, and visa case history.",
    endpoint: "/customers",
    helperText: "Select a customer from the CRM list to drill into their profile history.",
    columns: [
      { key: "name", header: "Customer" },
      { key: "email", header: "Email" },
      { key: "country", header: "Country" },
      { key: "status", header: "Status" },
    ],
  },
  visaRequirements: {
    title: "Visa requirements",
    description: "Operational view of eligibility rules and required documentation.",
    endpoint: "/visa-requirements",
    helperText: "Use this module to centralize destination-specific requirements.",
    columns: [
      { key: "country", header: "Country" },
      { key: "visa_type", header: "Visa type" },
      { key: "requirement", header: "Requirement" },
      { key: "status", header: "Status" },
    ],
  },
  documents: {
    title: "Documents",
    description: "Document inventory and verification status across cases.",
    endpoint: "/documents",
    helperText: "The current backend only exposes upload, so read views depend on future document list endpoints.",
    columns: [
      { key: "document_name", header: "Document" },
      { key: "application_id", header: "Application" },
      { key: "status", header: "Status" },
      { key: "uploaded_at", header: "Uploaded" },
    ],
  },
  documentVerification: {
    title: "Document verification",
    description: "Review uploaded files and internal verification outcomes.",
    endpoint: "/documents",
    helperText: "Verification workflows appear here when the backend returns document review data.",
    columns: [
      { key: "document_name", header: "Document" },
      { key: "application_id", header: "Application" },
      { key: "status", header: "Verification" },
      { key: "uploaded_at", header: "Uploaded" },
    ],
  },
  invoices: {
    title: "Invoices",
    description: "Invoice records, payment references, and receivable status.",
    endpoint: "/invoices",
    helperText: "Invoice analytics complement payment tracking and revenue reporting.",
    columns: [
      { key: "invoice_no", header: "Invoice" },
      { key: "customer", header: "Customer" },
      { key: "amount", header: "Amount" },
      { key: "status", header: "Status" },
      { key: "created_at", header: "Issued" },
    ],
  },
  transactions: {
    title: "Transactions",
    description: "Operational settlement and provider transaction audit view.",
    endpoint: "/transactions",
    helperText: "Transaction feeds reconcile provider references and payment outcomes.",
    columns: [
      { key: "provider_ref", header: "Provider Ref" },
      { key: "application_id", header: "Application" },
      { key: "amount", header: "Amount" },
      { key: "payment_status", header: "Status" },
      { key: "created_at", header: "Created" },
    ],
  },
  workflowBuilder: {
    title: "Workflow builder",
    description: "Configure case routing, status changes, and automation triggers.",
    endpoint: "/workflows",
    helperText: "Automated stage logic will surface here as workflow definitions become available.",
    columns: [
      { key: "name", header: "Workflow" },
      { key: "trigger", header: "Trigger" },
      { key: "status", header: "Status" },
      { key: "updated_at", header: "Updated" },
    ],
  },
  applicationPipeline: {
    title: "Application pipeline",
    description: "Monitor automated stage transitions and stuck cases.",
    endpoint: "/workflows",
    helperText: "Pipeline health highlights throughput and bottlenecks by stage.",
    columns: [
      { key: "stage", header: "Stage" },
      { key: "volume", header: "Cases" },
      { key: "owner", header: "Owner" },
      { key: "status", header: "State" },
    ],
  },
  tasks: {
    title: "Tasks",
    description: "Track operational tasks across agents and managers.",
    endpoint: "/tasks",
    helperText: "Tasks synchronize action items with case deadlines.",
    columns: [
      { key: "title", header: "Task" },
      { key: "assignee", header: "Assignee" },
      { key: "priority", header: "Priority" },
      { key: "status", header: "Status" },
      { key: "due_date", header: "Due" },
    ],
  },
  caseAssignments: {
    title: "Case assignments",
    description: "Distribute workload and monitor team utilization.",
    endpoint: "/tasks",
    helperText: "Assignments help balance capacity across the operations floor.",
    columns: [
      { key: "assignee", header: "Assignee" },
      { key: "title", header: "Case" },
      { key: "priority", header: "Priority" },
      { key: "status", header: "Status" },
    ],
  },
  inbox: {
    title: "Inbox",
    description: "Unified communication inbox for internal and customer messages.",
    endpoint: "/messages",
    helperText: "Customer communication should centralize here when message feeds are available.",
    columns: [
      { key: "subject", header: "Subject" },
      { key: "sender", header: "Sender" },
      { key: "status", header: "Status" },
      { key: "created_at", header: "Received" },
    ],
  },
  messages: {
    title: "Messages",
    description: "Operational communications and case-specific messaging threads.",
    endpoint: "/messages",
    helperText: "This view is designed for customer communication and internal updates.",
    columns: [
      { key: "subject", header: "Subject" },
      { key: "sender", header: "Sender" },
      { key: "status", header: "Status" },
      { key: "created_at", header: "Received" },
    ],
  },
  notifications: {
    title: "Notifications",
    description: "Alerts for workflow events, risk signals, and case changes.",
    endpoint: "/notifications",
    helperText: "Notifications surface important changes and compliance flags.",
    columns: [
      { key: "title", header: "Notification" },
      { key: "type", header: "Type" },
      { key: "status", header: "Status" },
      { key: "created_at", header: "Created" },
    ],
  },
  reports: {
    title: "Reports",
    description: "Operational reporting and export orchestration.",
    endpoint: "/reports",
    helperText: "Scheduled and ad hoc reports support executive and operational reporting.",
    columns: [
      { key: "name", header: "Report" },
      { key: "type", header: "Type" },
      { key: "status", header: "Status" },
      { key: "created_at", header: "Created" },
    ],
  },
  adminDashboard: {
    title: "Admin dashboard",
    description: "Administration and governance view across users, access, and system posture.",
    endpoint: "/admin",
    helperText: "Admin insights consolidate system-level controls and visibility.",
    columns: [
      { key: "name", header: "Entity" },
      { key: "type", header: "Type" },
      { key: "status", header: "Status" },
      { key: "updated_at", header: "Updated" },
    ],
  },
  userManagement: {
    title: "User management",
    description: "Provision and audit users across the platform.",
    endpoint: "/admin/users",
    helperText: "User administration governs access and team structure.",
    columns: [
      { key: "name", header: "User" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
      { key: "status", header: "Status" },
    ],
  },
  roleManagement: {
    title: "Role management",
    description: "Review platform permissions and role assignments.",
    endpoint: "/admin/roles",
    helperText: "Role definitions enforce RBAC boundaries across the ERP.",
    columns: [
      { key: "name", header: "Role" },
      { key: "permissions", header: "Permissions" },
      { key: "status", header: "Status" },
    ],
  },
  apiKeys: {
    title: "API keys",
    description: "Manage platform integrations and key rotation.",
    endpoint: "/admin/api-keys",
    helperText: "API credentials should be monitored and rotated on schedule.",
    columns: [
      { key: "name", header: "Key" },
      { key: "scope", header: "Scope" },
      { key: "status", header: "Status" },
      { key: "updated_at", header: "Updated" },
    ],
  },
  systemLogs: {
    title: "System logs",
    description: "Operational system telemetry and service diagnostics.",
    endpoint: "/admin/logs",
    helperText: "System logs support triage, incident review, and operational audits.",
    columns: [
      { key: "level", header: "Level" },
      { key: "message", header: "Message" },
      { key: "service", header: "Service" },
      { key: "created_at", header: "Timestamp" },
    ],
  },
  auditLogs: {
    title: "Audit logs",
    description: "Immutable actions, operator interventions, and approval history.",
    endpoint: "/audit-logs",
    helperText: "Audit trails support compliance, investigations, and control testing.",
    columns: [
      { key: "actor", header: "Actor" },
      { key: "action", header: "Action" },
      { key: "target", header: "Target" },
      { key: "created_at", header: "Timestamp" },
    ],
  },
  accessLogs: {
    title: "Access logs",
    description: "Track sign-in activity and access patterns.",
    endpoint: "/access-logs",
    helperText: "Access monitoring helps detect anomalous entry points and privilege use.",
    columns: [
      { key: "actor", header: "Actor" },
      { key: "ip_address", header: "IP" },
      { key: "status", header: "Result" },
      { key: "created_at", header: "Timestamp" },
    ],
  },
  compliance: {
    title: "Compliance",
    description: "Oversight of regulatory adherence, document controls, and case policies.",
    endpoint: "/compliance",
    helperText: "Compliance dashboards surface policy coverage and audit readiness.",
    columns: [
      { key: "rule", header: "Rule" },
      { key: "owner", header: "Owner" },
      { key: "status", header: "Status" },
      { key: "updated_at", header: "Updated" },
    ],
  },
};

export type ModuleConfigKey = keyof typeof moduleConfigs;
