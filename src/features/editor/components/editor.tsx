'use client';

import React, {  useCallback, useEffect, useRef, useState } from 'react'
import { useEditor } from '@/features/editor/hooks/use-editor';
import { fabric } from 'fabric';
import { Navbar } from '@/features/editor/components/navbar';
import { Sidebar } from '@/features/editor/components/sidebar';
import { Toolbar } from '@/features/editor/components/toolbar';
import { Footer } from '@/features/editor/components/footer';
import { ActiveTool } from '@/features/editor/types';
import { ShapeSidebar } from '@/features/editor/components/shape-sidebar';

export const Editor = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>('select')
  const { init,editor  } = useEditor();
  const onChangeActiveTool =  useCallback((tool: ActiveTool) => {
    if (tool ===activeTool) return setActiveTool('select');
    if (tool === 'draw') {
      // TODO: enable draw mode
    }
    if (activeTool === 'draw') {
      // TODO: disable draw mode
    }
    setActiveTool(tool);
  }, [activeTool])

  const canvasRef = useRef(null);
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      controlsAboveOverlay: true,
      preserveObjectStacking: true,

    })
    init({
      initialCanvas: canvas,
      initialContainer: containerRef.current!
    });
    return () => {
      canvas.dispose()
    }
  }, [init])
  return (
    <div className='h-full flex flex-col'>
      <Navbar activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
      <div className='absolute h-[calc(100%-68px)] w-full top-[68px] flex'>
        <Sidebar activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />

        <ShapeSidebar editor={editor}  activeTool={activeTool} onChangeActiveTool={onChangeActiveTool} />
        <main className='bg-muted flex-1 overflow-auto relative flex flex-col'>
          <Toolbar />
          <div ref={containerRef} className='flex-1 bg-muted h-[calc(100%-124px)]'>
            {/* containerRef, canvasRef control the canvas area responsive in the page and centerd in the page */}
            <canvas ref={canvasRef} />

          </div>
          <Footer/>
        </main>
      </div>
    </div>
  )
}
