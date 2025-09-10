"use client";

import dynamic from "next/dynamic";
import type { ActiveTool, Editor } from "../types";

// Define props interface for the component
interface ToolbarProps {
	editor: Editor | undefined;
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: string) => void;
}

// Import the toolbar component with client-side only rendering
// This prevents hydration mismatch errors since the component
// relies entirely on client-side editor state
const ClientToolbar = dynamic(
	() => import("./client-toolbar").then((mod) => mod.ClientToolbar),
	{ ssr: false },
);

// Simple skeleton loader to show during client-side loading
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

/**
 * Toolbar component that renders a client-only implementation
 * This approach prevents hydration mismatches by deferring
 * all rendering to the client side
 */
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
