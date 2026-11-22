import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {build} from 'esbuild';

const built=await build({
  entryPoints:['src/app/api/[[...route]]/ai.ts'],bundle:true,platform:'node',format:'esm',write:false,
  plugins:[{name:'test-auth-only',setup(build){
    build.onResolve({filter:/^@hono\/auth-js$/},()=>({path:'auth',namespace:'test-auth'}));
    build.onLoad({filter:/.*/,namespace:'test-auth'},()=>({contents:'export const verifyAuth=()=>async(_c,next)=>{await next()}',loader:'js'}));
  }}],
});
const previous={fetch:globalThis.fetch,generation:process.env.AI_IMAGE_GENERATION_ENABLED,removal:process.env.SERVER_BACKGROUND_REMOVAL_ENABLED};
let calls=0;
globalThis.fetch=async()=>{calls++;throw new Error('Unexpected external call');};
process.env.AI_IMAGE_GENERATION_ENABLED='true';
process.env.SERVER_BACKGROUND_REMOVAL_ENABLED='true';
try {
 const {default:app}=await import('data:text/javascript;base64,'+Buffer.from(built.outputFiles[0].text).toString('base64'));
 for(const model of ['google','huggingface','aritfy']) {
  const response=await app.request('/generate-image',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({prompt:'Release safety fixture',model})});
  assert.equal(response.status,503);assert.match((await response.json()).error,/not available in this release/);
 }
 const response=await app.request('/remove-bg',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({image:'https://example.com/fixture.png'})});
 assert.equal(response.status,503);const body=await response.json();assert.match(body.error,/deferred in this release/);assert.equal(body.fallbackToClient,false);
 assert.equal(calls,0,'even old enabled environment variables cannot start any provider');
 const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
 const remover=read('src/components/background-remover.tsx');
 assert.doesNotMatch(remover,/useEffect|useState|remove-bg-model|type="file"|onClick|fetch\(/);
 const sidebar=read('src/features/editor/components/remove-bg-sidebar.tsx');
 assert.doesNotMatch(sidebar,/useRemoveBackground|remove-bg-model|paywall|onProcessed/);
 const hook=read('src/features/ai/hooks/use-remove-background.ts');
 assert.doesNotMatch(hook,/import\(|new Worker|initRemoveBackgroundModel|fetch\(/);
 const page=read('src/app/remove-bg/page.tsx');
 assert.doesNotMatch(page,/RMBG|BriaAI|60MB|works well|WebGL/);
 assert.match(page,/deferred/);
 const toolbar=read('src/features/editor/components/client-toolbar.tsx');
 assert.match(toolbar,/aria-label="Background removal unavailable"\s+disabled/);
 const packageJson=JSON.parse(read('package.json'));
 assert.doesNotMatch(packageJson.scripts.build,/prepare-background-assets/);
 assert.doesNotMatch(read('src/app/layout.tsx'),/Canva with AI image generation/);
 assert.doesNotMatch(read('src/features/subscription/components/subscription-modal.tsx'),/>AI Image generation<|AI Background removal/);
 console.log('PASS: all generation models and removal return 503 with zero provider calls, even with legacy flags enabled. No active local-model UI, no automatic model downloads, no paid-plan AI promises. Auth is stubbed only in this isolated router test.');
} finally {
 globalThis.fetch=previous.fetch;
 for (const [key,value] of [['AI_IMAGE_GENERATION_ENABLED',previous.generation],['SERVER_BACKGROUND_REMOVAL_ENABLED',previous.removal]]) {if(value===undefined)delete process.env[key];else process.env[key]=value;}
}
