# Visa Matrix ERP Database Discovery and Gap Analysis

Generated from the current workspace code on 2026-06-01.

## Scope and Evidence

Primary frontend analyzed:
- `visa-matrix-frontend/visa-matrix-frontend/src/App.jsx`, which mounts the TanStack router from `src/loveable/router.tsx`.
- `visa-matrix-frontend/visa-matrix-frontend/src/loveable/lib/nav-config.ts`.
- `visa-matrix-frontend/visa-matrix-frontend/src/loveable/routes/*`.
- `visa-matrix-frontend/visa-matrix-frontend/src/loveable/lib/mock-data.ts`.

Additional ERP UI evidence analyzed:
- Legacy JSX pages in `visa-matrix-frontend/visa-matrix-frontend/src/Pages`, `src/forms`, `src/components`, `src/features/hr`, and `src/services`.
- Parallel frontend in `visa-matrix-backend/frontend/src`, especially `App.tsx`, pages, feature forms, and `features/modules/moduleConfigs.ts`.
- Existing Supabase migrations in `visa-matrix-frontend/visa-matrix-frontend/supabase/migrations` and `visa-matrix-backend/backend/supabase/migrations`.
- Backend and service table usage through Supabase calls and API endpoints.

Important finding: the active UI has a broad ERP surface, but a large portion is backed by mock data or generic module endpoints. The database must therefore support both the current displayed UI and the planned operations implied by screens, forms, and service calls.

## Section A: Complete ERP Module Inventory

1. Authentication and Identity
   - Login, register, forgot password, reset password, OTP, session expired.
   - Profile menu: My Profile, Settings, Security, Help and Support, Logout.
   - Evidence: `src/loveable/routes/login.tsx`, `register.tsx`, `forgot-password.tsx`, `reset-password.tsx`, `otp.tsx`, `UserMenu.tsx`, `src/loveable/lib/auth.tsx`.

2. Dashboard and Analytics
   - Overview dashboard, HR dashboard, Finance dashboard, CRM dashboard, Employee dashboard.
   - Metrics include applications, customers, revenue, status distribution, country demand, activities, pipeline stages.
   - Evidence: `src/loveable/routes/_app.dashboard*.tsx`, `src/loveable/components/dashboard/*`, `src/loveable/lib/mock-data.ts`.

3. Visa Operations
   - Applications list, new application wizard, application detail, approval center, countries and rules, visa categories.
   - Evidence: `src/loveable/routes/_app.visa.*`, `src/loveable/routes/_app.countries*.tsx`, legacy `src/Pages/Applications.jsx`, `ApplicationDetail.jsx`, `VisaQuestionFlow.jsx`, `QuotationPage.jsx`.

4. CRM
   - Leads, customers, pipeline, follow-ups, customer profile, notes/activities implied.
   - Evidence: `src/loveable/routes/_app.crm.*`, `src/data/leads.js`, `src/data/customers.js`, `visa-matrix-backend/frontend/src/features/modules/moduleConfigs.ts`.

5. Finance and Accounts
   - Payments, invoices, expenses, transactions, finance dashboard, accounts dashboard, invoice creation, reports.
   - Evidence: `src/loveable/routes/_app.finance.*`, legacy `src/Pages/Accounts*.jsx`, `src/Pages/Payments.jsx`, backend frontend `PaymentForm.tsx`.

6. HR Management
   - Employees, departments, attendance, payroll, leave, employee profile, roles and permissions, recruitment, performance, HR workflow, HR audit logs, HR settings.
   - Evidence: `src/loveable/routes/_app.hr.*`, legacy `src/Pages/HR*.jsx`, `src/features/hr/api/hrWorkspaceApi.js`, `src/features/hr/data/mockHrData.js`.

7. Document Management
   - Documents list, upload, verification, required document checklist, document status.
   - Evidence: `src/loveable/routes/_app.documents.tsx`, legacy `src/Pages/Documents.jsx`, `src/components/FileUpload.jsx`, `visa-matrix-backend/frontend/src/features/documents/UploadDocumentForm.tsx`.

8. Workflow and Task Management
   - Task board, approvals, workflow builder, application pipeline, HR workflow definitions and instances.
   - Evidence: `src/loveable/routes/_app.tasks.*`, legacy `src/Pages/Workflow.jsx`, `src/Pages/Tasks.jsx`, `src/features/hr/api/hrWorkspaceApi.js`.

9. Notifications and Communication
   - Notifications, announcements, email/messages, chat, inbox, message center.
   - Evidence: `src/loveable/routes/_app.notifications.tsx`, `_app.announcements.tsx`, `_app.email.tsx`, `_app.chat.tsx`, legacy `Communication.jsx`.

10. Administration and Security
    - Settings, users, roles, security, API management, audit logs, system logs, access logs, compliance.
    - Evidence: `src/loveable/routes/_app.settings*.tsx`, legacy `src/Pages/Admin.jsx`, backend frontend `UserManagement.tsx`, `RoleManagementPage.tsx`, `ApiKeys.tsx`, `Compliance.tsx`.

11. Reporting
    - Reports, date range filters, export, revenue and operational metrics.
    - Evidence: `src/loveable/routes/_app.reports.tsx`, legacy `src/Pages/Reports.jsx`, backend `reports` module.

12. Employee Engagement
    - Polls, responses, feedback, kudos, announcements.
    - Evidence: HR migrations and `modules/hr/models/engagementModel.js`.

## Section B: Complete Page Inventory

### Active TanStack Routes

