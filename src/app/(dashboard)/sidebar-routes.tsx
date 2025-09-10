"use client";

import { CreditCard, Crown, Home, MessageCircleQuestion } from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarItem } from "./sidebar-item";
import { usePaywall } from "@/features/subscription/hooks/use-paywall";
import { useCheckout } from "@/features/subscription/api/use-checkout";
import { useBilling } from "@/features/subscription/subscriptions/api/use-billing";

export const SidebarRoutes = () => {
	const pathname = usePathname();
	const { shouldBlock, isLoading, triggerPaywall } = usePaywall();
	const billingMutation = useBilling();
	const mutation = useCheckout();
	const onClick = () => {
		if (shouldBlock) {
			triggerPaywall();
			return;
		}
		billingMutation.mutate();
	};
	return (
		<div className="flex flex-col gap-y-4 flex-1">
			{shouldBlock && !isLoading && (
				<>
					<div className="px-3">
						<Button
							onClick={() => mutation.mutate()}
							className="w-full rounded-xl border-none hover:bg-white dark:hover:bg-pink-50 transition"
							size="lg"
						>
							<Crown className="mr-2 size-4 fill-yellow-500 text-yellow-500" />
							Upgrade to Aritfy Pro
						</Button>
					</div>
					<div className="px-3 ">
						<Separator />
					</div>
				</>
			)}

			<ul className="flex flex-col gap-y-1 px-3">
				<SidebarItem
					href="/"
					icon={Home}
					label="Home"
					isActive={pathname === "/"}
				/>
			</ul>
			<div className="px-3 ">
				<Separator />
			</div>
			<ul className="flex flex-col gap-y-1 px-3">
				<SidebarItem
					onClick={() => onClick()}
					href={pathname}
					icon={CreditCard}
					label="Billing"
				/>
				<SidebarItem
					href={"mailto:me@me.com"}
					icon={MessageCircleQuestion}
					label="Get Help"
				/>
			</ul>
		</div>
	);
};
