# CropCare — Documentation Index & Governance

## Purpose of This Directory

This `/architecture` directory is the **single source of truth** for the CropCare project. It exists *before* any production code is written, and it must stay synchronized with the codebase for the life of the project.

## Rule for Any AI Coding Agent (Kiro or otherwise)

> **Before generating, modifying, or refactoring any code, read the relevant document(s) in this directory first.** If a requirement, screen, table, or endpoint is not described here, do not invent it — flag it as a documentation gap and propose an update to the appropriate `.md` file before writing code. If code and documentation ever disagree, the documentation wins until deliberately updated.

## Document Map

| File | Purpose | Read this before... |
|---|---|---|
| `01_PRD.md` | Product Requirements — what we're building and why | Any feature discussion |
| `02_TRD.md` | Technical Requirements — the exact (free) tech stack and constraints | Choosing a library, service, or hosting provider |
| `03_App_Flow.md` | End-to-end user journeys, screen-to-screen | Building navigation or a new flow |
| `04_UI_UX_Spec.md` | Screen-by-screen UI spec, design tokens, states | Building any screen or component |
| `05_Database.md` | Schema, tables, relationships | Writing any query, model, or migration |
| `06_API_Design.md` | REST API contract, request/response shapes | Writing any endpoint or API call |
| `07_Architecture.md` | System architecture, diagrams, security, deployment | Structuring folders, services, or infra |
| `08_Implementation_Plan.md` | Milestones, task sequencing, references back to all docs above | Planning what to build next |

## Current Project Phase

**Phase: Demo / MVP-in-progress.** Two deliberate simplifications are active right now and are called out explicitly wherever they apply in these docs:

1. **Authentication is simplified for demo purposes** — no OTP/SMS verification yet. See `02_TRD.md §Auth` and `06_API_Design.md §Auth` for the exact demo-auth contract, and the documented upgrade path to Firebase Phone Auth.
2. **100% free-tier tech stack** — every service selected in `02_TRD.md` has a $0 tier sufficient for development and demo usage. Any point where a free tier has a hard limit is explicitly flagged, along with the free upgrade path.

## Change Policy

- Any change to product scope → update `01_PRD.md` first.
- Any change to a screen → update `04_UI_UX_Spec.md` and `03_App_Flow.md` first.
- Any change to a table/column → update `05_Database.md` first.
- Any change to an endpoint → update `06_API_Design.md` first.
- Code review checklist item: *"Does this PR match the docs? If not, which was updated first?"*
