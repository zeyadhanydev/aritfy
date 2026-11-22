import assert from 'node:assert/strict';
import React, {act} from 'react';
import {JSDOM} from 'jsdom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useGetImages} from '../src/features/images/api/use-get-images';
import {useGetTemplates} from '../src/features/projects/api/use-get-templates';

async function main() {
 const dom = new JSDOM('<!doctype html><div id="root"></div>');
 Object.assign(globalThis,{window:dom.window,document:dom.window.document,IS_REACT_ACT_ENVIRONMENT:true});
 const {createRoot}=await import('react-dom/client');
 const originalFetch=globalThis.fetch;
 const requests:string[]=[];
 globalThis.fetch=async input=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  requests.push(new URL(url,'http://localhost').pathname);
  return Response.json({data:[{id:url.includes('/images')?'photo':'template'}],nextPage:null});
 };
 const client=new QueryClient({defaultOptions:{queries:{retry:false,gcTime:0}}});
 const root=createRoot(document.querySelector('#root')!);
 let images:ReturnType<typeof useGetImages>;
 let templates:ReturnType<typeof useGetTemplates>;
 function Harness({enabled,defaults=false}:{enabled:boolean;defaults?:boolean}) {
  images=useGetImages(defaults?undefined:enabled);
  templates=useGetTemplates({limit:'20',page:'1'},defaults?undefined:enabled);
  return null;
 }
 const render=async(enabled:boolean,defaults=false)=>{await act(async()=>{root.render(<QueryClientProvider client={client}><Harness enabled={enabled} defaults={defaults}/></QueryClientProvider>);});await act(async()=>{await new Promise(r=>setTimeout(r,15));});};
 try {
  await render(false);assert.equal(requests.length,0,'closed tools must not fetch either library');
  await render(true);assert.equal(requests.length,2,'opening tools fetches both libraries normally');assert.equal(images!.data?.[0].id,'photo');assert.equal(templates!.data?.[0].id,'template');
  await render(false);await act(async()=>{await client.invalidateQueries();});assert.equal(requests.length,2,'inactive libraries stay disabled after invalidation');assert.equal(images!.data?.[0].id,'photo','cache survives closing');
  await render(true);assert.equal(requests.length,4,'reopening refreshes stale libraries');
  await render(false);await act(async()=>{await client.invalidateQueries();});await render(false,true);assert.equal(requests.length,6,'existing dashboard callers remain enabled by default');
  assert.equal(requests.filter(x=>x==='/api/images').length,3);assert.equal(requests.filter(x=>x==='/api/projects/templates').length,3);
  console.log('PASS: closed libraries make no requests, opening and reopening load normally, disabled invalidation preserves cache, default dashboard callers still fetch. No live API calls.');
 } finally {await act(async()=>root.unmount());client.clear();globalThis.fetch=originalFetch;dom.window.close();}
}
void main().catch(error=>{console.error(error);process.exitCode=1;});
