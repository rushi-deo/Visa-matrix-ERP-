// Controller: handles incoming requests related to emails
// Implements a test endpoint to validate the email flow.
import { sendEmail } from '../services/emailService.js';
import { testEmailTemplate } from '../services/emailTemplates.js';

// Simple email validation regex (sufficient for request validation)
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/email/test
// Expects: { email: 'recipient@example.com' }
// Returns 200 on success, 400 if missing, 422 if invalid, 500 on send errors.
export async function sendTestEmail(req, res) {
  try {
    const { email } = req.body || {};

    // Validation: missing email
    if (!email) {
      return res.status(400).json({ success: false, message: 'Missing "email" in request body' });
    }

    // Validation: invalid email format
    if (!EMAIL_REGEX.test(email)) {
      return res.status(422).json({ success: false, message: 'Invalid email address' });
    }

    // Build a professional HTML email using the centralized template
    const html = testEmailTemplate({ recipientName: email.split('@')[0], message: 'This is a test message from Visa Matrix ERP to verify email delivery.' });

    // Send the email using the service layer
    await sendEmail({ to: email, subject: 'Visa Matrix ERP — Test Email', html });

    // Success response
    return res.status(200).json({ success: true, message: 'Test email sent' });
  } catch (err) {
    // Log error and return a safe failure response
    console.error('sendTestEmail error:', err?.message ?? err);
    return res.status(500).json({ success: false, message: 'Failed to send test email', error: err?.message ?? 'unknown' });
  }
}

export default sendTestEmail;
