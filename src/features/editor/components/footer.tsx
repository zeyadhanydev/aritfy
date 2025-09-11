import { Hand, Minimize, ZoomIn, ZoomOut } from "lucide-react";
import React from "react";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import type { Editor } from "../types";

interface FooterProps {
	editor: Editor | undefined;
}

export const Footer = ({ editor }: FooterProps) => {
	return (
		<footer className="h-[52px] border-t bg-background w-full flex items-center justify-between overflow-x-auto z-[49] p-2 gap-x-1 shrink-0">
			<div className="flex items-center gap-x-2">
				<div className="flex items-center gap-x-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
					<Hand className="size-3" />
					<span>Hold Alt + drag to pan • Mouse wheel to zoom</span>
				</div>
			</div>
			<div className="flex items-center gap-x-1">
				<Hint label="Reset" side="top" sideOffset={10}>
					<Button
						onClick={() => editor?.autoZoom()}
						size={"icon"}
						variant={"ghost"}
						className="h-full"
					>
						<Minimize className="size-4" />
					</Button>
				</Hint>
				<Hint label="Zoom in" side="top" sideOffset={10}>
					<Button
						onClick={() => editor?.zoomIn()}
						size={"icon"}
						variant={"ghost"}
						className="h-full"
					>
						<ZoomIn className="size-4" />
					</Button>
				</Hint>
				<Hint label="Zoom out" side="top" sideOffset={10}>
					<Button
						onClick={() => editor?.zoomOut()}
						size={"icon"}
						variant={"ghost"}
						className="h-full"
					>
						<ZoomOut className="size-4" />
					</Button>
				</Hint>
			</div>
		</footer>
	);
};
