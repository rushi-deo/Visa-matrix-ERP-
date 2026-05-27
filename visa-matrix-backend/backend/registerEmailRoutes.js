// Helper to register email routes into your main Express app.
// This keeps the main server file clean and follows enterprise-style modular routing.
import emailRoutes from './routes/emailRoutes.js';

// Call this from your server.js or app.js after you create the Express `app`.
// Example (ES Modules):
// import express from 'express';
// import registerEmailRoutes from './backend/registerEmailRoutes.js';
// const app = express();
// registerEmailRoutes(app);
export default function registerEmailRoutes(app) {
  app.use('/api/email', emailRoutes);
}
