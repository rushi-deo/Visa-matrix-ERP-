// Email templates centralised for future-ready structure (OTP, invoices, visa status, onboarding)
// Each template returns an HTML string. Keep templates simple and branded.

// Basic inline styles to keep the email clean and compatible with most clients.
const baseStyles = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; margin:0; padding:0; color:#111; }
  .container { max-width:600px; margin:24px auto; padding:24px; border:1px solid #eee; border-radius:8px; }
  .header { text-align:center; padding-bottom:12px; }
  .brand { font-size:20px; font-weight:700; color:#0B5FFF; }
  .content { font-size:15px; line-height:1.5; }
  .footer { font-size:12px; color:#666; text-align:center; padding-top:16px; }
`;

// Test email template
export function testEmailTemplate({ recipientName = '', message = '' } = {}) {
  return `
  <html>
    <head>
      <style>${baseStyles}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">Visa Matrix ERP</div>
        </div>
        <div class="content">
          <h2>Hi ${escapeHtml(recipientName) || 'there'},</h2>
          <p>${escapeHtml(message) || 'This is a test email to verify mailing from Visa Matrix ERP.'}</p>
          <p>If you received this, your email configuration is working correctly.</p>
        </div>
        <div class="footer">© ${new Date().getFullYear()} Visa Matrix ERP — All rights reserved.</div>
      </div>
    </body>
  </html>
  `;
}

// Future-ready: OTP email
export function otpEmailTemplate({ otp, expiryMinutes = 10 } = {}) {
  return `
    <html><head><style>${baseStyles}</style></head><body>
      <div class="container">
        <div class="header"><div class="brand">Visa Matrix ERP</div></div>
        <div class="content">
          <h2>Your One-Time Passcode</h2>
          <p style="font-size:20px; font-weight:700;">${escapeHtml(otp)}</p>
          <p>This code will expire in ${expiryMinutes} minutes.</p>
        </div>
        <div class="footer">If you did not request this, contact support.</div>
      </div>
    </body></html>
  `;
}

// Future-ready: Invoice email
export function invoiceEmailTemplate({ invoiceNumber = '', amount = '', dueDate = '' } = {}) {
  return `
    <html><head><style>${baseStyles}</style></head><body>
      <div class="container">
        <div class="header"><div class="brand">Visa Matrix ERP</div></div>
        <div class="content">
          <h2>Invoice ${escapeHtml(invoiceNumber)}</h2>
          <p>Amount Due: <strong>${escapeHtml(amount)}</strong></p>
          <p>Due Date: ${escapeHtml(dueDate)}</p>
        </div>
        <div class="footer">Thank you for your business.</div>
      </div>
    </body></html>
  `;
}

// Future-ready: Visa status update
export function visaStatusTemplate({ applicantName = '', status = '', details = '' } = {}) {
  return `
    <html><head><style>${baseStyles}</style></head><body>
      <div class="container">
        <div class="header"><div class="brand">Visa Matrix ERP</div></div>
        <div class="content">
          <h2>Visa Status Update for ${escapeHtml(applicantName)}</h2>
          <p>Status: <strong>${escapeHtml(status)}</strong></p>
          <p>${escapeHtml(details)}</p>
        </div>
        <div class="footer">Contact HR for questions about this update.</div>
      </div>
    </body></html>
  `;
}

// Future-ready: HR onboarding email
export function onboardingTemplate({ employeeName = '', startDate = '' } = {}) {
  return `
    <html><head><style>${baseStyles}</style></head><body>
      <div class="container">
        <div class="header"><div class="brand">Visa Matrix ERP</div></div>
        <div class="content">
          <h2>Welcome aboard, ${escapeHtml(employeeName)}!</h2>
          <p>Your start date is ${escapeHtml(startDate)}. We are excited to have you on the team.</p>
        </div>
        <div class="footer">HR Team — Visa Matrix ERP</div>
      </div>
    </body></html>
  `;
}

// Minimal HTML escaping to avoid injection when templates are given raw values.
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
