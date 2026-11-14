# Lolo Cupcakes --- Database Design

## Design Principles

Relational PostgreSQL schema, UUID identifiers, NUMERIC monetary values,
explicit lifecycle states, historical snapshots, foreign keys, unique
constraints, and Flyway migrations.

This is a logical model to refine into an ERD and physical migrations.
Do not blindly create every table if a simpler normalized design
satisfies the requirements.

## Identity and Customers

-   users: staff and registered customer identities, credentials/status.
-   roles, permissions, user_roles, role_permissions: authorization
    model.
-   customers: customer-specific profile linked optionally to user.
-   customer_addresses: saved addresses for registered customers.
-   guest contact details are snapshotted on the order; do not require a
    user row.

## Catalog

-   categories: name, slug, parent, sort order, active status.
-   products: name, slug, description, category, product type, unit,
    base price, active/featured flags, lead time, SEO fields.
-   product_images: product, storage key, alt text, sort order, primary
    flag.
-   product_variants: size/weight/packaging variant, SKU if needed,
    price override, active status.
-   product_options / option_values: reusable option groups and values
    where appropriate.
-   product_addons: optional paid additions and price.
-   product_option_assignments: map options to products/variants.

Support fixed-price, variant-priced, per-piece, per-box, and per-weight
products. Use a clear pricing strategy per product; avoid ambiguous
combinations.

## Cart

-   carts: guest session token or customer association, expiry/status.
-   cart_items: product/variant, quantity, selected options, selected
    add-ons, configuration snapshot. Cart contents are not authoritative
    for final prices. Recalculate during checkout.

## Orders

-   orders: public order number, optional customer/user link, guest
    contact snapshot, fulfillment type, address snapshot, requested
    slot, currency, subtotal, discount, delivery fee, total, order
    status, payment status, notes, idempotency key.
-   order_items: product/variant references where retained plus
    immutable product name, SKU/description snapshot, unit price,
    quantity, line total, selected options/add-ons snapshot, custom
    configuration snapshot.
-   order_status_history: old/new state, actor, timestamp, note.
-   order_events or audit records only if needed; avoid duplicate
    history sources.

Order tracking must not expose sequential database IDs. Use a
high-entropy tracking token or verified phone-based access.

## Custom Cake Requests and Quotes

-   custom_cake_requests: customer contact, description, requested date,
    reference image key, status.
-   quotes: request, quoted price, details, expiry, status, admin actor.
-   quote_items or quote_options if quote composition requires detail.
-   quote acceptance must be explicit and recorded before converting to
    a confirmed order.

## Scheduling

-   business_hours: weekday, opening/closing times, branch/config scope.
-   business_closures: date/time ranges and reason.
-   time_slots: date/time range, fulfillment type, capacity, active
    status.
-   capacity_reservations: slot, order, reserved quantity/status.
-   product lead time belongs to product or product preparation policy.
    Capacity reservation must be atomic and safe under concurrent
    requests.

## Payments

-   payments: order, method, amount, currency, status, reference,
    reviewed_by, reviewed_at.
-   payment_proofs: private object key, upload metadata, checksum if
    useful.
-   refunds: payment, amount, reason, status, timestamps. Payment status
    must be separate from order status. Never infer paid status from
    proof upload.

## Fulfillment

-   delivery_zones: name, coverage description or supported postal/area
    identifiers, fee, minimum order, active status.
-   delivery_fee_rules: only if more complex fee calculation is
    required.
-   pickup configuration can live in store/branch settings if a separate
    entity is unnecessary.

## Marketing and Content

-   coupons: code, discount type/value, validity, usage limits, active
    status.
-   promotions: campaign metadata and eligibility rules.
-   banners: image key, destination, schedule, sort order.
-   reviews: customer/order association, rating, content, moderation
    status.

## Settings and Audit

-   store_settings: brand contact, currency, timezone, checkout
    settings, payment instructions.
-   audit_logs: actor, action, target type/id, timestamp, request
    metadata, safe before/after details.

## Important Constraints

-   Unique product/category slugs where appropriate.
-   Unique public order number.
-   Unique idempotency key within appropriate scope.
-   Valid positive quantities and non-negative monetary amounts.
-   Foreign keys with deliberate delete behavior.
-   Avoid hard deletion of financial/order records.
-   Index common lookup fields: order number, order status, created
    date, customer phone (consider privacy), product slug, active
    category/product, slot date/time.
-   Avoid storing uploaded file bytes in relational tables.
-   Preserve snapshots for historical correctness.

## Open Design Checks

Before migrations are generated, validate: 1. Whether inventory tracking
is required at MVP or only availability toggles. 2. Whether weight
products need decimal quantities and variable final weight. 3. Whether
slot capacity is measured by order count, preparation workload, or both.
4. Whether guest cart persistence is cookie/session-based. 5. Whether
customer accounts use password, OTP, or another verified method.