| Route | UI Page | Primary Entities |
|---|---|---|
| `/` | Root redirect/index | session, user |
| `/login` | Login | profile/session |
| `/register` | Register | profile/user invite |
| `/forgot-password` | Forgot password | password reset token |
| `/reset-password` | Reset password | password reset token |
| `/otp` | OTP | session/security |
| `/session-expired` | Session expired | session |
| `/dashboard` | Overview dashboard | applications, invoices, activities, metrics |
| `/dashboard/hr` | HR dashboard | employees, departments, leave, payroll |
| `/dashboard/finance` | Finance dashboard | invoices, payments, revenue |
| `/dashboard/crm` | CRM dashboard | leads, customers, pipeline |
| `/dashboard/employee` | Employee dashboard | tasks, leave, payroll, notifications |
| `/visa/applications` | Visa Applications | applications |
| `/visa/applications/new` | New Application Wizard | applications, applicant, country, visa type, documents |
| `/visa/applications/$id` | Application Detail | applications, applicant, events, documents, approvals |
| `/visa/approvals` | Approval Center | applications, approval decisions |
| `/countries` | Countries and Rules | countries, visa rules |
| `/countries/categories` | Visa Categories | visa categories/types |
| `/crm/leads` | Leads | leads |
| `/crm/customers` | Customers | customers |
| `/crm/pipeline` | Pipeline | leads, stages |
| `/crm/tasks` | Follow-ups | tasks, leads/customers |
| `/finance/payments` | Payments | payments |
| `/finance/invoices` | Invoices | invoices |
| `/finance/expenses` | Expenses | expenses |
| `/finance/transactions` | Transactions | payment transactions/ledger |
| `/hr/employees` | Employees | employees |
| `/hr/attendance` | Attendance | attendance |
| `/hr/payroll` | Payroll | payroll logs/runs |
| `/hr/leave` | Leave Management | leave requests |
| `/hr/departments` | Departments | departments |
| `/tasks/board` | Task Board | tasks |
| `/tasks/approvals` | Pending Approvals | approval requests |
| `/tasks/workflows` | Workflows | workflow definitions |
| `/notifications` | Notifications | notifications |
| `/announcements` | Announcements | announcements |
| `/email` | Email | messages/email logs |
| `/chat` | Chat | message threads/messages |
| `/documents` | Documents | documents |
| `/reports` | Reports | reports, report exports |
| `/settings` | Settings | settings |
| `/settings/users` | Users | profiles, roles |
| `/settings/roles` | Roles | roles, permissions |
| `/settings/security` | Security | sessions, login history, policies |
| `/settings/api` | API Management | API keys |
| `/settings/audit` | Audit Logs | audit logs |

### Legacy and Parallel Frontend Pages

The workspace also contains pages not mounted by the active `App.jsx` but useful for planned ERP scope:

`src/Pages`: Dashboard, Applications, ApplicationDetail, Countries, Customers, CRM, Documents, Payments, QuotationPage, Tasks, Workflow, VisaQuestionFlow, Reports, AuditLogs, Admin, Communication, HR dashboard/workspaces, Accounts dashboard/invoice/transactions/expenses/reports, Login, Signup.

`visa-matrix-backend/frontend/src/pages`: Dashboard, Applications, CreateApplication, ApplicationDetails, ApplicationPipeline, Countries, VisaTypes, VisaRequirements, Leads, Customers, CustomerProfile, Documents, UploadDocuments, DocumentVerification, Payments, Invoices, Transactions, WorkflowBuilder, Tasks, CaseAssignments, Messages, Inbox, Notifications, Reports, AnalyticsDashboard, Settings, AdminDashboard, UserManagement, RoleManagement, ApiKeys, SystemLogs, AuditLogs, AccessLogs, Compliance, HR, EmployeeManagement, Login/Register/ForgotPassword.

## Component Inventory and Feature Map

### Active Shared Layout Components

| Component | Path | Data/Process Implication |
|---|---|---|
| AppShell | `src/loveable/components/layout/AppShell.tsx` | Authenticated app shell, protected session, navigation context |
| AppSidebar | `src/loveable/components/layout/AppSidebar.tsx` | Module/role navigation and route map |
| TopBar | `src/loveable/components/layout/TopBar.tsx` | Global search, quick create, notifications, user menu |
| Breadcrumbs | `src/loveable/components/layout/Breadcrumbs.tsx` | Route hierarchy |
| GlobalSearch | `src/loveable/components/layout/GlobalSearch.tsx` | Searchable modules/pages; future global search index |
| NotificationCenter | `src/loveable/components/layout/NotificationCenter.tsx` | Notifications and read state |
| UserMenu | `src/loveable/components/layout/UserMenu.tsx` | Profile, settings, security, help, logout |

### Active Common ERP Components

| Component | Path | Data/Process Implication |
|---|---|---|
| ModulePage | `src/loveable/components/common/ModulePage.tsx` | Standard list/search/filter/export/add workflow |
| DataTable | `src/loveable/components/common/DataTable.tsx` | Search, sort, pagination, row actions |
| PageHeader | `src/loveable/components/common/PageHeader.tsx` | Primary actions and page metadata |
| StatCard | `src/loveable/components/common/StatCard.tsx` | Dashboard metric source/cache |
| StatusBadge | `src/loveable/components/common/StatusBadge.tsx` | Status enums across modules |
| EmptyState | `src/loveable/components/common/EmptyState.tsx` | No-data states |
| ConfirmDialog | `src/loveable/components/common/ConfirmDialog.tsx` | Approval/reject/destructive workflows |

