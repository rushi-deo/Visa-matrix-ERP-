import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import LoadingState from "./components/common/LoadingState";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { UnauthorizedPage } from "./components/common/ProtectedRouteNew";
import RootRedirect from "./components/common/RootRedirect";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

const AccessLogs = lazy(() => import("./pages/AccessLogs"));
const AccountsDashboard = lazy(
  () => import("./pages/accounts/AccountsDashboard"),
);
const AccountsExpenses = lazy(() => import("./pages/accounts/Expenses"));
const AccountsInvoices = lazy(() => import("./pages/accounts/Invoices"));
const AccountsReports = lazy(() => import("./pages/accounts/Reports"));
const AccountsTransactions = lazy(
  () => import("./pages/accounts/Transactions"),
);
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const ApplicationDetails = lazy(() => import("./pages/ApplicationDetails"));
const ApplicationPipeline = lazy(() => import("./pages/ApplicationPipeline"));
const Applications = lazy(() => import("./pages/Applications"));
const ApiKeys = lazy(() => import("./pages/ApiKeys"));
const AuditLogs = lazy(() => import("./pages/AuditLogs"));
const CaseAssignments = lazy(() => import("./pages/CaseAssignments"));
const Compliance = lazy(() => import("./pages/Compliance"));
const Countries = lazy(() => import("./pages/Countries"));
const CreateApplication = lazy(() => import("./pages/CreateApplication"));
const CustomerProfile = lazy(() => import("./pages/CustomerProfile"));
const Customers = lazy(() => import("./pages/Customers"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DocumentVerification = lazy(() => import("./pages/DocumentVerification"));
const Documents = lazy(() => import("./pages/Documents"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const HR = lazy(() => import("./pages/HR"));
const EmployeeManagement = lazy(() => import("./pages/EmployeeManagement"));
const Inbox = lazy(() => import("./pages/Inbox"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Leads = lazy(() => import("./pages/Leads"));
const LoginPage = lazy(() => import("./pages/LoginPageNew"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Payments = lazy(() => import("./pages/Payments"));
const Register = lazy(() => import("./pages/Register"));
const Reports = lazy(() => import("./pages/Reports"));
const RoleManagement = lazy(() => import("./pages/RoleManagement"));
const Settings = lazy(() => import("./pages/Settings"));
const SystemLogs = lazy(() => import("./pages/SystemLogs"));
const Tasks = lazy(() => import("./pages/Tasks"));
const Transactions = lazy(() => import("./pages/Transactions"));
const UploadDocuments = lazy(() => import("./pages/UploadDocuments"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const VisaRequirements = lazy(() => import("./pages/VisaRequirements"));
const VisaTypes = lazy(() => import("./pages/VisaTypes"));
const WorkflowBuilder = lazy(() => import("./pages/WorkflowBuilder"));

function App() {
  return (
    <Suspense
      fallback={<LoadingState label="Loading Visa Matrix workspace..." />}
    >
      <Routes>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/login" element={<LoginPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route
              path="/applications/create"
              element={<CreateApplication />}
            />
            <Route
              path="/applications/:referenceNo"
              element={<ApplicationDetails />}
            />
            <Route
              element={
                <ProtectedRoute
                  roles={[
                    "Super Admin",
                    "Admin",
                    "HR Manager",
                    "Visa Officer",
                    "Finance Manager",
                  ]}
                  requiredPermissions={["hr:view", "manage_employees"]}
                />
              }
            >
              <Route path="/hr" element={<HR />} />
              <Route
                element={
                  <ProtectedRoute
                    roles={["Super Admin", "Admin", "HR Manager"]}
                    requiredPermissions={["hr:edit", "manage_employees"]}
                  />
                }
              >
                <Route path="/hr/employees" element={<EmployeeManagement />} />
              </Route>
            </Route>
            <Route path="/leads" element={<Leads />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/customers/:id" element={<CustomerProfile />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/visa-types" element={<VisaTypes />} />
            <Route path="/visa-requirements" element={<VisaRequirements />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/documents/upload" element={<UploadDocuments />} />
            <Route
              path="/documents/verification"
              element={<DocumentVerification />}
            />
            <Route path="/payments" element={<Payments />} />
            <Route
              path="/accounts"
              element={<Navigate to="/accounts/dashboard" replace />}
            />
            <Route path="/accounts/dashboard" element={<AccountsDashboard />} />
            <Route path="/accounts/invoices" element={<AccountsInvoices />} />
            <Route
              path="/accounts/transactions"
              element={<AccountsTransactions />}
            />
            <Route path="/accounts/expenses" element={<AccountsExpenses />} />
            <Route path="/accounts/reports" element={<AccountsReports />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/workflows/builder" element={<WorkflowBuilder />} />
            <Route
              path="/workflows/pipeline"
              element={<ApplicationPipeline />}
            />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/tasks/assignments" element={<CaseAssignments />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/messages/inbox" element={<Inbox />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/settings" element={<Settings />} />

            <Route
              element={
                <ProtectedRoute
                  roles={["Super Admin", "Admin"]}
                  requiredPermissions={["settings:view", "manage_users"]}
                />
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/roles" element={<RoleManagement />} />
              <Route path="/admin/api-keys" element={<ApiKeys />} />
              <Route path="/admin/logs" element={<SystemLogs />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
              <Route path="/access-logs" element={<AccessLogs />} />
              <Route path="/compliance" element={<Compliance />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </Suspense>
  );
}

export default App;
