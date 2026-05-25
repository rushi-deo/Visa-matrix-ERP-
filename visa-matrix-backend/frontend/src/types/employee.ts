export type EmploymentStatus =
  | "pending"
  | "active"
  | "suspended"
  | "inactive"
  | "deleted";

export type EmployeeRef = {
  id: string;
  name: string;
};

export type ReportingManager = {
  id: string;
  fullName: string;
  designation?: string | null;
  employeeId?: string | null;
  roleName?: string | null;
  label: string;
};

export type Employee = {
  id: string;
  employeeId: string | null;
  email: string;
  fullName: string;
  phone: string | null;
  profilePhoto: string | null;
  designation: string | null;
  joiningDate: string | null;
  employmentStatus: EmploymentStatus;
  isLocked: boolean;
  lastLoginAt: string | null;
  createdAt?: string;
  organizationId?: string;
  role: EmployeeRef | null;
  department: EmployeeRef | null;
  branch: (EmployeeRef & { code?: string | null }) | null;
  reportingTo: ReportingManager | null;
  metadata?: Record<string, unknown>;
};

export type EmployeeFormOptions = {
  departments: Array<{ id: string; name: string }>;
  roles: Array<{ id: string; name: string }>;
  branches: Array<{ id: string; name: string; code?: string | null }>;
  managers: Array<{
    id: string;
    fullName: string;
    designation?: string | null;
    employeeId?: string | null;
    roleName?: string | null;
    label: string;
  }>;
};

export type HrDashboardSummary = {
  totalEmployees: number;
  activeEmployees: number;
  newHires30d: number;
  withReportingManager: number;
  pendingReviews: number;
};

export type EmployeePayload = {
  email?: string;
  fullName?: string;
  phone?: string | null;
  departmentId?: string | null;
  roleId?: string | null;
  branchId?: string | null;
  reportingManagerId?: string | null;
  designation?: string | null;
  joiningDate?: string | null;
  employeeCode?: string | null;
  profilePhoto?: string | null;
  status?: EmploymentStatus;
};
