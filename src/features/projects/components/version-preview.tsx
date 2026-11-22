"use client";
import {useEffect, useRef, useState} from 'react';
import {fabric} from 'fabric';
import {designIsComplete, normalizeDesignForLoad} from '@/features/editor/design-integrity';
import {JSON_KEYS} from '@/features/editor/types';

export const VersionPreview = ({json, onReady}: {json: string; onReady: (ready: boolean) => void}) => {
  const element = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    onReady(false);
    setError(null);
    let cancelled = false;
    let finished = false;
    const canvas = new fabric.StaticCanvas(element.current!, {width: 640, height: 420, renderOnAddRemove: false});
    const timeout = window.setTimeout(() => {if (!cancelled) setError('Preview timed out. Restore is disabled until all assets can be checked.');}, 20000);
    try {
      const design = JSON.parse(json);
      normalizeDesignForLoad(design);
      canvas.loadFromJSON(design, () => {
        finished = true;
        window.clearTimeout(timeout);
        if (cancelled) {canvas.dispose(); return;}
        try {
          if (!designIsComplete(design, canvas.toJSON(JSON_KEYS))) throw new Error();
          const workspace = canvas.getObjects().find(object => object.name === 'clip');
          if (!workspace?.width || !workspace.height) throw new Error();
          const scale = Math.min(600 / workspace.getScaledWidth(), 380 / workspace.getScaledHeight());
          const center = workspace.getCenterPoint();
          canvas.setViewportTransform([scale, 0, 0, scale, 320 - center.x * scale, 210 - center.y * scale]);
          canvas.renderAll();
          setError(null);
          onReady(true);
        } catch {setError('Some assets could not be previewed. Your current project has not been changed.');}
      });
    } catch {finished = true; window.clearTimeout(timeout); setError('This version could not be previewed safely.');}
    return () => {cancelled = true; window.clearTimeout(timeout); if (finished) canvas.dispose();};
  }, [json, onReady]);
  return <div className="space-y-2"><div className="overflow-hidden rounded-lg border bg-muted [&_canvas]:!w-full [&_canvas]:!h-auto"><canvas ref={element} aria-label="Read-only saved design preview" /></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
};
