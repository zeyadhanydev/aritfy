"use client";
import { Crown, Loader, LogOut } from "lucide-react";
import { BsCreditCard } from "react-icons/bs";
import { motion } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePaywall } from "@/features/subscription/hooks/use-paywall";
import { useBilling } from "@/features/subscription/api/use-billing";
import { useGetSubscription } from "@/features/subscription/api/use-get-subscription";
export const UserButton = () => {
	const paywall = usePaywall();
	const mutation = useBilling();
	const { data: subscription, isLoading } = useGetSubscription();
	const onClick = () => {
		if (paywall.shouldBlock) {
			paywall.triggerPaywall();
			return;
		}
		mutation.mutate();
	};
	const session = useSession();
	if (session.status === "loading") {
		return <Loader className="size-4 animate-spin text-muted-foreground" />;
	}
	if (session.status === "unauthenticated" || !session.data) {
		return null;
	}
	const name = session.data.user.name!;
	const imageUrl = session.data.user.image!;
	return (
		<div className="relative overflow-hidden rounded-full size-11 flex items-center justify-center">
			{subscription?.active && !isLoading && (
				<div className="absolute size-12 bg-gradient-conic from-yellow-400 via-yellow-500 to-yellow-600 animate-spin z-0" />
			)}
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger>
					<Avatar className="size-10 transition z-1">
						<AvatarImage
							alt="name"
							className="hover:scale-125 transition duration-300"
							src={imageUrl || ""}
						/>
						<AvatarFallback
							className="bg-blue-500 font-medium text-white
						"
						>
							{name.charAt(0).toUpperCase()}
						</AvatarFallback>
					</Avatar>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-60">
					<DropdownMenuItem
						className="h-10 cursor-pointer"
						onClick={onClick}
						disabled={mutation.isPending}
					>
						<BsCreditCard className="size-4 mr-2" />
						Billing
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						className="h-10 cursor-pointer"
						onClick={() => signOut()}
					>
						<LogOut className="size-4 mr-2"></LogOut>
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};
