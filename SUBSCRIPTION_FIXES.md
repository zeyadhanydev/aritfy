# Subscription Webhook Fixes

## Issues Fixed

### 1. Type Casting Error in Invoice Events
**Problem**: The webhook handler was incorrectly casting `event.data.object` as `Stripe.Checkout.Session` for all event types, including invoice events.

**Fix**:
- For `checkout.session.completed` events: Cast as `Stripe.Checkout.Session`
- For `invoice.payment_succeeded` and `invoice.payment_failed` events: Cast as `Stripe.Invoice`
- For subscription events: Cast as `Stripe.Subscription`

### 2. Incorrect Data Access for Invoice Events
**Problem**: The code was trying to access `session.subscription` and `session.metadata.userId` on invoice objects, which don't have these properties.

**Fix**:
- For invoice events, access subscription ID via `invoice.subscription`
- Removed dependency on `session.metadata.userId` for invoice events since invoices don't contain user metadata

### 3. Wrong WHERE Clause in Update Queries
**Problem**: The update queries were using `eq(subscriptions.id, subscription.id)` which compares the database primary key with the Stripe subscription ID.

**Fix**: Changed to `eq(subscriptions.subscriptionId, subscription.id)` to properly match by Stripe subscription ID.

### 4. Missing Error Handling
**Problem**: Database operations had no error handling, which could cause silent failures.

**Fix**: Added comprehensive try-catch blocks with proper error logging and HTTP error responses.

### 5. Duplicate Webhook Handling
**Problem**: Webhooks can be called multiple times, potentially creating duplicate subscription records.

**Fix**: Added upsert logic in `checkout.session.completed` to check for existing subscriptions and update instead of insert if they already exist.

## Additional Webhook Events Added

### 1. `customer.subscription.updated`
Handles subscription status changes (e.g., active → past_due → canceled)

### 2. `customer.subscription.deleted`
Handles subscription cancellations by updating status to "canceled"

### 3. `invoice.payment_failed`
Handles failed payments by updating subscription status

## Comprehensive Logging Added

Added detailed logging for:
- Webhook event types received
- Subscription creation/update operations
- Error conditions
- Success confirmations

This will help with debugging subscription issues in production.

## Testing the Fixes

To test these fixes:

1. **Set up Stripe webhook endpoint** pointing to `/api/subscriptions/webhook`
2. **Configure webhook events** to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
3. **Test subscription flow**:
   - Create a test subscription
   - Verify it's saved to database
   - Test payment renewal
   - Test subscription cancellation
4. **Monitor logs** for proper webhook processing

## Environment Variables Required

Ensure these environment variables are set:
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your webhook endpoint secret
- `NEXT_PUBLIC_APP_URL`: Your application URL for redirects

## Database Schema Verification

The fixes assume the following database schema for subscriptions table:
- `id`: Primary key (UUID)
- `userId`: Foreign key to users table
- `subscriptionId`: Stripe subscription ID (used for matching)
- `customerId`: Stripe customer ID
- `status`: Subscription status
- `priceId`: Stripe price ID
- `currentPeriodEnd`: Subscription period end date
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

This matches the schema found in `/src/db/schema.ts`.
