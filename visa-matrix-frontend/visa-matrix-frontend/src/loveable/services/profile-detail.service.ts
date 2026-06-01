import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Download,
  FilePlus2,
  Mail,
  Pencil,
  Printer,
  Receipt,
  RefreshCcw,
  Send,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserX,
} from "lucide-react";

import {
  applications,
  documents,
  employees,
  invoices,
  leads,
  type Employee,
  type Invoice,
  type Lead,
} from "@/lib/mock-data";
import type {
  ProfileAction,
  ProfileDetail,
  ProfileEntityType,
  ProfileMetric,
  ProfileNote,
  ProfileSection,
  ProfileTable,
  ProfileTimelineItem,
} from "@/types/profile-detail";

const wait = (ms = 280) => new Promise((resolve) => window.setTimeout(resolve, ms));

function money(value: number, currency = "INR") {
  return `${currency} ${value.toLocaleString("en-IN")}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function dateFromSeed(seed: number, monthOffset = 0) {
  const month = ((seed + monthOffset) % 12) + 1;
  const day = ((seed * 7) % 27) + 1;
  return `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function timeline(subject: string, owner: string): ProfileTimelineItem[] {
  return [
    {
      id: "tl-1",
      title: `${subject} updated`,
      description: "Profile details were reviewed and updated.",
      actor: owner,
      time: "Today, 10:35 AM",
      type: "info",
    },
    {
      id: "tl-2",
      title: "Document verified",
      description: "Identity and supporting documents passed compliance checks.",
      actor: "Compliance Desk",
      time: "Yesterday, 4:20 PM",
      type: "success",
    },
    {
      id: "tl-3",
      title: "Follow-up scheduled",
      description: "Next review reminder was added to the activity queue.",
      actor: "Visa Matrix Automation",
      time: "2 days ago",
      type: "warning",
    },
  ];
}

function auditLog(subject: string): ProfileTimelineItem[] {
  return [
    {
      id: "audit-1",
      title: "Permission check passed",
      description: `Read access granted for ${subject}.`,
      actor: "RBAC Engine",
      time: "Just now",
      type: "success",
    },
    {
      id: "audit-2",
      title: "Profile viewed",
      description: "User opened the detail profile screen.",
      actor: "Current user",
      time: "Just now",
      type: "info",
    },
  ];
}

function notes(name: string): ProfileNote[] {
  return [
    {
      id: "note-1",
      author: "Priya Sharma",
      body: `${name} needs a structured follow-up after the next document review.`,
      createdAt: "Today, 9:10 AM",
    },
    {
      id: "note-2",
      author: "Rohan Verma",
      body: "Payment, documentation, and communication history are aligned.",
      createdAt: "Yesterday, 3:45 PM",
    },
  ];
}

function makeTable(title: string, rows: Record<string, string>[], columns?: ProfileTable["columns"]): ProfileTable {
  const inferred = rows[0]
    ? Object.keys(rows[0]).map((key) => ({ key, header: key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()) }))
    : columns ?? [];

  return {
    title,
    columns: columns ?? inferred,
    rows,
    emptyTitle: `No ${title.toLowerCase()} yet`,
    emptyDescription: "New records will appear here when activity is available.",
  };
}

function personSections(fields: {
  personal: Record<string, string>;
  contact: Record<string, string>;
  emergency?: Record<string, string>;
  assignment?: Record<string, string>;
}): ProfileSection[] {
  return [
    { title: "Personal Information", fields: Object.entries(fields.personal).map(([label, value]) => ({ label, value })) },
    { title: "Contact Information", fields: Object.entries(fields.contact).map(([label, value]) => ({ label, value })) },
    ...(fields.emergency
      ? [{ title: "Emergency Contact", fields: Object.entries(fields.emergency).map(([label, value]) => ({ label, value })) }]
      : []),
    ...(fields.assignment
      ? [{ title: "Assignment", fields: Object.entries(fields.assignment).map(([label, value]) => ({ label, value })) }]
      : []),
  ];
}

const editFields = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", type: "email" as const, required: true },
  { name: "phone", label: "Phone", required: true },
  { name: "remarks", label: "Internal remarks", type: "textarea" as const },
];

