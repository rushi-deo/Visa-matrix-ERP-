// Email service: creates and exposes a reusable sendEmail() function
// Uses Nodemailer with Gmail and environment variables for credentials.
import nodemailer from 'nodemailer';

// Create a Gmail transporter using credentials from environment variables.
// Ensure EMAIL_USER and EMAIL_PASS are set in your environment or .env file.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Exported async function to send email. Accepts an object to keep signature extensible.
// Parameters:
// - to: recipient email address (string)
// - subject: email subject (string)
// - html: html body content (string)
export async function sendEmail({ to, subject, html }) {
  try {
    if (!to) throw new Error('`to` is required');
    if (!subject) subject = 'No subject';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    };

    // Send email and return the transport response for logging/inspection.
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent', { to, messageId: info.messageId });
    return info;
  } catch (err) {
    // Centralized error logging for easier debugging in production.
    console.error('sendEmail error:', err?.message ?? err);
    throw err;
  }
}

// Default export for ease of import in either named or default style.
export default sendEmail;
