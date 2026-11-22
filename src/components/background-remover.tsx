import { BACKGROUND_REMOVAL_UNAVAILABLE } from "@/lib/release-scope";

export function BackgroundRemover() {
  return (
    <div role="status" className="mx-auto max-w-3xl rounded-lg border bg-muted/40 p-6 text-sm space-y-3">
      <p className="font-medium">Background removal is not available.</p>
      <p>{BACKGROUND_REMOVAL_UNAVAILABLE}</p>
      <p className="text-muted-foreground">No image processing, uploads or model downloads occur here. You can still add images, arrange your design and export it from the editor.</p>
    </div>
  );
}
