"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import type { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarClose } from "./tool-sidebar-close";

interface OpacitySidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const OpacitySidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: OpacitySidebarProps) => {
	const onClose = () => {
		onChangeActiveTool("select");
	};
	const initialValue = editor?.getActiveOpacity() || 1;
	const [opacity, setOpacity] = useState(initialValue);
	const selectedObject = useMemo(
		() => editor?.selectedObjects[0],
		[editor?.selectedObjects],
	);
	useEffect(() => {
		if (selectedObject) {
			setOpacity(selectedObject.get("opacity") || 1);
		}
	}, [selectedObject]);
	const onChange = (value: number) => {
		editor?.changeOpacity(value);
		setOpacity(value);
	};

	return (
		<aside
			className={cn(
				"bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "opacity" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader
				title="Opacity"
				description="Change the opacity of the selected object"
			/>

			<ScrollArea>
				<div className="p-4 space-y-4 border-b">
					<Label className="text-sm">Opcaity</Label>
					<Slider
						value={[opacity]}
						onValueChange={(values) => onChange(values[0])}
						max={1}
						min={0}
						step={0.01}
					/>
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
