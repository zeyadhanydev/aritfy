import type { fabric } from "fabric";

function workspaceBounds(canvas: fabric.Canvas) {
	const workspace = canvas.getObjects().find((object) => object.name === "clip");
	if (!workspace?.width || !workspace.height) throw new Error("Canvas workspace is not ready");
	return { width: workspace.width, height: workspace.height, left: workspace.left ?? 0, top: workspace.top ?? 0 };
}

function withIdentityViewport<T>(canvas: fabric.Canvas, exportFile: () => T): T {
	const viewport = canvas.viewportTransform?.slice() ?? [1, 0, 0, 1, 0, 0];
	canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
	try {
		return exportFile();
	} finally {
		canvas.setViewportTransform(viewport);
		canvas.requestRenderAll();
	}
}

export function exportRaster(canvas: fabric.Canvas, format: "png" | "jpeg") {
	const bounds = workspaceBounds(canvas);
	return withIdentityViewport(canvas, () => {
		const output = canvas.toCanvasElement(1, bounds);
		if (format === "jpeg") {
			// JPEG has no alpha channel. Composite transparent edges onto white.
			const context = output.getContext("2d");
			if (!context) throw new Error("Image export is unavailable");
			context.globalCompositeOperation = "destination-over";
			context.fillStyle = "#ffffff";
			context.fillRect(0, 0, output.width, output.height);
		}
		return output.toDataURL(`image/${format}`, 1);
	});
}

export function exportSvg(canvas: fabric.Canvas) {
	const { width, height, left, top } = workspaceBounds(canvas);
	const svg = withIdentityViewport(canvas, () => canvas.toSVG({
		width: String(width),
		height: String(height),
		viewBox: { x: left, y: top, width, height },
	}));
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
