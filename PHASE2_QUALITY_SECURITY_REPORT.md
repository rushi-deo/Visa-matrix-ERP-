# Visa Matrix ERP — Phase 2 Quality and Dependency Security Report

**Audit date:** 2026-11-23
**Branch:** `codex/visa-matrix-phase2-checkpoint`

## Outcome

The frontend TypeScript count is zero, frontend ESLint reports zero errors and warnings, and both frontend and backend npm audits report zero vulnerabilities. NEXUS passed its Node 24 typecheck and test suite. Targeted dependency changes were checkpointed separately.

This report does **not** certify the complete ERP production workflow. The repository has no dedicated backend document-access, invoice, or payment tests, and no staging-backed end-to-end workflow was run. No Supabase migrations or production database changes were made.

## Git checkpoints

| Commit | Checkpoint |
|---|---|
| `486d6c7` | Prior remediation baseline |
| `bfbb911` | Frontend TypeScript and ESLint repairs |
| `4b14da5` | Backend dependency security updates |
| `aa90b14` | Frontend dependency security updates |

The working tree was clean after the dependency commits and regression runs. The package-manager restore commands changed `node_modules`, not tracked source or lockfiles.

## Phase A — TypeScript diagnostic register

The previous remediation recorded 47 TypeScript diagnostics. Re-running checkpoint `486d6c7` with the already-installed post-repair dependency tree reproduced 31 source diagnostics; the 16 missing-package errors no longer reproduced because those packages had already been installed. The 16 import sites are listed below alongside the 31 reproduced errors, preserving the original 47-item register. The repaired project now passes `tsc --noEmit` with zero diagnostics.

