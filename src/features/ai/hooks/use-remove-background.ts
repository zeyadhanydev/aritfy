import { useState } from "react";
import { useRemoveBgImage } from "@/features/ai/api/use-remove-bg";

interface UseRemoveBackgroundOptions { preferClientSide?: boolean; }
interface RemoveBackgroundResult {
 imageUrl: string | null;
 isLoading: boolean;
 error: string | null;
 progress: string;
}

export function useRemoveBackground(options: UseRemoveBackgroundOptions = {}) {
 const [result, setResult] = useState<RemoveBackgroundResult>({ imageUrl: null, isLoading: false, error: null, progress: "" });
 const { mutateAsync: removeBgServer } = useRemoveBgImage();

 const processClient = async (imageUrl: string) => {
  const model = await import("@/lib/remove-bg-model");
  setResult(prev => ({ ...prev, progress: "Loading background removal model..." }));
  if (!model.isModelLoaded()) await model.initRemoveBackgroundModel();
  setResult(prev => ({ ...prev, progress: "Removing background..." }));
  const response = await model.removeBackground(imageUrl);
  if (response.error) throw new Error(response.error);
  return response.image;
 };

 const removeBackgroundFromImage = async (imageUrl: string): Promise<string | null> => {
  setResult({ imageUrl: null, isLoading: true, error: null, progress: "Processing image..." });
  try {
   let processed: string;
   if (options.preferClientSide && typeof window !== "undefined") {
    processed = await processClient(imageUrl);
   } else {
    try {
     processed = (await removeBgServer({ image: imageUrl })).data;
    } catch (error) {
     if (typeof window === "undefined") throw error;
     // Fall back once, without recursively repeating the server request.
     processed = await processClient(imageUrl);
    }
   }
   setResult({ imageUrl: processed, isLoading: false, error: null, progress: "Complete" });
   return processed;
  } catch (error) {
   setResult({ imageUrl: null, isLoading: false, error: error instanceof Error ? error.message : "Background removal failed", progress: "Failed" });
   return null;
  }
 };
 return { ...result, removeBackground: removeBackgroundFromImage, isClientSideAvailable: typeof window !== "undefined" };
}
