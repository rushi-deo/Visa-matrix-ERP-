import React from "react";
import DataTable from "../components/DataTable";
import PageLayout from "../components/PageLayout";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import StatusPill from "../components/StatusPill";
import { useAuth } from "../context/AuthContext";
import {
  formatCurrency,
  getApplications,
  getChecklistCatalog,
  getDashboardMetrics,
  getDocuments,
  getPayments,
  getRecentApplications,
  getRecentPayments,
  getVisaDocumentChecklists,
} from "../services/mockApi";
import { getAutomationAlerts } from "../services/erpService";

export default function Dashboard() {
  const { currentUser } = useAuth();

  const applications = getApplications();
  const payments = getPayments();
  const documents = getDocuments();
  const checklistCatalog = getChecklistCatalog();
  const checklists = getVisaDocumentChecklists();

  const metrics = getDashboardMetrics(
    applications,
    payments,
    [],
    documents
  );

  const recentApplications = getRecentApplications(applications);
  const recentPayments = getRecentPayments(payments);

  const automationAlerts = getAutomationAlerts(
    applications,
    documents,
    payments,
    checklists
  );

  const openApplications = applications.filter(
    (application) =>
      !["Approved", "Rejected"].includes(application.status)
  ).length;

  return (
    <PageLayout
      title="Home"
      description="Modern visa consultancy dashboard"
      eyebrow="SaaS ERP Overview"
    >
      <SectionCard title="Workspace snapshot" description="The workspace now supports roles, permissions, organizations, notifications, and audit visibility.">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-primary font-medium">
              SaaS ERP Overview
            </span>

            <h3 className="text-2xl font-semibold mt-2">
              The workspace now supports roles, permissions,
              organizations, notifications, and audit visibility.
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              Signed in as {currentUser?.name} from{" "}
              {currentUser?.organization_name}.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[320px]">
            <article className="rounded-lg border p-4">
              <span className="text-sm text-gray-500">
                Checklist Templates
              </span>

              <strong className="block text-2xl font-semibold mt-1">
                {checklistCatalog.length}
              </strong>
            </article>

            <article className="rounded-lg border p-4">
              <span className="text-sm text-gray-500">
                Automation Alerts
              </span>

              <strong className="block text-2xl font-semibold mt-1">
                {automationAlerts.length}
              </strong>
            </article>

            <article className="rounded-lg border p-4">
              <span className="text-sm text-gray-500">
                Pending Finance
              </span>

              <strong className="block text-2xl font-semibold mt-1">
                {
                  payments.filter(
                    (payment) =>
                      payment.paymentStatus !== "Paid"
                  ).length
                }
              </strong>
            </article>

            <article className="rounded-lg border p-4">
              <span className="text-sm text-gray-500">
                Visible Modules
              </span>

              <strong className="block text-2xl font-semibold mt-1">
                5
              </strong>
            </article>
          </div>
        </div>
      </SectionCard>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Applications"
          value={metrics.totalApplications}
          icon="TA"
          color="#2563EB"
        />

        <StatCard
          title="Pending Applications"
          value={metrics.pendingApplications}
          icon="PA"
          color="#F59E0B"
        />

        <StatCard
          title="Approved Visas"
          value={metrics.approvedVisas}
          icon="AV"
          color="#22C55E"
        />

        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue)}
          icon="RV"
          color="#0F172A"
        />

        <StatCard
          title="Open Applications"
          value={openApplications}
          icon="OA"
          color="#2563EB"
        />

        <StatCard
          title="Documents Pending"
          value={metrics.documentsPending}
          icon="DP"
          color="#F97316"
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Recent Applications" description="Latest files moving through counseling and processing.">
          <DataTable
            caption="Recent applications"
            columns={[
              { key: "id", label: "Application ID" },
              { key: "customerName", label: "Customer" },
              { key: "destinationCountry", label: "Destination" },
              { key: "visaType", label: "Visa Type" },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <StatusPill label={row.status} />
                ),
              },
            ]}
            rows={recentApplications}
          />
        </SectionCard>

        <SectionCard title="Automation Highlights" description="Reminders generated from applications and invoices.">
          <div className="space-y-3">
            {automationAlerts.map((alert) => (
              <article
                key={alert.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">
                  {alert.title}
                </span>

                <p className="mt-1 text-sm text-slate-600">
                  {alert.description}
                </p>
              </article>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SectionCard title="Recent Payments" description="Outstanding and collected invoices.">
          <DataTable
            caption="Recent payments"
            columns={[
              { key: "invoiceId", label: "Invoice ID" },
              { key: "customer", label: "Customer" },
              { key: "application", label: "Application" },
              {
                key: "amount",
                label: "Amount",
                render: (row) =>
                  formatCurrency(row.amount),
              },
              {
                key: "paymentStatus",
                label: "Payment Status",
                render: (row) => (
                  <StatusPill
                    label={row.paymentStatus}
                  />
                ),
              },
            ]}
            rowKey="invoiceId"
            rows={recentPayments}
          />
        </SectionCard>

        <SectionCard title="Application Activity" description="Latest application records.">
          <DataTable
            caption="Application activity"
            columns={[
              { key: "id", label: "Application ID" },
              { key: "customerName", label: "Customer" },
              { key: "destinationCountry", label: "Destination" },
              {
                key: "status",
                label: "Status",
                render: (row) => (
                  <StatusPill label={row.status} />
                ),
              },
              {
                key: "assignedAgent",
                label: "Assigned Agent",
              },
            ]}
            rowKey="id"
            rows={recentApplications.slice(0, 5)}
          />
        </SectionCard>
      </section>
    </PageLayout>
  );
}