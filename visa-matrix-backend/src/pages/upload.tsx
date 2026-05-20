import { useNavigate } from "react-router-dom";

export default function Upload() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h1>Visa Matrix</h1>
      <p>Upload required documents</p>

      <div style={{ marginTop: 20 }}>
        <label>Passport</label>
        <input
          type="file"
          style={{ display: "block", marginTop: 8 }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Photo</label>
        <input
          type="file"
          style={{ display: "block", marginTop: 8 }}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <label>Bank Statement</label>
        <input
          type="file"
          style={{ display: "block", marginTop: 8 }}
        />
      </div>

      <button
        onClick={() => navigate("/result")}
        style={{
          marginTop: 30,
          padding: "10px 16px",
          cursor: "pointer",
        }}
      >
        Check Result
      </button>
    </div>
  );
}
