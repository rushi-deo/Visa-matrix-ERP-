# Environment Configuration

Do not place environment values, credentials, or `.env` contents in this document, source control, build logs, or browser bundles. Use separate secret stores and least-privilege credentials for development, staging, and production.

## Backend (`visa-matrix-backend/backend`)

Required at startup by `src/config/env.js`:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `JWT_SECRET` (server-only; use a high-entropy secret and rotation process)

Other recognized configuration names:

`NODE_ENV`, `PORT`, `API_PREFIX`, `APP_NAME`, `BASE_URL`, `CORS_ORIGIN`, `REQUEST_SIZE_LIMIT`, `LOG_LEVEL`, `JWT_EXPIRES_IN`, `SUPABASE_ANON_KEY`, `SUPABASE_STORAGE_BUCKET`, `UPLOAD_MAX_FILE_SIZE_BYTES`, `RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`, `AUTH_RATE_LIMIT_MAX`, `NEXUS_INTERNAL_TOKEN`, `REDIS_URL`, `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `ENABLE_INLINE_WORKERS`, and `EMAIL_FROM`.

- Never place `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, or `NEXUS_INTERNAL_TOKEN` in `VITE_` variables.
- User-scoped Supabase access requires `SUPABASE_ANON_KEY`; the helper no longer falls back to the service-role key.
- Production CORS has no default allowed origins; explicitly configure the exact frontend origins.
- `UPLOAD_MAX_FILE_SIZE_BYTES` defaults to 10 MiB. Align reverse-proxy limits and client copy with the deployed setting.
- Backend `npm run start` runs `node src/server.js`; `npm run build` is a syntax check, not an artifact compilation step.

## Frontend (`visa-matrix-frontend/visa-matrix-frontend`)

Recognized browser-safe names:

- `VITE_API_BASE_URL` (fallback: `VITE_API_URL`)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Only public Supabase configuration may be exposed to Vite. Never use a service-role key, JWT signing secret, NEXUS token, or provider API key as a `VITE_` variable. The browser Supabase client requires the public anon key; backend API authorization remains authoritative.

## NEXUS (`NEXUS/platform`)

Configuration names used by validation/runtime include:

`NODE_ENV`, `PORT`, `LOG_LEVEL`, `OPENAI_API_KEY`, `OPENAI_MODEL`, `OPENAI_ORGANIZATION`, `OPENAI_PROJECT`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `VISA_MATRIX_ERP_BASE_URL`, `VISA_MATRIX_ERP_TIMEOUT_MS`, and `NEXUS_INTERNAL_TOKEN`.

- NEXUS requires Node >=24 and pnpm 11.17.0 per its manifest/CI.
- Provider keys and the shared internal token are server-side secrets.
- Production ERP connector traffic must use HTTPS. The application currently accepts HTTP URLs, so deployment controls must enforce TLS until code policy is changed.

## Environment separation

| Environment | Data | Credentials | Database changes |
|---|---|---|---|
| Development | Local/synthetic only | Developer-scoped local credentials | Local only |
| Staging | Synthetic data only | Staging-specific credentials | Reviewed migrations only, after explicit approval |
| Production | Real operational data | Production-only secret store and restricted operators | Never modified by this assessment; changes require separate approval |

No actual production URLs, credential values, or provider configuration were inspected or invented.
