import { useState } from "react";
import { BACKGROUND_REMOVAL_UNAVAILABLE } from "@/lib/release-scope";
interface UseRemoveBackgroundOptions { preferClientSide?: boolean }
interface Result { imageUrl: string | null; isLoading: boolean; error: string | null; progress: string }

// Retained for callers, but this release cannot start a model or paid fallback.
export function useRemoveBackground(_options: UseRemoveBackgroundOptions = {}) {
  const [result, setResult] = useState<Result>({ imageUrl: null, isLoading: false, error: null, progress: "" });
  const removeBackground = async (_imageUrl: string): Promise<null> => {
    setResult({ imageUrl: null, isLoading: false, error: BACKGROUND_REMOVAL_UNAVAILABLE, progress: "Unavailable" });
    return null;
  };
  return { ...result, removeBackground, isClientSideAvailable: false };
}