const uploadFields = [
  { name: "documentName", label: "Document name", required: true },
  { name: "documentType", label: "Document type", type: "select" as const, required: true, options: ["Passport", "Financial", "Employment", "Identity", "Receipt", "Contract"] },
  { name: "notes", label: "Notes", type: "textarea" as const },
];

const noteFields = [
  { name: "note", label: "Note", type: "textarea" as const, required: true, placeholder: "Add context for the next team member" },
];

function employeeProfile(employee: Employee): ProfileDetail {
  const attendance = [
    { month: "January", present: "22", late: "1", absent: "0", overtime: "6h" },
    { month: "February", present: "20", late: "0", absent: "1", overtime: "4h" },
    { month: "March", present: "21", late: "2", absent: "0", overtime: "8h" },
  ];
  const payroll = [
    { period: "May 2026", gross: money(employee.salary / 12), deductions: money(4200), net: money(employee.salary / 12 - 4200), status: "Paid" },
    { period: "April 2026", gross: money(employee.salary / 12), deductions: money(4100), net: money(employee.salary / 12 - 4100), status: "Paid" },
  ];
  const leave = [
    { type: "Annual", available: "14", used: "4", pending: "1" },
    { type: "Sick", available: "8", used: "2", pending: "0" },
  ];
  const performance = [
    { cycle: "Q1 2026", rating: "Exceeds Expectations", reviewer: employee.manager, status: "Completed" },
    { cycle: "Q4 2025", rating: "Meets Expectations", reviewer: employee.manager, status: "Completed" },
  ];

  const sections = personSections({
    personal: {
      "Employee ID": employee.empId,
      "Full Name": employee.name,
      "Joining Date": employee.joinDate,
      "Employment Status": employee.status,
    },
    contact: {
      Email: employee.email,
      Phone: employee.phone,
      Address: "Visa Matrix Tower, MG Road, Bengaluru",
    },
    emergency: {
      Name: "Asha Sharma",
      Relationship: "Spouse",
      Phone: "+91 98765 43210",
    },
    assignment: {
      Department: employee.department,
      Designation: employee.role,
      Manager: employee.manager,
      "Salary Information": money(employee.salary),
    },
  });

  return {
    id: employee.id,
    entity: "employee",
    title: employee.name,
    subtitle: `${employee.role} in ${employee.department}`,
    eyebrow: employee.empId,
    avatar: employee.avatar,
    initials: initials(employee.name),
    badges: [
      { label: "Status", value: employee.status },
      { label: "Department", value: employee.department },
    ],
    metrics: [
      { label: "Attendance", value: "96%", description: "Current month" },
      { label: "Leave Balance", value: "22 days", description: "Annual and sick leave" },
      { label: "Payroll", value: money(employee.salary / 12), description: "Monthly gross" },
      { label: "Reviews", value: "2", description: "Completed cycles" },
    ],
    actions: [
      { key: "edit", label: "Edit Employee", icon: Pencil, kind: "drawer", module: "hr", permission: "edit", fields: editFields },
      { key: "upload", label: "Upload Document", icon: FilePlus2, kind: "drawer", module: "documents", permission: "create", fields: uploadFields, variant: "outline" },
      { key: "approve_leave", label: "Approve Leave", icon: CheckCircle2, kind: "confirm", module: "hr", permission: "approve", confirmLabel: "Approve" },
      { key: "payslip", label: "Generate Payslip", icon: Receipt, kind: "success", module: "finance", permission: "create", variant: "outline" },
      { key: "download", label: "Download Profile", icon: Download, kind: "download", module: "hr", permission: "view", variant: "outline" },
    ],
    tabs: [
      { value: "overview", label: "Overview", sections },
      { value: "attendance", label: "Attendance", metrics: [{ label: "Present", value: "63 days" }, { label: "Late", value: "3" }, { label: "Absent", value: "1" }], tables: [makeTable("Attendance Summary", attendance)] },
      { value: "payroll", label: "Payroll", tables: [makeTable("Payroll History", payroll)] },
      { value: "leave", label: "Leave", tables: [makeTable("Leave Summary", leave)] },
      { value: "documents", label: "Documents", tables: [makeTable("Uploaded Documents", documents.slice(0, 4).map((doc) => ({ name: doc.name, type: doc.type, status: doc.status, uploaded: doc.uploaded })))] },
      { value: "performance", label: "Performance", tables: [makeTable("Performance Reviews", performance)] },
      { value: "activity", label: "Activity Log", timeline: timeline(employee.name, employee.manager) },
    ],
    auditLog: auditLog(employee.name),
  };
}

