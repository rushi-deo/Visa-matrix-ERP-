const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const asArray = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toDisplayLines = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? "").trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const renderLines = (lines) =>
  lines.length
    ? lines.map((line) => `<div>${escapeHtml(line)}</div>`).join("")
    : `<div class="muted">Not provided</div>`;

const renderLogo = (company) => {
  if (company.logoUrl) {
    return `<img class="brand-logo" src="${escapeHtml(company.logoUrl)}" alt="${escapeHtml(
      company.name,
    )} logo" />`;
  }

  const initials = String(company.name ?? "VM")
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return `<div class="brand-mark">${escapeHtml(initials || "VM")}</div>`;
};

const renderItems = (items, formatCurrency) =>
  items
    .map(
      (item, index) => `
        <tr>
          <td>${escapeHtml(item.no ?? index + 1)}</td>
          <td>${escapeHtml(item.description)}</td>
          <td>${escapeHtml(item.hsnSac)}</td>
          <td>${escapeHtml(item.quantity)}</td>
          <td>${escapeHtml(formatCurrency(item.price))}</td>
          <td>${escapeHtml(formatCurrency(item.total))}</td>
        </tr>
      `,
    )
    .join("");

const renderTerms = (terms) =>
  terms.length
    ? `<ul class="terms-list">${terms
        .map((term) => `<li>${escapeHtml(term)}</li>`)
        .join("")}</ul>`
    : `<div class="muted">No terms specified.</div>`;

