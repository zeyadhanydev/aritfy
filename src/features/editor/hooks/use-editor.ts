import { fabric } from "fabric";
import type { ITextboxOptions } from "fabric/fabric-impl";
import { useCallback, useMemo, useRef, useState } from "react";
import { get } from "unsplash-js/dist/methods/users";
import { useAutoResize } from "@/features/editor/hooks/use-auto-resize";
import { useCanvasEvents } from "@/features/editor/hooks/use-canvas-events";
import {
	type buildEditorProps,
	CIRCLE_OPTIONS,
	DIAMOND_OPTIONS,
	type Editor,
	type EditorHookProps,
	FILL_COLOR,
	FONT_FAMILY,
	FONT_SIZE,
	FONT_WEIGHT,
	JSON_KEYS,
	RECTANGLE_OPTIONS,
	STROKE_COLOR,
	STROKE_DASH_ARRAY,
	STROKE_WIDTH,
	TEXT_OPTIONS,
	TRIANGLE_OPTIONS,
} from "@/features/editor/types";
import {
	createFilter,
	downloadFile,
	isTextType,
	transformText,
} from "@/features/editor/utils";
import { useClipboard } from "./use-clipboard";
import { useHistory } from "./use-history";
import { useHotkeys } from "./use-hotkeys";
import { useWindowEvents } from "./use-window-events";
import { useRemoveBgImage } from "@/features/ai/api/use-remove-bg";
import { useLoadState } from "./use-load-state";