function customerProfile(lead: Lead): ProfileDetail {
  const appRows = applications.slice(0, 3).map((app, index) => ({
    application: app.appId,
    country: index === 0 ? lead.country : app.country,
    visaType: app.visaType,
    status: app.status,
    amount: money(app.amount),
  }));
  const paymentRows = invoices.slice(0, 3).map((invoice) => ({
    invoice: invoice.invoiceNo,
    amount: money(invoice.amount),
    status: invoice.status,
    due: invoice.due,
  }));

  return {
    id: lead.id,
    entity: "customer",
    title: lead.name,
    subtitle: `${lead.country} visa customer managed by ${lead.owner}`,
    eyebrow: `Customer ${lead.id.toUpperCase()}`,
    initials: initials(lead.name),
    badges: [
      { label: "Application", value: "Under Review" },
      { label: "Payment", value: "Paid" },
    ],
    metrics: [
      { label: "Lifetime Value", value: money(lead.value) },
      { label: "Applications", value: String(appRows.length) },
      { label: "Documents", value: "8" },
      { label: "Consultant", value: lead.owner },
    ],
    actions: [
      { key: "edit", label: "Edit Customer", icon: Pencil, kind: "drawer", module: "crm", permission: "edit", fields: editFields },
      { key: "application", label: "Add Application", icon: FilePlus2, kind: "drawer", module: "visa", permission: "create", fields: [{ name: "country", label: "Country", required: true, defaultValue: lead.country }, { name: "visaType", label: "Visa Type", required: true }] },
      { key: "upload", label: "Upload Document", icon: FilePlus2, kind: "drawer", module: "documents", permission: "create", fields: uploadFields, variant: "outline" },
      { key: "note", label: "Add Note", icon: Pencil, kind: "drawer", module: "crm", permission: "edit", fields: noteFields, variant: "outline" },
      { key: "email", label: "Send Email", icon: Mail, kind: "drawer", module: "communication", permission: "create", fields: [{ name: "subject", label: "Subject", required: true }, { name: "message", label: "Message", type: "textarea", required: true }], variant: "outline" },
      { key: "assign", label: "Assign Consultant", icon: UserCog, kind: "drawer", module: "crm", permission: "edit", fields: [{ name: "consultant", label: "Consultant", type: "select", required: true, options: employees.slice(0, 6).map((employee) => employee.name), defaultValue: lead.owner }], variant: "outline" },
    ],
    tabs: [
      {
        value: "overview",
        label: "Overview",
        sections: personSections({
          personal: {
            "Customer Name": lead.name,
            "Passport Number": `P${lead.id.slice(2).padStart(7, "0")}`,
            "Country Preference": lead.country,
            "Visa Type": "Tourist Visa",
          },
          contact: { Email: lead.email, Phone: lead.phone, "Preferred Channel": "Email" },
          assignment: {
            "Application Status": "Under Review",
            "Payment Status": "Paid",
            "Assigned Consultant": lead.owner,
          },
        }),
      },
      { value: "applications", label: "Applications", tables: [makeTable("Visa Applications", appRows)] },
      { value: "documents", label: "Documents", tables: [makeTable("Documents", documents.slice(0, 5).map((doc) => ({ name: doc.name, type: doc.type, status: doc.status, uploaded: doc.uploaded })))] },
      { value: "payments", label: "Payments", tables: [makeTable("Payments", paymentRows)] },
      { value: "notes", label: "Notes", notes: notes(lead.name) },
      { value: "timeline", label: "Timeline", timeline: timeline(lead.name, lead.owner) },
    ],
    auditLog: auditLog(lead.name),
  };
}

