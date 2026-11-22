"use client";
import { BackgroundRemover } from "@/components/background-remover";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { type ActiveTool, type Editor } from "../types";

interface Props { activeTool: ActiveTool; onChangeActiveTool: (tool: ActiveTool) => void; editor: Editor | undefined }

export const RemoveBgSidebar = ({ activeTool, onChangeActiveTool }: Props) => {
  if (activeTool !== "remove-bg") return null;
  return (
    <aside data-editor-panel className="bg-background relative border-r z-[40] w-[360px] h-full flex flex-col">
      <ToolSidebarHeader title="Background removal" description="Deferred in this release" />
      <div className="p-4 overflow-y-auto"><BackgroundRemover /></div>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
