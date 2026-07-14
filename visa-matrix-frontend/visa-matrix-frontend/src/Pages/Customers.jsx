import React from "react";
import { useEffect, useState } from "react";
import DataTable from "../components/DataTable";
import FilterBar from "../components/FilterBar";
import PageLayout from "../components/PageLayout";
import SectionCard from "../components/SectionCard";
import StatCard from "../components/StatCard";
import TablePagination from "../components/TablePagination";
import DashboardLayout from "../layout/DashboardLayout";
import { fetchCustomers } from "../services/api";
import { getPageCount, paginateRows } from "../services/erpService";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadCustomers = async () => {
      setLoading(true);
      const nextCustomers = await fetchCustomers();

      if (!isMounted) {
        return;
      }

      setCustomers(nextCustomers);
      setSelectedCustomerId((currentId) =>
        nextCustomers.some((customer) => customer.id === currentId)
          ? currentId
          : nextCustomers[0]?.id ?? "",
      );
      setError("");
      setLoading(false);
    };

    loadCustomers();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCustomers = customers.filter((customer) =>
    [
      customer.name,
      customer.passportNumber,
      customer.contact,
      customer.email,
      customer.assignedAgent,
    ]
      .join(" ")
      .toLowerCase()
      .includes(searchValue.toLowerCase()),
  );

  const pageSize = 4;
  const pageCount = getPageCount(filteredCustomers, pageSize);
  const visibleCustomers = paginateRows(filteredCustomers, page, pageSize);
  const selectedCustomer =
    filteredCustomers.find((customer) => customer.id === selectedCustomerId) ??
    filteredCustomers[0] ??
    customers[0];

  const columns = [
    { key: "name", label: "Name" },
    { key: "passportNumber", label: "Passport Number" },
    { key: "contact", label: "Contact" },
    { key: "email", label: "Email" },
    { key: "activeApplications", label: "Active Applications" },
    {
      key: "actions",
      label: "Profile",
      render: (row) => (
        <button className="link-button" onClick={() => setSelectedCustomerId(row.id)} type="button">
          View Profile
        </button>
      ),
    },
  ];

  const totalDocuments = customers.reduce(
    (sum, customer) => sum + (customer.documentsUploaded?.length ?? 0),
    0,
  );

  return (
    <DashboardLayout>
      <PageLayout
        title="Customers"
        description="Customer profiles, passport data, visa history, and uploaded document context in one view."
        eyebrow="Customer CRM"
      >
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="Total Customers" value={customers.length} icon="CU" color="#2563EB" />
        <StatCard
          title="Active Accounts"
          value={customers.filter((customer) => customer.activeApplications > 0).length}
          icon="AA"
          color="#22C55E"
        />
        <StatCard title="Documents Uploaded" value={totalDocuments} icon="DU" color="#0F172A" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <SectionCard title="Customer Directory" description="Search by customer name, passport number, or assigned consultant.">
          <FilterBar>
            <label className="min-w-[240px] flex-1">
              <span className="mb-1 block text-sm font-medium text-slate-600">Search customers</span>
              <input
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                onChange={(event) => {
                  setSearchValue(event.target.value);
                  setPage(1);
                }}
                placeholder="Search customers"
                type="search"
                value={searchValue}
              />
            </label>
          </FilterBar>

          <DataTable
            caption="Customer directory"
            columns={columns}
            emptyMessage={loading ? "Loading customers..." : "No customers match the current search."}
            rowKey="id"
            rows={visibleCustomers}
          />

          <TablePagination
            itemLabel="customer profiles"
            onNext={() => setPage((currentPage) => Math.min(pageCount, currentPage + 1))}
            onPrevious={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            page={page}
            pageCount={pageCount}
          />
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Customer Profile" description="Profile context for the selected customer.">

            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{selectedCustomer?.name}</dd>
              </div>
              <div>
                <dt>Passport Number</dt>
                <dd>{selectedCustomer?.passportNumber}</dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{selectedCustomer?.contact}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{selectedCustomer?.email}</dd>
              </div>
              <div>
                <dt>Assigned Agent</dt>
                <dd>{selectedCustomer?.assignedAgent}</dd>
              </div>
              <div>
                <dt>Active Applications</dt>
                <dd>{selectedCustomer?.activeApplications}</dd>
              </div>
            </dl>

            <div>
              <span className="profile-card__eyebrow">Visa History</span>
              <div className="tag-list">
                {(selectedCustomer?.visaHistory ?? []).map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="profile-card__eyebrow">Documents Uploaded</span>
              <div className="tag-list">
                {(selectedCustomer?.documentsUploaded ?? []).map((item) => (
                  <span className="tag" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Client Portal Preparation" description="Preparation items for customer-facing updates.">
            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <strong className="block text-slate-900">Client document upload</strong>
                <p>Placeholder for secure customer uploads linked to this customer profile.</p>
              </div>
              <div>
                <strong className="block text-slate-900">Application status tracking</strong>
                <p>Placeholder for real-time customer-facing progress visibility.</p>
              </div>
              <div>
                <strong className="block text-slate-900">Client communication</strong>
                <p>Placeholder for portal messages, document comments, and appointment reminders.</p>
              </div>
            </div>
          </SectionCard>
        </div>
      </section>
      {error ? <p className="form-error">{error}</p> : null}
      </PageLayout>
    </DashboardLayout>
  );
}
