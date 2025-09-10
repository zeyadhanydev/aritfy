"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { type ActiveTool, type Editor, filters } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarClose } from "./tool-sidebar-close";

interface FilterSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const FilterSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: FilterSidebarProps) => {
	const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

	const onClose = useCallback(() => {
		onChangeActiveTool("select");
	}, [onChangeActiveTool]);
	return (
		<aside
			className={cn(
				"bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "filter" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader
				title="Filters"
				description="Applay a filter to selected image"
			/>

			<ScrollArea className="flex-1 overflow-y-auto">
				<div className="p-4 space-y-1 border-b">
					{filters.map((filter) => {
						return (
							<Button
								key={filter}
								className={cn(
									"w-full h-16 justify-start text-left",
									selectedFilter === filter && "border-blue-500 border",
								)}
								variant={"secondary"}
								size={"lg"}
								onClick={() => {
									editor?.changeImageFilter(filter);
									setSelectedFilter(filter);
								}}
							>
								{filter}
							</Button>
						);
					})}
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
