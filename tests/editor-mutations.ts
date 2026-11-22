import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { invoiceSubscriptionId } from '../src/lib/stripe-subscription';
import { isDemoPremium } from '../src/features/subscription/demo-premium';

async function main() {
 const dom = new JSDOM('<!doctype html><html><body></body></html>');
 Object.assign(globalThis, { window: dom.window, document: dom.window.document, Document: dom.window.Document, HTMLDocument: dom.window.HTMLDocument });
 const { buildEditor } = await import('../src/features/editor/hooks/use-editor');
 const attributes: Record<string, unknown> = { fontFamily: 'Georgia', fontWeight: 700, opacity: 1 };
 const object = { type: 'textbox', set: (value: object) => Object.assign(attributes, value), _set: (key: string, value: unknown) => { attributes[key] = value; }, get: (key: string) => attributes[key] };
 const workspace = { name: 'clip', width: 900, height: 1200, sendToBack: () => {} };
 let saves = 0;
 const editor = buildEditor({ canvas: { getActiveObjects: () => [object], getObjects: () => [workspace, object], renderAll: () => {}, freeDrawingBrush: {} } as never, selectedObjects: [object] as never, fillColor: '#000', strokeColor: '#000', strokeWidth: 2, strokeDashArray: [], fontFamily: 'Arial', setFillColor: () => {}, setStrokeColor: () => {}, setStrokeWidth: () => {}, setStrokeDashArray: () => {}, setFontFamily: () => {}, copy: () => {}, paste: () => {}, autoZoom: () => {}, save: () => { saves++; }, undo: () => {}, redo: () => {}, canUndo: () => false, canRedo: () => false, skipSave: { current: false } });
 assert.equal(editor.getActiveFontFamily(), 'Georgia');
 const operations: Array<() => void> = [
  () => editor.changeFillColor('#ff0000'), () => editor.changeStrokeColor('#00ff00'),
  () => editor.changeStrokeWidth(4), () => editor.changeStrokeDashArray([4, 2]),
  () => editor.changeOpacity(0), () => editor.changeFontWeight(400),
  () => editor.changeFontStyle('italic'), () => editor.changeFontFamily('Arial'),
  () => editor.changeFontLinethrough(true), () => editor.changeFontUnderline(true),
  () => editor.changeTextAlign('center'), () => editor.changeFontSize(64),
 ];
 for (const operation of operations) { const before = saves; operation(); assert.ok(saves > before, 'Property edit must save immediately'); }
 assert.equal(editor.getActiveOpacity(), 0);
 assert.equal(editor.getActiveFontStyle(), 'italic');
 assert.equal(editor.getActiveFontSize(), 64);
 assert.equal(invoiceSubscriptionId({ parent: { subscription_details: { subscription: 'sub_current' } } }), 'sub_current');
 assert.equal(invoiceSubscriptionId({ subscription: 'sub_legacy' }), 'sub_legacy');
 assert.equal(invoiceSubscriptionId({ parent: { subscription_details: { subscription: { id: 'sub_expanded' } } } }), 'sub_expanded');
 assert.equal(invoiceSubscriptionId({}), null);
 assert.equal(isDemoPremium('demo-user', 'demo-user'), true);
 assert.equal(isDemoPremium('other-user', 'demo-user'), false);
 assert.equal(isDemoPremium(undefined, 'demo-user'), false);
 assert.equal(isDemoPremium('demo-user', ''), false);
 const { client } = await import('../src/lib/hono');
 const originalFetch = globalThis.fetch;
 let requested = '';
 globalThis.fetch = async input => { requested = String(input); return new Response(JSON.stringify({ data: [] }), { headers: { 'content-type': 'application/json' } }); };
 try { await client.api.projects[':id'].$get({ param: { id: 'demo-id' } }); assert.equal(requested, '/api/projects/demo-id'); }
 finally { globalThis.fetch = originalFetch; }
 console.log(`PASS: ${operations.length} property mutations persist, font family and zero opacity getters, current/legacy/expanded Stripe invoice reference extraction. No provider or payment calls.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
