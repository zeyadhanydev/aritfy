"use client";
import Image from "next/image";
import { useState } from "react";
import { Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRemoveBackground } from "@/features/ai/hooks/use-remove-background";
import { usePaywall } from "@/features/subscription/hooks/use-paywall";
import { ToolSidebarHeader } from "./tool-sidebar-header";
import { ToolSidebarClose } from "./tool-sidebar-close";
import { type ActiveTool, type Editor } from "../types";
import { cn } from "@/lib/utils";
interface Props { activeTool: ActiveTool; onChangeActiveTool: (tool: ActiveTool) => void; editor: Editor | undefined }

export const RemoveBgSidebar = ({ activeTool, onChangeActiveTool, editor }: Props) => {
  const selected = editor?.selectedObjects[0];
  const imageSrc = selected?.type === "image" ? (selected as fabric.Image).getSrc() : undefined;
  const [source, setSource] = useState<string>();
  const [added, setAdded] = useState(false);
  const { removeBackground, imageUrl, isLoading, error, progress, isClientSideAvailable } = useRemoveBackground();
  const paywall = usePaywall();
  const run = async () => {
    if (paywall.shouldBlock) { paywall.triggerPaywall(); return; }
    if (!imageSrc || isLoading) return;
    setSource(imageSrc); setAdded(false);
    await removeBackground(imageSrc);
  };
  const add = () => {
    if (!imageUrl || source !== imageSrc || !editor || added) return;
    editor.addImage(imageUrl); setAdded(true);
  };
  const showResult = !!imageUrl && source === imageSrc;
  return (
    <aside data-editor-panel className={cn("bg-background relative border-r z-[40] w-[360px] h-full flex flex-col", activeTool === "remove-bg" ? "visible" : "hidden")}>
      <ToolSidebarHeader title="Remove background" description="Automatic, on-device subject cutout" />
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4 text-sm">
          <p>Runs on your device, without AI service credits or sending the image to an AI provider. The local model (4.4 MB) and its runtime download on first use.</p>
          <p className="text-xs text-muted-foreground">Best with one clear subject. Fine hair, transparent objects and busy scenes can need manual cleanup. Up to 8 megapixels.</p>
          {!imageSrc && <p role="status">Select an image on the canvas to remove its background.</p>}
          {imageSrc && <>
            <div className="relative aspect-square rounded-md border overflow-hidden bg-[repeating-conic-gradient(#e4e4e7_0%_25%,#fff_0%_50%)] bg-[length:20px_20px]">
              <Image src={showResult ? imageUrl! : imageSrc} fill unoptimized alt={showResult ? "Transparent cutout preview" : "Selected source image"} className="object-contain" />
            </div>
            {error && <p role="alert" className="text-destructive text-xs">{error}</p>}
            {!isClientSideAvailable && <p role="alert">This browser does not support local background removal.</p>}
            <Button onClick={run} disabled={isLoading || !isClientSideAvailable} className="w-full">
              {isLoading && <Loader aria-hidden="true" className="mr-2 size-4 animate-spin" />}
              {isLoading ? progress : "Remove background"}
            </Button>
            {showResult && <Button onClick={add} disabled={added} variant="outline" className="w-full">{added ? "Copy added to canvas" : "Add transparent copy"}</Button>}
            <p className="text-xs text-muted-foreground">Your original stays unchanged. Review the preview before adding a separate copy.</p>
          </>}
          <a className="text-xs underline text-muted-foreground" href="/models/NOTICE.txt" target="_blank" rel="noreferrer">U²-NetP model and runtime licenses</a>
        </div>
      </ScrollArea>
      <ToolSidebarClose onClick={() => onChangeActiveTool("select")} />
    </aside>
  );
};
