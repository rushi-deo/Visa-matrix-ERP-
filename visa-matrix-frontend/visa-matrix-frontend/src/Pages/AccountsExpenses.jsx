import React from "react";
import DashboardLayout from "../layout/DashboardLayout";

export default function AccountsExpenses() {
  return (
    <DashboardLayout>
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3>Expenses</h3>
            <p>Record and manage expenses.</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
