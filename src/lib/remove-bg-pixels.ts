export const CUTOUT_SIZE = 320;
export const MAX_CUTOUT_PIXELS = 8_000_000;

export function normalizeCutoutPixels(pixels: Uint8ClampedArray): Float32Array {
  const count = CUTOUT_SIZE * CUTOUT_SIZE;
  if (pixels.length !== count * 4) throw new Error("Invalid image input size.");
  let maximum = 1;
  for (let i = 0; i < pixels.length; i++) if (i % 4 !== 3) maximum = Math.max(maximum, pixels[i]);
  const result = new Float32Array(3 * count);
  const mean = [0.485, 0.456, 0.406], deviation = [0.229, 0.224, 0.225];
  for (let c = 0; c < 3; c++) for (let i = 0; i < count; i++) result[c * count + i] = (pixels[i * 4 + c] / maximum - mean[c]) / deviation[c];
  return result;
}

export function cutoutMaskPixels(mask: Float32Array): Uint8ClampedArray {
  if (mask.length !== CUTOUT_SIZE * CUTOUT_SIZE) throw new Error("Invalid background mask size.");
  let minimum = Infinity, maximum = -Infinity;
  for (const value of mask) {
    if (!Number.isFinite(value)) throw new Error("The model returned an invalid mask.");
    minimum = Math.min(minimum, value); maximum = Math.max(maximum, value);
  }
  if (maximum - minimum < 0.000001) throw new Error("No usable subject mask was found. Try a photo with one clear subject.");
  const pixels = new Uint8ClampedArray(mask.length * 4);
  for (let i = 0; i < mask.length; i++) {
    pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = 255;
    pixels[i * 4 + 3] = Math.round(255 * (mask[i] - minimum) / (maximum - minimum));
  }
  return pixels;
}
