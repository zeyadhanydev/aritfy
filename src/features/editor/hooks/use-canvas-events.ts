import type { fabric } from "fabric";
import { useEffect } from "react";

interface UseCanvasEventsProps {
 save: () => void;
 canvas: fabric.Canvas | null;
 setSelectedObjects: (objects: fabric.Object[]) => void;
 clearSelectionCallback?: () => void;
}

export const useCanvasEvents = ({ canvas, setSelectedObjects, clearSelectionCallback, save }: UseCanvasEventsProps) => {
 useEffect(() => {
  if (!canvas) return;
  const onChange = () => save();
  const onSelection = (event: fabric.IEvent) => setSelectedObjects(event.selected || []);
  const onClear = () => { setSelectedObjects([]); clearSelectionCallback?.(); };
  canvas.on("object:added", onChange);
  canvas.on("object:removed", onChange);
  canvas.on("object:modified", onChange);
  canvas.on("selection:created", onSelection);
  canvas.on("selection:updated", onSelection);
  canvas.on("selection:cleared", onClear);
  return () => {
   canvas.off("object:added", onChange);
   canvas.off("object:removed", onChange);
   canvas.off("object:modified", onChange);
   canvas.off("selection:created", onSelection);
   canvas.off("selection:updated", onSelection);
   canvas.off("selection:cleared", onClear);
  };
 }, [canvas, setSelectedObjects, clearSelectionCallback, save]);
};
