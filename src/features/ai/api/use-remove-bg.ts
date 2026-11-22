import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { InferRequestType } from "hono";
import { client } from "@/lib/hono";
import { BACKGROUND_REMOVAL_UNAVAILABLE } from "@/lib/release-scope";
type RequestType = InferRequestType<(typeof client.api.ai)["remove-bg"]["$post"]>["json"];

export const useRemoveBgImage = () => useMutation<{data: string}, Error, RequestType>({
  mutationFn: async () => { throw new Error(BACKGROUND_REMOVAL_UNAVAILABLE); },
  onError: (error) => { toast.error(error.message); },
});
