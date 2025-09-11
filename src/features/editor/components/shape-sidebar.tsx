import React from "react";

import {
	FaCircle,
	FaSquare,
	FaSquareFull,
	FaStar,
	FaHeart,
	FaPlus,
} from "react-icons/fa";
import { IoTriangle } from "react-icons/io5";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { FaDiamond } from "react-icons/fa6";
import {
	MdKeyboardArrowUp,
	MdKeyboardArrowDown,
	MdKeyboardArrowLeft,
	MdKeyboardArrowRight,
} from "react-icons/md";
import { TbHexagon, TbPentagon, TbOval } from "react-icons/tb";
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
					<ShapeTool
						onClick={() => {
							editor?.addStar();
						}}
						icon={FaStar}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addPentagon();
						}}
						icon={TbPentagon}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addHexagon();
						}}
						icon={TbHexagon}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addArrowRight();
						}}
						icon={MdKeyboardArrowRight}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addArrowLeft();
						}}
						icon={MdKeyboardArrowLeft}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addArrowUp();
						}}
						icon={MdKeyboardArrowUp}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addArrowDown();
						}}
						icon={MdKeyboardArrowDown}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addHeart();
						}}
						icon={FaHeart}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addPlus();
						}}
						icon={FaPlus}
					/>
					<ShapeTool
						onClick={() => {
							editor?.addEllipse();
						}}
						icon={TbOval}
					/>
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