### Active Dashboard Components

| Component | Path | Data/Process Implication |
|---|---|---|
| ActivityFeed | `src/loveable/components/dashboard/ActivityFeed.tsx` | Application/system event stream |
| RevenueChart | `src/loveable/components/dashboard/RevenueChart.tsx` | Finance metric aggregation |
| StatusPie | `src/loveable/components/dashboard/StatusPie.tsx` | Application status distribution |

### Active UI Foundation Components

The active UI uses Radix/shadcn-style components under `src/loveable/components/ui`: accordion, alert, alert-dialog, aspect-ratio, avatar, badge, breadcrumb, button, calendar, card, carousel, chart, checkbox, collapsible, command, context-menu, dialog, drawer, dropdown-menu, form, hover-card, input, input-otp, label, menubar, navigation-menu, pagination, popover, progress, radio-group, resizable, scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner, switch, table, tabs, textarea, toggle, toggle-group, tooltip.

These components do not create business tables by themselves, but they expose required overlay/menu/dialog/form/table behavior used by modules and workflows.

### Legacy/Parallel Functional Components

| Component | Path | Data/Process Implication |
|---|---|---|
| ApplicationForm/NewApplicationForm | `src/components/ApplicationForm.jsx`, `src/forms/NewApplicationForm.jsx` | Application intake fields |
| DynamicForm/FormEngine/VisaForm | `src/components/DynamicForm.jsx`, `src/components/FormEngine.jsx`, `visa-matrix-backend/frontend/src/components/VisaForm.jsx` | Dynamic form configs and submissions |
| FileUpload/UploadDocumentForm | `src/components/FileUpload.jsx`, `visa-matrix-backend/frontend/src/features/documents/UploadDocumentForm.tsx` | Document metadata, storage, verification |
| InvoicePreview/QuotationTemplate | `src/components/InvoicePreview.jsx`, `src/components/QuotationTemplate.jsx` | Invoice/quotation lines, fees, taxes |
| CountrySelector | `src/components/CountrySelector.jsx` | Country and visa question selection |
| HrCreateEmployeeDrawer | `src/features/hr/components/HrCreateEmployeeDrawer.jsx` | Employee creation, login provisioning, hierarchy, permissions |
| HrRecruitmentBoard | `src/features/hr/components/HrRecruitmentBoard.jsx` | Candidate stages and recruitment workflow |
| RolePermissionMatrix | `visa-matrix-backend/frontend/src/components/admin/RolePermissionMatrix.tsx` | RBAC matrix persistence |
| PaymentForm | `visa-matrix-backend/frontend/src/features/payments/PaymentForm.tsx` | Payment capture/provider reference |
| CreateApplicationForm | `visa-matrix-backend/frontend/src/features/applications/CreateApplicationForm.tsx` | Backend application creation |

### Feature Map

| Feature | Primary UI Evidence | Tables Required |
|---|---|---|
| Multi-step application intake | `_app.visa.applications.new.tsx`, `CreateApplicationForm.tsx` | applications, form_configs, form_submissions, application_checklists, documents |
| Application approval | `_app.visa.approvals.tsx`, application detail confirm dialogs | application_approvals, application_status_history, application_events, audit_logs, notifications |
| CRM pipeline | `_app.crm.pipeline.tsx`, `moduleConfigs.ts` leads | leads, lead_stage_history, lead_activities, tasks |
| Customer profile/timeline | backend frontend customer profile module | customers, contacts, customer_notes, customer_activities, applications, documents |
| Finance capture and reconciliation | `_app.finance.*`, `PaymentForm.tsx`, invoice/quotation components | invoices, invoice_line_items, payments, payment_transactions, refunds, ledger_entries |
| Document verification | documents pages and upload components | documents, document_requirements, document_versions, document_verifications |
| HR employee lifecycle | HR workspaces, EmployeeManagement, HrCreateEmployeeDrawer | profiles, employees, departments, branches, roles, employee_permissions |
| HR payroll | payroll routes and HR API | employee_salary_structure, salary_components, payroll_runs, payroll_logs, payslips |
| HR attendance and leave | HR routes/API | attendance, attendance_corrections, shifts, leaves, leave_balances |
| Recruitment and performance | legacy HR pages/API fallback | job_openings, recruitment_candidates, candidate_stage_history, performance_cycles, performance_reviews |
| Workflow automation | task/workflow routes, HR workflow API | workflow_definitions, workflow_steps, workflow_instances, workflow_instance_steps, approval_requests |
| Communications | email/chat/inbox/announcements routes | announcements, message_threads, message_participants, messages, email_logs |
| Reporting and analytics | reports route, dashboard charts | reports, report_exports, report_schedules, dashboard_metric_snapshots, saved_filters |
| Admin/security | settings users/roles/security/api/audit routes | profiles, roles, permissions, user_roles, sessions, login_history, api_keys, audit_logs, system_settings |

## Section C: Complete Entity Inventory

Core and security:
- Organization, branch, department, user profile, employee identity, role, permission, role-permission mapping, user-role mapping, employee-specific permission, session, login history, password reset token, API key, system setting, audit log.

CRM:
- Lead, lead source, lead stage history, lead activity, customer, contact, customer note, customer activity.

Visa operations:
- Country, visa type, visa category, visa requirement, requirement template, visa fee, visa rule, dynamic form config, form submission, application, application assignment, application status history, application event, application approval, application checklist, application question answer, embassy appointment.

Documents:
- Document, document category, document template, document requirement, document version, document verification.

