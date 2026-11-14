# AGENTS.md --- Lolo Cupcakes

## Project Source of Truth

Read these files before implementation: 1. `01_PRD.md` 2.
`02_BRAND_GUIDELINES.md` 3. `03_ARCHITECTURE.md` 4.
`04_DATABASE_DESIGN.md` 5. `05_API_SPECIFICATION.md` 6.
`06_UI_UX_SPECIFICATION.md` 7. `07_BUSINESS_RULES.md` 8.
`08_SECURITY_AND_TESTING.md` 9. `09_IMPLEMENTATION_PLAN.md`

If documents conflict, report the conflict. Do not silently choose a
different requirement.

## Non-Negotiable Rules

-   Brand name is Lolo Cupcakes.
-   Arabic-first and correct RTL.
-   Delivery and pickup are supported.
-   Guest checkout is default; customer account is optional.
-   MVP payments are cash and manually verified transfer.
-   One branch at launch; design for future expansion without building
    multi-branch operations now.
-   Modular monolith: Next.js + TypeScript frontend, Java 21 Spring Boot
    backend, PostgreSQL.
-   Flyway owns schema migrations.
-   Backend is authoritative for pricing, availability, capacity, order
    state, and payment state.
-   No microservices, Kafka, Redis, or Kubernetes in MVP without
    explicit approval.
-   Never hardcode unknown business data.

## Engineering Standards

-   Use clear naming and feature-oriented packages.
-   Keep controllers thin.
-   Put business rules in application/domain services.
-   Use DTOs; do not expose persistence entities.
-   Validate input at API boundaries and in domain operations.
-   Use database constraints for invariants.
-   Use transactions for order creation and capacity reservation.
-   Use idempotency for order submission.
-   Use decimal-safe monetary calculations.
-   Keep secrets out of source control.
-   Avoid unnecessary abstractions and dependencies.
-   Add tests for every important business rule.
-   Keep documentation and OpenAPI in sync.

## Frontend Standards

-   Responsive and mobile-first.
-   RTL must be correct, not merely text-aligned right.
-   Use centralized design tokens.
-   Provide loading, empty, error, and success states.
-   Do not calculate authoritative totals only in frontend.
-   Use accessible semantic components.
-   Do not use placeholder product photos as if they were real Lolo
    products.

## Security Standards

-   Enforce authorization on backend.
-   Protect customer PII and private uploads.
-   Never expose payment proof through public object URLs.
-   Do not trust client-supplied price, discount, payment status, or
    order status.
-   Do not expose stack traces or secrets in API responses/logs.
-   Add audit records for sensitive admin operations.

## Execution Protocol

For each phase: 1. Read relevant requirements. 2. Inspect existing code
before editing. 3. State a short implementation plan and assumptions. 4.
Implement only the approved phase scope. 5. Run formatting,
compile/build, unit/integration tests available. 6. Fix regressions. 7.
Summarize changed files, test evidence, unresolved decisions, and risks.
8. Stop at the phase boundary and wait for approval before starting the
next phase.
