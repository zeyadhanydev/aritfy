"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { type ActiveTool, type Editor, fonts } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarClose } from "./tool-sidebar-close";

interface FontSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const FontSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: FontSidebarProps) => {
	const onClose = useCallback(() => {
		onChangeActiveTool("select");
	}, [onChangeActiveTool]);
	const fontFamily = editor?.getActiveFontFamily();
	return (
		<aside
			className={cn(
				"bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "font" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader title="Font" description="Change text font" />

			<ScrollArea className="flex-1 overflow-y-auto">
				<div className="p-4 space-y-1 border-b">
					{fonts.map((font) => {
						return (
							<Button
								key={font}
								className={cn(
									"w-full h-16 justify-start text-left ",
									font === fontFamily && "border border-blue-500",
								)}
								variant={"secondary"}
								size={"lg"}
								style={{
									fontFamily: font,
									fontSize: "16px",
									padding: "8px 16px",
								}}
								onClick={() => editor?.changeFontFamily(font)}
							>
								{font}
							</Button>
						);
					})}
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
