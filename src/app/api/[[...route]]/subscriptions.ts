import Stripe from "stripe";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@hono/auth-js";

import { checkIsActive } from "@/features/subscription/lib";

import { stripe } from "@/lib/stripe";
import { db } from "@/db/drizzle";
import { subscriptions } from "@/db/schema";

const app = new Hono()
  .post("/billing", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    if (!subscription) {
      return c.json({ error: "No subscription found" }, 404);
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}`,
    });

    if (!session.url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: session.url });
  })
  .get("/current", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [subscription] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, auth.token.id));

    const active = checkIsActive(subscription);

    return c.json({
      data: {
        ...subscription,
        active,
      },
    });
  })
  .post("/checkout", verifyAuth(), async (c) => {
    const auth = c.get("authUser");

    if (!auth.token?.id) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}?canceled=1`,
      payment_method_types: ["card", "paypal"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: auth.token.email || "",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      metadata: {
        userId: auth.token.id,
      },
    });

    const url = session.url;

    if (!url) {
      return c.json({ error: "Failed to create session" }, 400);
    }

    return c.json({ data: url });
  })
  .post(
    "/webhook",
    async (c) => {
      const body = await c.req.text();
      const signature = c.req.header("Stripe-Signature") as string;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (error) {
        console.error("Webhook signature verification failed:", error);
        return c.json({ error: "Invalid signature" }, 400);
      }

      console.log(`Processing webhook event: ${event.type}`);

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );

        if (!session?.metadata?.userId) {
          console.error("No userId in session metadata");
          return c.json({ error: "Invalid session" }, 400);
        }

        console.log(`Creating subscription for user: ${session.metadata.userId}, subscription: ${subscription.id}`);

        try {
          // Check if subscription already exists to handle duplicate webhooks
          const [existingSubscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.subscriptionId, subscription.id));

          if (existingSubscription) {
            console.log(`Subscription already exists, updating: ${subscription.id}`);
            await db
              .update(subscriptions)
              .set({
                status: subscription.status,
                currentPeriodEnd: new Date(
                  subscription.items.data[0].current_period_end * 1000
                ),
                updatedAt: new Date(),
              })
              .where(eq(subscriptions.subscriptionId, subscription.id));
          } else {
            await db
              .insert(subscriptions)
              .values({
                status: subscription.status,
                userId: session.metadata.userId,
                subscriptionId: subscription.id,
                customerId: subscription.customer as string,
                priceId: subscription.items.data[0].price.product as string,
                currentPeriodEnd: new Date(
                  subscription.items.data[0].current_period_end * 1000
                ),
                createdAt: new Date(),
                updatedAt: new Date(),
              });
          }
          console.log(`Successfully processed subscription: ${subscription.id}`);
        } catch (error) {
          console.error("Failed to create/update subscription:", error);
          return c.json({ error: "Failed to process subscription" }, 500);
        }
      }

      if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice;

        // Skip if no subscription (e.g., one-time payments)
        if (!invoice.subscription) {
          console.log("Invoice has no subscription, skipping");
          return c.json(null, 200);
        }

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
        );

        console.log(`Updating subscription after payment success: ${subscription.id}`);

        try {
          // Check if subscription exists in database first
          const [existingSubscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.subscriptionId, subscription.id));

          if (!existingSubscription) {
            console.log(`Subscription not found in database, skipping update: ${subscription.id}`);
            return c.json(null, 200);
          }

          await db
            .update(subscriptions)
            .set({
              status: subscription.status,
              currentPeriodEnd: new Date(
                subscription.items.data[0].current_period_end * 1000,
              ),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.subscriptionId, subscription.id));
          console.log(`Successfully updated subscription: ${subscription.id}`);
        } catch (error) {
          console.error("Failed to update subscription:", error);
          return c.json({ error: "Failed to update subscription" }, 500);
        }
      }

      if (event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription;

        console.log(`Updating subscription status: ${subscription.id} to ${subscription.status}`);

        try {
          // Check if subscription exists in database first
          const [existingSubscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.subscriptionId, subscription.id));

          if (!existingSubscription) {
            console.log(`Subscription not found in database, skipping update: ${subscription.id}`);
            return c.json(null, 200);
          }

          await db
            .update(subscriptions)
            .set({
              status: subscription.status,
              currentPeriodEnd: new Date(
                subscription.items.data[0].current_period_end * 1000,
              ),
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.subscriptionId, subscription.id));
          console.log(`Successfully updated subscription status: ${subscription.id}`);
        } catch (error) {
          console.error("Failed to update subscription status:", error);
          return c.json({ error: "Failed to update subscription" }, 500);
        }
      }

      if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;

        console.log(`Canceling subscription: ${subscription.id}`);

        try {
          // Check if subscription exists in database first
          const [existingSubscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.subscriptionId, subscription.id));

          if (!existingSubscription) {
            console.log(`Subscription not found in database, skipping deletion: ${subscription.id}`);
            return c.json(null, 200);
          }

          await db
            .update(subscriptions)
            .set({
              status: "canceled",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.subscriptionId, subscription.id));
          console.log(`Successfully canceled subscription: ${subscription.id}`);
        } catch (error) {
          console.error("Failed to cancel subscription:", error);
          return c.json({ error: "Failed to cancel subscription" }, 500);
        }
      }

      if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;

        // Skip if no subscription
        if (!invoice.subscription) {
          console.log("Invoice has no subscription, skipping payment failure update");
          return c.json(null, 200);
        }

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
        );

        console.log(`Updating subscription after payment failure: ${subscription.id} to ${subscription.status}`);

        try {
          // Check if subscription exists in database first
          const [existingSubscription] = await db
            .select()
            .from(subscriptions)
            .where(eq(subscriptions.subscriptionId, subscription.id));

          if (!existingSubscription) {
            console.log(`Subscription not found in database, skipping payment failure update: ${subscription.id}`);
            return c.json(null, 200);
          }

          await db
            .update(subscriptions)
            .set({
              status: subscription.status,
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.subscriptionId, subscription.id));
          console.log(`Successfully updated subscription after payment failure: ${subscription.id}`);
        } catch (error) {
          console.error("Failed to update subscription after payment failure:", error);
          return c.json({ error: "Failed to update subscription" }, 500);
        }
      }

      return c.json(null, 200);
    },
  );

export default app;