| # | Original file and line | Cause and classification | Repair |
|---:|---|---|---|
| 1 | `src/loveable/components/ui/accordion.tsx:2` | Missing `@radix-ui/react-accordion` module; dependency-resolution issue | Added the existing UI primitive dependency at a React 19 compatible version |
| 2 | `src/loveable/components/ui/aspect-ratio.tsx:1` | Missing `@radix-ui/react-aspect-ratio` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 3 | `src/loveable/components/ui/collapsible.tsx:3` | Missing `@radix-ui/react-collapsible` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 4 | `src/loveable/components/ui/context-menu.tsx:2` | Missing `@radix-ui/react-context-menu` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 5 | `src/loveable/components/ui/hover-card.tsx:2` | Missing `@radix-ui/react-hover-card` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 6 | `src/loveable/components/ui/menubar.tsx:2` | Missing `@radix-ui/react-menubar` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 7 | `src/loveable/components/ui/navigation-menu.tsx:2` | Missing `@radix-ui/react-navigation-menu` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 8 | `src/loveable/components/ui/radio-group.tsx:2` | Missing `@radix-ui/react-radio-group` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 9 | `src/loveable/components/ui/slider.tsx:2` | Missing `@radix-ui/react-slider` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 10 | `src/loveable/components/ui/toggle.tsx:2` | Missing `@radix-ui/react-toggle` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 11 | `src/loveable/components/ui/toggle-group.tsx:4` | Missing `@radix-ui/react-toggle-group` module; dependency-resolution issue | Added the existing UI primitive dependency |
| 12 | `src/loveable/components/ui/calendar.tsx:5` | Missing `react-day-picker` module; dependency-resolution issue | Added the existing calendar dependency |
| 13 | `src/loveable/components/ui/carousel.tsx:2` | Missing `embla-carousel-react` module; dependency-resolution issue | Added the existing carousel dependency |
| 14 | `src/loveable/components/ui/drawer.tsx:2` | Missing `vaul` module; dependency-resolution issue | Added the existing drawer dependency |
| 15 | `src/loveable/components/ui/form.tsx:11` | Missing `react-hook-form` module; dependency-resolution issue | Added the existing form dependency |
| 16 | `src/loveable/components/ui/resizable.tsx:2` | Missing `react-resizable-panels` module; dependency-resolution issue | Added the existing resizable-panel dependency |
| 17 | `src/loveable/components/auth/AuthLayout.tsx:1` | JPG import had no TypeScript asset declaration; type-definition issue | Added the JPG module declaration in `src/assets.d.ts` |
| 18 | `src/loveable/components/layout/AppSidebar.tsx:9` | Same missing JPG declaration; type-definition issue | Resolved by the shared asset declaration |
| 19 | `src/loveable/components/ui/chart.tsx:109` | Recharts tooltip props did not expose the inferred `payload`; type mismatch | Declared the custom tooltip input explicitly |
| 20 | `src/loveable/components/ui/chart.tsx:114` | Recharts tooltip props did not expose the inferred `label`; type mismatch | Declared and narrowed the custom tooltip input |
| 21 | `src/loveable/components/ui/chart.tsx:246` | `payload` was not a valid key in the inferred Recharts prop type; type mismatch | Replaced the incompatible inferred type with an explicit local type |
| 22 | `src/loveable/components/ui/chart.tsx:253` | Tooltip payload was `unknown` before reading `length`; type-safety defect | Added a runtime shape guard before access |
| 23 | `src/loveable/components/ui/chart.tsx:267` | Tooltip payload was `unknown` before calling `filter`; type-safety defect | Added a runtime shape guard before access |
| 24 | `src/loveable/router.tsx:8` | TanStack Router requires `strictNullChecks`; compiler configuration issue | Enabled strict null checking and registered the router type |
| 25 | `src/loveable/routes/_app.crm.customers.tsx:145` | Route `id` params were rejected because the router registration was missing; type-only routing issue | Registered the file router and retained the existing route parameter |
| 26 | `src/loveable/routes/_app.crm.leads.tsx:66` | Same TanStack route parameter inference issue | Resolved by router registration |
| 27 | `src/loveable/routes/_app.dashboard.crm.tsx:16` | Revenue chart rendered without required `data`; component contract mismatch with runtime impact | Passed typed dashboard data |
| 28 | `src/loveable/routes/_app.dashboard.crm.tsx:16` | Activity feed rendered without required `activities`; component contract mismatch with runtime impact | Passed typed activity records |
| 29 | `src/loveable/routes/_app.dashboard.employee.tsx:19` | Activity feed rendered without required `activities`; component contract mismatch with runtime impact | Passed typed activity records |
| 30 | `src/loveable/routes/_app.dashboard.finance.tsx:16` | Revenue chart rendered without required `data`; component contract mismatch with runtime impact | Passed typed chart data |
| 31 | `src/loveable/routes/_app.dashboard.finance.tsx:16` | Status chart rendered without required `data`; component contract mismatch with runtime impact | Passed typed status data |
| 32 | `src/loveable/routes/_app.dashboard.hr.tsx:16` | Revenue chart rendered without required `data`; component contract mismatch with runtime impact | Passed typed chart data |
| 33 | `src/loveable/routes/_app.dashboard.hr.tsx:16` | Activity feed rendered without required `activities`; component contract mismatch with runtime impact | Passed typed activity records |
| 34 | `src/loveable/routes/_app.finance.invoices.tsx:128` | Invoice route parameter rejected by the incomplete router registration; type-only routing issue | Resolved by router registration |
| 35 | `src/loveable/routes/_app.finance.payments.tsx:57` | Payment route parameter rejected by the incomplete router registration; type-only routing issue | Resolved by router registration |
| 36 | `src/loveable/routes/_app.hr.employees.tsx:82` | Employee route parameter rejected by the incomplete router registration; type-only routing issue | Resolved by router registration |
| 37 | `src/loveable/routes/_app.reports.tsx:19` | Revenue chart rendered without required `data`; component contract mismatch | Passed typed chart data |
| 38 | `src/loveable/routes/_app.reports.tsx:19` | Status chart rendered without required `data`; component contract mismatch | Passed typed status data |
| 39 | `src/loveable/routes/_app.visa.approvals.tsx:54` | Route `id` params rejected by router registration; type-only routing issue | Resolved by router registration |
| 40 | `src/loveable/routes/_app.visa.approvals.tsx:54` | The local `Application` model did not define the assumed `id` field; API/model mismatch | Normalized API records before using them |
| 41 | `src/loveable/routes/_app.visa.approvals.tsx:105` | `Application[]` was forced into a row type requiring `id`; model mismatch | Made the table generic over the actual row type |
| 42 | `src/loveable/routes/_app.visa.approvals.tsx:106` | Column definitions used `Application` but the table required `{ id: string }`; model mismatch | Typed columns against the row model |
| 43 | `src/loveable/routes/_app.visa.approvals.tsx:107` | `applicant` was rejected by an id-only column key type | Changed table keys to `keyof T` |
| 44 | `src/loveable/routes/_app.visa.approvals.tsx:107` | `appId` was rejected by an id-only column key type | Changed table keys to `keyof T` |
| 45 | `src/loveable/routes/_app.visa.approvals.tsx:107` | `country` was rejected by an id-only column key type | Changed table keys to `keyof T` |
| 46 | `src/loveable/server.ts:14` | Stale adapter imported absent `@tanstack/react-start/server-entry`; inactive scaffold, not active runtime | Excluded the unused React Start adapter files from the app typecheck |
| 47 | `src/loveable/start.ts:1` | Stale adapter imported absent `@tanstack/react-start`; inactive scaffold, not active runtime | Excluded the unused React Start adapter files from the app typecheck |

