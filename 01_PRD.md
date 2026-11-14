# Lolo Cupcakes --- Product Requirements Document

## 1. Product Vision

Build a premium, mobile-first dessert e-commerce platform for **Lolo
Cupcakes**, serving customers in Egypt. The store sells cupcakes, cakes,
gateaux, oriental and western desserts, assorted boxes, and
configurable/custom cakes. The platform includes a customer storefront
and a secure administration dashboard.

The product must feel premium, warm, elegant, playful, trustworthy, and
easy to use. Arabic is the primary language and the interface must
support RTL correctly. The architecture must allow English to be added
without redesigning the application.

## 2. Approved Decisions

-   Brand: Lolo Cupcakes.
-   Brand identity: create from scratch; proposed visual direction is
    blush pink, vanilla cream, cocoa brown, and restrained
    champagne-gold accents. Final logo and exact tokens require design
    approval.
-   Sales fulfillment: delivery and pickup.
-   Checkout: guest checkout by default; optional customer account.
-   Payments: cash and manually verified bank/wallet transfer.
-   Initial operation: one branch.
-   Future growth: branch-aware data model, but no full multi-branch
    operations in MVP.
-   Product scope: cupcakes, cakes, gateaux, oriental/western desserts,
    boxes, and custom cakes.
-   Currency: EGP.
-   Business timezone: Africa/Cairo.
-   Architecture: modular monolith.
-   Frontend: Next.js + TypeScript.
-   Backend: Java 21 + Spring Boot.
-   Database: PostgreSQL.
-   No microservices, Kafka, Kubernetes, or Redis in MVP unless a
    measured requirement justifies them.

## 3. User Types

### Visitor / Guest

-   Browse categories and products.
-   Search and filter products.
-   Add products and configured options to cart.
-   Checkout without account.
-   Submit custom cake quote request.
-   Track an order using a secure tracking mechanism.

### Registered Customer

All guest capabilities plus: - Manage profile and saved addresses. -
View eligible order history. - Maintain wishlist. - Reorder where
product availability permits.

### Owner

-   Full access to administration and settings.

### Manager

-   Operational access granted by Owner.

### Staff

-   Limited operational permissions such as viewing and updating
    assigned order stages.

Authorization must be enforced by the backend for every protected
operation. Hiding a button in the frontend is not authorization.

## 4. Storefront Pages

-   Home
-   Shop / product listing
-   Category listing
-   Product details
-   Custom cake request/configurator
-   Cart
-   Checkout
-   Order confirmation
-   Order tracking
-   Login / registration (optional)
-   Customer account and order history
-   Wishlist (can be Phase 2 if needed)
-   About
-   Contact
-   FAQ
-   Delivery, cancellation, privacy, and terms policies

## 5. Catalog Requirements

Products support: - Name, slug, description, category, status, featured
flag. - Multiple images with primary image and display order. - Product
type and selling unit: item, box, weight, or configurable variant. -
Base price and optional variant-specific prices. - Options such as size,
flavor, filling, and packaging. - Paid add-ons. - Preparation lead
time. - Availability and optional inventory tracking. - Seasonal
availability and publish dates. - SEO metadata.

Never assume all desserts share one pricing model. Product configuration
must support fixed-price, variant-priced, per-piece, per-box, and
per-weight products without hardcoding category-specific behavior.

## 6. Custom Cake Requirements

Two distinct flows: 1. Standard customization: predefined options with
known prices; backend calculates the total and customer can place the
order. 2. Special request / quote: customer submits details, requested
date, message, and optional reference image. Admin reviews and provides
a quote. Customer must accept the quote before it becomes a confirmed
payable order.

Reference uploads must be validated, size-limited, stored privately
where appropriate, and served using controlled access.

## 7. Cart and Checkout

-   Guest checkout is the default.
-   Account creation is optional and must not block checkout.
-   Required customer details: name and verified/validated contact
    phone; address details for delivery.
