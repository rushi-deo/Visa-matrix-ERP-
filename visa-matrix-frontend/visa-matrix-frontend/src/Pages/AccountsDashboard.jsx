import React from "react";
import DashboardLayout from "../layout/DashboardLayout";

export default function AccountsDashboard() {
  return (
    <DashboardLayout>
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3>Accounts Dashboard</h3>
            <p>Overview of invoices, transactions and expenses.</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
