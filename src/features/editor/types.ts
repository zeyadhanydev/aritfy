export type ActiveTool =
  | "select"
  | "shapes"
  | "text"
  | "images"
  | "draw"
  | "fill"
  | "stroke-color"
  | "stroke-width"
  | "font"
  | "opacity"
  | "filter"
  | "settings"
  | "ai"
  | "remove-bg"
  | "templates";

export const FILL_COLOR = "rgba(0,0,0,1)";
export const STROKE_COLOR = "rgba(0,0,0,1)";
export const STROKE_WIDTH = 2;

export const CIRCLE_OPTIONS = {
  radius: 150,
  left: 100,
  top: 100,
  fill: FILL_COLOR,
  stroke: STROKE_COLOR,
  strokeWidth: STROKE_WIDTH,
  
};
export const RECTANGLE_OPTIONS = {
  left: 100,
  top: 100,
  width: 300,
  height: 300,
  fill: FILL_COLOR,
  angle: 0,
  strokeWidth: STROKE_WIDTH,
};
export const TRIANGLE_OPTIONS = {
  left: 100,
  top: 100,
  width: 300,
  height: 300,
  fill: FILL_COLOR,
  angle: 0,
  strokeWidth: STROKE_WIDTH,
  
};
export const DIAMOND_OPTIONS = {
  left: 100,
  top: 100,
  width: 420,
  height: 420,
  fill: FILL_COLOR,
  angle: 0,
  strokeWidth: STROKE_WIDTH,
};

export type buildEditorProps = {
  canvas: fabric.Canvas;
};

export interface Editor {
  addCircle: () => void;
  addSoftRectangle: () => void;
  addRectangle: () =>void;
  addTriangle: () =>void;
  addInverseTriangle: () =>void;
  addDiamond: () =>void;
}