export default function Result() {
  return (
    <div className="container">
      <div className="result-card">
        <h2>Visa Approval Probability</h2>

        <div className="score">78%</div>

        <p className="text-muted">
          Based on your documents, travel history, and destination requirements.
        </p>

        <div style={{ marginTop: "24px" }}>
          <button className="btn btn-primary">
            View Detailed Report
          </button>
        </div>
      </div>
    </div>
  );
}
