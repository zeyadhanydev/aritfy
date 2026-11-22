import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import type { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	(typeof client.api.ai)["generate-image"]["$post"], 200
>;
type RequestType = InferRequestType<
	(typeof client.api.ai)["generate-image"]["$post"]
>["json"];

export const useGenerateImage = () => {
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async (json) => {
			const response = await client.api.ai["generate-image"].$post({
				json,
			});

			if (!response.ok) {
				throw new Error("Failed to generate image");
			}

			const payload = await response.json();
			if (!("data" in payload)) throw new Error("The provider did not return an image");
			return payload;
		},
		onSuccess: () => {
			toast.success("Image generated successfully!");
		},
		onError: (error) => {
			toast.error(error.message || "Failed to generate image");
		},
	});
	return mutation;
};