Finance:
- Quotation, quotation line item, invoice, invoice line item, payment, payment transaction, refund, expense, expense category, ledger entry.

HR:
- Employee, salary structure, salary component, payroll run, payroll log, payslip, attendance, attendance correction, shift, leave request, leave balance, job opening, recruitment candidate, candidate stage history, performance cycle, performance review.

Workflow and tasks:
- Workflow, workflow step, workflow definition, workflow instance, workflow instance step, approval request, task, task comment.

Notifications and communication:
- Notification, notification preference, announcement, message, message thread, message participant, email log.

Reporting and compliance:
- Report, report export, report schedule, dashboard metric snapshot, saved filter, compliance rule, compliance check.

Engagement:
- Poll, poll response, feedback, kudos.

## Section D: Complete Table Inventory

### Existing Tables Found In Migrations

45 unique created tables were found:

`admin_users`, `announcements`, `application_events`, `application_status_history`, `applications`, `attendance`, `audit_logs`, `branches`, `countries`, `customers`, `departments`, `documents`, `employee_permissions`, `employee_salary_structure`, `employees`, `feedback`, `form_configs`, `invoices`, `kudos`, `leads`, `leaves`, `login_history`, `messages`, `notifications`, `organizations`, `password_reset_tokens`, `payments`, `payroll_logs`, `permissions`, `poll_responses`, `polls`, `profiles`, `reports`, `role_permissions`, `roles`, `sessions`, `tasks`, `user_roles`, `users`, `visa_requirements`, `visa_types`, `workflow_definitions`, `workflow_instances`, `workflow_steps`, `workflows`.

### Duplicate Or Merge Candidates

| Duplicate Area | Tables | Recommendation |
|---|---|---|
| User identity | `users`, `profiles`, `admin_users`, `employees` | Use Supabase `auth.users` plus `profiles`; keep `employees` only for employment data linked to `profiles.id`; retire `admin_users` and legacy `users` or make them compatibility views. |
| RBAC | `roles`, `permissions`, `role_permissions`, `user_roles`, `employee_permissions` repeated across migrations | Keep one normalized RBAC set. |
| Notifications | `notifications` created in several migrations | Keep one table with actor, recipient, channel, related entity, read state. |
| Workflow | `workflows`, `workflow_steps`, `workflow_definitions`, `workflow_instances` | Keep definitions and instances separate; use `workflows` only as application-stage runtime or rename to `application_workflows`. |
| Documents | generic `documents` used for HR and visa documents | Keep one `documents` table plus `document_links` or polymorphic ownership fields if multiple modules need attachments. |
| Countries/visa catalogs | repeated alterations and `visa_type` singular references | Standardize to `countries`, `visa_types`, `visa_requirements`, `visa_fees`, `visa_rules`. |

### Recommended Final Production Table Inventory

Final estimated production table count: **97 tables**.

This count includes tables required by active UI, legacy/planned UI pages, backend services, and workflows implied by forms/actions. It excludes Supabase internal `auth.users`.

#### Core, Auth, Admin: 15

