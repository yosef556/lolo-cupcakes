# Lolo Cupcakes --- API Specification (Contract Blueprint)

## Conventions

-   Base path: `/api/v1`.
-   JSON request/response.
-   Stable error envelope with `code`, `message`, optional
    `fieldErrors`, and `traceId`.
-   Pagination uses `page`, `size`, and explicit sort allowlists.
-   Use DTOs; never serialize JPA entities directly.
-   Validate all input server-side.
-   Monetary values are decimal strings or JSON numbers with documented
    precision; never use floating-point arithmetic for money.
-   Do not expose internal IDs where public opaque identifiers are more
    appropriate.

## Public Catalog

-   `GET /categories`
-   `GET /products`
-   `GET /products/{slug}`
-   `GET /products/{slug}/available-options`
-   `GET /storefront/home`

Support filtering by category, product type, availability, and search
query. Validate sort fields.

## Cart

-   `POST /carts`
-   `GET /carts/{cartToken}`
-   `POST /carts/{cartToken}/items`
-   `PATCH /carts/{cartToken}/items/{itemId}`
-   `DELETE /carts/{cartToken}/items/{itemId}`
-   `POST /carts/{cartToken}/validate`

The cart API may return indicative pricing, but checkout always
recalculates.

## Checkout and Orders

-   `POST /checkout/quote`: validate cart, fulfillment, slot, and return
    authoritative price quote.
-   `POST /orders`: submit order with idempotency key.
-   `GET /orders/{publicOrderNumber}/tracking`: protected by secure
    token or phone verification.
-   `POST /orders/{publicOrderNumber}/tracking/verify`: only if an
    OTP/verification flow is configured.

Do not allow public access by predictable order number alone.

## Custom Cake Requests

-   `POST /custom-cake-requests`
-   `GET /custom-cake-requests/{publicReference}` with secure access
    control.
-   Admin: `GET /admin/custom-cake-requests`
-   Admin: `POST /admin/custom-cake-requests/{id}/quotes`
-   Customer: `POST /quotes/{publicReference}/accept`
-   Customer: `POST /quotes/{publicReference}/decline`

Quote acceptance must check expiry and quote status and must not be
replayable.

## Scheduling and Fulfillment

-   `GET /availability/slots?date=...&fulfillmentType=...`
-   Admin CRUD for business hours, closures, slots, capacity, and
    delivery zones.
-   `GET /delivery-zones` returns only public, active zones and relevant
    fee/minimum information.

Availability shown to a customer is advisory; reserve capacity
atomically when creating the order.

## Payments

-   `GET /payment-instructions`
-   `POST /orders/{publicOrderNumber}/manual-payment-proofs`
-   Admin: `GET /admin/payments`
-   Admin: `POST /admin/payments/{id}/approve`
-   Admin: `POST /admin/payments/{id}/reject`

Proof upload uses pre-signed private upload or a controlled upload
endpoint. Approve/reject requires permission and audit record.

## Customer Account

-   `POST /auth/register`
-   `POST /auth/login`
-   `POST /auth/logout`
-   `GET /me`
-   `GET /me/orders`
-   `GET /me/addresses`
-   CRUD addresses and profile as appropriate.

Guest orders can be linked to an account only after a secure
ownership-verification process.

## Admin

-   `/admin/dashboard`
-   `/admin/products`
-   `/admin/categories`
-   `/admin/orders`
-   `/admin/customers`
-   `/admin/promotions`
-   `/admin/content`
-   `/admin/settings`
-   `/admin/staff`
-   `/admin/audit-logs`

All admin endpoints require backend authorization. Add endpoint-level
permission rules.

## API Contract Rules

-   Document all request/response DTOs and error cases in OpenAPI.
-   Use consistent enum naming and state transition validation.
-   Do not trust client totals, discounts, delivery fees, payment
    statuses, or order statuses.
-   Use idempotency for order creation and any non-repeatable payment
    actions.
-   Avoid leaking customer PII in logs.
-   Add integration tests for concurrent checkout, capacity, quote
    acceptance, and payment review.
