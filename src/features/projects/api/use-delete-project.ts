import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InferRequestType, InferResponseType } from "hono";
import { toast } from "sonner";
import { client } from "@/lib/hono";

type ResponseType = InferResponseType<
	(typeof client.api.projects)[":id"]["$delete"],
	200
>;
type RequestType = InferRequestType<
	(typeof client.api.projects)[":id"]["$delete"]
>["param"];

export const useDeleteProject = () => {
	const queryClient = useQueryClient();
	const mutation = useMutation<ResponseType, Error, RequestType>({
		mutationFn: async (param) => {
			const response = await client.api.projects[":id"].$delete({
				param,
			});

			if (!response.ok) {
				throw new Error("Failed to delete project");
			}

			return await response.json();
		},
		onSuccess: ({ data }) => {
			toast.success("Project deleted");

			queryClient.invalidateQueries({
				queryKey: ["projects", { id: data.id }],
			});
			queryClient.invalidateQueries({
				queryKey: ["projects"],
			});
		},
		onError: () => {
			toast.error("Failed to delete project");
		},
	});

	return mutation;
};
