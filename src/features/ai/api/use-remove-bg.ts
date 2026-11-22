import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	(typeof client.api.ai)["remove-bg"]["$post"], 200
>;
type RequestType = InferRequestType<
	(typeof client.api.ai)["remove-bg"]["$post"]
>["json"];

export const useRemoveBgImage = () => {
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async (json) => {
			const response = await client.api.ai["remove-bg"].$post({
				json,
			});

			if (!response.ok) {
				throw new Error("Failed to remove background");
			}

			const payload = await response.json();
			if (!("data" in payload)) throw new Error("The provider did not return an image");
			return payload;
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
