import assert from 'node:assert/strict';
import React, {act} from 'react';
import {JSDOM} from 'jsdom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useProjectAutosave} from '../src/features/projects/api/use-project-autosave';
import {projectRevision} from '../src/features/projects/revision';
import {useWindowEvents} from '../src/features/editor/hooks/use-window-events';

async function main() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>');
  Object.assign(globalThis, {window: dom.window, document: dom.window.document, IS_REACT_ACT_ENVIRONMENT: true});
  const {createRoot} = await import('react-dom/client');
  const originalFetch = globalThis.fetch;
  const initial = {json: '{"objects":[]}', width: 500, height: 400};
  const first = {...initial, json: '{"objects":[{"id":"first"}]}'};
  const second = {...initial, json: '{"objects":[{"id":"second"}]}'};
  const latest = {...initial, json: '{"objects":[{"id":"latest"}]}'};
  const retryState = {...initial, json: '{"objects":[{"id":"retry"}]}'};
  const requests: Array<typeof initial & {baseRevision: string}> = [];
  let releaseFirst!: () => void;
  const firstGate = new Promise<void>(resolve => {releaseFirst = resolve;});
  let fail = false;
  globalThis.fetch = async (_input, init) => {
    const body = JSON.parse(init?.body as string);
    requests.push(body);
    if (requests.length === 1) await firstGate;
    if (fail) return Response.json({error: 'Test network failure'}, {status: 503});
    return Response.json({data: {...body, revision: await projectRevision(body)}});
  };
  const client = new QueryClient({defaultOptions: {queries: {retry: false, gcTime: 0}, mutations: {retry: false, gcTime: 0}}});
  let api!: ReturnType<typeof useProjectAutosave>;
  const initialRevision = await projectRevision(initial);
  const root = createRoot(document.querySelector('#root')!);
  function Harness() {api = useProjectAutosave('owned-demo', initialRevision); useWindowEvents(api.status !== 'saved'); return null;}
  try {
    await act(async () => root.render(<QueryClientProvider client={client}><Harness /></QueryClientProvider>));
    const leave = () => {const event = new dom.window.Event('beforeunload', {cancelable: true}); dom.window.dispatchEvent(event); return event.defaultPrevented;};
    assert.equal(leave(), false, 'saved editor never blocks navigation');
    let firstFlush!: Promise<string>;
    await act(async () => {api.save(first); firstFlush = api.flush();});
    assert.equal(leave(), true, 'in-flight edits warn before leaving');
    let concurrentFlush!: Promise<string>;
    await act(async () => {api.save(second); api.save(latest); concurrentFlush = api.flush();});
    assert.equal(requests.length, 1, 'only one save request can be in flight');
    await act(async () => {releaseFirst(); await Promise.all([firstFlush, concurrentFlush]);});
    assert.equal(requests.length, 2);
    assert.equal(requests[1].json, latest.json, 'queued edits collapse to the newest state');
    assert.equal(requests[0].baseRevision, initialRevision);
    assert.equal(requests[1].baseRevision, await projectRevision(first), 'next save uses the acknowledged revision');
    assert.equal(api.status, 'saved'); assert.equal(leave(), false);
    fail = true;
    await act(async () => {api.save(retryState); await assert.rejects(api.flush(), /Test network failure/);});
    assert.equal(api.status, 'error'); assert.equal(leave(), true, 'failed saves retain dirty navigation protection');
    fail = false;
    await act(async () => {await api.flush();});
    assert.equal(requests.at(-1)?.json, retryState.json, 'failed payload is retained for a safe retry');
    assert.equal(api.status, 'saved'); assert.equal(leave(), false);
    assert.notEqual(await projectRevision(initial), await projectRevision({...initial, width: 501}));
    console.log('PASS: serialized autosaves, latest-state coalescing, acknowledged revisions, failure retention/retry and dirty-only navigation warning. No live API calls.');
  } finally {await act(async () => root.unmount()); client.clear(); globalThis.fetch = originalFetch; dom.window.close();}
}
void main().catch(error => {console.error(error); process.exitCode = 1;});
