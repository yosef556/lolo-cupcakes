# Lolo Cupcakes --- Implementation Plan

## Working Method

Use Google Antigravity as an implementation assistant, not as an
autonomous one-shot code generator. It must inspect the repository, read
all project documents, propose a plan, implement one phase at a time,
run tests, and report evidence.

## Phase 0 --- Repository and Decisions

-   Inspect existing repository and tools.
-   Confirm frontend/backend structure and versions.
-   Create project conventions and AGENTS.md.
-   Identify unresolved business inputs.
-   Produce ERD and API contracts for review before coding core flows.

Exit criteria: architecture and domain model reviewed; no invented
business settings.

## Phase 1 --- Foundation

-   Create Next.js frontend and Spring Boot backend.
-   Configure PostgreSQL and Flyway.
-   Docker Compose for local development.
-   Health checks, environment configuration, structured errors.
-   OpenAPI.
-   CI checks and test setup.

Exit criteria: clean startup, migration from empty DB, basic automated
tests.

## Phase 2 --- Brand and Design System

-   Draft identity directions and request approval.
-   Implement tokens, typography, RTL layout, responsive shell.
-   Build shared components and storefront/admin layout.

Exit criteria: approved visual direction and responsive page shell.

## Phase 3 --- Catalog

-   Categories, products, images, variants, options, add-ons.
-   Public listing and detail APIs/pages.
-   Admin catalog management.

Exit criteria: admin can create/edit/publish products and storefront
displays them accurately.

## Phase 4 --- Cart and Pricing

-   Cart persistence for guest.
-   Option compatibility and server pricing.
-   Checkout quote endpoint.
-   Price snapshots.

Exit criteria: totals match server calculations; tampered client totals
are ignored.

## Phase 5 --- Scheduling and Fulfillment

-   Business hours, closures, slots, capacity.
-   Delivery zones and fees.
-   Pickup configuration.
-   Atomic capacity reservation.

Exit criteria: no overbooking under concurrency; delivery and pickup
rules pass tests.

## Phase 6 --- Orders and Payments

-   Guest checkout and optional accounts.
-   Order lifecycle and history.
-   Cash and manual transfer.
-   Private proof upload and admin review.
-   Idempotent order submission.

Exit criteria: full guest order flows pass E2E tests.

## Phase 7 --- Custom Cake Requests

-   Standard configuration.
-   Special request form and private reference image.
-   Admin quotation.
-   Customer quote acceptance/decline.

Exit criteria: quote lifecycle and expiry/replay protections pass.

## Phase 8 --- Admin Completion

-   Dashboard, customer view, promotions, content, staff permissions,
    reports, audit.
-   Responsive operational workflows.

Exit criteria: owner can operate store without developer intervention
for routine updates.

## Phase 9 --- Hardening and Launch

-   Security review.
-   Performance and accessibility.
-   SEO.
-   Backup/restore.
-   Staging and production deployment.
-   Owner training and launch checklist.

Exit criteria: release gates in SECURITY_AND_TESTING.md pass.

## Antigravity Rules

-   Do not implement all phases in one pass.
-   Do not silently change approved architecture.
-   Do not invent brand assets, prices, addresses, delivery zones,
    payment details, or policies.
-   If a decision is required, list the exact question and a safe
    default; continue only where reversible.
-   Keep code compiling and tests passing after each phase.
-   Provide files changed, commands run, test results, and remaining
    risks.
