import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	(typeof client.api.projects)["$post"],
	200
>;
type RequestType = InferRequestType<(typeof client.api.projects)["$post"]>;

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
			toast.error("Faild to create project");
		},
	});
	return mutation;
};
