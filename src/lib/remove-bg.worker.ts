import * as ort from "onnxruntime-web/wasm";

type Request = { id: number; type: "init" | "segment"; pixels?: Float32Array };
const scope = self as unknown as {
  location: Location;
  onmessage: ((event: MessageEvent<Request>) => void) | null;
  postMessage: (message: unknown, transfer?: Transferable[]) => void;
};
let session: ort.InferenceSession | null = null;
let initializing: Promise<void> | null = null;
let busy = false;
const MODEL_BYTES = 4_574_861;
const MODEL_SHA256 = "309c8469258dda742793dce0ebea8e6dd393174f89934733ecc8b14c76f4ddd8";

async function initialize() {
  if (session) return;
  if (!initializing) initializing = (async () => {
    ort.env.wasm.numThreads = 1;
    ort.env.wasm.wasmPaths = `${scope.location.origin}/onnx/`;
    const response = await fetch(`${scope.location.origin}/models/u2netp.onnx`);
    if (!response.ok) throw new Error("The local background model could not be downloaded.");
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength !== MODEL_BYTES) throw new Error("The background model download is incomplete.");
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    const hash = Array.from(new Uint8Array(digest), x => x.toString(16).padStart(2, "0")).join("");
    if (hash !== MODEL_SHA256) throw new Error("Background model integrity verification failed.");
    session = await ort.InferenceSession.create(bytes, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
  })().catch(error => { initializing = null; throw error; });
  await initializing;
}

scope.onmessage = async ({ data }) => {
  if (busy) { scope.postMessage({ id: data.id, error: "Background removal is already running." }); return; }
  busy = true;
  try {
    await initialize();
    if (data.type === "init") { scope.postMessage({ id: data.id, ready: true }); return; }
    if (data.type !== "segment" || !(data.pixels instanceof Float32Array) || data.pixels.length !== 3 * 320 * 320 || !session) throw new Error("Invalid background removal input.");
    const output = await session.run({ [session.inputNames[0]]: new ort.Tensor("float32", data.pixels, [1, 3, 320, 320]) });
    const tensor = output[session.outputNames[0]];
    if (tensor.type !== "float32" || tensor.data.length !== 320 * 320) throw new Error("Invalid background mask.");
    const mask = new Float32Array(tensor.data as Float32Array);
    scope.postMessage({ id: data.id, mask }, [mask.buffer]);
  } catch (error) {
    scope.postMessage({ id: data.id, error: error instanceof Error ? error.message : "Background removal failed." });
  } finally { busy = false; }
};
// Explicit startup handshake also covers slower module loading on hosted browsers.
scope.postMessage({ started: true });