`organizations`, `branches`, `departments`, `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `employee_permissions`, `sessions`, `login_history`, `password_reset_tokens`, `api_keys`, `system_settings`, `audit_logs`.

#### CRM: 8

`leads`, `lead_sources`, `lead_stage_history`, `lead_activities`, `customers`, `contacts`, `customer_notes`, `customer_activities`.

#### Visa Operations: 16

`countries`, `visa_types`, `visa_categories`, `visa_requirements`, `requirement_templates`, `visa_fees`, `visa_rules`, `form_configs`, `form_submissions`, `applications`, `application_assignments`, `application_status_history`, `application_events`, `application_approvals`, `application_checklists`, `embassy_appointments`.

#### Document Management: 6

`documents`, `document_categories`, `document_templates`, `document_requirements`, `document_versions`, `document_verifications`.

#### Finance: 10

`quotations`, `quotation_line_items`, `invoices`, `invoice_line_items`, `payments`, `payment_transactions`, `refunds`, `expenses`, `expense_categories`, `ledger_entries`.

#### HR: 16

`employees`, `employee_salary_structure`, `salary_components`, `payroll_runs`, `payroll_logs`, `payslips`, `attendance`, `attendance_corrections`, `shifts`, `leaves`, `leave_balances`, `job_openings`, `recruitment_candidates`, `candidate_stage_history`, `performance_cycles`, `performance_reviews`.

#### Workflow and Tasks: 8

`workflows`, `workflow_steps`, `workflow_definitions`, `workflow_instances`, `workflow_instance_steps`, `approval_requests`, `tasks`, `task_comments`.

#### Notifications and Communication: 7

`notifications`, `notification_preferences`, `announcements`, `messages`, `message_threads`, `message_participants`, `email_logs`.

#### Reporting, Analytics, Compliance: 7

`reports`, `report_exports`, `report_schedules`, `dashboard_metric_snapshots`, `saved_filters`, `compliance_rules`, `compliance_checks`.

#### Engagement: 4

`polls`, `poll_responses`, `feedback`, `kudos`.

## DATABASE_TABLE_ANALYSIS

| Module | UI Page | Entity | Required Table | Purpose | Priority |
|---|---|---|---|---|---|
| Core | All tenant-scoped pages | Organization | organizations | Tenant/company isolation and branding | P1 |
| Core | Settings/Admin/HR | Branch | branches | Office/location hierarchy | P2 |
| Core/HR | HR departments/settings | Department | departments | Department catalog and reporting | P1 |
| Auth | Login/Profile/User menu | Profile | profiles | User account metadata and role context | P1 |
| Auth/RBAC | Settings users/roles | Role | roles | Access role definitions | P1 |
| Auth/RBAC | Settings roles | Permission | permissions | Action/module permissions | P1 |
| Auth/RBAC | Settings roles | Role permission | role_permissions | Role to permission mapping | P1 |
| Auth/RBAC | Settings users | User role | user_roles | Assign profiles to roles | P1 |
| Auth/RBAC | HR role templates | Employee permission override | employee_permissions | Employee-level permission exceptions | P2 |
| Auth/Security | Security/settings | Session | sessions | Session tracking and logout controls | P2 |
| Auth/Security | Access logs/security | Login history | login_history | Access/audit trail | P2 |
| Auth | Forgot/reset password | Password reset | password_reset_tokens | Password recovery | P1 |
| Admin | API Management | API key | api_keys | Integration credentials | P3 |
| Admin | Settings | System setting | system_settings | ERP configuration values | P2 |
| Admin | Audit logs | Audit log | audit_logs | Immutable operator actions | P1 |
| CRM | Leads | Lead | leads | Prospect tracking | P1 |
| CRM | Leads/pipeline | Lead source | lead_sources | Normalize lead source filters | P3 |
| CRM | Pipeline | Lead stage history | lead_stage_history | Kanban movement and conversion reporting | P2 |
| CRM | Follow-ups | Lead activity | lead_activities | Calls, emails, follow-ups, notes | P2 |
| CRM | Customers | Customer | customers | Customer account and profile | P1 |
| CRM | Customer profile | Contact | contacts | Customer contacts/family/business contacts | P2 |
| CRM | Customer profile | Customer note | customer_notes | Timeline notes | P2 |
| CRM | Customer profile | Customer activity | customer_activities | Customer timeline/actions | P2 |
| Visa Operations | Countries | Country | countries | Destination catalog | P1 |
| Visa Operations | Visa categories/types | Visa type | visa_types | Visa product catalog | P1 |
| Visa Operations | Visa categories | Visa category | visa_categories | Tourist/business/student/work grouping | P2 |
| Visa Operations | Visa requirements | Visa requirement | visa_requirements | Country/visa eligibility rules | P1 |
| Visa Operations/Documents | New application/doc checklist | Requirement template | requirement_templates | Reusable required document/question templates | P2 |
| Visa Operations/Finance | Quotation/invoice pricing | Visa fee | visa_fees | Government/service/consultation fee lookup | P1 |
| Visa Operations | Countries and rules | Visa rule | visa_rules | Rule engine and question flow | P2 |
| Forms | Dynamic forms/question flow | Form config | form_configs | Schema-driven intake forms | P1 |
| Forms | New application/question flow | Form submission | form_submissions | Answers from dynamic forms | P2 |
| Visa Operations | Applications | Application | applications | Core visa case record | P1 |
| Visa Operations | Application list/detail | Application assignment | application_assignments | Assignee/team ownership history | P2 |
| Visa Operations | Detail/pipeline/reports | Application status history | application_status_history | Status audit and SLA reporting | P1 |
| Visa Operations | Detail/activity feed | Application event | application_events | Timeline/event stream | P2 |
| Visa Operations | Approval Center | Application approval | application_approvals | Approve/reject decision history | P1 |
| Visa Operations | New application/documents | Application checklist | application_checklists | Per-case required item status | P2 |
| Visa Operations | Application detail | Embassy appointment | embassy_appointments | Appointment scheduling/status | P3 |
| Documents | Documents/upload | Document | documents | File metadata and ownership | P1 |
| Documents | Document filters | Document category | document_categories | Passport/photo/financial/etc. categories | P2 |
| Documents | Templates | Document template | document_templates | Standard document layouts/templates | P3 |
| Documents | Requirements/checklist | Document requirement | document_requirements | Required document per country/visa/application | P1 |
| Documents | File history | Document version | document_versions | Re-upload and revision history | P3 |
| Documents | Verification page | Document verification | document_verifications | Verification outcome and reviewer | P1 |
| Finance | Quotation page | Quotation | quotations | Pre-invoice quote record | P2 |
| Finance | Quotation template | Quotation line item | quotation_line_items | Fees/taxes/services on quotes | P2 |
| Finance | Invoices | Invoice | invoices | Receivable document | P1 |
| Finance | Invoice preview | Invoice line item | invoice_line_items | Itemized invoice rows | P1 |
| Finance | Payments | Payment | payments | Payment capture and status | P1 |
| Finance | Transactions | Payment transaction | payment_transactions | Provider refs and settlement data | P1 |
| Finance | Approvals/refunds | Refund | refunds | Refund workflow and audit | P3 |
| Finance | Expenses | Expense | expenses | Operating expenses | P2 |
| Finance | Expenses | Expense category | expense_categories | Expense classification | P3 |
| Finance | Transactions/reports | Ledger entry | ledger_entries | Accounting/reconciliation entries | P3 |
| HR | Employees | Employee | employees | Employment record linked to profile | P1 |
| HR/Payroll | Employee profile/payroll | Salary structure | employee_salary_structure | Compensation configuration | P1 |
| HR/Payroll | Employee profile | Salary component | salary_components | Basic/HRA/deductions/allowances | P2 |
| HR/Payroll | Payroll page | Payroll run | payroll_runs | Batch payroll processing | P2 |
| HR/Payroll | Payroll logs | Payroll log | payroll_logs | Payroll output/audit logs | P1 |
| HR/Payroll | Payslips | Payslip | payslips | Employee payslip artifact | P3 |
| HR | Attendance | Attendance | attendance | Daily attendance records | P1 |
| HR | Attendance corrections | Attendance correction | attendance_corrections | Correction workflow | P3 |
| HR | Attendance | Shift | shifts | Shift schedule/template | P3 |
| HR | Leave | Leave request | leaves | Leave applications and approvals | P1 |
| HR | Leave dashboard | Leave balance | leave_balances | Entitlement and remaining balances | P2 |
| HR/Recruitment | Recruitment | Job opening | job_openings | Open positions | P3 |
| HR/Recruitment | Recruitment board | Candidate | recruitment_candidates | Hiring pipeline candidate | P3 |
| HR/Recruitment | Recruitment board | Candidate stage history | candidate_stage_history | Stage movement audit | P3 |
| HR/Performance | Performance | Performance cycle | performance_cycles | Review cycle setup | P3 |
| HR/Performance | Performance reviews | Performance review | performance_reviews | Rating/goals/feedback | P3 |
| Workflow | Workflow builder | Workflow | workflows | Runtime application workflow/stage | P2 |
| Workflow | Workflow builder | Workflow step | workflow_steps | Step definitions/ordering | P2 |
| Workflow | HR workflow/task workflows | Workflow definition | workflow_definitions | Configurable process template | P2 |
| Workflow | Workflow instances | Workflow instance | workflow_instances | Running process instance | P2 |
| Workflow | Workflow instances | Workflow instance step | workflow_instance_steps | Per-instance step status | P3 |
| Approvals | Approval Center/pending approvals | Approval request | approval_requests | Generic approval queue | P2 |
| Tasks | Task board/follow-ups | Task | tasks | Operational task record | P1 |
| Tasks | Task detail | Task comment | task_comments | Discussion/update history | P3 |
| Notifications | Notifications center/page | Notification | notifications | User and system alerts | P1 |
| Notifications | Settings | Notification preference | notification_preferences | Channel/read preference | P3 |
| Communication | Announcements | Announcement | announcements | Broadcast messages | P2 |
| Communication | Email/messages/inbox/chat | Message | messages | Message payload | P2 |
| Communication | Threads | Message thread | message_threads | Conversation grouping | P2 |
| Communication | Threads | Message participant | message_participants | Thread membership/read state | P3 |
| Communication | Email | Email log | email_logs | Outbound/inbound email audit | P3 |
| Reports | Reports | Report | reports | Report definitions/catalog | P2 |
| Reports | Export button | Report export | report_exports | Generated export artifacts | P3 |
| Reports | Scheduled reports | Report schedule | report_schedules | Recurring delivery | P4 |
| Analytics | Dashboard charts | Dashboard metric snapshot | dashboard_metric_snapshots | Historical KPI cache | P4 |
| Analytics | Tables/filters | Saved filter | saved_filters | User saved views | P4 |
| Compliance | Compliance page | Compliance rule | compliance_rules | Policy/rule catalog | P3 |
| Compliance | Compliance page | Compliance check | compliance_checks | Rule execution/result history | P3 |
| Engagement | HR engagement | Poll | polls | Employee polls | P4 |
| Engagement | HR engagement | Poll response | poll_responses | Poll answers | P4 |
| Engagement | HR engagement | Feedback | feedback | Employee feedback | P4 |
| Engagement | HR engagement | Kudos | kudos | Recognition events | P4 |

## Section E: Entity Relationship Diagram, Text Format

```text
Organization
  |-- Branches
  |-- Departments
  |-- Profiles
  |-- Roles
  |-- Audit Logs

