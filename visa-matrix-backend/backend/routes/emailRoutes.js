// Router for email-related endpoints. Keeps route definitions modular and mountable.
import express from 'express';
import { sendTestEmail } from '../controllers/emailController.js';

const router = express.Router();

// POST /api/email/test -> sends a professional test email
router.post('/test', express.json(), sendTestEmail);

export default router;
