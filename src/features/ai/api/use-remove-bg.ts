import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	(typeof client.api.ai)["remove-bg"]["$post"]
>;
type RequestType = InferRequestType<
	(typeof client.api.ai)["remove-bg"]["$post"]
>;

export const useRemoveBgImage = () => {
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async (json) => {
			const response = await client.api.ai["remove-bg"].$post({
				json,
			});

			if (!response.ok) {
				throw new Error("Failed to remove background");
			}

			return await response.json();
		},
		onSuccess: () => {
			toast.success("Background removed successfully!");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to remove background");
		},
	});
	return mutation;
};
