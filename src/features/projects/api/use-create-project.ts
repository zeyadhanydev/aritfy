import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	(typeof client.api.projects)["$post"],
	200
>;

export const useCreateProject = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType>({
		mutationFn: async (json) => {
			const response = await client.api.projects.$post({
				json,
			});
			if (!response.ok) {
				throw new Error("Something went wrong");
			}
			return await response.json();
		},
		onSuccess: () => {
			toast.success("project created");
			queryClient.invalidateQueries({
				queryKey: ["projects"],
			});
		},
		onError: () => {
			toast.error("Failed to create project");
		},
	});
	return mutation;
};