export const buildInvoiceHtml = (data) => {
  const {
    company,
    invoiceTo,
    documentTitle,
    documentLabel,
    documentNumber,
    documentDate,
    dueDate,
    items,
    taxSummary,
    paymentMethod,
    thankYouMessage,
    terms,
    grandTotal,
    currency,
    notes,
  } = data;

  const formatCurrency = (amount) => {
    const numericAmount = Number(amount ?? 0);

    if (!Number.isFinite(numericAmount)) {
      return String(amount ?? "");
    }

    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(numericAmount);
  };

  const contactBits = [company.phone, company.email, company.website].filter(Boolean);
  const footerAddressLines = toDisplayLines(company.footerAddress || company.addressLines);
  const billingAddressLines = toDisplayLines(invoiceTo.addressLines);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${escapeHtml(documentTitle)} ${escapeHtml(documentNumber)}</title>
    <style>
      :root {
        --brand-blue: #1f5eff;
        --brand-blue-dark: #163ea7;
        --brand-blue-soft: #eef4ff;
        --ink-strong: #173152;
        --ink: #35506f;
        --ink-soft: #6b7f98;
        --line: #d7e3f7;
        --surface: #ffffff;
        --surface-alt: #f7faff;
        --page: #eef3fb;
        --radius-lg: 22px;
        --radius-md: 16px;
        --shadow: 0 18px 40px rgba(22, 62, 167, 0.08);
      }

      @page {
        size: A4;
        margin: 14mm;
      }

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        background: var(--page);
        color: var(--ink);
        font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      body {
        padding: 24px;
      }

      .page {
        max-width: 1100px;
        margin: 0 auto;
        padding: 32px;
        background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
        border-radius: 28px;
        box-shadow: var(--shadow);
      }

      .hero {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 24px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--line);
      }

      .brand {
        display: flex;
        align-items: center;
        gap: 16px;
        min-width: 0;
      }

      .brand-logo,
      .brand-mark {
        width: 74px;
        height: 74px;
        flex-shrink: 0;
        border-radius: 18px;
        object-fit: cover;
        background: linear-gradient(135deg, #1f5eff 0%, #6ca3ff 100%);
      }

      .brand-mark {
        display: grid;
        place-items: center;
        color: #ffffff;
        font-size: 28px;
        font-weight: 800;
        letter-spacing: 0.08em;
      }

      .company-name {
        margin: 0;
        color: var(--ink-strong);
        font-size: 28px;
        font-weight: 800;
      }

      .company-subtitle {
        margin-top: 6px;
        color: var(--ink-soft);
        font-size: 14px;
      }

      .document-title {
        margin: 0;
        color: var(--brand-blue-dark);
        font-size: clamp(34px, 6vw, 52px);
        line-height: 0.95;
        letter-spacing: 0.1em;
        font-weight: 900;
        text-align: right;
      }

      .meta-grid,
      .bottom-grid,
      .message-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
        margin-top: 24px;
      }

      .card,
      .table-card,
      .summary-card,
      .info-panel,
      .message-card,
      .footer-card {
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius-lg);
        overflow: hidden;
      }

      .card-body,
      .summary-body,
      .message-body,
      .footer-body {
        padding: 20px 22px;
      }

      .section-kicker {
        margin: 0 0 16px;
        color: var(--brand-blue-dark);
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .entity-name {
        margin: 0 0 10px;
        color: var(--ink-strong);
        font-size: 24px;
        font-weight: 800;
      }

      .line-stack {
        display: grid;
        gap: 4px;
        color: var(--ink);
        font-size: 14px;
        line-height: 1.55;
      }

      .muted {
        color: var(--ink-soft);
      }

      .meta-list {
        display: grid;
        gap: 12px;
      }

      .meta-row {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        font-size: 14px;
      }

      .meta-row span:first-child {
        color: var(--ink-soft);
      }

      .meta-row span:last-child {
        color: var(--ink-strong);
        font-weight: 700;
        text-align: right;
      }

      .table-card {
        margin-top: 24px;
        overflow-x: auto;
      }

      table {
        width: 100%;
        min-width: 720px;
        border-collapse: collapse;
      }

      thead th {
        padding: 16px 14px;
        background: linear-gradient(135deg, #1f5eff 0%, #2f7bff 100%);
        color: #ffffff;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        text-align: left;
      }

      tbody td {
        padding: 15px 14px;
        border-bottom: 1px solid var(--line);
        color: var(--ink);
        font-size: 14px;
        vertical-align: top;
      }

      tbody tr:nth-child(even) td {
        background: var(--surface-alt);
      }

      tbody tr:last-child td {
        border-bottom: none;
      }

      .summary-wrap {
        display: flex;
        justify-content: flex-end;
        margin-top: 24px;
      }

      .summary-card {
        width: min(100%, 360px);
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 18px;
        padding: 10px 0;
        color: var(--ink-strong);
        font-size: 14px;
      }

      .summary-row + .summary-row {
        border-top: 1px dashed var(--line);
      }

      .info-panel {
        border: none;
        background: linear-gradient(145deg, #1f5eff 0%, #163ea7 100%);
        color: #ffffff;
      }

      .info-header {
        padding: 18px 22px 0;
        font-size: 14px;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .info-body {
        padding: 14px 22px 22px;
      }

      .info-body .line-stack,
      .info-body .muted,
      .total-caption {
        color: rgba(255, 255, 255, 0.82);
      }

      .total-amount {
        margin: 12px 0 8px;
        font-size: clamp(28px, 5vw, 38px);
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0.02em;
      }

      .message-card {
        min-height: 100%;
      }

      .thank-you {
        margin: 0;
        color: var(--ink-strong);
        font-size: 30px;
        line-height: 1.05;
        font-weight: 900;
      }

      .thank-copy {
        margin-top: 12px;
        color: var(--ink-soft);
        font-size: 15px;
        line-height: 1.7;
      }

      .terms-list {
        margin: 0;
        padding-left: 20px;
        color: var(--ink);
        font-size: 14px;
        line-height: 1.7;
      }

      .footer-card {
        margin-top: 24px;
      }

      .footer-body {
        display: grid;
        gap: 10px;
        font-size: 14px;
        color: var(--ink);
      }

      .footer-label {
        color: var(--brand-blue-dark);
        font-weight: 800;
      }

      @media (max-width: 900px) {
        body {
          padding: 14px;
        }

        .page {
          padding: 22px;
          border-radius: 22px;
        }

        .hero,
        .meta-grid,
        .bottom-grid,
        .message-grid {
          grid-template-columns: 1fr;
        }

        .document-title {
          text-align: left;
        }

        .summary-wrap {
          justify-content: stretch;
        }

        .summary-card {
          width: 100%;
        }
      }

      @media print {
        body {
          padding: 0;
          background: #ffffff;
        }

        .page {
          max-width: none;
          padding: 0;
          border-radius: 0;
          box-shadow: none;
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <div class="brand">
          ${renderLogo(company)}
          <div>
            <h1 class="company-name">${escapeHtml(company.name)}</h1>
            <div class="company-subtitle">${escapeHtml(company.tagline)}</div>
          </div>
        </div>
        <h2 class="document-title">${escapeHtml(documentTitle)}</h2>
      </section>

      <section class="meta-grid">
        <article class="card">
          <div class="card-body">
            <div class="section-kicker">${escapeHtml(documentLabel)} to:</div>
            <h3 class="entity-name">${escapeHtml(invoiceTo.name)}</h3>
            <div class="line-stack">
              ${renderLines(billingAddressLines)}
              ${invoiceTo.phone ? `<div>${escapeHtml(invoiceTo.phone)}</div>` : ""}
              ${invoiceTo.email ? `<div>${escapeHtml(invoiceTo.email)}</div>` : ""}
            </div>
          </div>
        </article>

        <article class="card">
          <div class="card-body">
            <div class="section-kicker">${escapeHtml(documentLabel)} no:</div>
            <div class="meta-list">
              <div class="meta-row">
                <span>${escapeHtml(documentLabel)} Number</span>
                <span>${escapeHtml(documentNumber)}</span>
              </div>
              <div class="meta-row">
                <span>${escapeHtml(documentLabel)} Date</span>
                <span>${escapeHtml(documentDate)}</span>
              </div>
              <div class="meta-row">
                <span>Due Date</span>
                <span>${escapeHtml(dueDate)}</span>
              </div>
            </div>
          </div>
        </article>
      </section>

      <section class="table-card">
        <table>
          <thead>
            <tr>
              <th style="width: 8%;">No</th>
              <th style="width: 36%;">Description</th>
              <th style="width: 16%;">HSN/SAC</th>
              <th style="width: 12%;">Quantity</th>
              <th style="width: 14%;">Price</th>
              <th style="width: 14%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${renderItems(items, formatCurrency)}
          </tbody>
        </table>
      </section>

      <section class="summary-wrap">
        <article class="summary-card">
          <div class="summary-body">
            <div class="section-kicker">Charges Summary</div>
            <div class="summary-row">
              <span>CGST</span>
              <strong>${escapeHtml(formatCurrency(taxSummary.cgst))}</strong>
            </div>
            <div class="summary-row">
              <span>SGST</span>
              <strong>${escapeHtml(formatCurrency(taxSummary.sgst))}</strong>
            </div>
            <div class="summary-row">
              <span>Government fees</span>
              <strong>${escapeHtml(formatCurrency(taxSummary.governmentFees))}</strong>
            </div>
          </div>
        </article>
      </section>

      <section class="bottom-grid">
        <article class="info-panel">
          <div class="info-header">Payment Method</div>
          <div class="info-body">
            <div class="line-stack">
              <div><strong>Account Name:</strong> ${escapeHtml(paymentMethod.accountName)}</div>
              <div><strong>Bank Name:</strong> ${escapeHtml(paymentMethod.bankName)}</div>
              <div><strong>Account Number:</strong> ${escapeHtml(paymentMethod.accountNumber)}</div>
              <div><strong>IFSC:</strong> ${escapeHtml(paymentMethod.ifsc)}</div>
              ${
                paymentMethod.branch
                  ? `<div><strong>Branch:</strong> ${escapeHtml(paymentMethod.branch)}</div>`
                  : ""
              }
              ${
                paymentMethod.upiId
                  ? `<div><strong>UPI:</strong> ${escapeHtml(paymentMethod.upiId)}</div>`
                  : ""
              }
            </div>
          </div>
        </article>

        <article class="info-panel">
          <div class="info-header">Grand Total</div>
          <div class="info-body">
            <div class="total-caption">Amount payable including taxes and government fees.</div>
            <div class="total-amount">${escapeHtml(formatCurrency(grandTotal))}</div>
            <div class="line-stack">
              <div>Currency: ${escapeHtml(currency)}</div>
              ${notes ? `<div>${escapeHtml(notes)}</div>` : ""}
            </div>
          </div>
        </article>
      </section>

      <section class="message-grid">
        <article class="message-card">
          <div class="message-body">
            <div class="section-kicker">Thank you</div>
            <p class="thank-you">Thank you</p>
            <div class="thank-copy">${escapeHtml(thankYouMessage)}</div>
          </div>
        </article>

        <article class="message-card">
          <div class="message-body">
            <div class="section-kicker">Terms and Conditions</div>
            ${renderTerms(asArray(terms))}
          </div>
        </article>
      </section>

      <footer class="footer-card">
        <div class="footer-body">
          <div><span class="footer-label">Contact Information:</span> ${escapeHtml(contactBits.join(" | ") || "Not provided")}</div>
          <div><span class="footer-label">Company Address:</span> ${escapeHtml(footerAddressLines.join(", ") || "Not provided")}</div>
        </div>
      </footer>
    </main>
  </body>
</html>`;
};
