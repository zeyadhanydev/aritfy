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
				<TooltipTrigger asChild className="">
					{children}
				</TooltipTrigger>
				<TooltipContent
					align={align}
					side={side}
					sideOffset={sideOffset}
					alignOffset={alignOffset}
					className=""
				>
					<p className="">{label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};