## Phase B — ESLint repair register

The original configured lint run had **199 errors and 10 warnings**. Current lint exits successfully with **0 errors and 0 warnings**.

| Finding group | Original count | Resolution |
|---|---:|---|
| TypeScript `no-explicit-any` | 56 | Replaced active-source `any` with concrete types, `unknown`, and runtime guards |
| Unused variables/imports | 44 `no-unused-vars` + 4 TypeScript unused-variable findings | Removed dead imports/variables or connected existing behavior to its UI entry point |
| React Refresh export-boundary findings | 42 | Kept the rule enabled generally; scoped exceptions only to TanStack route modules and shared modules whose documented API exports hooks, contexts, or helpers alongside components |
| `react-hooks/set-state-in-effect` | 25 | Refactored effect/state paths where possible; used only targeted, explained exceptions for asynchronous data synchronization |
| `no-undef` | 12 | Corrected ESLint’s TypeScript globals configuration; `no-undef` is disabled only for TS/TSX where the TypeScript parser owns name checking |
| `react-hooks/rules-of-hooks` | 8 | Moved hooks to valid component/custom-hook paths |
| Duplicate keys | 3 | Removed duplicated navigation keys and repaired the sidebar configuration |
| React render purity/immutability/manual memoization | 3 total | Removed render-time randomness, avoided state mutation, and corrected the memoization dependency contract |
| Parser errors | 2 | Repaired malformed active `Sidebar.jsx`; the other was in historical `App.backup.jsx`, which remains preserved and is excluded from lint |
| Hook dependency warnings | 6 | Stabilized fallback data and corrected effect/memo dependencies |
| Stale `no-console` suppression warnings | 4 | Removed unused directives from active route code; the remaining occurrence is in an ignored historical backup |

The ESLint config ignores `dist`, coverage, and reviewed historical backup patterns. It does not globally disable rules. Accessibility and floating-promise rules are not present in the configured rule set, so their zero reported findings are **not** an accessibility or promise-safety audit.

## Phase C — Backend dependency vulnerability register

Fresh audit before changes: **17 findings** (2 critical, 10 high, 5 moderate); all were in the production dependency graph. Current `npm audit`: **0 findings**. The advisory IDs below are the IDs reported by npm for the Phase A/B lockfile.

