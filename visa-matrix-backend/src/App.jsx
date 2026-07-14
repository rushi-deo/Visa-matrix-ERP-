import { Routes, Route, Link, Navigate } from "react-router-dom";

function Layout({ children }) {
  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial" }}>
      <div
        style={{
          width: "220px",
          background: "#1e293b",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Visa Matrix</h2>

        <nav
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            marginTop: "20px",
          }}
        >
          <Link to="/" style={{ color: "white" }}>
            Dashboard
          </Link>
          <Link to="/crm" style={{ color: "white" }}>
            CRM
          </Link>
          <Link to="/applications" style={{ color: "white" }}>
            Applications
          </Link>
          <Link to="/documents" style={{ color: "white" }}>
            Documents
          </Link>
          <Link to="/payments" style={{ color: "white" }}>
            Payments
          </Link>
          <Link to="/accounts" style={{ color: "white" }}>
            Accounts
          </Link>
          <Link to="/accounts/invoices" style={{ color: "white" }}>
            Invoices
          </Link>
          <Link to="/accounts/transactions" style={{ color: "white" }}>
            Transactions
          </Link>
          <Link to="/accounts/expenses" style={{ color: "white" }}>
            Expenses
          </Link>
          <Link to="/accounts/reports" style={{ color: "white" }}>
            Reports
          </Link>
          <Link to="/reports" style={{ color: "white" }}>
            Reports
          </Link>
          <Link to="/admin" style={{ color: "white" }}>
            Admin
          </Link>
        </nav>
      </div>

      <div style={{ flex: 1, padding: "30px" }}>{children}</div>
    </div>
  );
}

function Dashboard() {
  const cardStyle = {
    background: "#ffffff",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    width: "200px",
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px" }}>
        <div style={cardStyle}>
          <h3>Total Applications</h3>
          <p>124</p>
        </div>

        <div style={cardStyle}>
          <h3>Pending Visas</h3>
          <p>32</p>
        </div>

        <div style={cardStyle}>
          <h3>Approved Visas</h3>
          <p>76</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Revenue</h3>
          <p>$18,500</p>
        </div>
      </div>
    </div>
  );
}

function CRM() {
  return <h1>CRM / Leads</h1>;
}

function Applications() {
  const applications = [
    { id: "VM001", name: "John Doe", country: "Canada", status: "Pending" },
    { id: "VM002", name: "Sara Khan", country: "UK", status: "Approved" },
    {
      id: "VM003",
      name: "Raj Patel",
      country: "Australia",
      status: "Processing",
    },
  ];

  return (
    <div>
      <h1>Visa Applications</h1>

      <table
        style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}
      >
        <thead>
          <tr style={{ background: "#f1f5f9" }}>
            <th>ID</th>
            <th>Customer</th>
            <th>Country</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td>{app.id}</td>
              <td>{app.name}</td>
              <td>{app.country}</td>
              <td>{app.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Documents() {
  return <h1>Documents</h1>;
}

function Payments() {
  return <h1>Payments & Invoices</h1>;
}

function Reports() {
  return <h1>Reports & Analytics</h1>;
}

function Admin() {
  return <h1>Admin Settings</h1>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/crm"
        element={
          <Layout>
            <CRM />
          </Layout>
        }
      />
      <Route
        path="/applications"
        element={
          <Layout>
            <Applications />
          </Layout>
        }
      />
      <Route
        path="/documents"
        element={
          <Layout>
            <Documents />
          </Layout>
        }
      />
      <Route
        path="/payments"
        element={
          <Layout>
            <Payments />
          </Layout>
        }
      />
      <Route
        path="/accounts"
        element={
          <Layout>
            <Payments />
          </Layout>
        }
      />
      <Route
        path="/accounts/invoices"
        element={
          <Layout>
            <Payments />
          </Layout>
        }
      />
      <Route
        path="/accounts/transactions"
        element={
          <Layout>
            <Payments />
          </Layout>
        }
      />
      <Route
        path="/accounts/expenses"
        element={
          <Layout>
            <Payments />
          </Layout>
        }
      />
      <Route
        path="/accounts/reports"
        element={
          <Layout>
            <Payments />
          </Layout>
        }
      />
      <Route
        path="/reports"
        element={
          <Layout>
            <Reports />
          </Layout>
        }
      />
      <Route
        path="/admin"
        element={
          <Layout>
            <Admin />
          </Layout>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
