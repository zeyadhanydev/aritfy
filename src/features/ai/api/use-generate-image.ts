import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { InferRequestType } from "hono";
import { client } from "@/lib/hono";
import { AI_GENERATION_UNAVAILABLE } from "@/lib/release-scope";
type RequestType = InferRequestType<(typeof client.api.ai)["generate-image"]["$post"]>["json"];

export const useGenerateImage = () => useMutation<{data: string}, Error, RequestType>({
  mutationFn: async () => { throw new Error(AI_GENERATION_UNAVAILABLE); },
  onError: (error) => { toast.error(error.message); },
});
