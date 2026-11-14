# Lolo Cupcakes --- UI/UX Specification

## Experience Goals

Premium, warm, elegant, playful, trustworthy, fast, mobile-first, and
Arabic-first. Product photography should lead the experience. The site
must not look like a generic admin template or a discount marketplace.

## Global Requirements

-   Arabic default, correct RTL layout and typography.
-   Responsive mobile, tablet, and desktop.
-   Accessible contrast, focus, keyboard navigation, semantic labels.
-   Consistent loading, empty, error, success, and disabled states.
-   Avoid excessive animation and layout shifts.
-   Respect reduced-motion preferences.
-   Centralized design tokens.

## Storefront Navigation

-   Brand logo.
-   Main categories.
-   Search.
-   Cart.
-   Account entry (optional).
-   Mobile navigation that remains easy to use.

## Home Page Sections

1.  Hero with strong brand image and clear CTA.
2.  Shop by category.
3.  Best sellers.
4.  Signature cakes / cupcakes.
5.  Custom cake CTA.
6.  Seasonal collection.
7.  Reviews.
8.  Social gallery.
9.  Footer with contact, branch, policies, and social links.

## Product Listing

-   Responsive grid.
-   Search and filters.
-   Sort by relevant options.
-   Product cards with image, name, price/from-price, availability, and
    quick view/add only when configuration is unambiguous.
-   Clear sold-out and seasonal states.

## Product Detail

-   Large image gallery.
-   Product description.
-   Price and selling unit.
-   Variant/options selection.
-   Add-ons.
-   Quantity.
-   Preparation lead time.
-   Availability guidance.
-   Add-to-cart CTA.
-   Related products.

## Custom Cake Flow

-   Clear distinction between standard priced customization and special
    quote request.
-   Step-by-step configuration where useful.
-   Requested date.
-   Reference image upload.
-   Text/message and special instructions.
-   Explain that custom quote requests are not confirmed orders until
    the customer accepts a quote.

## Checkout UX

-   Guest-first.
-   Contact details.
-   Delivery or pickup selection.
-   Address and delivery zone only for delivery.
-   Date and available slot.
-   Payment method.
-   Order summary with transparent line items, fees, discounts, and
    total.
-   Clear validation and recovery from errors.
-   Do not clear cart until order creation is confirmed.

## Order Tracking

-   Clear timeline and status.
-   Do not reveal orders using guessable IDs.
-   Explain pending transfer review.
-   Provide contact support link configured by admin.

## Admin UX

-   Desktop-efficient but responsive.
-   Search, filters, pagination, sorting.
-   Confirm destructive or sensitive actions.
-   Order detail should show customer snapshot, items/configuration,
    fulfillment, payment, and history.
-   Payment proof review should show safe private image preview.
-   Product forms should support variants/options without overwhelming
    the user.
-   Dashboard cards should show meaningful operational metrics, not
    decorative charts.

## Arabic and Localization

-   Use logical CSS properties where possible.
-   Avoid hardcoded left/right assumptions.
-   Format EGP and dates for Egypt.
-   Store timestamps consistently and display in Africa/Cairo.
-   Translation-ready content model; English may be added later.

## Design QA

Test common viewport widths, keyboard flow, RTL alignment, long Arabic
labels, empty catalog, failed image, network error, and checkout
validation.
