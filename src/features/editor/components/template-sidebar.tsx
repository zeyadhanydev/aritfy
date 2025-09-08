"use client";

import { AlertTriangle, Crown, Loader } from "lucide-react";
import { useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ToolSidebarHeader } from "@/features/editor/components/tool-sidebar-header";
import { type ActiveTool, type Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { useGetTemplates } from "@/features/projects/api/use-get-templates";
import { useConfirm } from "@/hooks/use-confirm";
import { usePaywall } from "@/features/subscription/hooks/use-paywall";

interface TemplateSidebarProps {
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	editor: Editor | undefined;
}

export const TemplateSidebar = ({
	activeTool,
	editor,
	onChangeActiveTool,
}: TemplateSidebarProps) => {
	const [ConfirmDialog, confirm] = useConfirm(
		"Are you sure?",
		"You are about to replace the current project with this template",
	);
	const onClose = useCallback(() => {
		onChangeActiveTool("select");
	}, [onChangeActiveTool]);
	const { data, isLoading, isError } = useGetTemplates({
		limit: "20",
		page: "1",
	});
	const paywall = usePaywall();

	const onClick = async (template: any) => {
		const ok = await confirm();
		if (paywall.shouldBlock && template.isPro) {
			paywall.triggerPaywall();
			return;
		}
		if (ok) {
			editor.loadJson(template.json);
		}
	};
	return (
		<aside
			className={cn(
				"bg-white relative border-r z-[40] w-[360px] h-full flex flex-col",
				activeTool === "templates" ? "visible" : "hidden",
			)}
		>
			<ConfirmDialog />
			<ToolSidebarHeader
				title="Template"
				description="Choose from a varity of templates to get started"
			/>

			{isLoading && (
				<div className="flex items-center justify-center flex-1">
					<Loader className="size-4 text-muted-foreground animate-spin" />
				</div>
			)}
			{isError && (
				<div className="flex flex-col gap-y-4 items-center justify-center flex-1">
					<AlertTriangle className="size-4 text-muted-foreground" />
					<p className="text-muted-foreground text-xs">
						Failed to fetch templates
					</p>
				</div>
			)}

			<ScrollArea className="flex-1 overflow-y-auto">
				<div className="p-4 grid grid-cols-2 gap-4">
					{data?.map((template) => {
						return (
							<button
								type="button"
								key={template.id}
								className="relative w-full group hover:opacity-75 transition bg-muted rounded-sm overflow-hidden border"
								onClick={() => {
									onClick(template);
								}}
							>
								<img
									src={template.thumbnailUrl || ""}
									alt={template.name || "Template"}
									className="object-cover"
									style={{
										aspectRatio: `${template.width}/${template.height}`,
									}}
								/>
								{template.isPro && (
									<div className="absolute top-2 right-2 size-8 flex items-center justify-center bg-black/50 rounded-full">
										<Crown className="size-4 fill-yellow-500 text-yellow-500" />
									</div>
								)}
								<div
									className="opacity-0 group-hover:opacity-100 absolute left-0 bottom-0 w-full
							 text-[10px] truncate text-white p-1 bg-black/50 text-left"
								>
									{template.name}
								</div>
							</button>
						);
					})}
				</div>
			</ScrollArea>

			<ToolSidebarClose onClick={onClose} />
		</aside>
	);
};
