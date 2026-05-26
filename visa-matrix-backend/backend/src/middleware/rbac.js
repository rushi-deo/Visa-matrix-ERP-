import { authorizePermissions } from "./rbac.middleware.js";

const moduleAliases = {
  account: "accounts",
  accounts: "accounts",
  application: "applications",
  applications: "applications",
  countries: "countries",
  "visa-rules": "countries",
  "visa-catalog": "countries",
  documents: "documents",
  payments: "payments",
  invoices: "invoicing",
  quotation: "invoicing",
  quotations: "invoicing",
  "quotation-template": "invoicing",
  "send-quotation": "invoicing",
  "generate-invoice": "invoicing",
  invoice: "invoicing",
  payment: "payments",
  tasks: "tasks",
  workflows: "workflow",
  workflow: "workflow",
  communication: "notifications",
  notifications: "notifications",
  reports: "reports",
  customers: "customers",
};

const actionByMethod = {
  GET: "view",
  POST: "create",
  PUT: "edit",
  PATCH: "edit",
  DELETE: "delete",
};

const resolveModule = (req) => {
  const baseSegments = req.baseUrl.split("/").filter(Boolean);
  const pathSegments = req.path.split("/").filter(Boolean);
  const routeSegment =
    baseSegments[baseSegments.length - 1] === "api"
      ? pathSegments[0]
      : baseSegments[baseSegments.length - 1];
  return moduleAliases[routeSegment] || routeSegment;
};

const resolveAction = (req) => {
  if (/approve|approval/i.test(req.path)) {
    return "approve";
  }

  return actionByMethod[req.method] || "view";
};

// Backward-compatible wrapper. Older routes pass role names here, but access is
// now checked against DB-backed module permissions derived from the request.
export const authorize = () => {
  return (req, res, next) => {
    const moduleName = resolveModule(req);
    const action = resolveAction(req);
    return authorizePermissions(`${moduleName}:${action}`)(req, res, next);
  };
};

export default authorize;
