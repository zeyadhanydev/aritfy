"use client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import {
	type ActiveTool,
	type Editor,
	STROKE_DASH_ARRAY,
	STROKE_WIDTH,
} from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarClose } from "./tool-sidebar-close";

interface StrokeWidthSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const StrokeWidthSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: StrokeWidthSidebarProps) => {
	const onClose = () => {
		onChangeActiveTool("select");
	};
	const widthValue = editor?.getActiveStrokeWidth() || STROKE_WIDTH;
  const typeValue = editor?.getActiveStrokeDashArray() || STROKE_DASH_ARRAY;
	const onChangeStrokeWidth = (value: number) => {
		editor?.changeStrokeWidth(value);
	};
  const onChangeStrokeType = (value: number[]) => {
    editor?.changeStrokeDashArray(value);

  }

	return (
		<aside
			className={cn(
				"bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "stroke-width" ? "visible" : "hidden",
			)}
		>
			<ToolSidebarHeader
				title="Stroke Options"
				description="Modify the stroke of your element"
			/>

			<ScrollArea>
				<div className="p-4 space-y-4 border-b">
					<Label className="text-sm">Stroke Width</Label>
					<Slider
						value={[widthValue]}
						onValueChange={(values) => onChangeStrokeWidth(values[0])}
					/>
				</div>
				<div className="p-4 space-y-4 border-b">
					<Label className="text-sm">Stroke Type</Label>
					<Button variant={'secondary'} onClick={() => {
              onChangeStrokeType([]);
          }} size={'lg'} className={cn("w-full text-left h-16 justify-start", JSON.stringify(typeValue) === `[]` && 'border border-blue-500')} style={{
					padding: '8px 16px'
					}}>
						<div className="border-black w-full rounded-full border-4" />
					</Button>
					<Button variant={'secondary'} size={'lg'} className={cn("w-full text-left h-16 justify-start", JSON.stringify(typeValue) === `[5,5]` && 'border border-blue-500')}
				 onClick={() => {
					onChangeStrokeType([5,5]);

					}}
					style={{
									padding: '8px 16px'
									}}>
									<div className="border-dashed w-full rounded-full border-4" />
									</Button>
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
