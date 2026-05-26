import React from "react";
import DashboardLayout from "../layout/DashboardLayout";

export default function AccountsTransactions() {
  return (
    <DashboardLayout>
      <section className="panel">
        <div className="panel__header">
          <div>
            <h3>Transactions</h3>
            <p>List of financial transactions.</p>
          </div>
        </div>
      </section>
    </DashboardLayout>
  );
}
