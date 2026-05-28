export const STATUSES = ["Draft", "Submitted", "Under Review", "Approved", "Rejected", "On Hold"] as const;
export type AppStatus = (typeof STATUSES)[number];

export const countries = [
  { code: "US", name: "United States", flag: "🇺🇸", processing: "15-30 days", embassy: "Washington" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", processing: "10-21 days", embassy: "London" },
  { code: "CA", name: "Canada", flag: "🇨🇦", processing: "20-45 days", embassy: "Ottawa" },
  { code: "AU", name: "Australia", flag: "🇦🇺", processing: "25-60 days", embassy: "Canberra" },
  { code: "DE", name: "Germany", flag: "🇩🇪", processing: "10-15 days", embassy: "Berlin" },
  { code: "FR", name: "France", flag: "🇫🇷", processing: "10-20 days", embassy: "Paris" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", processing: "3-7 days", embassy: "Singapore" },
  { code: "AE", name: "UAE", flag: "🇦🇪", processing: "4-8 days", embassy: "Abu Dhabi" },
  { code: "JP", name: "Japan", flag: "🇯🇵", processing: "7-14 days", embassy: "Tokyo" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", processing: "20-30 days", embassy: "Wellington" },
];

export const visaCategories = [
  { code: "TOURIST", name: "Tourist Visa", duration: "30-90 days" },
  { code: "BUSINESS", name: "Business Visa", duration: "30-180 days" },
  { code: "STUDENT", name: "Student Visa", duration: "1-4 years" },
  { code: "WORK", name: "Work Permit", duration: "1-3 years" },
  { code: "PR", name: "Permanent Residency", duration: "Permanent" },
  { code: "TRANSIT", name: "Transit Visa", duration: "1-3 days" },
];

const firstNames = ["Aarav","Priya","Rohan","Sneha","Vikram","Ananya","Arjun","Ishita","Kabir","Meera","Liam","Olivia","Noah","Emma","Ethan","Sophia","Lucas","Mia","Mason","Amelia"];
const lastNames = ["Sharma","Patel","Khan","Singh","Verma","Kumar","Reddy","Mehta","Smith","Johnson","Brown","Davis","Wilson","Miller","Moore","Taylor","Anderson","Thomas"];
const departments = ["Operations","Sales","Documentation","Compliance","Finance","HR","Customer Success","IT"];
const roles = ["Visa Officer","Senior Consultant","Documentation Specialist","Team Lead","Manager","Director","Analyst"];

function rand<T>(a: T[]) { return a[Math.floor(Math.random()*a.length)]; }
function seedRand(seed: number) { return () => { seed = (seed*9301+49297)%233280; return seed/233280; }; }

export interface Employee {
  id: string; empId: string; name: string; email: string; phone: string;
  department: string; role: string; manager: string; status: "Active"|"On Leave"|"Inactive";
  joinDate: string; salary: number; avatar: string;
}
export const employees: Employee[] = Array.from({length: 32}).map((_,i) => {
  const r = seedRand(i+1);
  const fn = firstNames[Math.floor(r()*firstNames.length)];
  const ln = lastNames[Math.floor(r()*lastNames.length)];
  return {
    id: `e_${i+1}`,
    empId: `EMP-${(1000+i).toString()}`,
    name: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@visamatrix.io`,
    phone: `+91 ${Math.floor(r()*9000000000)+1000000000}`,
    department: departments[Math.floor(r()*departments.length)],
    role: roles[Math.floor(r()*roles.length)],
    manager: `${firstNames[Math.floor(r()*firstNames.length)]} ${lastNames[Math.floor(r()*lastNames.length)]}`,
    status: (["Active","Active","Active","On Leave","Inactive"] as const)[Math.floor(r()*5)],
    joinDate: `202${Math.floor(r()*5)}-0${Math.floor(r()*8)+1}-${(Math.floor(r()*27)+1).toString().padStart(2,"0")}`,
    salary: Math.round((40000+r()*120000)/100)*100,
    avatar: `https://i.pravatar.cc/80?img=${(i%70)+1}`,
  };
});

export interface Application {
  id: string; appId: string; applicant: string; email: string;
  country: string; flag: string; visaType: string;
  status: AppStatus; priority: "Low"|"Medium"|"High"|"Urgent";
  assignee: string; submitted: string; amount: number; progress: number;
}
export const applications: Application[] = Array.from({length: 48}).map((_,i) => {
  const r = seedRand(i+100);
  const country = countries[Math.floor(r()*countries.length)];
  const cat = visaCategories[Math.floor(r()*visaCategories.length)];
  return {
    id: `a_${i+1}`,
    appId: `VM-${(20240+i).toString()}`,
    applicant: `${firstNames[Math.floor(r()*firstNames.length)]} ${lastNames[Math.floor(r()*lastNames.length)]}`,
    email: `applicant${i+1}@email.com`,
    country: country.name, flag: country.flag,
    visaType: cat.name,
    status: STATUSES[Math.floor(r()*STATUSES.length)],
    priority: (["Low","Medium","High","Urgent"] as const)[Math.floor(r()*4)],
    assignee: employees[Math.floor(r()*employees.length)].name,
    submitted: `2025-${(Math.floor(r()*11)+1).toString().padStart(2,"0")}-${(Math.floor(r()*27)+1).toString().padStart(2,"0")}`,
    amount: Math.round((200+r()*4000)/10)*10,
    progress: Math.floor(r()*100),
  };
});

export interface Lead {
  id: string; name: string; email: string; phone: string; source: string;
  stage: "New"|"Contacted"|"Qualified"|"Proposal"|"Won"|"Lost";
  owner: string; value: number; country: string; created: string;
}
export const leads: Lead[] = Array.from({length: 36}).map((_,i) => {
  const r = seedRand(i+200);
  return {
    id: `l_${i+1}`,
    name: `${firstNames[Math.floor(r()*firstNames.length)]} ${lastNames[Math.floor(r()*lastNames.length)]}`,
    email: `lead${i+1}@gmail.com`,
    phone: `+91 9${Math.floor(r()*900000000)+100000000}`,
    source: rand(["Website","Referral","LinkedIn","Google Ads","Walk-in","Partner"]),
    stage: (["New","Contacted","Qualified","Proposal","Won","Lost"] as const)[Math.floor(r()*6)],
    owner: employees[Math.floor(r()*employees.length)].name,
    value: Math.round((500+r()*15000)/100)*100,
    country: countries[Math.floor(r()*countries.length)].name,
    created: `2025-${(Math.floor(r()*11)+1).toString().padStart(2,"0")}-${(Math.floor(r()*27)+1).toString().padStart(2,"0")}`,
  };
});

export interface Invoice {
  id: string; invoiceNo: string; customer: string; amount: number;
  status: "Paid"|"Pending"|"Overdue"|"Refunded"; issued: string; due: string;
}
export const invoices: Invoice[] = Array.from({length: 24}).map((_,i) => {
  const r = seedRand(i+300);
  return {
    id: `i_${i+1}`,
    invoiceNo: `INV-${(8400+i).toString()}`,
    customer: `${firstNames[Math.floor(r()*firstNames.length)]} ${lastNames[Math.floor(r()*lastNames.length)]}`,
    amount: Math.round((300+r()*6000)/10)*10,
    status: (["Paid","Paid","Pending","Overdue","Refunded"] as const)[Math.floor(r()*5)],
    issued: `2025-${(Math.floor(r()*11)+1).toString().padStart(2,"0")}-${(Math.floor(r()*27)+1).toString().padStart(2,"0")}`,
    due: `2025-${(Math.floor(r()*11)+1).toString().padStart(2,"0")}-${(Math.floor(r()*27)+1).toString().padStart(2,"0")}`,
  };
});

export const monthlyRevenue = [
  { month: "Jan", revenue: 42000, applications: 38 },
  { month: "Feb", revenue: 51000, applications: 44 },
  { month: "Mar", revenue: 48000, applications: 41 },
  { month: "Apr", revenue: 63000, applications: 52 },
  { month: "May", revenue: 72000, applications: 58 },
  { month: "Jun", revenue: 68000, applications: 55 },
  { month: "Jul", revenue: 81000, applications: 64 },
  { month: "Aug", revenue: 88000, applications: 71 },
  { month: "Sep", revenue: 92000, applications: 76 },
  { month: "Oct", revenue: 105000, applications: 83 },
  { month: "Nov", revenue: 112000, applications: 89 },
  { month: "Dec", revenue: 124000, applications: 96 },
];

export const statusDistribution = [
  { name: "Approved", value: 124, color: "var(--success)" },
  { name: "Under Review", value: 86, color: "var(--info)" },
  { name: "Submitted", value: 64, color: "var(--chart-1)" },
  { name: "Rejected", value: 18, color: "var(--destructive)" },
  { name: "On Hold", value: 22, color: "var(--warning)" },
];

export const countryStats = countries.slice(0,6).map((c,i) => ({
  country: c.name, flag: c.flag, count: 80 - i*9 + Math.floor(Math.random()*8),
}));

export const activities = [
  { id: 1, who: "Priya Sharma", action: "approved visa application", target: "VM-20247", time: "2 min ago", type: "success" },
  { id: 2, who: "Rohan Verma", action: "uploaded documents for", target: "VM-20246", time: "12 min ago", type: "info" },
  { id: 3, who: "Ananya Patel", action: "created new lead", target: "Acme Corp", time: "1 hr ago", type: "info" },
  { id: 4, who: "System", action: "flagged overdue invoice", target: "INV-8412", time: "2 hr ago", type: "warning" },
  { id: 5, who: "Vikram Singh", action: "rejected application", target: "VM-20231", time: "3 hr ago", type: "danger" },
  { id: 6, who: "Meera Kumar", action: "added new employee", target: "EMP-1031", time: "5 hr ago", type: "info" },
  { id: 7, who: "Finance Bot", action: "processed payment for", target: "INV-8408", time: "Yesterday", type: "success" },
];

export const notifications = [
  { id: 1, title: "New visa application", desc: "VM-20248 awaiting review", time: "5m", unread: true, type: "info" },
  { id: 2, title: "Document expiring", desc: "Passport for Arjun Mehta expires in 14 days", time: "1h", unread: true, type: "warning" },
  { id: 3, title: "Payment received", desc: "INV-8421 marked as paid", time: "3h", unread: true, type: "success" },
  { id: 4, title: "Leave request", desc: "Sneha Singh requested 3 days leave", time: "5h", unread: false, type: "info" },
  { id: 5, title: "Application rejected", desc: "VM-20218 was rejected by embassy", time: "1d", unread: false, type: "danger" },
];

export const tasks = [
  { id: "t1", title: "Verify passport for VM-20247", assignee: "Priya Sharma", priority: "High", due: "Today", status: "todo" },
  { id: "t2", title: "Schedule embassy appointment", assignee: "Rohan Verma", priority: "Urgent", due: "Today", status: "todo" },
  { id: "t3", title: "Collect financial documents", assignee: "Ananya Patel", priority: "Medium", due: "Tomorrow", status: "in_progress" },
  { id: "t4", title: "Translate birth certificate", assignee: "Vikram Singh", priority: "Low", due: "Fri", status: "in_progress" },
  { id: "t5", title: "Submit application to consulate", assignee: "Meera Kumar", priority: "High", due: "Mon", status: "review" },
  { id: "t6", title: "Final review VM-20231", assignee: "Arjun Mehta", priority: "Medium", due: "Done", status: "done" },
  { id: "t7", title: "Send approval letter", assignee: "Sneha Singh", priority: "Low", due: "Done", status: "done" },
];

export const documents = [
  { id: "d1", name: "Passport_AaravSharma.pdf", type: "Passport", size: "1.2 MB", uploaded: "2025-09-12", status: "Verified", owner: "Aarav Sharma" },
  { id: "d2", name: "BankStatement_Q3.pdf", type: "Financial", size: "3.4 MB", uploaded: "2025-09-15", status: "Pending", owner: "Priya Patel" },
  { id: "d3", name: "OfferLetter.pdf", type: "Employment", size: "420 KB", uploaded: "2025-09-18", status: "Verified", owner: "Rohan Khan" },
  { id: "d4", name: "BirthCert.jpg", type: "Personal", size: "890 KB", uploaded: "2025-09-20", status: "Rejected", owner: "Ananya Verma" },
  { id: "d5", name: "MarriageCert.pdf", type: "Personal", size: "1.1 MB", uploaded: "2025-09-22", status: "Verified", owner: "Vikram Kumar" },
  { id: "d6", name: "EducationTranscript.pdf", type: "Education", size: "2.0 MB", uploaded: "2025-09-25", status: "Pending", owner: "Ishita Reddy" },
];