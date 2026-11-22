type SubscriptionRef = string | { id: string } | null;
type InvoiceSubscriptionSource = {
 parent?: { subscription_details?: { subscription?: SubscriptionRef } | null } | null;
 subscription?: SubscriptionRef;
};

// Current Stripe invoices nest this reference; older webhook versions did not.
export function invoiceSubscriptionId(invoice: InvoiceSubscriptionSource): string | null {
 const reference = invoice.parent?.subscription_details?.subscription ?? invoice.subscription;
 return typeof reference === "string" ? reference : reference?.id ?? null;
}
