# Lolo Cupcakes --- Architecture

## Architecture Decision

Use a modular monolith: one Spring Boot deployable application with
feature-oriented modules and one PostgreSQL database. Keep module
boundaries explicit. Do not split into microservices for MVP.

## System Context

-   Next.js + TypeScript: customer storefront and admin UI.
-   Spring Boot Java 21: business rules, authentication, authorization,
    APIs.
-   PostgreSQL: transactional relational data.
-   S3-compatible object storage: product images and private
    payment/custom-request uploads.
-   Docker: reproducible local and production runtime.

## Backend Module Boundaries

Suggested modules: - identity: users, roles, permissions,
sessions/tokens. - customers: customer profile and addresses. - catalog:
categories, products, images, variants. - productconfiguration: options,
add-ons, pricing rules. - cart: cart and cart items. - orders: order
placement, lifecycle, snapshots. - customization: standard cake
configuration and special requests. - quotations: admin quotes and
customer acceptance. - scheduling: business hours, slots, capacity,
holidays. - payments: cash/manual transfer, proof review, refunds. -
fulfillment: delivery zones, pickup, delivery fees. - promotions:
coupons and promotional rules. - content: banners and static content. -
reviews: customer review and moderation. - administration: dashboard
queries, staff operations. - audit: security-sensitive business audit
events. - shared: carefully limited shared primitives.

Avoid creating a generic shared module that becomes a dumping ground.
Modules should own their entities, services, repositories, and API
contracts where practical.

## Frontend Structure

Use route groups or equivalent separation for: - public storefront. -
checkout and order tracking. - customer account. - admin dashboard.

Keep API access in typed client/service modules. Do not put business
pricing logic exclusively in the browser. Centralize design tokens and
reusable components.

## Data and Transaction Rules

-   UUID primary keys.
-   PostgreSQL NUMERIC for monetary values.
-   Explicit currency code (EGP).
-   Store instants in UTC; apply Africa/Cairo for business schedules and
    display.
-   Use optimistic or pessimistic locking where needed for slot capacity
    and inventory.
-   Order creation, price snapshotting, payment initialization, and
    capacity reservation must be transactionally consistent.
-   Use idempotency keys for order submission.
-   Add database constraints for uniqueness and valid references.
-   Use Flyway migrations only; never rely on Hibernate auto-update in
    production.

## Branch Readiness

Include branch identity in the relevant store/order/fulfillment model
only where it has clear business meaning. MVP has one configured branch.
Do not build multi-branch dashboards or complex branch permissions yet.
Avoid adding branch_id mechanically to every table without a
relationship rationale.

## Security

-   Backend authorization on every protected route.
-   Password hashing with a modern adaptive algorithm if password
    authentication is used.
-   Secure token/session handling.
-   Rate limiting for login, OTP if introduced, checkout, and tracking
    endpoints.
-   Private object storage for payment proof and sensitive uploads.
-   Validate file type, size, and content; do not trust filename or MIME
    header alone.
-   Secrets through environment variables or secret manager.
-   CORS and CSRF configuration must match the selected authentication
    strategy.
-   Audit sensitive admin operations.

## Observability and Operations

-   Structured logs with correlation/request IDs.
-   Health/readiness endpoints.
-   Error responses with stable codes and no stack traces to clients.
-   Database backup and restore test.
-   Staging environment before production.
-   Monitor application errors, database capacity, storage usage, and
    backup success.

## Explicitly Avoid in MVP

Microservices, Kubernetes, Kafka, Redis, distributed tracing
infrastructure, and unnecessary event-driven complexity. Add only when
measurable operational needs justify them.
