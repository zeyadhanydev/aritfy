import { useState } from "react";
interface UseRemoveBackgroundOptions { preferClientSide?: boolean }
interface Result { imageUrl: string | null; isLoading: boolean; error: string | null; progress: string }

// This path is always local. It never falls back to a metered server API.
export function useRemoveBackground(_options: UseRemoveBackgroundOptions = {}) {
  const [result, setResult] = useState<Result>({ imageUrl: null, isLoading: false, error: null, progress: "" });
  const removeBackground = async (imageUrl: string): Promise<string | null> => {
    setResult({ imageUrl: null, isLoading: true, error: null, progress: "Loading local model..." });
    try {
      const model = await import("@/lib/remove-bg-model");
      await model.initRemoveBackgroundModel();
      setResult(previous => ({ ...previous, progress: "Removing background locally..." }));
      const response = await model.removeBackground(imageUrl);
      if (response.error) throw new Error(response.error);
      setResult({ imageUrl: response.image, isLoading: false, error: null, progress: "Ready to add" });
      return response.image;
    } catch (error) {
      setResult({ imageUrl: null, isLoading: false, error: error instanceof Error ? error.message : "Background removal failed.", progress: "Failed" });
      return null;
    }
  };
  return { ...result, removeBackground, isClientSideAvailable: typeof window !== "undefined" && typeof Worker !== "undefined" && typeof WebAssembly !== "undefined" };
}
