"use client";

import { cn } from "@/lib/utils";
import { Crown } from "lucide-react";
import Image from "next/image";

interface TemplateCardProps {
	imgSrc: string;
	title: string;
	onClick: () => void;
	disabled?: boolean;
	width: number;
	height: number;
	isPro: boolean | null;
	description: string;
}
export const TemplateCard = ({
	imgSrc,
	height,
	isPro,
	onClick,
	title,
	width,
	disabled,
	description,
}: TemplateCardProps) => {
	return (
		<button
			onClick={onClick}
			disabled={disabled}
			style={{
			  aspectRatio: `${width}/${height}`
			}}
			className={cn(
				"space-y-2 group text-left transition flex flex-col",
				disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer",
			)}
		>
			<div className="relative rounded-xl aspect-[3/2] h-full w-full overflow-hidden border">
				<img src={imgSrc} alt={title} width={width} height={height} className="object-cover transition transform group-hover:scale-105"/>
				{isPro && (
				  <div className="absolute top-2 right-2 h-10 w-10 flex items-center justify-center bg-black/50 rounded-full z-10"><Crown className="size-5 fill-yellow-500 text-yellow-500" /></div>
				)}
				<div className="opacity-0 group-hover:opacity-100 transition absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl backdrop-blur-sm">
				<p className="text-white font-medium px-4 py-2 bg-black/60 rounded-full">Open in editor</p>
				</div>

			</div>
			<div className="space-y-1">
	  <p className="text-sm font-medium">{title}</p>
			<p className="text-xs text-muted-foreground opacity-0 group-hover:opacity-75 transition">{description}</p>
			</div>


		</button>
	);
};
