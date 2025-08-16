"use client";
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColorPicker } from "@/features/editor/components/color-picker";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import {
	type ActiveTool,
	type Editor,
	FILL_COLOR,
    STROKE_COLOR,
} from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarClose } from "./tool-sidebar-close";

interface StrokeColorSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const StrokeColorSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: StrokeColorSidebarProps) => {
	const onClose = () => {
		onChangeActiveTool("select");
	};
	const value = editor?.getActiveStrokeColor() || STROKE_COLOR;
	const onChange = (value: string) => {
		editor?.changeStrokeColor(value);
	};

	return (
		<aside
			className={cn(
				"bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "stroke-color" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader
				title="Stroke Color"
				description="Add stroke color to your element"
			/>

			<ScrollArea>
				<div className="p-4 space-x-6">
					<ColorPicker value={value} onChange={onChange} />
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
