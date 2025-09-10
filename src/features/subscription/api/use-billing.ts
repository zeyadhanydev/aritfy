import { useMutation } from "@tanstack/react-query";

import { toast } from "sonner";
import { client } from "@/lib/hono";

export const useBilling = () => {
	const mutation = useMutation({
		mutationFn: async () => {
			const response = await client.api.subscriptions.billing.$post();
			if (!response.ok) {
				throw new Error("Failed to create a session");
			}
			return await response.json();
		},
		onSuccess: ({ data }) => {
			window.location.href = data;
		},
		onError: () => {
			toast.error("Failed to create session");
		},
	});
	return mutation;
};