function leadProfile(lead: Lead): ProfileDetail {
  const followUps = [
    { date: dateFromSeed(1), type: "Call", owner: lead.owner, status: "Pending" },
    { date: dateFromSeed(2), type: "Email", owner: lead.owner, status: "Completed" },
  ];
  const activities = [
    { event: "Lead captured", source: lead.source, actor: "CRM Automation", time: lead.created },
    { event: "Qualification call", source: "Phone", actor: lead.owner, time: dateFromSeed(4) },
  ];

  return {
    id: lead.id,
    entity: "lead",
    title: lead.name,
    subtitle: `${lead.source} lead interested in ${lead.country}`,
    eyebrow: `Lead ${lead.id.toUpperCase()}`,
    initials: initials(lead.name),
    badges: [
      { label: "Stage", value: lead.stage },
      { label: "Score", value: lead.stage === "Qualified" ? "86" : "72" },
    ],
    metrics: [
      { label: "Lead Score", value: lead.stage === "Qualified" ? "86" : "72" },
      { label: "Potential Value", value: money(lead.value) },
      { label: "Follow-ups", value: "2" },
      { label: "Assigned Agent", value: lead.owner },
    ],
    actions: [
      { key: "convert", label: "Convert To Customer", icon: UserCheck, kind: "confirm", module: "crm", permission: "edit", confirmLabel: "Convert" },
      { key: "followup", label: "Schedule Follow-Up", icon: CalendarClock, kind: "drawer", module: "crm", permission: "edit", fields: [{ name: "date", label: "Follow-up date", type: "date", required: true }, { name: "type", label: "Type", type: "select", required: true, options: ["Call", "Email", "Meeting", "WhatsApp"] }] },
      { key: "note", label: "Add Note", icon: Pencil, kind: "drawer", module: "crm", permission: "edit", fields: noteFields, variant: "outline" },
      { key: "reassign", label: "Reassign Agent", icon: UserCog, kind: "drawer", module: "crm", permission: "edit", fields: [{ name: "agent", label: "Agent", type: "select", required: true, options: employees.slice(0, 6).map((employee) => employee.name), defaultValue: lead.owner }], variant: "outline" },
      { key: "lost", label: "Mark Lost", icon: UserX, kind: "confirm", module: "crm", permission: "edit", variant: "destructive", destructive: true, confirmLabel: "Mark lost" },
      { key: "won", label: "Mark Won", icon: BadgeCheck, kind: "confirm", module: "crm", permission: "edit", confirmLabel: "Mark won", variant: "outline" },
    ],
    tabs: [
      {
        value: "overview",
        label: "Overview",
        sections: personSections({
          personal: {
            Source: lead.source,
            "Lead Score": lead.stage === "Qualified" ? "86" : "72",
            "Interested Country": lead.country,
            "Interested Visa Type": "Business Visa",
          },
          contact: { Email: lead.email, Phone: lead.phone },
          assignment: {
            "Assigned Agent": lead.owner,
            "Follow-Up Schedule": dateFromSeed(1),
            "Conversion Status": lead.stage,
          },
        }),
      },
      { value: "followups", label: "Follow Ups", tables: [makeTable("Follow-Up Schedule", followUps)] },
      { value: "activities", label: "Activities", tables: [makeTable("Activities", activities)] },
      { value: "notes", label: "Notes", notes: notes(lead.name) },
      { value: "timeline", label: "Timeline", timeline: timeline(lead.name, lead.owner) },
    ],
    auditLog: auditLog(lead.name),
  };
}

