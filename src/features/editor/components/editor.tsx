"use client";

import { fabric } from "fabric";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiSidebar } from "@/features/editor/components/ai-sidebar";
import { FillColorSidebar } from "@/features/editor/components/fill-color-sidebar";
import { FilterSidebar } from "@/features/editor/components/filter-sidebar";
import { FontSidebar } from "@/features/editor/components/font-sidebar";
import { Footer } from "@/features/editor/components/footer";
import { ImageSidebar } from "@/features/editor/components/image-sidebar";
import { TemplateSidebar } from "@/features/editor/components/template-sidebar";
import { Navbar } from "@/features/editor/components/navbar";
import { OpacitySidebar } from "@/features/editor/components/opacity-sidebar";
import { RemoveBgSidebar } from "@/features/editor/components/remove-bg-sidebar";
import { ShapeSidebar } from "@/features/editor/components/shape-sidebar";
import { Sidebar } from "@/features/editor/components/sidebar";
import { StrokeColorSidebar } from "@/features/editor/components/stroke-color-sidebar";
import { StrokeWidthSidebar } from "@/features/editor/components/stroke-width-sidebar";
import { TextSidebar } from "@/features/editor/components/text-sidebar";
import { Toolbar } from "@/features/editor/components/toolbar";

import { useEditor } from "@/features/editor/hooks/use-editor";
import {
	type ActiveTool,
	selectionDependentTools,
} from "@/features/editor/types";
import type { ResponseType } from "@/features/projects/api/use-get-project";
import { DrawSidebar } from "./draw-sidebar";
import { SettingsSidebar } from "./settings-sidebar";
import { useUpdateProject } from "@/features/projects/api/use-update-project";
import debounce from "lodash.debounce";

interface EditorProps {
	initialData: ResponseType["data"];
}
export const Editor = ({ initialData }: EditorProps) => {
	const { mutate } = useUpdateProject(initialData.id);

	const debouncedSave = useMemo(() =>
		debounce((values: { json: string; height: number; width: number }) => {
			mutate(values);
		}, 500),
		[mutate],
	);

	useEffect(() => () => { debouncedSave.flush(); }, [debouncedSave]);

	const [activeTool, setActiveTool] = useState<ActiveTool>("select");
	const onClearSelection = useCallback(() => {
		if (selectionDependentTools.includes(activeTool)) {
			setActiveTool("select");
		}
	}, [activeTool]);
	const { init, editor, loadError } = useEditor({
		defaultState: initialData.json,
		defaultWidth: initialData.width,
		defaultHeight: initialData.height,
		clearSelectionCallback: onClearSelection,
		saveCallback: debouncedSave,
	});

	const onChangeActiveTool = useCallback(
		(tool: ActiveTool) => {
			if (tool === "draw") {
				editor?.enableDrawingMode();
			}
			if (activeTool === "draw") {
				editor?.disableDrawingMode();
			}

			if (tool === activeTool) return setActiveTool("select");

			setActiveTool(tool);
		},
		[activeTool, editor],
	);

	const canvasRef = useRef(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = new fabric.Canvas(canvasRef.current, {
			controlsAboveOverlay: true,
			preserveObjectStacking: true,
		});
		init({
			initialCanvas: canvas,
			initialContainer: containerRef.current!,
		});
		return () => {
			canvas.dispose();
		};
	}, [init]);
    if (loadError) return <div role="alert" className="h-full flex flex-col items-center justify-center gap-4 p-8 text-center"><h1 className="font-semibold">Design could not be opened</h1><p>{loadError}</p><Link href="/" className="underline">Back to dashboard</Link></div>;
    return (
        <div className="h-full flex flex-col">
			<Navbar
				activeTool={activeTool}
				onChangeActiveTool={onChangeActiveTool}
				editor={editor}
				id={initialData.id}
			/>
			<div className="absolute inset-x-0 top-[68px] bottom-0 flex min-h-0 min-w-0 overflow-hidden">
				<Sidebar
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>

				<ShapeSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<FillColorSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<StrokeColorSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<StrokeWidthSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<OpacitySidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<TextSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<FontSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<TemplateSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>

				<ImageSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<FilterSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<AiSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<RemoveBgSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<DrawSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<SettingsSidebar
					editor={editor}
					activeTool={activeTool}
					onChangeActiveTool={onChangeActiveTool}
				/>
				<main className="bg-muted flex-1 min-h-0 min-w-0 overflow-hidden relative flex flex-col">
					<Toolbar
						editor={editor}
						activeTool={activeTool}
						onChangeActiveTool={onChangeActiveTool}
						key={JSON.stringify(editor?.canvas.getActiveObject())}
					/>
					<div
						ref={containerRef}
						className="flex-1 min-h-0 min-w-0 bg-muted relative overflow-hidden"
					>
						{/* containerRef, canvasRef control the canvas area responsive in the page and centerd in the page */}
						<div className="absolute inset-0"><canvas ref={canvasRef} /></div>
					</div>
					<Footer editor={editor} />
				</main>
			</div>
		</div>
	);
};
