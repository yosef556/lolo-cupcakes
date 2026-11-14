# Lolo Cupcakes --- Business Rules

## Pricing

-   Backend is the single source of truth.
-   Recalculate product, variant, option, add-on, coupon, delivery, and
    total values at checkout.
-   Use decimal-safe arithmetic.
-   Store currency as EGP.
-   Snapshot unit price, selected configuration, product name, and line
    totals into order items.
-   Price changes after order creation must not change existing orders.

## Product Availability

-   Product may be active, inactive, seasonal, or sold out.
-   Do not allow checkout for inactive/unavailable products.
-   Inventory tracking is optional pending owner decision; availability
    toggle is required.

## Standard Customization

-   Only predefined options with configured prices can be directly
    ordered.
-   Validate option compatibility with selected product/variant.
-   Reject unknown or disabled options.
-   Recalculate all add-ons on server.

## Special Requests and Quotes

-   A request is not an order and does not reserve production capacity
    by default.
-   Admin reviews details and creates a quote with amount, description,
    expiry, and terms.
-   Customer explicitly accepts or declines.
-   Expired, rejected, or already accepted quotes cannot be accepted
    again.
-   On acceptance, create/confirm the appropriate order and reserve
    capacity according to the configured policy.

## Checkout

-   Guest checkout is enabled.
-   Phone is required; format validation should support Egyptian numbers
    without assuming one provider.
-   Delivery requires a valid active delivery zone and address.
-   Pickup uses configured branch and pickup hours.
-   Client-supplied totals are ignored.
-   Use idempotency key to prevent duplicate orders.
-   Do not show unavailable slots as selectable.

## Scheduling

-   Apply Africa/Cairo business calendar.
-   Respect product lead time and business closures.
-   Capacity validation and reservation must be atomic.
-   Admin changes to capacity must not invalidate already confirmed
    reservations silently.
-   Define whether capacity is per order, per production workload, or
    both before production launch.

## Payment

-   Cash is marked according to the configured collection policy; do not
    mark as collected merely because order is placed if cash is due on
    fulfillment.
-   Manual transfer starts as pending verification.
-   Proof upload never means paid.
-   Only authorized admin can approve/reject.
-   Record reviewer and timestamp.
-   Payment and order states are independent.

## Order Lifecycle

-   Validate legal transitions.
-   Typical flow: PENDING -\> CONFIRMED -\> PREPARING -\> READY -\>
    OUT_FOR_DELIVERY -\> COMPLETED.
-   Pickup: READY -\> COMPLETED.
-   Cancellation/rejection require reason and policy checks.
-   Keep full status history.

## Delivery

-   Fees are calculated from active zone rules.
-   Do not accept unsupported delivery addresses.
-   Pickup has no delivery fee.
-   Admin can pause delivery/pickup independently.

## Customer Privacy

-   Only collect necessary data.
-   Restrict access to phone, address, and payment proof.
-   Do not log sensitive values.
-   Guest tracking requires secure token or verification, not order
    number alone.
