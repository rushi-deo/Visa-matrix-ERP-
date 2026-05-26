import React from "react";
import DashboardLayout from "../layout/DashboardLayout";

export default function AccountsInvoice() {
  return (
    <DashboardLayout>
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3>Invoice</h3>
            <p>Invoice creation and management.</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
