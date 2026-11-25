# Deployment Checklist

**Release status: BLOCKED**

## Repository and CI

- [x] Backend lint, syntax check, and local tests pass.
- [x] Frontend lint, typecheck, production build, and local tests pass.
- [x] NEXUS lint, typecheck, build, and tests pass locally.
- [ ] Run NEXUS under the declared Node >=24 runtime.
- [ ] Resolve the NEXUS critical/high dependency audit findings.
- [ ] Add/verify backend and frontend CI workflows; only a NEXUS workflow was found.
- [ ] Verify lockfile policy. Backend and frontend each contain both npm and pnpm lockfiles.

## Configuration and secrets

- [ ] Maintain separate development, staging, and production secret stores.
- [ ] Use only public Supabase URL/anon key in browser `VITE_` variables.
- [ ] Keep service-role key, JWT signing secret, NEXUS internal token, and AI provider keys server-side.
- [ ] Confirm production NEXUS connector URL uses HTTPS.
- [ ] Set CORS to exact deployed frontend origins; do not use wildcard origins with credentials.
- [ ] Set upload-size configuration to match reverse-proxy and frontend expectations.
- [ ] Never copy `.env` files into artifacts or print their contents.

## Database and storage

- [ ] Run `STAGING_VALIDATION.sql` against staging only.
- [ ] Review actual RLS, policies, grants, constraints, ownership, views, and `SECURITY DEFINER` functions.
- [ ] Verify the canonical `form_configs` and `form_responses` schemas and migration history.
- [ ] Obtain explicit approval before applying reviewed staging migrations.
- [ ] Prove the document bucket is private and document object policies are tenant-scoped.
- [ ] Run anonymous, same-tenant, cross-tenant, employee, manager, and admin access tests.
- [ ] Verify short-lived signed URL creation and expired/unauthorized URL rejection.

## Application and integration

- [ ] Run synthetic CRM, application, form, document, payment, and HR E2E workflows.
- [ ] Verify invoice/PDF output and payment/refund/cancellation behavior.
- [ ] Verify NEXUS customer/application reads and customer creation permissions with user JWT plus service authentication.
- [ ] Verify request/correlation IDs and sensitive-operation audit records.
- [ ] Check health endpoints and database/Storage dependency readiness; `/health` alone is not a dependency check.
- [ ] Confirm distributed rate limiting if deployment uses multiple backend instances.
- [ ] Validate browser session expiry and protected-route behavior in a real browser.
- [ ] Review frontend chunk warning before relying on first-load performance.

## Operations and release

- [ ] Identify actual host, URLs, DNS, TLS termination, logs, metrics, and error monitoring.
- [ ] Build and run the production backend artifact and NEXUS container; verify startup and health.
- [ ] Verify graceful shutdown and background-worker behavior under the actual process manager.
- [ ] Perform and record a database and private document backup restore in an isolated environment.
- [ ] Approve the deployment window, operator, rollback artifacts, and incident contact.
- [ ] Deploy to staging only after all blockers are resolved; run smoke/E2E/security checks.
- [ ] Production release requires explicit approval after staging gates pass.

No deployment was initiated as part of this assessment.
