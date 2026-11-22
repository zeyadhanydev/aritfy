"use client";
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {ToolSidebarHeader} from './tool-sidebar-header';
import {ToolSidebarClose} from './tool-sidebar-close';
import {type ActiveTool, type Editor} from '../types';
import {cn} from '@/lib/utils';

interface AiSidebarProps {activeTool: ActiveTool; onChangeActiveTool: (tool: ActiveTool) => void; editor: Editor | undefined}
export const AiSidebar = ({activeTool, editor, onChangeActiveTool}: AiSidebarProps) => (
  <aside data-editor-panel className={cn('bg-background relative border-r z-[40] w-[360px] h-full flex flex-col', activeTool === 'ai' ? 'visible' : 'hidden')}>
    <ToolSidebarHeader title="Sample artwork" description="Try image editing without an AI service" />
    <ScrollArea className="flex-1"><div className="p-4 space-y-4">
      <div className="rounded-lg border bg-muted p-3 text-sm"><p className="font-medium">AI generation is not available in this release.</p><p className="mt-2 text-muted-foreground">This is fixed sample artwork, not an AI-generated result. Inserting it does not call a generation provider.</p></div>
      {/* First-party, self-contained illustration. No external image service or model download. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/samples/studio-still-life.svg" alt="Fixed sample illustration of a vase and plant on a studio plinth" className="w-full rounded-lg border" />
      <p className="text-xs text-muted-foreground">Sample illustration · Not AI-generated</p>
      <Button className="w-full" disabled={!editor} onClick={() => editor?.addImage('/samples/studio-still-life.svg')}>Insert sample artwork</Button>
      <p className="text-xs text-muted-foreground">Then resize, move, layer or export it with the rest of your design.</p>
    </div></ScrollArea>
    <ToolSidebarClose onClick={() => onChangeActiveTool('select')} />
  </aside>
);
