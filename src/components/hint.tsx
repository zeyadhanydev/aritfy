"use client";
import type React from "react";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export interface HintProps {
	label: string;
	children: React.ReactNode;
	side?: "top" | "bottom" | "left" | "right";
	align?: "start" | "center" | "end";
	sideOffset?: number;
	alignOffset?: number;
}

export const Hint = ({
	children,
	label,
	align,
	alignOffset,
	side,
	sideOffset,
}: HintProps) => {
	return (
		<TooltipProvider>
			<Tooltip delayDuration={100}>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent
					align={align}
					side={side}
					sideOffset={sideOffset}
					alignOffset={alignOffset}
				>
					<p className="font-semibold capitalize text-black dark:text-white">
						{label}
					</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
