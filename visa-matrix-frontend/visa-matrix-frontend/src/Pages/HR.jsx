import React from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";
import DashboardLayout from "../layout/DashboardLayout";

export default function HR() {
  return (
    <DashboardLayout>
      <PageHeader
        title="HR"
        description="Human Resources management dashboard. Manage employees, leave requests, payroll, and attendance tracking."
      />

      <section className="summary-grid">
        <StatCard
          title="Total Employees"
          value={0}
          icon="EM"
          color="#3B82F6"
        />
        <StatCard
          title="Pending Leave Requests"
          value={0}
          icon="LR"
          color="#F59E0B"
        />
        <StatCard
          title="Payroll Status"
          value="Current"
          icon="PY"
          color="#10B981"
        />
        <StatCard
          title="Attendance Rate"
          value="—"
          icon="AT"
          color="#8B5CF6"
        />
      </section>

      <section className="workflow-grid">
        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Employees</h3>
              <p>View and manage employee profiles, contact information, and employment details.</p>
            </div>
          </div>
          <div style={{ padding: "2rem", textAlign: "center", color: "#6B7280" }}>
            <p>Employee management coming soon</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Manage employee records, departments, and organizational structure
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Leave Requests</h3>
              <p>Track and approve employee leave requests, absences, and time-off management.</p>
            </div>
          </div>
          <div style={{ padding: "2rem", textAlign: "center", color: "#6B7280" }}>
            <p>Leave request management coming soon</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Process vacation, sick leave, and other leave types
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Payroll</h3>
              <p>Process payroll, manage compensation, and generate salary statements.</p>
            </div>
          </div>
          <div style={{ padding: "2rem", textAlign: "center", color: "#6B7280" }}>
            <p>Payroll management coming soon</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Handle salary processing and payment records
            </p>
          </div>
        </article>

        <article className="panel">
          <div className="panel__header">
            <div>
              <h3>Attendance</h3>
              <p>Monitor employee attendance, check-ins, and time tracking records.</p>
            </div>
          </div>
          <div style={{ padding: "2rem", textAlign: "center", color: "#6B7280" }}>
            <p>Attendance tracking coming soon</p>
            <p style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
              Track daily attendance and work hours
            </p>
          </div>
        </article>
      </section>
    </DashboardLayout>
  );
}
