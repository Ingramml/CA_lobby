# PR Deployment Error Remediation Plan

**Project:** CA Lobby Search System  
**Repository:** Ingramml/CA_lobby  
**Date:** March 2, 2026  
**Scope:** Open PR deployment failures (Vercel checks)

## 1) Objective
Resolve current pull request deployment failures and restore predictable green checks for dependency/security PRs.

## 2) Current Findings
- 9 open Dependabot PRs are active (#1, #4, #5, #7, #8, #9, #10, #13, #14).
- Failing checks are Vercel deployments (`ca-lobby-1`, `ca-lobby-deploy`) rather than local CRA build failures.
- Local baseline build succeeds with warnings (`npm ci` + `npm run build`).
- Most failing PRs modify lockfile only; one PR also modifies package metadata.

## 3) Root-Cause Hypothesis (Ranked)
1. **Vercel project configuration drift** between `ca-lobby-1` and `ca-lobby-deploy`.
2. **Preview environment variable gaps** (especially Clerk-related variables).
3. **Project linkage mismatch** (Git branch/project mapping inconsistency).
4. **Secondary dependency regression** in select PRs (lower probability due local build pass).

## 4) Execution Plan

### Phase A — Platform Configuration Stabilization
1. Compare both Vercel projects side-by-side:
   - Root directory
   - Framework preset
   - Install/build commands
   - Node.js version
   - Ignored build step
   - Git branch settings
2. Normalize settings so both projects use the same verified frontend build profile.
3. Confirm required environment variables exist for **Preview + Production** in both projects.

**Exit Criteria:** A manual redeploy of the current branch succeeds on both projects.

### Phase B — Canary PR Validation
1. Use PR #14 as canary.
2. Re-run failed checks without changing code.
3. Capture pass/fail outcomes and deployment URLs.

**Exit Criteria:** PR #14 has green deployment checks on both Vercel contexts.

### Phase C — Batch PR Recovery
1. Re-run checks for lockfile-only PRs first: #13, #10, #9, #8, #7, #5, #1.
2. Handle mixed-change PR (#4) after lockfile-only group.
3. Merge only PRs with full green checks.

**Exit Criteria:** All safe dependency PRs merged or explicitly deferred with reason.

### Phase D — Pipeline Hardening
1. Add a PR CI workflow for local build verification:
   - `npm ci`
   - `npm run build`
2. Keep Vercel checks as deployment validation, not sole build signal.
3. Document Vercel config baseline in deployment docs.

**Exit Criteria:** New PRs show both CI build status and Vercel deployment status.

## 5) Priority Order
- **P0:** Fix Vercel settings/env parity.
- **P0:** Validate canary PR check rerun.
- **P1:** Batch unstick Dependabot PRs.
- **P1:** Add CI build gate.
- **P0 Security:** Rotate/remove exposed secret values from repository docs and update secure references.

## 6) Risks & Mitigations
- **Risk:** Hidden Vercel account/project permissions issue.  
  **Mitigation:** Use one owner account to normalize both projects, then re-test.
- **Risk:** Secret mismatch in Preview only.  
  **Mitigation:** Explicitly set envs in all environments (Development/Preview/Production).
- **Risk:** One dependency PR introduces runtime issue despite successful build.  
  **Mitigation:** Merge sequentially and verify app health endpoint/post-merge preview.

## 7) Deliverables
- Vercel settings parity checklist completed.
- Canary PR deployment checks green.
- Open dependency PRs triaged/merged with status table.
- CI build workflow added.
- Deployment docs updated with stable baseline.

## 8) Definition of Done
- Deployment checks pass consistently for new dependency PRs.
- No repeated Vercel failure pattern across lockfile-only updates.
- Clear documented runbook exists for future PR deployment incidents.