| Package | Installed → resolved | Vulnerable range / severity | Advisory IDs | Original dependency path | Scope and disposition |
|---|---|---|---|---|---|
| `@mapbox/node-pre-gyp` | 1.0.11 → removed | `<=1.0.11`, high | Inherited from the `tar` advisories listed below | `bcrypt 5.1.1 → @mapbox/node-pre-gyp 1.0.11 → tar 6.2.1` | Production; removed with bcrypt 5 |
| `bcrypt` | 5.1.1 → 6.0.0 | `5.0.1–5.1.1`, high | Inherited from the vulnerable node-pre-gyp/tar path | Root direct dependency | Production; major update. Source only calls `hash` and `compare`; a hash/compare smoke check passed |
| `body-parser` | 1.20.4 → 1.20.9 | `<=1.20.8`, high | GHSA-v422-hmwv-36x6, GHSA-27r3-jxmh-p828 | `express 4.22.1 → body-parser` | Production; patched within the Express-compatible 1.20 line |
| `brace-expansion` | 1.1.12 → vulnerable copy removed | `<=1.1.20`, high | GHSA-f886-m6hf-6m8v, GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895, GHSA-q2hr-2g5m-vwhr, GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p | `bcrypt → @mapbox/node-pre-gyp → rimraf → glob → minimatch → brace-expansion` | Production path removed with bcrypt 5; the unrelated ESLint `brace-expansion` 5.x copy is outside the affected range |
| `bullmq` | 5.70.4 → 5.81.6 | `1.0.1–5.58.5` or `5.66.1–5.76.1`, moderate | GHSA-w5hq-g745-h8pq via its UUID dependency | Root direct dependency → BullMQ’s UUID path | Production; updated within major 5; no vulnerable UUID finding remains |
| `express-rate-limit` | 8.3.1 → 8.7.5 | `8.0.1–8.5.0`, moderate | Inherited from the `ip-address` advisories below | Root direct dependency → `ip-address 10.1.0` | Production; updated within major 8 |
| `ip-address` | 10.1.0 → 10.7.6 | `<=10.7.3`, high | GHSA-v2v4-37r5-5v8g, GHSA-mwp4-54f8-5fhr, GHSA-rpw4-54j3-4h4q, GHSA-j6r3-76f7-8jcv, GHSA-h3mg-xc3c-68pw, GHSA-rxp7-6hxx-x8q5 | `express-rate-limit 8.3.1 → ip-address` | Production; compatible transitive update |
| `morgan` | 1.10.1 → 1.12.1 | `<=1.12.0`, moderate | GHSA-4vj7-5mj6-jm8m, GHSA-jxfw-x594-9x9m, GHSA-9f6g-j8ch-79g4 | Root direct dependency | Production; compatible 1.x update |
| `multer` | 2.1.1 → 2.5.0 | `<=2.4.0`, high | GHSA-72gw-mp4g-v24j, GHSA-3p4h-7m6x-2hcm, GHSA-wc9g-mqfw-jrwm, GHSA-qvfw-j98x-7q72, GHSA-535w-7cp7-47q4, GHSA-q7qp-rjg7-q26m | Root direct dependency | Production; compatible 2.x update |
| `nodemailer` | 8.0.9 → removed | `<=10.1.3`, high | GHSA-p6gq-j5cr-w38f, GHSA-8m3c-c648-2xjj, GHSA-wmmp-3585-3rmp, GHSA-2x7j-588g-ccc2, GHSA-cc9r-2j5m-2m83, GHSA-6vj9-mwq6-2f5v, GHSA-8vvx-rff5-p5rq, GHSA-v53p-9fqp-m79j, GHSA-39m8-27wv-hr27, GHSA-8c8m-p3m8-cjg8, GHSA-m943-m63m-w62w, GHSA-85x2-q946-cp5h, GHSA-4ffr-jq9g-5ffx, GHSA-g73g-hqqh-jr95, GHSA-4g23-2xm8-66gc | Root direct dependency | Production; removed after confirming there were no imports/usages in `src`, `test`, or `tools` |
| `path-to-regexp` | 0.1.12 → 0.1.13 | `<0.1.13`, high | GHSA-37ch-88jc-xwx2 | `express → path-to-regexp` | Production; compatible patch update |
| `proxy-addr` | 2.0.7 → 2.0.8 | `1.1.0–2.0.7`, critical | GHSA-jqcg-44mw-7w3h | `express → proxy-addr` | Production; patched compatible 2.x update |
| `qs` | 6.14.2 → 6.17.1 | `2.2.5–6.16.0`, moderate | GHSA-q8mj-m7cp-5q26, GHSA-x5fp-wj9c-mxmx, GHSA-4mjr-xmp4-gh2g, GHSA-6pq8-jhm2-2vcw | `express` and `body-parser` both pinned to older `~6.14` ranges | Production; narrow npm override to patched qs 6.x |
| `tar` | 6.2.1 → removed | `<=7.5.20`, critical | GHSA-34x7-hfp2-rc4v, GHSA-8qq5-rm4j-mr97, GHSA-83g3-92jg-28cx, GHSA-qffp-2rhf-9h96, GHSA-9ppj-qmqm-q256, GHSA-r6q2-hw4h-h46w, GHSA-vmf3-w455-68vh, GHSA-w8wr-v893-vjvp, GHSA-23hp-3jrh-7fpw, GHSA-8x88-c5mf-7j5w, GHSA-gvwx-54wh-qm9j, GHSA-r292-9mhp-454m | `bcrypt 5.1.1 → @mapbox/node-pre-gyp → tar` | Production; vulnerable path removed with bcrypt 5 |
| `uuid` | 9.0.1 direct / 11.1.0 under BullMQ → removed from vulnerable graph | `<11.1.1`, moderate | GHSA-w5hq-g745-h8pq | Root direct dependency and `BullMQ → uuid` | Production; removed unused root dependency and updated BullMQ; no UUID audit finding remains |
| `ws` | 8.19.0 → 8.23.0 | `8.0.0–8.20.1`, high | GHSA-58qx-3vcg-4xpx, GHSA-96hv-2xvq-fx4p | `@supabase/supabase-js → @supabase/realtime-js → ws` | Production; compatible 8.x update |
| `zod` | 4.3.6 → 4.6.7 | `<4.6.6`, high | GHSA-mrhx-c7xc-m3w5 | Root direct dependency | Production; compatible 4.x update |