-   Customer selects Delivery or Pickup.
-   Delivery requires a supported zone and address.
-   Pickup requires an available pickup slot.
-   Customer selects an eligible date/time slot.
-   Server recalculates product prices, options, discounts, delivery
    fee, and total.
-   Order submission must be idempotent to prevent duplicates on
    retries.
-   Display a clear order number and confirmation state.

## 8. Delivery and Pickup

Both are supported but configurable. - Delivery zones and fees are
managed by admin. - Optional minimum order value per zone. - Delivery
availability can be paused. - Pickup branch address, working hours, and
instructions are configurable. - Pickup must not charge delivery fees. -
Do not hardcode branch address, delivery zones, or fees.

## 9. Scheduling and Capacity

-   Store working hours and holidays.
-   Product-specific preparation lead time.
-   Configurable time slots.
-   Configurable order capacity per slot.
-   Admin can close a date or slot.
-   Validate slot availability during checkout and again inside a
    database transaction at order creation.
-   Prevent overbooking under concurrent requests.
-   Show only slots that satisfy preparation time and fulfillment rules.

## 10. Payments

MVP payment methods: - Cash, with allowed collection moment configurable
(delivery or pickup). - Manual transfer using admin-configured payment
instructions.

Manual transfer flow: - Customer enters transfer reference and may
upload proof. - Payment status becomes PENDING_VERIFICATION. - Admin
approves or rejects. - Uploading an image never automatically marks
payment as paid. - Payment proof is private and access-controlled.

Payment status is separate from order status. Future payment gateway
integration must fit behind a payment-provider abstraction without
requiring a redesign.

## 11. Order Management

Order statuses: - PENDING - CONFIRMED - PREPARING - READY -
OUT_FOR_DELIVERY - COMPLETED - CANCELLED - REJECTED

Pickup flow: READY -\> COMPLETED, without OUT_FOR_DELIVERY.

Payment status is separate: - UNPAID - PENDING_VERIFICATION - PAID -
REJECTED - REFUNDED

Every state transition must be validated and recorded with actor,
timestamp, previous state, new state, and optional note. Do not allow
arbitrary status changes.

## 12. Admin Dashboard

Modules: - Overview - Orders - Custom cake requests and quotes -
Products - Categories - Product options and add-ons - Scheduling and
capacity - Payments and proofs - Customers - Delivery zones and fees -
Promotions / coupons - Content / banners - Reviews (moderation) - Staff
and permissions - Reports - Store settings - Audit log

## 13. Notifications

MVP may use email or configured messaging integration only if
credentials and provider are supplied. Do not invent credentials or
silently depend on a paid service. At minimum, provide in-app/admin
visibility and customer order confirmation UI. WhatsApp integration is a
later, explicitly configured feature.

## 14. Non-Functional Requirements

-   Responsive, mobile-first UI.
-   Correct Arabic RTL across all pages and components.
-   Accessible keyboard navigation, labels, focus states, and contrast.
-   Optimized image formats and responsive image sizes.
-   SEO metadata, sitemap, canonical URLs, Open Graph, and relevant
    structured data.
-   Secure authentication and authorization.
-   Rate limiting for sensitive endpoints.
-   Validation on both frontend and backend.
-   Structured logs and error handling.
-   Database backups and a tested restore procedure.
-   No secrets in source control.
-   No sensitive payment proof files in public buckets.
-   Use transactions for order placement and capacity reservation.
-   Preserve historical order snapshots when catalog data changes.

## 15. MVP Exclusions

Unless explicitly approved later: - Multi-branch management UI. - Online
card payment gateway. - Loyalty points. - Advanced CRM automation. -
Delivery-driver dispatch platform. - Microservices. - Kafka / Redis /
Kubernetes. - AI product recommendations. - Complex warehouse
management.

## 16. Success Criteria

A customer can browse, configure a product, choose delivery or pickup,
select a valid slot, pay cash or submit a manual transfer, and receive a
trackable order. Admin can manage the catalog, slots, orders, custom
requests, payments, and store settings securely. The complete flow works
on mobile and in Arabic RTL.
