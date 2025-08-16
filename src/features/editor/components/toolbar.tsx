"use client";

import React from "react";
import { BsBorderWidth } from "react-icons/bs";
import { Hint } from "@/components/hint";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type ActiveTool, type Editor, FILL_COLOR } from "../types";

interface ToolbarProps {
	editor: Editor | undefined;
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
}

export const Toolbar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: ToolbarProps) => {
	const fillColor = editor?.getActiveFillColor();
	const strokeColor = editor?.getActiveStrokeColor();
	if (editor?.selectedObjects.length === 0) {
		return (
			<div className="shrink-0 h-[56px] border-b bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2" />
		);
	}
	return (
		<div className="shrink-0 h-[56px] border-b bg-white w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2">
			<div className="flex items-center h-full justify-center">
				<Hint label="color" side="bottom" sideOffset={5}>
					<Button
						onClick={() => onChangeActiveTool("fill")}
						variant={"ghost"}
						size={"icon"}
						className={cn(activeTool === "fill" && "bg-gray-100")}
					>
						<div
							className="rounded-sm size-4 border"
							style={{
								backgroundColor: fillColor || FILL_COLOR,
							}}
						/>
					</Button>
				</Hint>
			</div>
			<div className="flex items-center h-full justify-center">
				<Hint label="Stroke Color" side="bottom" sideOffset={5}>
					<Button
						onClick={() => onChangeActiveTool("stroke-color")}
						variant={"ghost"}
						size={"icon"}
						className={cn(activeTool === "stroke-color" && "bg-gray-100")}
					>
						<div
							className="rounded size-4 border-2 bg-white"
							style={{
								borderColor: strokeColor,
							}}
						/>
					</Button>
				</Hint>
			</div>
			<div className="flex items-center h-full justify-center">
				<Hint label="Stroke Width" side="bottom" sideOffset={5}>
					<Button
						onClick={() => onChangeActiveTool("stroke-width")}
						variant={"ghost"}
						size={"icon"}
						className={cn(activeTool === "stroke-width" && "bg-gray-100")}
					>
						<BsBorderWidth className="size-4" />
					</Button>
				</Hint>
			</div>
		</div>
	);
};
