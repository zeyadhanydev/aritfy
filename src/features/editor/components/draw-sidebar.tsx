"use client";
import React from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { ColorPicker } from "@/features/editor/components/color-picker";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import {
	type ActiveTool,
	type Editor,
	STROKE_COLOR,
    STROKE_WIDTH,
} from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarClose } from "./tool-sidebar-close";

interface DrawSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const DrawSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: DrawSidebarProps) => {
	const onClose = () => {
		onChangeActiveTool("select");
	};
	const colorValue = editor?.getActiveStrokeColor() || STROKE_COLOR;
	const widthValue= editor?.getActiveStrokeWidth() || STROKE_WIDTH;
	const onColorChange = (value: string) => {
		editor?.changeStrokeColor(value);
	};
	const onWidthChange = (value: number) => {
		editor?.changeStrokeWidth(value);
	};

	return (
		<aside
			className={cn(
				"bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "draw" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader
				title="Drawing mode"
				description="Modify brush settings"
			/>

			<ScrollArea>
				<div className="p-4 space-x-6">
					<div className="p-4 space-y-6">
						<Label className="text-sm">Brush Width</Label>
						<Slider value={[widthValue]} onValueChange={(values) => {
						onWidthChange(values[0])
						}}/>
					</div>
					<ColorPicker value={colorValue} onChange={onColorChange} />
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