function invoiceProfile(invoice: Invoice): ProfileDetail {
  const serviceRows = [
    { service: "Visa consultation", quantity: "1", rate: money(invoice.amount * 0.45), tax: "18%", total: money(invoice.amount * 0.45 * 1.18) },
    { service: "Document processing", quantity: "1", rate: money(invoice.amount * 0.35), tax: "18%", total: money(invoice.amount * 0.35 * 1.18) },
    { service: "Embassy appointment support", quantity: "1", rate: money(invoice.amount * 0.2), tax: "18%", total: money(invoice.amount * 0.2 * 1.18) },
  ];
  const paymentRows = invoice.status === "Pending" || invoice.status === "Overdue"
    ? []
    : [{ date: invoice.issued, method: "Bank Transfer", reference: `TXN-${invoice.id.slice(2).padStart(6, "0")}`, amount: money(invoice.amount), status: invoice.status }];

  return {
    id: invoice.id,
    entity: "invoice",
    title: invoice.invoiceNo,
    subtitle: `Invoice for ${invoice.customer}`,
    eyebrow: "Invoice Detail",
    initials: "IN",
    badges: [
      { label: "Status", value: invoice.status },
      { label: "Due", value: invoice.due },
    ],
    metrics: [
      { label: "Amount", value: money(invoice.amount) },
      { label: "Tax", value: money(invoice.amount * 0.18) },
      { label: "Discount", value: money(invoice.amount * 0.05) },
      { label: "Balance", value: invoice.status === "Paid" ? money(0) : money(invoice.amount) },
    ],
    actions: [
      { key: "edit", label: "Edit Invoice", icon: Pencil, kind: "drawer", module: "finance", permission: "edit", fields: [{ name: "dueDate", label: "Due date", type: "date", required: true, defaultValue: invoice.due }, { name: "notes", label: "Invoice notes", type: "textarea" }] },
      { key: "download", label: "Download PDF", icon: Download, kind: "download", module: "finance", permission: "view", variant: "outline" },
      { key: "send", label: "Send Invoice", icon: Send, kind: "drawer", module: "communication", permission: "create", fields: [{ name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }], variant: "outline" },
      { key: "paid", label: "Mark Paid", icon: CheckCircle2, kind: "confirm", module: "finance", permission: "edit", confirmLabel: "Mark paid" },
      { key: "cancel", label: "Cancel Invoice", icon: UserX, kind: "confirm", module: "finance", permission: "edit", destructive: true, variant: "destructive", confirmLabel: "Cancel invoice" },
      { key: "print", label: "Print Invoice", icon: Printer, kind: "success", module: "finance", permission: "view", variant: "outline" },
    ],
    tabs: [
      {
        value: "overview",
        label: "Overview",
        sections: [
          {
            title: "Invoice Summary",
            fields: [
              { label: "Customer Information", value: invoice.customer },
              { label: "Invoice Number", value: invoice.invoiceNo },
              { label: "Invoice Date", value: invoice.issued },
              { label: "Due Date", value: invoice.due },
              { label: "Invoice Status", value: invoice.status },
            ],
          },
          {
            title: "Tax and Discount Information",
            fields: [
              { label: "Tax Information", value: "GST 18%" },
              { label: "Discount Information", value: "5% loyalty discount" },
              { label: "Services", value: "Consultation, documentation, embassy support" },
            ],
          },
        ],
      },
      { value: "items", label: "Items", tables: [makeTable("Services", serviceRows)] },
      { value: "payments", label: "Payments", tables: [makeTable("Payment History", paymentRows, [{ key: "date", header: "Date" }, { key: "method", header: "Method" }, { key: "reference", header: "Reference" }, { key: "amount", header: "Amount" }, { key: "status", header: "Status" }])] },
      { value: "activity", label: "Activity Log", timeline: timeline(invoice.invoiceNo, "Finance Team") },
    ],
    auditLog: auditLog(invoice.invoiceNo),
  };
}

