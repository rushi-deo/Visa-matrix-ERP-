import AdminLayout from "./AdminLayout";

export default function Applications() {
  return (
    <AdminLayout>
      <div className="result-card">
        <h2>Applications</h2>
        <p className="text-muted">
          List of all visa applications submitted by users.
        </p>

        <div style={{ marginTop: 16 }}>
          <p>No applications yet.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
    