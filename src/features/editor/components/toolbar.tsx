"use client";

import dynamic from "next/dynamic";
import type { ActiveTool, Editor } from "../types";

interface ToolbarProps {
	editor: Editor | undefined;
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: string) => void;
}

const ClientToolbar = dynamic(
	() => import("./client-toolbar").then((mod) => mod.ClientToolbar),
	{ ssr: false },
);

const ToolbarSkeleton = () => (
	<div className="shrink-0 h-[56px] border-b bg-background w-full flex items-center overflow-x-auto z-[49] p-2 gap-x-2">
		<div className="w-full h-full flex items-center justify-start">
			<div className="animate-pulse flex space-x-2">
				{Array(5)
					.fill(0)
					.map((_, i) => (
						<div key={i} className="rounded-full bg-gray-200 h-8 w-8" />
					))}
			</div>
		</div>
	</div>
);

export const Toolbar = (props: ToolbarProps) => {
	return (
		<>
			<ClientToolbar {...props} />
			<noscript>
				<ToolbarSkeleton />
			</noscript>
		</>
	);
};

export default Toolbar;
