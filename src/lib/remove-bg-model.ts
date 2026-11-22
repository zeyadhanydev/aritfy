import { CUTOUT_SIZE, MAX_CUTOUT_PIXELS, cutoutMaskPixels, normalizeCutoutPixels } from "./remove-bg-pixels";

interface RemoveBackgroundResult { image: string; error?: string; }
type WorkerReply = { id: number; ready?: boolean; mask?: Float32Array; error?: string };
let worker: Worker | null = null;
let ready = false;
let counter = 0;
let processing = false;
let initialization: Promise<void> | null = null;
const pending = new Map<number, { resolve: (reply: WorkerReply) => void; reject: (error: Error) => void; timer: ReturnType<typeof setTimeout> }>();

function resetWorker(message: string) {
  worker?.terminate(); worker = null; ready = false; initialization = null;
  for (const request of pending.values()) { clearTimeout(request.timer); request.reject(new Error(message)); }
  pending.clear();
}
function getWorker() {
  if (!worker) {
    if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") throw new Error("This browser does not support local background removal.");
    worker = new Worker(`${window.location.origin}/onnx/cutout-worker.js`, { type: "module", name: "Aritfy local cutout" });
    worker.onmessage = ({ data }: MessageEvent<WorkerReply>) => {
      const request = pending.get(data.id); if (!request) return;
      clearTimeout(request.timer); pending.delete(data.id);
      if (data.error) request.reject(new Error(data.error));
      else { if (data.ready) ready = true; request.resolve(data); }
    };
    worker.onerror = () => resetWorker("The local background model stopped. Try again, or use a smaller photo.");
    worker.onmessageerror = () => resetWorker("The background model returned an unreadable response.");
  }
  return worker;
}
function request(type: "init" | "segment", pixels?: Float32Array): Promise<WorkerReply> {
  const target = getWorker(); const id = ++counter;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resetWorker(type === "init" ? "The local model did not start in time. Check the download or try again." : "Background removal timed out. Try a smaller photo or another browser."), 90_000);
    pending.set(id, { resolve, reject, timer });
    target.postMessage({ id, type, pixels }, pixels ? [pixels.buffer] : []);
  });
}
export async function initRemoveBackgroundModel(): Promise<void> {
  if (ready) return;
  if (!initialization) initialization = request("init").then(() => undefined).catch(error => { initialization = null; throw error; });
  await initialization;
}
export function isModelLoaded(): boolean { return ready; }

export async function removeBackground(imageUrl: string): Promise<RemoveBackgroundResult> {
  if (processing) return { image: imageUrl, error: "Background removal is already running." };
  processing = true;
  try {
    const image = new Image(); image.crossOrigin = "anonymous";
    image.src = imageUrl;
    let imageTimer: ReturnType<typeof setTimeout> | undefined;
    try {
      await Promise.race([image.decode(), new Promise<never>((_, reject) => { imageTimer = setTimeout(() => { image.src = ""; reject(new Error("The source image took too long to load.")); }, 20_000); })]);
    } finally { clearTimeout(imageTimer); }
    if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > MAX_CUTOUT_PIXELS) throw new Error("Use a photo no larger than 8 megapixels for local background removal.");
    const small = document.createElement("canvas"); small.width = small.height = CUTOUT_SIZE;
    const input = small.getContext("2d"); if (!input) throw new Error("Canvas is unavailable.");
    input.drawImage(image, 0, 0, CUTOUT_SIZE, CUTOUT_SIZE);
    const pixels = normalizeCutoutPixels(input.getImageData(0, 0, CUTOUT_SIZE, CUTOUT_SIZE).data);
    await initRemoveBackgroundModel();
    const reply = await request("segment", pixels);
    if (!reply.mask) throw new Error("No background mask was returned.");
    const maskPixels = cutoutMaskPixels(reply.mask);
    const maskImage = input.createImageData(CUTOUT_SIZE, CUTOUT_SIZE); maskImage.data.set(maskPixels); input.putImageData(maskImage, 0, 0);
    const canvas = document.createElement("canvas"); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const output = canvas.getContext("2d"); if (!output) throw new Error("Canvas is unavailable.");
    output.drawImage(image, 0, 0);
    // Multiplication preserves any transparency already present in the source image.
    output.globalCompositeOperation = "destination-in";
    output.drawImage(small, 0, 0, canvas.width, canvas.height);
    output.globalCompositeOperation = "source-over";
    return { image: canvas.toDataURL("image/png") };
  } catch (error) {
    return { image: imageUrl, error: error instanceof Error ? error.message : "Background removal failed." };
  } finally { processing = false; }
}

export async function fetchImageAsBlob(url: string): Promise<string> {
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error("The source image could not be loaded.");
  return URL.createObjectURL(await response.blob());
}
