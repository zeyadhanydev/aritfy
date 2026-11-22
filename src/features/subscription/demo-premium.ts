// Owner-controlled, server-only app access. This never creates a paid subscription.
export function isDemoPremium(userId: string | undefined, allowlist = process.env.DEMO_PREMIUM_USER_IDS ?? ""): boolean {
 if (!userId) return false;
 return allowlist.split(",").map(value => value.trim()).filter(Boolean).includes(userId);
}