const buildEditor = ({
	canvas,
	fillColor,
	setFillColor,
	setStrokeColor,
	setStrokeWidth,
	strokeColor,
	strokeWidth,
	selectedObjects,
	setStrokeDashArray,
	strokeDashArray,
	fontFamily,
	setFontFamily,
	copy,
	paste,
	autoZoom,
	save,
	undo,
	canRedo,

	redo,
	canUndo,
}: buildEditorProps): Editor => {
	const generateSaveOptions = () => {
		const { width, height, left, top } = getWorkspace() as fabric.Rect;
		return {
			name: "Image",
			format: "png",
			quality: 1,
			width,
			height,
			left,
			top,
		};
	};
	const savePng = () => {
		const options = generateSaveOptions();
		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		const dataUrl = canvas.toDataURL(options);
		downloadFile(dataUrl, "png");
		autoZoom();
	};

	const saveSvg = () => {
		const options = generateSaveOptions();
		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		const dataUrl = canvas.toDataURL(options);
		downloadFile(dataUrl, "svg");
		autoZoom();
	};

	const saveJpg = () => {
		const options = generateSaveOptions();
		canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
		const dataUrl = canvas.toDataURL(options);
		downloadFile(dataUrl, "jpg");
		autoZoom();
	};

	const saveJson = async () => {
		const dataUrl = canvas.toJSON(JSON_KEYS);

		await transformText(dataUrl.objects);
		// encodeURIComponent` is a JavaScript function that encodes a string to be used in a URI (Uniform Resource Identifier), also known as a URL. It escapes special characters, with the exception of: `- _ . ! ~ * ' ( )`.
		// This is useful when you need to
		// pass a string as a parameter in a URL.
		// For example, if you have a search query
		// that might contain special characters like `&` or `/`,
		// you would use `encodeURIComponent` to prevent them from
		// being interpreted as part of the URL structure.
		const fileString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataUrl, null, "\t"))}`;
		downloadFile(fileString, "json");
	};
	const loadJson = (json: string) => {
		const data = JSON.parse(json);
		canvas.loadFromJSON(data, (data) => {
			autoZoom();
		});
	};
	const getWorkspace = () => {
		return canvas.getObjects().find((obj) => obj.name === "clip") as
			| fabric.Object
			| undefined;
	};
	const center = (object: fabric.Object) => {
		const workspace = getWorkspace();
		const center = workspace?.getCenterPoint();
		if (!center) return;
		//@ts-expect-error _centerObject is not in types in fabric
		canvas._centerObject(object, center);
	};
	const addToCanvas = (object: fabric.Object) => {
		center(object);
		canvas.add(object);
		canvas.setActiveObject(object);
	};
	return {
		savePng,
		saveJpg,
		saveSvg,
		saveJson,
		loadJson,
		autoZoom,
		canUndo,
		canRedo,
		zoomIn: () => {
			let zoomRatio = canvas.getZoom();
			zoomRatio += 0.05;
			const center = canvas.getCenter();
			canvas.zoomToPoint(
				new fabric.Point(center.left, center.top),
				zoomRatio > 1 ? 1 : zoomRatio,
			);
		},
		zoomOut: () => {
			let zoomRatio = canvas.getZoom();
			zoomRatio -= 0.05;
			const center = canvas.getCenter();
			canvas.zoomToPoint(
				new fabric.Point(center.left, center.top),
				zoomRatio < 0.2 ? 0.2 : zoomRatio,
			);
		},
		getWorkspace,
		changeSize: (value: { width: number; height: number }) => {
			const workspace = getWorkspace();
			workspace?.set(value);
			autoZoom();
			// TODO: save
			save();
		},
		changeBackground: (value: string) => {
			const workspace = getWorkspace();
			workspace?.set({
				fill: value,
			});
			canvas.renderAll();
			// TODO: save
			save();
		},
		enableDrawingMode: () => {
			canvas.discardActiveObject();
			canvas.renderAll();
			canvas.isDrawingMode = true;
			canvas.freeDrawingBrush.width = strokeWidth;
			canvas.freeDrawingBrush.color = strokeColor;
		},
		disableDrawingMode: () => {
			canvas.isDrawingMode = false;
		},
		onUndo: () => undo(),
		onRedo: () => redo(),
		onCopy: () => copy(),
		onPaste: () => paste(),
		changeImageFilter: (value: string) => {
			const objects = canvas.getActiveObjects();
			objects.forEach((object) => {
				if (object.type === "image") {
					const imageObject = object as fabric.Image;
					const effect = createFilter(value);
					imageObject.filters = effect ? [effect] : [];
					imageObject.applyFilters();
					canvas.renderAll();
				}
			});
		},
		addImage: (value: string) => {
			fabric.Image.fromURL(
				value,
				(image) => {
					const workspace = getWorkspace();
					image.scaleToWidth(workspace?.width || 0);
					image.scaleToHeight(workspace?.height || 0);
					addToCanvas(image);
				},
				{
					crossOrigin: "anonymous",
				},
			);
		},
		delete: () => {
			canvas.getActiveObjects().forEach((object) => {
				canvas.remove(object);
			});
			canvas.discardActiveObject();
			canvas.renderAll();
		},
		addText: (value, options) => {
			const object = new fabric.Textbox(value, {
				...TEXT_OPTIONS,
				fill: fillColor,
				...options,
			});
			addToCanvas(object);
		},
		changeOpacity: (value: number) => {
			canvas.getActiveObjects().forEach((object) => {
				object.set({ opacity: value });
			});
			canvas.renderAll();
		},
		changeFontWeight: (value: number) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					object.set({ fontWeight: value });
				}
			});
			canvas.renderAll();
		},
		changeFontStyle: (value: string) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					object.set({ fontStyle: value });
				}
			});
			canvas.renderAll();
		},
		bringForward: () => {
			canvas.getActiveObjects().forEach((object) => {
				canvas.bringForward(object);
			});
			canvas.renderAll();
			const workspace = getWorkspace();
			workspace?.sendToBack();
			// TODO: Elements could go below workspace overflow
		},
		sendBackwards: () => {
			canvas.getActiveObjects().forEach((object) => {
				canvas.sendBackwards(object);
			});
			canvas.renderAll();

			const workspace = getWorkspace();
			workspace?.sendToBack();

			// TODO: Elements could go below workspace overflow
		},
		changeFillColor: (value: string) => {
			setFillColor(value);
			canvas.getActiveObjects().forEach((object) => {
				object.set({ fill: value });
			});
			canvas.renderAll();
		},
		changeStrokeWidth: (value: number) => {
			setStrokeWidth(value);
			canvas.getActiveObjects().forEach((object) => {
				object.set({ strokeWidth: value });
			});
			canvas.freeDrawingBrush.width = value;
			canvas.renderAll();
		},
		changeStrokeDashArray: (value: number[]) => {
			setStrokeDashArray(value);
			canvas.getActiveObjects().forEach((object) => {
				object.set({ strokeDashArray: value });
			});
			canvas.renderAll();
		},
		changeStrokeColor: (value: string) => {
			setStrokeColor(value);
			canvas.getActiveObjects().forEach((object) => {
				// if object is text type then change the fill color not stroke
				// Text Types not have stroke
				if (isTextType(object.type)) {
					object.set({ fill: value });

					return;
				}
				object.set({ stroke: value });
			});

			canvas.freeDrawingBrush.color = value;
			canvas.renderAll();
		},
		changeFontFamily: (value) => {
			setFontFamily(value);
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					object._set("fontFamily", value);
				}
			});
			canvas.renderAll();
		},

		addCircle() {
			const object = new fabric.Circle({
				...CIRCLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addSoftRectangle() {
			const object = new fabric.Rect({
				...RECTANGLE_OPTIONS,
				rx: 10,
				ry: 10,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addRectangle() {
			const object = new fabric.Rect({
				...RECTANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});

			addToCanvas(object);
		},
		addTriangle() {
			const object = new fabric.Triangle({
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addInverseTriangle() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const object = new fabric.Polygon(
				[
					{ x: 0, y: 0 },
					{ x: WIDTH, y: 0 },
					{ x: WIDTH / 2, y: HEIGHT },
				],
				{
					...TRIANGLE_OPTIONS,
					fill: fillColor,
					stroke: strokeColor,
					strokeWidth: strokeWidth,
					strokeDashArray: strokeDashArray,
				},
			);
			addToCanvas(object);
		},
		addDiamond() {
			const HEIGHT = DIAMOND_OPTIONS.height;
			const WIDTH = DIAMOND_OPTIONS.width;
			const object = new fabric.Polygon(
				[
					{ x: WIDTH / 2, y: 0 },
					{ x: WIDTH, y: HEIGHT / 2 },
					{ x: WIDTH / 2, y: HEIGHT },
					{ x: 0, y: HEIGHT / 2 },
				],
				{
					...DIAMOND_OPTIONS,
					fill: fillColor,
					stroke: strokeColor,
					strokeWidth: strokeWidth,
					strokeDashArray: strokeDashArray,
				},
			);
			addToCanvas(object);
		},
		addStar() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const outerRadius = WIDTH / 2;
			const innerRadius = outerRadius * 0.4;
			const centerX = WIDTH / 2;
			const centerY = HEIGHT / 2;
			const points = [];

			for (let i = 0; i < 10; i++) {
				const angle = (i * Math.PI * 2) / 10 - Math.PI / 2;
				const radius = i % 2 === 0 ? outerRadius : innerRadius;
				points.push({
					x: centerX + Math.cos(angle) * radius,
					y: centerY + Math.sin(angle) * radius,
				});
			}

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addPentagon() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const radius = WIDTH / 2;
			const centerX = WIDTH / 2;
			const centerY = HEIGHT / 2;
			const points = [];

			for (let i = 0; i < 5; i++) {
				const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
				points.push({
					x: centerX + Math.cos(angle) * radius,
					y: centerY + Math.sin(angle) * radius,
				});
			}

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addHexagon() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const radius = WIDTH / 2;
			const centerX = WIDTH / 2;
			const centerY = HEIGHT / 2;
			const points = [];

			for (let i = 0; i < 6; i++) {
				const angle = (i * Math.PI * 2) / 6;
				points.push({
					x: centerX + Math.cos(angle) * radius,
					y: centerY + Math.sin(angle) * radius,
				});
			}

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addArrowRight() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const points = [
				{ x: 0, y: HEIGHT * 0.3 },
				{ x: WIDTH * 0.7, y: HEIGHT * 0.3 },
				{ x: WIDTH * 0.7, y: 0 },
				{ x: WIDTH, y: HEIGHT / 2 },
				{ x: WIDTH * 0.7, y: HEIGHT },
				{ x: WIDTH * 0.7, y: HEIGHT * 0.7 },
				{ x: 0, y: HEIGHT * 0.7 },
			];

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addArrowLeft() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const points = [
				{ x: WIDTH, y: HEIGHT * 0.3 },
				{ x: WIDTH * 0.3, y: HEIGHT * 0.3 },
				{ x: WIDTH * 0.3, y: 0 },
				{ x: 0, y: HEIGHT / 2 },
				{ x: WIDTH * 0.3, y: HEIGHT },
				{ x: WIDTH * 0.3, y: HEIGHT * 0.7 },
				{ x: WIDTH, y: HEIGHT * 0.7 },
			];

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addArrowUp() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const points = [
				{ x: WIDTH * 0.3, y: HEIGHT },
				{ x: WIDTH * 0.3, y: HEIGHT * 0.3 },
				{ x: 0, y: HEIGHT * 0.3 },
				{ x: WIDTH / 2, y: 0 },
				{ x: WIDTH, y: HEIGHT * 0.3 },
				{ x: WIDTH * 0.7, y: HEIGHT * 0.3 },
				{ x: WIDTH * 0.7, y: HEIGHT },
			];

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addArrowDown() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const points = [
				{ x: WIDTH * 0.3, y: 0 },
				{ x: WIDTH * 0.3, y: HEIGHT * 0.7 },
				{ x: 0, y: HEIGHT * 0.7 },
				{ x: WIDTH / 2, y: HEIGHT },
				{ x: WIDTH, y: HEIGHT * 0.7 },
				{ x: WIDTH * 0.7, y: HEIGHT * 0.7 },
				{ x: WIDTH * 0.7, y: 0 },
			];

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addHeart() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const centerX = WIDTH / 2;
			const topY = HEIGHT * 0.3;
			const points = [];

			// Left curve of heart
			for (let i = 0; i <= 10; i++) {
				const angle = Math.PI - (i / 10) * Math.PI;
				const x = centerX - WIDTH * 0.25 + WIDTH * 0.25 * Math.cos(angle);
				const y = topY + HEIGHT * 0.15 * Math.sin(angle);
				points.push({ x, y });
			}

			// Right curve of heart
			for (let i = 0; i <= 10; i++) {
				const angle = (i / 10) * Math.PI;
				const x = centerX + WIDTH * 0.25 + WIDTH * 0.25 * Math.cos(angle);
				const y = topY + HEIGHT * 0.15 * Math.sin(angle);
				points.push({ x, y });
			}

			// Bottom point
			points.push({ x: centerX, y: HEIGHT * 0.9 });

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addPlus() {
			const HEIGHT = TRIANGLE_OPTIONS.height;
			const WIDTH = TRIANGLE_OPTIONS.width;
			const thickness = WIDTH * 0.2;
			const points = [
				{ x: WIDTH / 2 - thickness / 2, y: 0 },
				{ x: WIDTH / 2 + thickness / 2, y: 0 },
				{ x: WIDTH / 2 + thickness / 2, y: HEIGHT / 2 - thickness / 2 },
				{ x: WIDTH, y: HEIGHT / 2 - thickness / 2 },
				{ x: WIDTH, y: HEIGHT / 2 + thickness / 2 },
				{ x: WIDTH / 2 + thickness / 2, y: HEIGHT / 2 + thickness / 2 },
				{ x: WIDTH / 2 + thickness / 2, y: HEIGHT },
				{ x: WIDTH / 2 - thickness / 2, y: HEIGHT },
				{ x: WIDTH / 2 - thickness / 2, y: HEIGHT / 2 + thickness / 2 },
				{ x: 0, y: HEIGHT / 2 + thickness / 2 },
				{ x: 0, y: HEIGHT / 2 - thickness / 2 },
				{ x: WIDTH / 2 - thickness / 2, y: HEIGHT / 2 - thickness / 2 },
			];

			const object = new fabric.Polygon(points, {
				...TRIANGLE_OPTIONS,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		addEllipse() {
			const object = new fabric.Ellipse({
				...CIRCLE_OPTIONS,
				rx: CIRCLE_OPTIONS.radius,
				ry: CIRCLE_OPTIONS.radius * 0.6,
				fill: fillColor,
				stroke: strokeColor,
				strokeWidth: strokeWidth,
				strokeDashArray: strokeDashArray,
			});
			addToCanvas(object);
		},
		getActiveFillColor: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return fillColor;
			}
			const value = selectedObject.get("fill") || fillColor;
			// curretly , gradiant & patterns are not supported
			return value as string;
		},
		getActiveStrokeColor: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return strokeColor;
			}
			const value = selectedObject.get("stroke") || strokeColor;
			return value as string;
		},
		getActiveStrokeWidth: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return strokeWidth;
			}
			const value = selectedObject.get("strokeWidth") || strokeWidth;
			return value;
		},
		getActiveStrokeDashArray: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return strokeDashArray;
			}
			const value = selectedObject.get("strokeDashArray") || strokeDashArray;
			return value;
		},
		getActiveOpacity: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return 1;
			}
			const value = selectedObject.get("opacity") || 1;
			return value;
		},

		getActiveFontFamily: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return fontFamily;
			}
			const value = selectedObject.get("fontFmaily") || fontFamily;
			// curretly , gradiant & patterns are not supported
			return value;
		},
		getActiveFontWeight: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return FONT_WEIGHT;
			}
			const value = selectedObject.get("fontWeight") || FONT_WEIGHT;
			// curretly , gradiant & patterns are not supported
			return value;
		},
		getActiveFontStyle: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return "normal";
			}
			const value = selectedObject.get("fontStyle") || "normal";
			// curretly , gradiant & patterns are not supported
			return value;
		},
		getActiveFontLinethrough: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return false;
			}
			const value = selectedObject.get("linethrough") || false;
			// curretly , gradiant & patterns are not supported
			return value;
		},
		changeFontLinethrough: (value: boolean) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					object._set("linethrough", value);
				}
			});
			canvas.renderAll();
		},

		getActiveFontUnderline: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return false;
			}
			const value = selectedObject.get("underline") || false;
			// curretly , gradiant & patterns are not supported
			return value;
		},
		changeFontUnderline: (value: boolean) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					object._set("underline", value);
				}
			});
			canvas.renderAll();
		},
		getActiveTextAlign: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return "left";
			}
			const value = selectedObject.get("textAlign") || "left";
			// curretly , gradiant & patterns are not supported
			return value;
		},
		changeTextAlign: (value: ITextboxOptions["textAlign"]) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					object._set("textAlign", value);
				}
			});
			canvas.renderAll();
		},
		getActiveFontSize: () => {
			const selectedObject = selectedObjects[0];
			if (!selectedObject) {
				return FONT_SIZE;
			}
			const value = selectedObject.get("fontSize") || FONT_SIZE;
			// curretly , gradiant & patterns are not supported
			return value;
		},
		changeFontSize: (value: number) => {
			canvas.getActiveObjects().forEach((object) => {
				if (isTextType(object.type)) {
					object._set("fontSize", value);
				}
			});
			canvas.renderAll();
		},
		canvas,
		selectedObjects,
	};
};
export const useEditor = ({
	clearSelectionCallback,
	saveCallback,
	defaultHeight,
	defaultWidth,
	defaultState,
}: EditorHookProps) => {
	const initialState = useRef(defaultState);
	const initialWidth = useRef(defaultWidth);
	const initialHeight = useRef(defaultHeight);

	const [canvas, setCanvas] = useState<null | fabric.Canvas>(null);
	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);

	const [fillColor, setFillColor] = useState<string>(FILL_COLOR);
	const [strokeColor, setStrokeColor] = useState<string>(STROKE_COLOR);
	const [strokeWidth, setStrokeWidth] = useState<number>(STROKE_WIDTH);
	const [strokeDashArray, setStrokeDashArray] =
		useState<number[]>(STROKE_DASH_ARRAY);
	const [fontFamily, setFontFamily] = useState<string>(FONT_FAMILY);
	const { copy, paste } = useClipboard({ canvas });
	const { save, canRedo, canUndo, redo, undo, setHistoryIndex, canvasHistory } =
		useHistory({ canvas, saveCallback });

	const { autoZoom } = useAutoResize({
		canvas,
		container,
	});
	useWindowEvents();
	useCanvasEvents({
		save,
		canvas,
		setSelectedObjects,
		clearSelectionCallback,
	});

	useLoadState({
		autoZoom,
		canvas,
		canvasHistory,
		initialState,
		setHistoryIndex,
	});

	const editor = useMemo(() => {
		if (canvas)
			return buildEditor({
				save,
				undo,
				redo,
				canRedo,
				canUndo,
				canvas,
				fillColor,
				setFillColor,
				strokeColor,
				setStrokeColor,
				strokeWidth,
				setStrokeWidth,
				selectedObjects,
				strokeDashArray,
				setStrokeDashArray,
				fontFamily,
				setFontFamily,
				copy,
				paste,
				autoZoom,
			});
		return undefined;
	}, [
		canvas,
		fillColor,
		fontFamily,
		strokeColor,
		strokeWidth,
		selectedObjects,
		strokeDashArray,
		copy,
		paste,
		autoZoom,
		save,
		undo,
		redo,
		canRedo,
		canUndo,
	]);

	useHotkeys({
		save,
		undo,
		zoomIn: editor?.zoomIn,
		zoomOut: editor?.zoomOut,
		autoZoom,
		redo,
		copy,
		paste,
		canvas,
	});
	const init = useCallback(
		({
			initialCanvas,
			initialContainer,
		}: {
			initialCanvas: fabric.Canvas;
			initialContainer: HTMLDivElement;
		}) => {
			fabric.Object.prototype.set({
				cornerColor: "#FFF",
				cornerStyle: "circle",
				borderColor: "#3b82f6",
				borderScaleFactor: 1.5,
				transparentCorners: false,
				borderOpacityWhenMoving: 1,
				cornerStrokeColor: "#3b82f6",
			});
			const initialWorkspace = new fabric.Rect({
				width: initialWidth.current,
				height: initialHeight.current,
				name: "clip",
				fill: "white",
				selectable: false,
				hasControls: false,
				shadow: new fabric.Shadow({
					color: "rgba(0,0,0,0.1)",
					blur: 5,
				}),
			});
			// Set canvas dimensions first
			initialCanvas.setWidth(initialContainer.offsetWidth);
			initialCanvas.setHeight(initialContainer.offsetHeight);

			// Add to canvas first
			initialCanvas.add(initialWorkspace);

			// Set as clip path
			initialCanvas.clipPath = initialWorkspace;
			// Then center it
			initialCanvas.centerObject(initialWorkspace);
			setCanvas(initialCanvas);
			setContainer(initialContainer);
			const currentState = JSON.stringify(initialCanvas.toJSON(JSON_KEYS));

			canvasHistory.current.push(currentState);
			setHistoryIndex(0);
		},
		[
			canvasHistory, // this is a ref so it won't cause re-render
			setHistoryIndex, // this is a state setter so it won't cause re-render
		],
	);

	return { init, editor };
};
