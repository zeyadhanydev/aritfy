import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	(typeof client.api.subscriptions.checkout)["$post"],
	200
>;

export const useCheckout = () => {
	const mutation = useMutation({
		mutationFn: async () => {
			const response = await client.api.subscriptions.checkout.$post();
			if (!response.ok) {
				throw new Error("Failed to create a session");
			}
			return await response.json();
		},
		onSuccess: ({ data }) => {
			window.location.href = data;
		},
		onError: () => {
			toast.error("Faild to create session");
		},
	});
	return mutation;
};
