import assert from 'node:assert/strict';
import React, { act } from 'react';
import { JSDOM } from 'jsdom';
import { useHistory } from '../src/features/editor/hooks/use-history';
import { useLoadState } from '../src/features/editor/hooks/use-load-state';
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

 let viewport = [2, 0, 0, 2, 15, 30];
 const original = [...viewport];
 const exportCanvas = {
  getObjects: () => [{ name: 'clip', width: 900, height: 1200, left: 25, top: 40 }],
  get viewportTransform() { return viewport; },
  setViewportTransform: (v: number[]) => { viewport = v; },
  requestRenderAll: () => {},
  toDataURL: (options: { format: string }) => `data:image/${options.format};base64,TEST`,
  toSVG: (options: { viewBox: { x: number; y: number } }) => `<svg viewBox="${options.viewBox.x} ${options.viewBox.y} 900 1200"><rect width="30" height="30"/></svg>`,
 };
 assert.ok(exportRaster(exportCanvas as never, 'png').startsWith('data:image/png;'));
 assert.deepEqual(viewport, original);
 assert.ok(exportRaster(exportCanvas as never, 'jpeg').startsWith('data:image/jpeg;'));
 assert.deepEqual(viewport, original);
 const svg = exportSvg(exportCanvas as never);
 assert.ok(svg.startsWith('data:image/svg+xml;'));
 assert.ok(decodeURIComponent(svg.split(',')[1]).includes('<svg viewBox="25 40 900 1200">'));
 assert.deepEqual(viewport, original);
 exportCanvas.toSVG = () => { throw new Error('Expected test failure'); };
 assert.throws(() => exportSvg(exportCanvas as never));
 assert.deepEqual(viewport, original, 'viewport is restored after an export error');
 console.log('PASS: undo/redo final-state persistence, redo branching, duplicate snapshots, initial load suppression, PNG/JPEG/SVG formats, viewport restoration.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
