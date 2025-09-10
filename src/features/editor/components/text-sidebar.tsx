"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import type { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarClose } from "./tool-sidebar-close";

interface TextSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const TextSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: TextSidebarProps) => {
	const onClose = useCallback(() => {
		onChangeActiveTool("select");
	}, [onChangeActiveTool]);

	return (
		<aside
			className={cn(
				"bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "text" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader title="Text" description="Add text to your canvas" />

			<ScrollArea>
				<div className="p-4 space-y-4 border-b">
					<Button className="w-full" onClick={() => editor?.addText("Textbox")}>
						Add a textbox{" "}
					</Button>
					<Button
						className="w-full h-16"
						variant={"secondary"}
						size={"lg"}
						onClick={() =>
							editor?.addText("Heading", {
								fontSize: 80,
								fontWeight: 700,
							})
						}
					>
						<div className="text-3xl font-bold">Add a heading</div>
					</Button>
					<Button
						className="w-full h-16"
						variant={"secondary"}
						size={"lg"}
						onClick={() =>
							editor?.addText("Subheading", {
								fontSize: 44,
								fontWeight: 500,
							})
						}
					>
						<div className="text-2xl font-medium">Add a subheading</div>
					</Button>
					<Button
						className="w-full h-16"
						variant={"secondary"}
						size={"lg"}
						onClick={() =>
							editor?.addText("Paragraph", {
								fontSize: 32,
							})
						}
					>
						Add a subheading
					</Button>
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