## Phase C — Frontend dependency vulnerability register

Fresh audit against the Phase A/B lockfile: **15 findings** (1 critical, 9 high, 5 moderate), of which npm classified 10 in the production graph and 5 as development-only. The earlier count of 10 predates this fresh audit. Current `npm audit`: **0 findings**.

| Package | Installed → resolved | Vulnerable range / severity | Advisory IDs | Original dependency path | Scope and disposition |
|---|---|---|---|---|---|
| `@vitejs/plugin-react` | 4.3.1 → 4.7.0 | `2.0.0-alpha.0–4.3.3`, moderate | Inherited through the Vite findings below | Root dev dependency; peer Vite 5.4.21 | Development; upgraded within plugin major 4 |
| `axios` | 1.16.1 → 1.21.1 | `1.0.0–1.19.0`, high | GHSA-xj6q-8x83-jv6g, GHSA-mmx7-hfxf-jppx, GHSA-pmv8-rq9r-6j72, GHSA-mwf2-3pr3-8698, GHSA-gcfj-64vw-6mp9, GHSA-7q8q-rj6j-mhjq, GHSA-jqh4-m9w3-8hp9, GHSA-f4gw-2p7v-4548, GHSA-42h9-826w-cgv3, GHSA-hcpx-6fm6-wx23, GHSA-vh66-26gq-q6x8, GHSA-9fr6-4gfg-395g, GHSA-c29m-xwm3-cm6r, GHSA-mghh-pgcx-3jjj, GHSA-x97p-jq2g-jp4f, GHSA-3pq3-5fj3-cg6v, GHSA-542g-h47m-68v8, GHSA-j8rh-479h-cp32, GHSA-4hqw-qxg8-jxx2, GHSA-m8m8-qj5v-23w3, GHSA-44g4-m2mj-wpvx | Root direct dependency; also brings `follow-redirects` and `form-data` | Production; compatible Axios 1.x update |
| `baseline-browser-mapping` | 2.10.32 → 2.11.39 | `>=2.0.0 <2.11.0`, moderate | GHSA-w5vr-8v7q-w6rv | `@vitejs/plugin-react → Babel → browserslist → baseline-browser-mapping`; also Autoprefixer → browserslist | Development; compatible transitive update |
| `browserslist` | 4.28.2 → 4.29.6 | `<=4.28.6`, high | GHSA-c83g-rgw3-j3cx, GHSA-73wf-gq98-2v4g | Babel/plugin-react and Autoprefixer build paths | Development; compatible 4.x update |
| `esbuild` | 0.21.5 → 0.25.12 | `<=0.24.2`, moderate | GHSA-67mh-4wv8-2f99 | `vite 5.4.21 → esbuild` | Development; Vite 6 resolves patched esbuild 0.25 |
| `follow-redirects` | 1.16.0 → 1.16.3 | `1.16.0–1.16.1`, high | GHSA-q3jh-wrc6-jgq8, GHSA-8r9p-f939-6h3c, GHSA-mrwp-f3q8-3g9p | `axios → follow-redirects` | Production; patched transitive version |
| `form-data` | 4.0.5 → 4.0.6 | `4.0.0–4.0.5`, high | GHSA-hmw2-7cc7-3qxx | `axios → form-data` | Production; patched transitive version |
| `nanoid` | 3.3.12 → 3.3.20 | `<=3.3.17`, high | GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8 | `postcss → nanoid` | Production graph; compatible 3.x update |
| `postcss` | 8.5.15 → 8.5.33 | `<=8.5.22`, high | GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849 | Direct dev dependency; also reachable through build tooling | npm audit `--omit=dev` included this node in the audited production graph; patched 8.x update |
| `postcss-selector-parser` | 6.1.2 → 6.1.6 | `<=6.1.4`, moderate | GHSA-w9m9-85wc-3x92, GHSA-rj75-hqrm-r3gf | `tailwindcss → postcss-nested → postcss-selector-parser` | Production graph; compatible 6.x update |
| `react-router` | 7.15.1 → 7.18.6 | `6.0.0–7.18.1`, high | GHSA-wrjc-x8rr-h8h6, GHSA-h8fp-f39c-q6mh, GHSA-337j-9hxr-rhxg, GHSA-chx6-hx7r-mcp5, GHSA-qwww-vcr4-c8h2 | `react-router-dom → react-router` | Production; kept major 7 |
| `react-router-dom` | 7.15.1 → 7.18.6 | `6.0.0-alpha.0–7.17.0`, moderate | Inherited from the React Router advisories above | Root direct dependency → `react-router` | Production; kept major 7 |
| `seroval` | 1.5.4 → 1.8.2 | `<=1.6.7`, critical | GHSA-p6vx-979v-rg4c, GHSA-jp82-f5mq-hwhp, GHSA-97r2-qh9m-474h, GHSA-wp97-x4hv-qvhp, GHSA-7rv5-mrxv-xcr9 | `@tanstack/react-router → @tanstack/router-core → seroval` | Production; compatible 1.x transitive update |
| `source-map-js` | 1.2.1 → 1.2.4 | `1.0.0–1.2.1`, high | GHSA-68fv-2mgg-jv7q | PostCSS source-map dependency path | Production graph; patched transitive version |
| `vite` | 5.4.21 → 6.4.6 | `<=6.4.3`, high | GHSA-4w7w-66w2-5vf9, GHSA-v6wh-96g9-6wx3, GHSA-698v-4r3x-3vcv, GHSA-r825-w8mm-5pxw, GHSA-587h-7wmj-h5pm, GHSA-9jrq-w75r-8gcw, GHSA-rq7h-c2jc-7f22, GHSA-fx2h-pf6j-xcff; also GHSA-67mh-4wv8-2f99 through esbuild | Root dev dependency; plugin-react peer Vite; Vite depended on vulnerable esbuild 0.21.5 | Development; major 5→6 after config/peer/Node compatibility review |

