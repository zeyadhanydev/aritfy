"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCreateProject } from "@/features/projects/api/use-create-project";

export const Banner = () => {
	const mutation = useCreateProject();
	const router = useRouter();
	const onClick = () => {
		mutation.mutate(
			{
				name: "Untitled project",
				json: "",
				width: 900,
				height: 1200,
			},
			{
				onSuccess: ({ data }) => {
					router.push(`/editor/${data.id}`);
				},
			},
		);
	};
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.6, ease: "easeOut" }}
			className=" text-white aspect-[5/1] min-h-[248px] flex gap-x-6 p-6 items-center rounded-xl bg-gradient-to-r from-[#6366f1] via-[#8b5cf6] to-[#ec4899]"
		>
			<motion.div
				initial={{ scale: 0, rotate: -180 }}
				animate={{ scale: 1, rotate: 0 }}
				transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
				className="rounded-full hidden md:flex size-28 flex items-center justify-center bg-white/50"
			>
				<div className="rounded-full size-20 flex items-center justify-center bg-white">
					<motion.div
						animate={{ rotate: 360 }}
						transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
					>
						<Sparkles className="h-20 text-[#0073ff] fill-[#0073ff]" />
					</motion.div>
				</div>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, x: -30 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
				className="flex flex-col gap-y-2 text-xl md:text-3xl font-semibold"
			>
				<motion.h1
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
				>
					Visulaze your ideas with Image AI
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.5 }}
					className="text-xs md:text-sm mb-2 "
				>
					Turn inspiration into design in no time. Simply upload an image and
					let AI do the rest
				</motion.p>
				<Button
					variant="secondary"
					className="w-[160px] "
					onClick={onClick}
					disabled={mutation.isPending}
				>
					{" "}
					Start Creating
					<ArrowRight className="size-4 ml-2" />
				</Button>
			</motion.div>
		</motion.div>
	);
};
