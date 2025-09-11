import React from "react";
import { Move, Hand, MousePointer2 } from "lucide-react";
import { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface MoveSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const MoveSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: MoveSidebarProps) => {
	const onClose = () => {
		onChangeActiveTool("select");
	};

	return (
		<aside
			className={cn(
				"bg-background relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "move" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader
				title="Move Tool"
				description="Move objects around the canvas easily"
			/>

			<ScrollArea>
				<div className="p-4 space-y-4">
					<div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
						<MousePointer2 className="size-5 text-blue-600" />
						<div className="text-sm text-blue-800">
							<div className="font-medium">Move Mode Active</div>
							<div className="text-blue-600">
								Click and drag objects to move them. Resize handles are
								disabled.
							</div>
						</div>
					</div>

					<div className="space-y-2">
						<h3 className="text-sm font-medium text-gray-700">Quick Actions</h3>

						<Button
							variant="outline"
							size="sm"
							className="w-full justify-start gap-2"
							onClick={() => {
								editor?.onCopy();
								editor?.onPaste();
							}}
						>
							<Move className="size-4" />
							Duplicate Selected
						</Button>

						<Button
							variant="outline"
							size="sm"
							className="w-full justify-start gap-2"
							onClick={() => editor?.bringForward()}
						>
							<Hand className="size-4" />
							Bring Forward
						</Button>

						<Button
							variant="outline"
							size="sm"
							className="w-full justify-start gap-2"
							onClick={() => editor?.sendBackwards()}
						>
							<Hand className="size-4" />
							Send Backward
						</Button>
					</div>

					<div className="text-xs text-gray-500 space-y-1">
						<div className="font-medium">Tips:</div>
						<ul className="space-y-1 ml-2">
							<li>• Click on objects to select them</li>
							<li>• Drag selected objects to move them</li>
							<li>• Hold Shift to select multiple objects</li>
							<li>• Use keyboard arrows for precise movement</li>
						</ul>
					</div>
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