function paymentProfile(invoice: Invoice): ProfileDetail {
  const paymentId = `PAY-${invoice.id.slice(2).padStart(5, "0")}`;
  const receiptRows = invoice.status === "Pending"
    ? []
    : [{ receipt: `RCT-${invoice.id.slice(2).padStart(5, "0")}`, issued: invoice.issued, amount: money(invoice.amount), status: "Generated" }];

  return {
    id: invoice.id,
    entity: "payment",
    title: paymentId,
    subtitle: `Payment for ${invoice.customer}`,
    eyebrow: "Payment Detail",
    initials: "PY",
    badges: [
      { label: "Status", value: invoice.status === "Overdue" ? "Pending" : invoice.status },
      { label: "Method", value: "Bank Transfer" },
    ],
    metrics: [
      { label: "Amount", value: money(invoice.amount) },
      { label: "Currency", value: "INR" },
      { label: "Invoice", value: invoice.invoiceNo },
      { label: "Reference", value: `TXN-${invoice.id.slice(2).padStart(6, "0")}` },
    ],
    actions: [
      { key: "verify", label: "Verify Payment", icon: ShieldCheck, kind: "confirm", module: "finance", permission: "edit", confirmLabel: "Verify" },
      { key: "receipt", label: "Generate Receipt", icon: Receipt, kind: "success", module: "finance", permission: "create", variant: "outline" },
      { key: "download", label: "Download Receipt", icon: Download, kind: "download", module: "finance", permission: "view", variant: "outline" },
      { key: "refund", label: "Refund Payment", icon: RefreshCcw, kind: "confirm", module: "finance", permission: "edit", destructive: true, variant: "destructive", confirmLabel: "Refund" },
      { key: "link", label: "Link Invoice", icon: FilePlus2, kind: "drawer", module: "finance", permission: "edit", fields: [{ name: "invoice", label: "Invoice number", required: true, defaultValue: invoice.invoiceNo }], variant: "outline" },
      { key: "send", label: "Send Confirmation", icon: Send, kind: "drawer", module: "communication", permission: "create", fields: [{ name: "email", label: "Email", type: "email", required: true }, { name: "message", label: "Message", type: "textarea", required: true }], variant: "outline" },
    ],
    tabs: [
      {
        value: "overview",
        label: "Overview",
        sections: [
          {
            title: "Payment Summary",
            fields: [
              { label: "Customer Information", value: invoice.customer },
              { label: "Payment Method", value: "Bank Transfer" },
              { label: "Payment Reference", value: `REF-${invoice.id.slice(2).padStart(6, "0")}` },
              { label: "Transaction ID", value: `TXN-${invoice.id.slice(2).padStart(6, "0")}` },
              { label: "Amount", value: money(invoice.amount) },
              { label: "Currency", value: "INR" },
              { label: "Payment Status", value: invoice.status === "Overdue" ? "Pending" : invoice.status },
            ],
          },
          {
            title: "Invoice and Receipt Information",
            fields: [
              { label: "Invoice Mapping", value: invoice.invoiceNo },
              { label: "Receipt Information", value: receiptRows[0]?.receipt ?? "Receipt pending" },
            ],
          },
        ],
      },
      { value: "invoices", label: "Invoices", tables: [makeTable("Invoice Mapping", [{ invoice: invoice.invoiceNo, customer: invoice.customer, amount: money(invoice.amount), status: invoice.status }])] },
      { value: "receipts", label: "Receipts", tables: [makeTable("Receipts", receiptRows, [{ key: "receipt", header: "Receipt" }, { key: "issued", header: "Issued" }, { key: "amount", header: "Amount" }, { key: "status", header: "Status" }])] },
      { value: "activity", label: "Activity Log", timeline: timeline(paymentId, "Finance Team") },
    ],
    auditLog: auditLog(paymentId),
  };
}

export interface ProfileDetailService {
  getProfile(entity: ProfileEntityType, id: string): Promise<ProfileDetail | null>;
}

export const profileDetailService: ProfileDetailService = {
  async getProfile(entity, id) {
    await wait();

    if (id === "error") {
      throw new Error("Unable to load the requested profile.");
    }

    if (entity === "employee") {
      const employee = employees.find((item) => item.id === id) ?? employees[0];
      return employee ? employeeProfile(employee) : null;
    }

    if (entity === "customer") {
      const customer = leads.find((item) => item.id === id && item.stage === "Won") ?? leads.find((item) => item.stage === "Won") ?? leads[0];
      return customer ? customerProfile(customer) : null;
    }

    if (entity === "lead") {
      const lead = leads.find((item) => item.id === id) ?? leads[0];
      return lead ? leadProfile(lead) : null;
    }

    if (entity === "invoice") {
      const invoice = invoices.find((item) => item.id === id) ?? invoices[0];
      return invoice ? invoiceProfile(invoice) : null;
    }

    const normalizedPaymentId = id.startsWith("p_") ? `i_${id.slice(2)}` : id;
    const invoice = invoices.find((item) => item.id === normalizedPaymentId) ?? invoices[0];
    return invoice ? paymentProfile(invoice) : null;
  },
};
