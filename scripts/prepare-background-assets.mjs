import { build } from 'esbuild';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const dist = dirname(require.resolve('onnxruntime-web'));
mkdirSync('public/onnx', { recursive: true });
for (const name of ['ort-wasm-simd-threaded.mjs', 'ort-wasm-simd-threaded.wasm']) copyFileSync(join(dist, name), join('public/onnx', name));
copyFileSync('public/models/LICENSE-ONNXRUNTIME.txt', 'public/onnx/LICENSE.txt');
copyFileSync('public/models/THIRD-PARTY-ONNXRUNTIME.txt', 'public/onnx/ThirdPartyNotices.txt');
writeFileSync('public/onnx/NOTICE.txt', 'ONNX Runtime Web 1.22.0, Microsoft Corporation, MIT license. Runtime assets copied without modification from the pinned npm package. License: /onnx/LICENSE.txt. Third-party notices: /onnx/ThirdPartyNotices.txt\n');
// Preserve ESM worker semantics instead of allowing Next/Webpack to rewrite it as classic.
await build({ entryPoints: ['src/lib/remove-bg.worker.ts'], outfile: 'public/onnx/cutout-worker.js', bundle: true, platform: 'browser', format: 'esm', target: 'es2022', minify: true });
console.log('Prepared pinned local ONNX Runtime Web assets and the module worker.');