Profile
  |-- User Roles
  |-- Sessions
  |-- Login History
  |-- Notifications
  |-- Messages
  |-- Employee
  |-- Audit Logs as actor

Employee
  |-- Attendance
  |-- Attendance Corrections
  |-- Leaves
  |-- Leave Balances
  |-- Salary Structure
  |-- Payroll Logs
  |-- Payslips
  |-- Performance Reviews
  |-- Employee Permissions

Customer
  |-- Contacts
  |-- Customer Notes
  |-- Customer Activities
  |-- Leads
  |-- Applications
  |-- Documents
  |-- Invoices
  |-- Payments
  |-- Tasks

Lead
  |-- Lead Stage History
  |-- Lead Activities
  |-- Tasks
  |-- Customer when converted

Country
  |-- Visa Types
  |-- Visa Requirements
  |-- Visa Fees
  |-- Visa Rules
  |-- Applications

Visa Type
  |-- Visa Requirements
  |-- Visa Fees
  |-- Form Configs
  |-- Applications

Application
  |-- Application Assignments
  |-- Application Status History
  |-- Application Events
  |-- Application Approvals
  |-- Application Checklists
  |-- Documents
  |-- Document Verifications
  |-- Quotations
  |-- Invoices
  |-- Payments
  |-- Workflows
  |-- Tasks
  |-- Notifications
  |-- Embassy Appointments

Document
  |-- Document Versions
  |-- Document Verifications
  |-- Document Requirement

Quotation
  |-- Quotation Line Items
  |-- Invoice when accepted

Invoice
  |-- Invoice Line Items
  |-- Payments
  |-- Refunds
  |-- Ledger Entries

Payment
  |-- Payment Transactions
  |-- Refunds
  |-- Ledger Entries

Workflow Definition
  |-- Workflow Steps
  |-- Workflow Instances

Workflow Instance
  |-- Workflow Instance Steps
  |-- Approval Requests

Task
  |-- Task Comments
  |-- Related Application, Lead, Customer, Workflow Instance

