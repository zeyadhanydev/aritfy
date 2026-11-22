import type { fabric } from "fabric";
import { useCallback, useRef } from "react";

export const useClipboard = ({ canvas }: { canvas: fabric.Canvas | null }) => {
 const clipboard = useRef<fabric.Object | null>(null);
 const copy = useCallback(() => canvas?.getActiveObject()?.clone((cloned: fabric.Object) => { clipboard.current = cloned; }), [canvas]);
 const paste = useCallback(() => {
  if (!canvas || !clipboard.current) return;
  clipboard.current.clone((cloned: fabric.Object) => {
   canvas.discardActiveObject();
   cloned.set({ left: (cloned.left ?? 0) + 10, top: (cloned.top ?? 0) + 10, evented: true });
   if (cloned.type === "activeSelection") {
    const selection = cloned as fabric.ActiveSelection;
    selection.canvas = canvas;
    selection.forEachObject(object => canvas.add(object));
    selection.setCoords();
   } else canvas.add(cloned);
   if (clipboard.current) clipboard.current.set({ top: (clipboard.current.top ?? 0) + 10, left: (clipboard.current.left ?? 0) + 10 });
   canvas.setActiveObject(cloned);
   canvas.requestRenderAll();
  });
 }, [canvas]);
 return { copy, paste };
};
