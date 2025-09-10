import React from "react";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
interface SidebarItemProps {
	icon: LucideIcon;
	label: string;
	isActive?: boolean;
	onClick: () => void;
}
export const SidebarItem = ({
	icon: Icon,
	label,
	isActive,
	onClick,
}: SidebarItemProps) => {
	return (
		<Button
			variant={"ghost"}
			onClick={onClick}
			className={cn(
				"w-full h-16 cursor-pointer aspect-video p-3 py-4 flex flex-col rounded-none bg-background",
				isActive && "bg-background/50 text-primary",
			)}
		>
			<Icon className="size-5 stroke-2 shrink-0" />
			<span className="text-xs">{label}</span>
		</Button>
	);
};
