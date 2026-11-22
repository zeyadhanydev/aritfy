import { fabric } from "fabric";
import { useCallback, useEffect } from "react";

interface UseAutoResizeProps {
	canvas: fabric.Canvas | null;
	container: HTMLDivElement | null;
}

export function measureCanvasContainer(container: Pick<HTMLDivElement, "offsetWidth" | "offsetHeight" | "isConnected">) {
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    if (!container.isConnected || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
    return { width, height };
}

export const useAutoResize = ({ canvas, container }: UseAutoResizeProps) => {
	const autoZoom = useCallback(() => {
		if (!canvas || !container) return;
		const size = measureCanvasContainer(container);
        if (!size) return;
        const { width, height } = size;
        if (canvas.width !== width) canvas.setWidth(width);
        if (canvas.height !== height) canvas.setHeight(height);
		const center = canvas.getCenter();
		const zoomRatio = 0.85;
		const localWorkspace = canvas
			.getObjects()
			.find((object) => object.name === "clip");

		if (!localWorkspace) return;
		// @ts-expect-error findScaleToFit doesn't has a types in fabric library
		const scale = fabric.util.findScaleToFit(localWorkspace, {
			width,
			height,
		});
		const zoom = zoomRatio * scale;
        if (!Number.isFinite(zoom) || zoom <= 0) return;
		canvas.setViewportTransform(fabric.iMatrix.concat());
		canvas.zoomToPoint(new fabric.Point(center.left, center.top), zoom);
		const workspaceCenter = localWorkspace.getCenterPoint();
		const viewportTransform = canvas.viewportTransform;
		if (
			canvas.width === undefined ||
			canvas.height === undefined ||
			!viewportTransform
		) {
			return;
		}
		viewportTransform[4] =
			canvas.width / 2 - workspaceCenter.x * viewportTransform[0];

		viewportTransform[5] =
			canvas.height / 2 - workspaceCenter.y * viewportTransform[3];
		canvas.setViewportTransform(viewportTransform);
		localWorkspace.clone((cloned: fabric.Rect) => {
			canvas.clipPath = cloned;
			canvas.requestRenderAll();
		});
	}, [canvas, container]);
	useEffect(() => {
		let resizeObserver: ResizeObserver | null = null;
		if (canvas && container) {
			resizeObserver = new ResizeObserver(() => {
				autoZoom();
			});
			resizeObserver.observe(container);
		}
		return () => {
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, [canvas, container, autoZoom]);
	return { autoZoom };
};
