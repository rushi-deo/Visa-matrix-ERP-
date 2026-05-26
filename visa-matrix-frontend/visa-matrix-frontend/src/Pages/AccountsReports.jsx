import React from "react";
import DashboardLayout from "../layout/DashboardLayout";

export default function AccountsReports() {
  return (
    <DashboardLayout>
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3>Accounts Reports</h3>
            <p>Financial reports for accounts.</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
