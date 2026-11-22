"use client";
import {ToolSidebarHeader} from './tool-sidebar-header';
import {ToolSidebarClose} from './tool-sidebar-close';
import {type ActiveTool, type Editor} from '../types';
import {cn} from '@/lib/utils';
interface Props {activeTool: ActiveTool; onChangeActiveTool: (tool: ActiveTool) => void; editor: Editor | undefined}
export const RemoveBgSidebar = ({activeTool, onChangeActiveTool}: Props) => (
  <aside data-editor-panel className={cn('bg-background relative border-r z-[40] w-[360px] h-full flex flex-col', activeTool === 'remove-bg' ? 'visible' : 'hidden')}>
    <ToolSidebarHeader title="Background removal" description="Not enabled in this release" />
    <div className="p-4 space-y-3 text-sm"><p>Background removal is unavailable in this release.</p><p className="text-muted-foreground">Image resizing, filters, layering and export are still available. No model is downloaded and no paid service is called from this panel.</p></div>
    <ToolSidebarClose onClick={() => onChangeActiveTool('select')} />
  </aside>
);
