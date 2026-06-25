
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "node:url";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

import cors from "cors";
import express from "express";
import helmet from "helmet";
import env from "./config/env.js";
import logger from "./core/logger.js";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/users/user.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import leadRoutes from "./modules/leads/lead.routes.js";
import applicationRoutes from "./modules/applications/application.routes.js";
import countryRoutes from "./modules/countries/country.routes.js";
import visaCatalogRoutes from "./modules/visa-catalog/visaCatalog.routes.js";
import visaRuleRoutes from "./modules/visaRules/visaRule.routes.js";
import visaTypeRoutes from "./routes/visaTypeRoutes.js";
import documentRoutes from "./modules/documents/document.routes.js";
import departmentRoutes from "./modules/departments/department.routes.js";
import existingInvoiceRoutes from "./modules/invoices/invoice.routes.js";
import quotationRoutes from "./modules/Quotation/quotation.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import paymentRoutes from "./modules/payments/payment.routes.js";
import paymentCreateRoutes from "./routes/payment.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import workflowRoutes from "./modules/workflows/workflow.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import communicationRoutes from "./modules/communication/communication.routes.js";
import reportRoutes from "./modules/reports/report.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import debugDbRoutes from "./routes/debugDb.routes.js";
import formConfigRoutes from "./routes/formConfig.js";
import legacyApplicationRoutes from "./routes/applicationRoutes.js";
import publicApplicationsRoutes from "./routes/publicApplications.js";
import pdfRoutes from "./routes/pdf.routes.js";
import testSecureRoutes from "./routes/testSecureRoutes.js";
import validationRoutes from "./routes/validation.js";
import visaFeesRoutes from "./routes/visaFees.routes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { globalRateLimiter } from "./middleware/rateLimiter.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { startEmailWorker } from "./jobs/emailJob.js";
import { startNotificationWorker } from "./jobs/notificationJob.js";
import { startWorkflowWorker } from "./jobs/workflowJob.js";

const currentFilePath = fileURLToPath(import.meta.url);
const activeWorkers = [];
const allowedCorsOrigins = ["http://localhost:5173", ...env.corsOrigins];

const corsOptions = {
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedCorsOrigins.includes("*") ||
      allowedCorsOrigins.includes(origin)
    ) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const startWorkers = () => {
  const workers = [
    startEmailWorker(),
    startNotificationWorker(),
    startWorkflowWorker(),
  ].filter(Boolean);

  activeWorkers.push(...workers);
};

const shutdownWorkers = async () => {
  await Promise.all(
    activeWorkers.map((worker) =>
      worker.close().catch((error) => {
        logger.error("Failed to close worker cleanly", {
          error: error.message,
        });
      }),
    ),
  );
};

export const createServerApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));
  app.use(globalRateLimiter);
  app.use(express.json({ limit: env.requestSizeLimit }));
  app.use(express.urlencoded({ extended: true, limit: env.requestSizeLimit }));
  app.use(requestLogger);

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      data: {
        service: env.appName,
        status: "ok",
        environment: env.nodeEnv,
        timestamp: new Date().toISOString(),
      },
    });
  });

  // Health check at /api/health
  app.get(`${env.apiPrefix}/health`, (_req, res) => {
    res.json({ status: "OK" });
  });

  app.get(`${env.apiPrefix}`, (_req, res) => {
    res.send("API is running");
  });

  app.use(`${env.apiPrefix}/auth`, authRoutes);
  app.use(`${env.apiPrefix}/users`, userRoutes);
  app.use(`${env.apiPrefix}/customers`, customerRoutes);
  app.use(`${env.apiPrefix}/leads`, leadRoutes);
  app.use(`${env.apiPrefix}/application`, legacyApplicationRoutes);
  app.use(`${env.apiPrefix}/public/applications`, publicApplicationsRoutes);
  app.use(`${env.apiPrefix}/applications`, applicationRoutes);
  app.use(`${env.apiPrefix}/countries`, countryRoutes);
  app.use(`${env.apiPrefix}/visa-catalog`, visaCatalogRoutes);
  app.use(`${env.apiPrefix}`, visaCatalogRoutes);
  app.use(`${env.apiPrefix}/visa-types`, visaTypeRoutes);
  app.use(`${env.apiPrefix}/visa-rules`, visaRuleRoutes);
  app.use(`${env.apiPrefix}/documents`, documentRoutes);
  app.use(`${env.apiPrefix}/form-config`, formConfigRoutes);
  // DEV ONLY: keep rule-engine validation available without auth while testing.
  app.use(`${env.apiPrefix}`, validationRoutes);
  app.use("/api/invoices", existingInvoiceRoutes);
  app.use("/api", invoiceRoutes);
  app.use(`${env.apiPrefix}`, paymentCreateRoutes);
  app.use(`${env.apiPrefix}/payments`, paymentRoutes);
  app.use(`${env.apiPrefix}/tasks`, taskRoutes);
  app.use(`${env.apiPrefix}/workflows`, workflowRoutes);
  app.use(`${env.apiPrefix}/notifications`, notificationRoutes);
  app.use(`${env.apiPrefix}/communication`, communicationRoutes);
  app.use(`${env.apiPrefix}/reports`, reportRoutes);
  app.use(`${env.apiPrefix}/admin`, adminRoutes);
  app.use(`${env.apiPrefix}/debug-db`, debugDbRoutes);
  app.use(`${env.apiPrefix}/pdf`, pdfRoutes);
  app.use(`${env.apiPrefix}/test`, testSecureRoutes);
  app.use(`${env.apiPrefix}/visa-fees`, visaFeesRoutes);
app.use(`${env.apiPrefix}/quotations`, quotationRoutes);
  app.use(`${env.apiPrefix}/departments`, departmentRoutes);

  // Enterprise Auth & Access Control Routes
  app.use(`${env.apiPrefix}/employees`, employeeRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const app = createServerApp();

const startServer = () => {
  startWorkers();

  const server = app.listen(env.port, () => {
    logger.info("Visa Matrix backend started", {
      url: `${env.baseUrl}${env.apiPrefix}`,
      port: env.port,
      environment: env.nodeEnv,
    });
  });

  const shutdown = async () => {
    logger.info("Shutting down Visa Matrix backend");
    await shutdownWorkers();
    server.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
};

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  startServer();
}

export default app;
