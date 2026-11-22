import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	(typeof client.api.projects)[":id"]["$patch"],
	200
>;
type RequestType = InferRequestType<
	(typeof client.api.projects)[":id"]["$patch"]
>["json"];

export const useUpdateProject = (id: string) => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationKey: ["project", { id }],
		mutationFn: async (json) => {
			const response = await client.api.projects[":id"].$patch({
				json,
				param: { id },
			});
			if (!response.ok) {
				const result = await response.json();
                throw new Error("error" in result ? result.error : "Failed to update project");
			}
			return response.json();
		},
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: ["project", { id }],
			});
			queryClient.invalidateQueries({
				queryKey: ["projects"],
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});
	return mutation;
};
