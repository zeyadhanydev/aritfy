"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";

export function ModeToggle() {
	const { setTheme, theme } = useTheme();

	const toggleTheme = () => {
		if (theme === "dark") {
			setTheme("light");
		} else {
			setTheme("dark");
		}
	};

	return (
		<Button
			variant="outline"
			size="icon"
			className="rounded-full"
			onClick={toggleTheme}
		>
			<AnimatePresence mode="wait" initial={false}>
				{theme === "dark" ? (
					<motion.div
						key="moon"
						initial={{ scale: 0, rotate: 90 }}
						animate={{ scale: 1, rotate: 0 }}
						exit={{ scale: 0, rotate: -90 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<Moon className="h-[1.2rem] w-[1.2rem]" />
					</motion.div>
				) : (
					<motion.div
						key="sun"
						initial={{ scale: 0, rotate: -90 }}
						animate={{ scale: 1, rotate: 0 }}
						exit={{ scale: 0, rotate: 90 }}
						transition={{ duration: 0.3, ease: "easeInOut" }}
					>
						<Sun className="h-[1.5rem] w-[1.5rem]" />
					</motion.div>
				)}
			</AnimatePresence>
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
