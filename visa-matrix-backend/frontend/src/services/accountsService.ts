import { formatCurrency } from "../utils/formatters";

export type FinanceStatus = "Paid" | "Pending" | "Failed" | "Refunded";
export type PaymentMode = "UPI" | "Bank Transfer" | "Cash" | "Card";
export type InvoiceStatus = "Paid" | "Pending" | "Overdue";
export type ExpenseCategory =
  | "Office"
  | "Salaries"
  | "Marketing"
  | "Travel"
  | "Vendor";

export type AccountsTransaction = {
  id: string;
  customer: string;
  applicationId: string;
  paymentType: PaymentMode;
  amount: number;
  status: FinanceStatus;
  date: string;
  note: string;
};

export type AccountsInvoice = {
  invoiceNumber: string;
  customer: string;
  visaType: string;
  amount: number;
  dueDate: string;
  paymentStatus: InvoiceStatus;
  gst: number;
  applicationId: string;
};

export type AccountsExpense = {
  id: string;
  category: ExpenseCategory;
  vendor: string;
  amount: number;
  notes: string;
  date: string;
  status: "Approved" | "Pending";
};

export const accountsSummary = {
  totalRevenue: 1584600,
  pendingPayments: 184250,
  monthlyCollection: 428750,
  refundRequests: 14750,
};

export const revenueTrendData = [
  { month: "Jan", revenue: 310000, expenses: 155000 },
  { month: "Feb", revenue: 342000, expenses: 168000 },
  { month: "Mar", revenue: 368000, expenses: 176000 },
  { month: "Apr", revenue: 392000, expenses: 184000 },
  { month: "May", revenue: 420000, expenses: 190000 },
  { month: "Jun", revenue: 452000, expenses: 201000 },
];

export const countryRevenueData = [
  { country: "UAE", revenue: 420000 },
  { country: "Canada", revenue: 286000 },
  { country: "UK", revenue: 243000 },
  { country: "Australia", revenue: 198000 },
  { country: "Schengen", revenue: 164000 },
];

export const applicationRevenueData = [
  { name: "Student Visa", revenue: 352000 },
  { name: "Tourist Visa", revenue: 298000 },
  { name: "Work Visa", revenue: 312000 },
  { name: "Business Visa", revenue: 239000 },
];

export const expenseVsIncomeData = [
  { month: "Jan", income: 310000, expenses: 155000 },
  { month: "Feb", income: 342000, expenses: 168000 },
  { month: "Mar", income: 368000, expenses: 176000 },
  { month: "Apr", income: 392000, expenses: 184000 },
  { month: "May", income: 420000, expenses: 190000 },
  { month: "Jun", income: 452000, expenses: 201000 },
];

export const mockAccountsTransactions: AccountsTransaction[] = [
  {
    id: "TXN-2026-001",
    customer: "Aarav Menon",
    applicationId: "APP-2048",
    paymentType: "UPI",
    amount: 95000,
    status: "Paid",
    date: "2026-05-20",
    note: "Student visa processing advance",
  },
  {
    id: "TXN-2026-002",
    customer: "Priya Shah",
    applicationId: "APP-2051",
    paymentType: "Card",
    amount: 128000,
    status: "Pending",
    date: "2026-05-18",
    note: "Tourist visa filing fee",
  },
  {
    id: "TXN-2026-003",
    customer: "Mikhail Novak",
    applicationId: "APP-2056",
    paymentType: "Bank Transfer",
    amount: 86000,
    status: "Paid",
    date: "2026-05-16",
    note: "Business visa service charge",
  },
  {
    id: "TXN-2026-004",
    customer: "Sana Ahmed",
    applicationId: "APP-2060",
    paymentType: "Cash",
    amount: 42000,
    status: "Failed",
    date: "2026-05-12",
    note: "Document verification fee",
  },
  {
    id: "TXN-2026-005",
    customer: "Noor Fernandez",
    applicationId: "APP-2064",
    paymentType: "UPI",
    amount: 73000,
    status: "Refunded",
    date: "2026-05-10",
    note: "Overpayment refund for duplicate submission",
  },
  {
    id: "TXN-2026-006",
    customer: "Daniel Carter",
    applicationId: "APP-2067",
    paymentType: "Card",
    amount: 104000,
    status: "Pending",
    date: "2026-05-09",
    note: "Work visa appointment and courier charges",
  },
];

