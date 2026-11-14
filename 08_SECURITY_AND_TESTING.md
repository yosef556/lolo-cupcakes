# Lolo Cupcakes --- Security and Testing Plan

## Authentication and Authorization

-   Optional customer accounts; guest checkout remains available.
-   Staff/admin accounts require secure authentication.
-   Enforce roles and permissions on backend endpoints.
-   Prevent privilege escalation and mass assignment.
-   Use secure password hashing if password login is implemented.
-   Define session/token storage and CSRF/CORS policy consistently.

## Input and File Security

-   Server-side validation for every request.
-   Encode output and prevent XSS.
-   Use parameterized database access.
-   Validate upload size, extension, actual file signature, and allowed
    image formats.
-   Randomize object keys; never use user filename as storage key.
-   Keep payment proof and sensitive custom images private.
-   Restrict upload and download authorization.
-   Scan uploads where operationally available.

## Abuse Protection

-   Rate limit login, account recovery, checkout, custom requests, and
    tracking.
-   Add idempotency for order creation.
-   Avoid exposing sequential identifiers.
-   Avoid leaking whether a phone number or account exists.
-   Prevent repeated quote acceptance and payment review actions.

## Business Integrity

-   Recalculate all totals on backend.
-   Database transaction for order placement and capacity reservation.
-   Concurrency tests for last available slot.
-   State transition validation.
-   Audit all sensitive admin actions.
-   No direct client updates to payment/order status.

## Testing Layers

### Unit

Pricing, option compatibility, coupon rules, delivery fee, state
transitions, quote expiry, scheduling.

### Integration

Repositories, transactions, migrations, authorization, payment proof
workflow, order creation.

### Concurrency

Two simultaneous checkouts competing for final capacity; duplicate
request retries; repeated quote acceptance.

### End-to-End

-   Guest order with pickup and cash.
-   Guest order with delivery and cash.
-   Guest order with manual transfer and proof review.
-   Standard customized cake order.
-   Special cake request -\> quote -\> acceptance.
-   Admin product creation/update.
-   Admin order lifecycle.
-   Unauthorized access attempts.

### UI / Accessibility

-   Mobile and desktop.
-   Arabic RTL.
-   Keyboard-only navigation.
-   Empty/loading/error states.
-   Long names and Arabic content.
-   Broken image and slow network.

## Release Gate

Do not declare production-ready until: - All critical flows pass. - No
known critical/high security issue remains. - Migrations work from an
empty database and from the previous release. - Backups and restore are
tested. - Secrets are externalized. - Production environment variables
and domain/HTTPS are configured. - Admin owner account is provisioned
securely.