## Package and lockfile changes

| Project | Manifest changes | Lockfile result |
|---|---|---|
| Backend | Updated bcrypt, BullMQ, express-rate-limit, Morgan, Multer, and Zod within analyzed ranges; removed unused Nodemailer and direct UUID; added a narrow `qs` 6.x override | `visa-matrix-backend/backend/package-lock.json`; 0 audit findings |
| Frontend | Updated Axios and React Router within their existing majors; moved Vite 5→6 and updated `@vitejs/plugin-react`; updated PostCSS | `visa-matrix-frontend/visa-matrix-frontend/package-lock.json`; 0 audit findings |
| NEXUS | No dependency changes | Existing `pnpm-lock.yaml` retained; frozen install reported up to date |

Compatibility notes:

- Backend code calls only `bcrypt.hash` and `bcrypt.compare`. A synthetic password hash/compare smoke check passed on the installed runtime. The [bcrypt project compatibility notes](https://github.com/kelektiv/node.bcrypt.js#version-compatibility) list Node 18+ support for bcrypt 6 and continued compatibility with older bcrypt hashes.
- Frontend Vite config uses the standard React plugin and path aliases; it does not set custom `resolve.conditions`, Sass legacy APIs, or Vite runtime APIs. The [Vite 6 migration guide](https://v6.vite.dev/guide/migration) describes the release as avoiding most breaking changes and identifies the custom conditions and low-level APIs needing attention. The [React plugin changelog](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md) records Vite 6 peer support in plugin-react 4.3.4. Node 24.22.3 exceeds Vite 6’s supported Node versions.
- The direct Nodemailer package had no source/test/tool imports. The direct `uuid` package had no package imports; `.uuid()` occurrences are Zod validators. Both were removed instead of changing business behavior.
- The only override is `qs: ^6.17.1`, because Express and body-parser declared older `~6.14` ranges. Runtime paths were unchanged and backend regression passed.

## Phase D — Regression results

| Project/check | Result |
|---|---|
| NEXUS typecheck (`pnpm@11.17.0`, Node 24.22.3) | Passed: app and test TypeScript configs |
| NEXUS full test suite | Passed: 60 files, 199 tests |
| NEXUS connector files (`visa-matrix-backend.test.ts`, `connectors.test.ts`) | Passed: 2 files, 63 tests |
| Backend lint | Passed: 0 errors, 0 warnings |
| Backend tests | Passed: 16 tests |
| Backend build check | Passed: syntax checked 239 JavaScript files |
| Backend npm audit | Passed: 0 vulnerabilities |
| Frontend typecheck | Passed: 0 diagnostics |
| Frontend lint | Passed: 0 errors, 0 warnings |
| Frontend tests | Passed: 3 tests |
| Frontend Vite production build | Passed: 2,875 modules transformed; 1,500.66 kB JS (437.08 kB gzip) |
| Frontend npm audit | Passed: 0 vulnerabilities |

Backend test coverage includes NEXUS internal-token/bearer-token and permission-middleware checks, tenant-context fail-closed checks, and audit redaction. The NEXUS suite also includes connector and storage abstractions.

**Not covered by existing automated backend tests:** document authorization through the owning application/organization, invoice routes/business logic, and payment routes/business logic. The backend currently has two test files (`test/nexus-routes.test.js` and `tests/integration-boundary.test.js`); neither contains dedicated document, invoice, or payment cases. The complete employee-to-payment workflow against a staging Supabase project was not run. Frontend test logs also report the Supabase URL/key as missing; no values were printed and no live Supabase calls were made.

## Remaining issues and readiness

- Dependency security gate: **passes**. Both current npm audits are at zero, including zero critical/high findings.
- Frontend static quality: **passes**. Typecheck and lint have no remaining diagnostics/findings.
- Build warning: the frontend bundle still exceeds Vite’s 500 kB chunk warning threshold. The build succeeds; code splitting was not changed in this dependency phase.
- Test coverage: **incomplete for production workflow sign-off**. Add/execute dedicated document-access and invoice/payment tests, then run authorized end-to-end coverage against a non-production Supabase environment.
- Clean reinstall check: `npm ci` in the active worktree was blocked by Windows `EPERM` while removing native esbuild/msgpackr files held by long-running Vite/Node processes. Those processes were left running. `npm install` restored both dependency trees from their lockfiles; audits and all regression checks passed afterward. A clean `npm ci` should be retried after the active development processes are stopped.
- Database/production: no migrations were applied and no live database was changed.

**Readiness assessment:** Dependency and frontend quality gates are green. Do not certify the complete Visa Matrix ERP production workflow yet: document access and invoice/payment behavior still lack dedicated regression coverage, and the staging end-to-end workflow remains unverified. No current critical dependency advisory remains in either npm audit.

## Fixed-file inventory

Frontend source/type/lint checkpoint `bfbb911` (73 files):

- Config and dependency files: `eslint.config.js` (removed), `eslint.config.mjs`, `package.json`, `package-lock.json`, `tsconfig.json`.
- Pages: `src/Pages/Admin.jsx`, `ApplicationDetail.jsx`, `Applications.jsx`, `CRM.jsx`, `Countries.jsx`, `HREmployeesWorkspace.jsx`, `HRRolesPermissionsWorkspace.jsx`.
- Components/context/hooks/data/services: `src/assets.d.ts`, `src/components/ApplicationForm.jsx`, `ProtectedRoute.jsx`, `Sidebar.jsx`, `TopNavbar.jsx`, `src/context/AuthContext.jsx`, `src/data/navigation.js` (removed), `src/enhancements/components/DashboardEnhancements.jsx`, `src/features/hr/hooks/useHrResource.js`, `src/hooks/use-mobile.js`, `src/services/application.service.js`, `src/services/documents.service.js`.
- Applicant workspace: `src/loveable/components/applicant-workspace/ApplicantActivity.tsx`, `ApplicantDocuments.tsx`, `ApplicantFormResponses.tsx`, `ApplicantHeader.tsx`, `ApplicantNotes.tsx`, `ApplicantPayments.tsx`, `ApplicantTabs.tsx`, `ApplicantTimeline.tsx`, `ApplicantWorkspace.tsx`, and `hooks/useApplicant.ts`.
- Applications and shared UI: `src/loveable/components/applications/ApplicationCreateDialog.tsx`, `ApplicationProfileModal.tsx`, `src/loveable/components/common/DataTable.tsx`, `src/loveable/components/dashboard/ActivityFeed.tsx`, `src/loveable/components/forms/DynamicVisaApplicationForm.tsx`, `src/loveable/components/layout/Breadcrumbs.tsx`, `NotificationCenter.tsx`, `src/loveable/components/profiles/ProfileDetailPage.tsx`, `src/loveable/components/ui/carousel.tsx`, `chart.tsx`, `sidebar.tsx`.
- Router, libraries, and routes: `src/loveable/hooks/use-mobile.tsx`, `src/loveable/lib/api-record.ts`, `auth.tsx`, `mock-data.ts`, `nav-config.ts`, `src/loveable/routeTree.gen.ts`, `router.tsx`, `src/loveable/routes/_app.countries.tsx`, `_app.crm.customers.tsx`, `_app.dashboard.crm.tsx`, `_app.dashboard.employee.tsx`, `_app.dashboard.finance.tsx`, `_app.dashboard.hr.tsx`, `_app.dashboard.tsx`, `_app.email.tsx`, `_app.finance.invoices.$id.tsx`, `_app.finance.invoices.tsx`, `_app.hr.leave.tsx`, `_app.hr.payroll.tsx`, `_app.reports.tsx`, `_app.settings.users.tsx`, `_app.visa.applications.$id.tsx`, `_app.visa.applications.new.tsx`, `_app.visa.applications.tsx`, `_app.visa.approvals.tsx`, `login.tsx`, `src/loveable/services/profile-detail.service.ts`, `src/loveable/types/dashboard.ts`.
- Dependency-security checkpoints: `visa-matrix-backend/backend/package.json`, `visa-matrix-backend/backend/package-lock.json`, `visa-matrix-frontend/visa-matrix-frontend/package.json`, `visa-matrix-frontend/visa-matrix-frontend/package-lock.json`.
- This report: `PHASE2_QUALITY_SECURITY_REPORT.md`.