export const mockAccountsInvoices: AccountsInvoice[] = [
  {
    invoiceNumber: "INV-2026-1101",
    customer: "Aarav Menon",
    visaType: "Student Visa",
    amount: 95000,
    dueDate: "2026-05-25",
    paymentStatus: "Paid",
    gst: 17100,
    applicationId: "APP-2048",
  },
  {
    invoiceNumber: "INV-2026-1102",
    customer: "Priya Shah",
    visaType: "Tourist Visa",
    amount: 128000,
    dueDate: "2026-05-28",
    paymentStatus: "Pending",
    gst: 23040,
    applicationId: "APP-2051",
  },
  {
    invoiceNumber: "INV-2026-1103",
    customer: "Mikhail Novak",
    visaType: "Business Visa",
    amount: 86000,
    dueDate: "2026-05-20",
    paymentStatus: "Paid",
    gst: 15480,
    applicationId: "APP-2056",
  },
  {
    invoiceNumber: "INV-2026-1104",
    customer: "Sana Ahmed",
    visaType: "Documentation",
    amount: 42000,
    dueDate: "2026-05-22",
    paymentStatus: "Overdue",
    gst: 7560,
    applicationId: "APP-2060",
  },
  {
    invoiceNumber: "INV-2026-1105",
    customer: "Noor Fernandez",
    visaType: "Student Visa",
    amount: 73000,
    dueDate: "2026-05-30",
    paymentStatus: "Pending",
    gst: 13140,
    applicationId: "APP-2064",
  },
];

export const mockAccountsExpenses: AccountsExpense[] = [
  {
    id: "EXP-001",
    category: "Office",
    vendor: "BluePeak Leasing",
    amount: 18500,
    notes: "Office rent and maintenance for May",
    date: "2026-05-03",
    status: "Approved",
  },
  {
    id: "EXP-002",
    category: "Salaries",
    vendor: "Payroll Team",
    amount: 220000,
    notes: "Monthly salary disbursal",
    date: "2026-05-05",
    status: "Approved",
  },
  {
    id: "EXP-003",
    category: "Marketing",
    vendor: "AltEdge Studio",
    amount: 42000,
    notes: "Campaign assets for lead generation",
    date: "2026-05-08",
    status: "Pending",
  },
  {
    id: "EXP-004",
    category: "Travel",
    vendor: "AirNova",
    amount: 64000,
    notes: "Client visit to Dubai embassy support",
    date: "2026-05-12",
    status: "Approved",
  },
  {
    id: "EXP-005",
    category: "Vendor",
    vendor: "DocFlow Systems",
    amount: 25000,
    notes: "Document automation subscription",
    date: "2026-05-16",
    status: "Pending",
  },
];

export const accountsTimeline = [
  {
    label: "Funds received",
    time: "09:45 AM",
    detail: "UPI settlement for APP-2048 confirmed",
  },
  {
    label: "Invoice due review",
    time: "11:20 AM",
    detail: "Three invoices flagged for review in finance queue",
  },
  {
    label: "Refund request",
    time: "01:30 PM",
    detail: "APP-2064 refund request validated for approval",
  },
  {
    label: "Collection report synced",
    time: "04:10 PM",
    detail: "Monthly collection summary updated in the ERP",
  },
];

export function getRevenueSnapshot() {
  return accountsSummary;
}

export function getAccountsStatusTone(
  status: FinanceStatus | InvoiceStatus | "Approved" | "Pending",
) {
  if (status === "Paid" || status === "Approved") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Failed") {
    return "bg-rose-100 text-rose-700";
  }

  if (status === "Refunded" || status === "Overdue") {
    return "bg-violet-100 text-violet-700";
  }

  return "bg-slate-100 text-slate-600";
}

export function formatAccountCurrency(amount: number) {
  return formatCurrency(amount, "USD");
}

export function createInvoicePdfContent(invoice: AccountsInvoice) {
  return `Visa Matrix Finance Invoice\n\nInvoice Number: ${invoice.invoiceNumber}\nCustomer: ${invoice.customer}\nApplication: ${invoice.applicationId}\nVisa Type: ${invoice.visaType}\nAmount: ${formatAccountCurrency(invoice.amount)}\nGST: ${formatAccountCurrency(invoice.gst)}\nDue Date: ${invoice.dueDate}\nPayment Status: ${invoice.paymentStatus}`;
}
