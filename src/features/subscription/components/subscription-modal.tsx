"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useSubscriptionModal } from "../store/use-subscription-modal";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2 } from "lucide-react";
import { useCheckout } from "../api/use-checkout";

export const SubscriptionModal = () => {
	const { isOpen, onClose, onOpen } = useSubscriptionModal();
	const mutation = useCheckout();

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader className="flex items-center space-y-4">
					<img src="/logo.svg" alt="Logo" width={36} height={36} />
					<DialogTitle>Upgrate to a paid plan</DialogTitle>
					<DialogDescription>
						You need to subscribe to access this feature.
					</DialogDescription>
				</DialogHeader>
				<Separator />
				<ul className="space-y-2">
					<li className="flex items-center">
						<CheckCircle2 className="size-5 fill-blue-500 mr-2 text-white" />
						<p className="text-sm text-muted-foreground">Unlimited projects</p>
					</li>
					<li className="flex items-center">
						<CheckCircle2 className="size-5 fill-blue-500 mr-2 text-white" />
						<p className="text-sm text-muted-foreground">Unlimited templates</p>
					</li>
					<li className="flex items-center">
						<CheckCircle2 className="size-5 fill-blue-500 mr-2 text-white" />
						<p className="text-sm text-muted-foreground">
							AI background removal
						</p>
					</li>
					<li className="flex items-center">
						<CheckCircle2 className="size-5 fill-blue-500 mr-2 text-white" />
						<p className="text-sm text-muted-foreground">AI Image generation</p>
					</li>
				</ul>
				<DialogFooter className="pt-2 mt-4 gay-y-2">
					<Button
						disabled={mutation.isPending}
						className="w-full"
						onClick={() => {
							mutation.mutate();
						}}
					>
						Upgrade
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};
