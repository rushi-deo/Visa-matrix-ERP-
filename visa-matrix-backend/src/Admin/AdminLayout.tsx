import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 240,
          background: "var(--surface)",
          borderRight: "1px solid var(--border)",
          padding: "24px",
        }}
      >
        <h3 style={{ marginBottom: 24 }}>Visa Matrix</h3>

        <nav className="flex flex-col gap-md">
          <Link to="/admin/applications">Applications</Link>
          <Link to="/admin/documents">Documents</Link>
          <Link to="/admin/users">Users</Link>
        </nav>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: "var(--background)" }}>
        {/* Top bar */}
        <div
          style={{
            padding: "16px 24px",
            borderBottom: "1px solid var(--border)",
            background: "var(--surface)",
          }}
        >
          <strong>Admin Dashboard</strong>
        </div>

        {/* Page content */}
        <div style={{ padding: 24 }}>{children}</div>
      </main>
    </div>
  );
}
