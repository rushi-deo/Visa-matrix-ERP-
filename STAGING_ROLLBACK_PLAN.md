# Staging Rollback Plan

**Status:** Prepared only. No staging or production changes were made, so no rollback is currently required.

## Safety boundary

- This plan applies only to staging project `rsvlxzespfidejaqisng`, after confirming its identity in the Supabase Dashboard.
- Production project `hnanyyimuvdfxyjjgwbd` is out of scope.
- Do not use `supabase db reset`, `supabase migration repair`, destructive SQL, table drops, or truncation as a rollback strategy.
- Do not copy production data into staging. Use synthetic staging data only.

## Before an approved staging migration

1. Resolve the migration-order, duplicate-version, schema, RLS, grants, and storage blockers in `STAGING_MIGRATION_PLAN.md`.
2. Have the database owner classify each migration as additive, data-changing, or destructive and document its migration-specific recovery.
3. Confirm the staging project's backup/snapshot capability, retention, and a tested restore procedure. These capabilities were not verified.
4. Take and verify a staging-only recovery point immediately before the approved change. Do not store credentials or customer data in this repository.
5. Save the exact CLI dry-run output and verify it targets `rsvlxzespfidejaqisng`. Stop if the target or planned migrations differ from approval.

## If a migration fails or staging behaves incorrectly

1. Stop further migrations and application writes that could compound the issue. Do not automatically retry.
2. Preserve the exact error and CLI output after removing credentials and personal data.
3. Check staging project identity and migration history with a read-only migration-list operation. Do not repair or edit the migration ledger to force consistency.
4. Have the database owner compare the resulting staging schema with the approved plan. Some earlier migrations may have succeeded even if a later migration failed.
5. Prefer a reviewed forward corrective migration when the state is understood and safe. For irrecoverable staging-only changes, restore the verified staging recovery point using the provider's documented procedure and explicit approval.
6. Re-run the staging validation checklist and synthetic workflows before resuming.

## Rollback limitations

The current migration set has not been shown to be transactionally atomic or reversible as a whole. It contains row backfills, ownership quarantine, constraint and trigger replacement, RLS/grant changes, and storage visibility changes. Reversing these by dropping columns, restoring public access, or deleting data could cause loss or re-exposure. Therefore:

- No generic down-migration or rollback SQL is prepared.
- Do not infer that a failed `db push` left staging unchanged.
- Do not make a blanket rollback from the filename order.
- A restore point is not considered usable until its restoration has been tested on staging or an equivalent disposable project.

No Supabase migration, repair, reset, restore, or deployment command was executed for this task.