Message Thread
  |-- Message Participants
  |-- Messages
  |-- Email Logs
```

## Section F: Missing Tables Report

### Critical Missing Tables

These tables are not present in migrations but are directly required by UI screens or backend services:

- `api_keys`: API Management screen.
- `system_settings`: Settings screen.
- `contacts`: Customer profile/contact history.
- `customer_notes`: Customer profile/timeline.
- `customer_activities`: CRM/customer activity tracking.
- `lead_stage_history`: Pipeline movement history.
- `lead_activities`: CRM follow-ups.
- `visa_categories`: active navigation exposes Visa Categories.
- `requirement_templates`: new application wizard and document checklist.
- `visa_fees`: quotation/invoice pricing; code currently references `visa_fees_import`, but production should normalize.
- `visa_rules`: country rules/question flow.
- `form_submissions`: required for dynamic form answers.
- `application_assignments`: application assignee and workload tracking.
- `application_approvals`: approval center decisions.
- `application_checklists`: required document completion per case.
- `document_categories`: document filters and classification.
- `document_templates`: reusable document templates.
- `document_requirements`: required documents by case/country/visa type.
- `document_versions`: re-upload history.
- `document_verifications`: verification outcome/reviewer.
- `quotations`: quotation page and backend service reference.
- `quotation_line_items`: quotation template fees.
- `invoice_line_items`: invoice preview/detail.
- `payment_transactions`: transactions screen/provider refs.
- `refunds`: approval request types include refunds.
- `expenses`: finance expenses screen.
- `expense_categories`: expense filters/reporting.
- `ledger_entries`: finance transaction/reconciliation.
- `salary_components`: detailed salary breakdown.
- `payroll_runs`: batch payroll execution.
- `payslips`: employee payroll artifacts.
- `attendance_corrections`: attendance workflow.
- `shifts`: attendance scheduling.
- `leave_balances`: leave dashboard/eligibility.
- `job_openings`: recruitment.
- `recruitment_candidates`: recruitment board.
- `candidate_stage_history`: recruitment audit.
- `performance_cycles`: performance setup.
- `performance_reviews`: performance page.
- `workflow_instance_steps`: workflow instance status by step.
- `approval_requests`: pending approvals page.
- `task_comments`: task collaboration.
- `notification_preferences`: notification settings.
- `message_threads`: inbox/chat grouping.
- `message_participants`: read state and participants.
- `email_logs`: email page/audit.
- `report_exports`: export button persistence.
- `report_schedules`: scheduled reports.
- `dashboard_metric_snapshots`: analytics history.
- `saved_filters`: table filter persistence.
- `compliance_rules`: compliance page.
- `compliance_checks`: compliance result history.

### UI Screens With No Complete Backend Data Model

| UI Screen | Gap |
|---|---|
| `/visa/applications/new` | Wizard fields are UI-only in active app; needs `applications`, `form_submissions`, `application_checklists`, `documents`. |
| `/visa/approvals` | Approve/reject buttons need `application_approvals` and status-event writes. |
| `/countries/categories` | Needs normalized `visa_categories` or category field in `visa_types`. |
| `/crm/pipeline` | Needs stage history and activities, not just `leads.stage`. |
| `/crm/tasks` | Needs task relation to lead/customer/application and follow-up activity records. |
| `/finance/expenses` | No created `expenses` table found. |
| `/finance/transactions` | Needs normalized provider transaction/ledger tables. |
| `/settings/api` | No created `api_keys` table found. |
| `/settings/security` | Sessions/login history exist, but policy settings need `system_settings` or security policy tables. |
| `/settings/audit` | `audit_logs` exists, but must be consistently written across modules. |
| `/email` and `/chat` | `messages` exists, but threads/participants/email logs are missing. |
| HR recruitment/performance legacy pages | Candidate/performance tables are UI/service-implied but missing from migrations. |
| Document verification | Generic `documents` exists; verification outcomes require `document_verifications`. |

## Section G: Recommended Final Supabase Schema

### Primary Key Pattern

- Use `id uuid primary key default gen_random_uuid()` for all business tables.
- Use `created_at timestamptz not null default now()` and `updated_at timestamptz not null default now()`.
- Add `organization_id uuid references organizations(id)` to tenant-owned tables.
- Add `created_by uuid references profiles(id)` and `updated_by uuid references profiles(id)` where audit ownership matters.

### Key Foreign Keys

| Table | Primary Key | Important Foreign Keys |
|---|---|---|
| profiles | id | organization_id, department_id, branch_id, manager_id self-reference |
| employees | id | profile_id, organization_id, department_id, branch_id, reporting_manager_id |
| customers | id | organization_id, profile_id, country_id |
| leads | id | organization_id, customer_id, owner_id, source_id |
| applications | id | organization_id, customer_id, country_id, visa_type_id, assigned_to |
| documents | id | organization_id, application_id, customer_id, employee_id, uploaded_by |
| invoices | id | organization_id, customer_id, application_id, quotation_id |
| payments | id | organization_id, invoice_id, application_id, customer_id |
| tasks | id | organization_id, application_id, customer_id, lead_id, assigned_to |
| workflow_instances | id | organization_id, workflow_definition_id, application_id, reference_id |
| notifications | id | organization_id, recipient_id, actor_id, related_application_id |
| messages | id | organization_id, thread_id, sender_id |
| audit_logs | id | organization_id, actor_id |

### Normalization Rules

- Keep `profiles` as the user identity table; keep HR employment-specific fields in `employees`.
- Keep `roles`, `permissions`, `role_permissions`, `user_roles` as one RBAC model.
- Keep all application lifecycle changes in `application_status_history` and `application_events`; never rely only on current `applications.status`.
- Keep document verification separate from document metadata.
- Keep invoice rows in `invoice_line_items` and provider settlement in `payment_transactions`.
- Keep dashboard/report metrics derivable from source tables, with `dashboard_metric_snapshots` only for cached history.

## Section H: Total Table Count

Recommended final production table count: **97 tables**.

Current created table count found in migrations: **45 tables**.

Net new tables required for full UI support: **52 tables**, after normalizing duplicates and adding UI-implied process tables.

## Section I: Table Count By Module

| Module | Count |
|---|---:|
| Core, Auth, Admin | 15 |
| CRM | 8 |
| Visa Operations | 16 |
| Document Management | 6 |
| Finance | 10 |
| HR | 16 |
| Workflow and Tasks | 8 |
| Notifications and Communication | 7 |
| Reporting, Analytics, Compliance | 7 |
| Engagement | 4 |
| Total | 97 |

## Section J: Implementation Priority

### Priority 1: Required For MVP

`organizations`, `profiles`, `roles`, `permissions`, `role_permissions`, `user_roles`, `audit_logs`, `countries`, `visa_types`, `visa_requirements`, `visa_fees`, `form_configs`, `applications`, `application_status_history`, `application_approvals`, `documents`, `document_requirements`, `document_verifications`, `customers`, `leads`, `invoices`, `invoice_line_items`, `payments`, `payment_transactions`, `employees`, `employee_salary_structure`, `attendance`, `leaves`, `payroll_logs`, `tasks`, `notifications`, `password_reset_tokens`.

### Priority 2: Required For Operations

`branches`, `departments`, `employee_permissions`, `sessions`, `login_history`, `system_settings`, `contacts`, `lead_stage_history`, `lead_activities`, `customer_notes`, `customer_activities`, `visa_categories`, `requirement_templates`, `visa_rules`, `form_submissions`, `application_assignments`, `application_events`, `application_checklists`, `document_categories`, `quotations`, `quotation_line_items`, `expenses`, `payroll_runs`, `salary_components`, `leave_balances`, `workflows`, `workflow_steps`, `workflow_definitions`, `workflow_instances`, `approval_requests`, `announcements`, `messages`, `message_threads`, `reports`.

### Priority 3: Required For Automation

`api_keys`, `embassy_appointments`, `document_templates`, `document_versions`, `refunds`, `expense_categories`, `ledger_entries`, `payslips`, `attendance_corrections`, `shifts`, `workflow_instance_steps`, `task_comments`, `notification_preferences`, `message_participants`, `email_logs`, `compliance_rules`, `compliance_checks`.

### Priority 4: Required For Analytics

`report_exports`, `report_schedules`, `dashboard_metric_snapshots`, `saved_filters`, `polls`, `poll_responses`, `feedback`, `kudos`, `performance_cycles`, `performance_reviews`.

### Priority 5: Future Scale

`job_openings`, `recruitment_candidates`, `candidate_stage_history`, plus optional future tables for external integrations, webhook deliveries, SLA calendars, data warehouse syncs, and document OCR extraction.

## Existing Backend/API Gaps

1. Missing APIs
   - CRUD for `api_keys`, `system_settings`, `contacts`, `customer_notes`, `lead_activities`, `lead_stage_history`, `visa_categories`, `requirement_templates`, `form_submissions`, `application_approvals`, `document_verifications`, `quotation_line_items`, `invoice_line_items`, `payment_transactions`, `expenses`, `refunds`, `ledger_entries`, `message_threads`, `email_logs`, `report_exports`, `compliance_rules`.

2. Missing Workflows
   - Application approval should write `application_approvals`, `application_status_history`, `application_events`, `audit_logs`, and `notifications`.
   - Document verification should write `document_verifications`, `application_checklists`, `application_events`, and `notifications`.
   - Payment capture should write `payments`, `payment_transactions`, `invoice status`, `ledger_entries`, and `notifications`.
   - Payroll run should write `payroll_runs`, `payroll_logs`, `payslips`, and `audit_logs`.
   - Task approval should write `approval_requests`, `workflow_instances`, `workflow_instance_steps`, `tasks`, and `audit_logs`.

3. Missing Reports
   - Report definitions exist as UI concepts, but export and scheduling tables are missing.
   - Dashboard charts currently depend on mock arrays or direct source aggregation; add snapshots only when historical KPI trend storage is required.

4. Missing Audit Coverage
   - `audit_logs` exists, but writes are inconsistent. Every create/update/delete/approve/reject/export/login/security change should emit an audit row.

5. Missing Communication Model
   - `messages` exists, but thread, participant, read-state, and email audit tables are required for inbox/chat/email screens.

## Final Recommendations

1. Normalize identity first: use Supabase auth plus `profiles`, and link `employees.profile_id` for HR.
2. Stabilize RBAC around one set of `roles`, `permissions`, `role_permissions`, `user_roles`, and `employee_permissions`.
3. Implement the P1 schema before continuing backend feature work.
4. Add write paths for all approval actions so the UI does not mutate only current status fields.
5. Replace import/legacy tables such as `visa_fees_import` with normalized `visa_fees`, while retaining import tables only as staging.
6. Treat dynamic form schemas and submissions as first-class records, because the application wizard and question flow require durable answers.
7. Add communication threading before expanding chat/email screens.
8. Add report export/schedule tables before enabling production export automation.
