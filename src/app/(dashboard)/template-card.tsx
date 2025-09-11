"use client";

import { cn } from "@/lib/utils";
import { Crown, Zap } from "lucide-react";
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
		<div
			className={cn(
				"group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 transition-all duration-300",
				"hover:shadow-lg hover:scale-[1.02] hover:border-blue-200 dark:hover:border-blue-600",
				disabled ? "cursor-not-allowed opacity-75" : "cursor-pointer",
			)}
		>
			<button
				onClick={onClick}
				disabled={disabled}
				type="button"
				className="w-full h-full text-left"
			>
				{/* Image Container */}
				<div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-700">
					<img
						src={imgSrc}
						alt={title}
						width={width}
						height={height}
						className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
					/>

					{/* Pro Badge */}
					{isPro && (
						<div className="absolute top-3 right-3 flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg">
							<Crown className="size-3" />
							PRO
						</div>
					)}

					{/* Hover Overlay */}
					<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
						<div className="absolute bottom-4 left-4 right-4">
							<div className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-md rounded-lg py-2 px-4 text-white font-medium">
								<Zap className="size-4" />
								Open in Editor
							</div>
						</div>
					</div>

					{/* Gradient Overlay at Bottom */}
					<div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
				</div>

				{/* Content */}
				<div className="p-4">
					<h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
						{title}
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
						{description}
					</p>
					<div className="flex items-center justify-between">
						<span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded-full">
							{width} × {height}px
						</span>
						{isPro && (
							<span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">
								Premium
							</span>
						)}
					</div>
				</div>
			</button>
		</div>
	);
};
