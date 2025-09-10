import React from "react";

import { FaCircle, FaSquare, FaSquareFull } from "react-icons/fa";
import { IoTriangle } from "react-icons/io5";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { FaDiamond } from "react-icons/fa6";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShapeTool } from "./shape-tool";
interface ShapeSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const ShapeSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: ShapeSidebarProps) => {
	const onClose = () => {
		onChangeActiveTool("select");
	};
	return (
		<aside
			className={cn(
				"bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "shapes" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader
				title="Shapes"
				description="Add shapes to your canvas"
			/>

			<ScrollArea>
				<div className="grid grid-cols-3 gap-4 p-4">
					<ShapeTool onClick={() => editor?.addCircle()} icon={FaCircle} />
					<ShapeTool
						onClick={() => editor?.addSoftRectangle()}
						icon={FaSquare}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addRectangle();
						}}
						icon={FaSquareFull}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addTriangle();
						}}
						icon={IoTriangle}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addInverseTriangle();
						}}
						icon={IoTriangle}
						iconClassName="rotate-180"
					/>
					<ShapeTool
						onClick={() => {
							editor?.addDiamond();
						}}
						icon={FaDiamond}
					/>
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
