import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { useHistory } from '../src/features/editor/hooks/use-history';
import { useLoadState } from '../src/features/editor/hooks/use-load-state';
import { designIsComplete, normalizeDesignForLoad } from '../src/features/editor/design-integrity';
import { exportRaster, exportSvg } from '../src/features/editor/export';

async function main() {
 const dom = new JSDOM('<!doctype html><div id="root"></div>');
 Object.assign(globalThis, { window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true });
 const { createRoot } = await import('react-dom/client');
 let api: ReturnType<typeof useHistory>;
 let state = { objects: [{ id: 'initial' }] };
 const persisted: unknown[] = [];
 const canvas = {
  clipPath: { width: 900, height: 1200 },
  toJSON: () => structuredClone(state),
  loadFromJSON: (next: typeof state, done: () => void) => {
   state = { objects: [] }; api.save();
   for (const object of next.objects) { state.objects.push(object); api.save(); }
   done();
  },
  renderAll: () => {},
 };
 const root = createRoot(document.querySelector('#root')!);
 function Harness() { api = useHistory({ canvas: canvas as never, saveCallback: value => persisted.push(value) }); return null; }
 await act(async () => root.render(<Harness />));
 await act(async () => { api.canvasHistory.current = [JSON.stringify(state)]; api.setHistoryIndex(0); });
 const initial = JSON.stringify(state);
 state = { objects: [{ id: 'initial' }, { id: 'second' }] };
 await act(async () => api.save());
 const second = JSON.stringify(state);
 assert.equal(api!.canUndo(), true); assert.equal(api!.canRedo(), false);
 persisted.length = 0;
 await act(async () => api.undo());
 assert.equal(JSON.stringify(state), initial); assert.equal(persisted.length, 1, 'only the final undo state is persisted');
 assert.equal(api!.canRedo(), true);
 persisted.length = 0;
 await act(async () => api.redo());
 assert.equal(JSON.stringify(state), second); assert.equal(persisted.length, 1);
 await act(async () => api.undo());
 state = { objects: [{ id: 'initial' }, { id: 'replacement' }] };
 await act(async () => api.save());
 assert.equal(api!.canvasHistory.current.length, 2, 'old redo branch is removed');
 assert.equal(api!.canRedo(), false);
 await act(async () => api.redo());
 assert.equal(state.objects[1].id, 'replacement');
 const length = api!.canvasHistory.current.length;
 await act(async () => api.save());
 assert.equal(api!.canvasHistory.current.length, length, 'identical snapshots do not create history steps');
 await act(async () => root.unmount());

 const loadRoot = createRoot(document.querySelector('#root')!);
 state = { objects: [{ id: 'saved-a' }, { id: 'saved-b' }] };
 const initialState = { current: JSON.stringify(state) };
 persisted.length = 0;
 function LoadHarness() {
  api = useHistory({ canvas: canvas as never, saveCallback: value => persisted.push(value) });
  useLoadState({ canvas: canvas as never, autoZoom: () => {}, initialState,
   canvasHistory: api.canvasHistory, setHistoryIndex: api.setHistoryIndex, skipSave: api.skipSave });
  return null;
 }
 await act(async () => loadRoot.render(<LoadHarness />));
 assert.equal(persisted.length, 0, 'loading never autosaves intermediate states');
 assert.equal(api!.canvasHistory.current.length, 1);
 assert.equal(api!.skipSave.current, false);
 await act(async () => loadRoot.unmount());

 assert.equal(designIsComplete({objects:[{type:'group',objects:[{type:'image'}]}]}, {objects:[{type:'group',objects:[]}]}),false);
 const incompleteRoot = createRoot(document.querySelector('#root')!);
 let incompleteError: string | null = null;
 const expectedDesign = { current: JSON.stringify({objects:[{id:'kept'},{id:'missing-image'}]}) };
 const incompleteCanvas = { ...canvas, loadFromJSON: (_next: unknown, done: () => void) => {state={objects:[{id:'kept'}]};done();} };
 persisted.length=0;
 function IncompleteHarness() {
  api=useHistory({canvas:incompleteCanvas as never,saveCallback:value=>persisted.push(value)});
  incompleteError=useLoadState({canvas:incompleteCanvas as never,autoZoom:()=>{},initialState:expectedDesign,canvasHistory:api.canvasHistory,setHistoryIndex:api.setHistoryIndex,skipSave:api.skipSave});
  return null;
 }
 await act(async()=>incompleteRoot.render(<IncompleteHarness/>));
 assert.match(incompleteError ?? '', /autosave are paused/);
 assert.equal(api!.skipSave.current,true);
 await act(async()=>api!.save());
 assert.equal(persisted.length,0,'a partially loaded design cannot overwrite its stored JSON');
 assert.equal(JSON.parse(expectedDesign.current).objects.length,2);
 await act(async()=>incompleteRoot.unmount());

 let viewport = [2, 0, 0, 2, 15, 30];
 const original = [...viewport];
 let jpegComposites = 0;
 const exportCanvas = {
  getObjects: () => [{ name: 'clip', width: 900, height: 1200, left: 25, top: 40 }],
  get viewportTransform() { return viewport; },
  setViewportTransform: (v: number[]) => { viewport = v; },
  requestRenderAll: () => {},
  toCanvasElement: () => ({
   width: 900, height: 1200,
   getContext: () => ({globalCompositeOperation: 'source-over', fillStyle: '', fillRect: () => { jpegComposites += 1; }}),
   toDataURL: (mime: string) => `data:${mime};base64,TEST`,
  }),
  toSVG: (options: { viewBox: { x: number; y: number } }) => `<svg viewBox="${options.viewBox.x} ${options.viewBox.y} 900 1200"><rect width="30" height="30"/></svg>`,
 };
 assert.ok(exportRaster(exportCanvas as never, 'png').startsWith('data:image/png;'));
 assert.deepEqual(viewport, original);
 assert.equal(jpegComposites, 0);
 assert.ok(exportRaster(exportCanvas as never, 'jpeg').startsWith('data:image/jpeg;'));
 assert.deepEqual(viewport, original);
 assert.equal(jpegComposites, 1, 'JPEG alpha is composited onto white');
 const svg = exportSvg(exportCanvas as never);
 assert.ok(svg.startsWith('data:image/svg+xml;'));
 assert.ok(decodeURIComponent(svg.split(',')[1]).includes('<svg viewBox="25 40 900 1200">'));
 assert.deepEqual(viewport, original);
 exportCanvas.toSVG = () => { throw new Error('Expected test failure'); };
 assert.throws(() => exportSvg(exportCanvas as never));
 assert.deepEqual(viewport, original, 'viewport is restored after an export error');
 console.log('PASS: undo/redo final-state persistence, redo branching, duplicate snapshots, initial load suppression and incomplete-asset autosave guard, PNG/JPEG/SVG formats, viewport restoration.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });

const legacyText = {objects:[{type:"textbox",text:"Example",styles:undefined}]};
normalizeDesignForLoad(legacyText);
assert.deepEqual(legacyText.objects[0].styles,{});
