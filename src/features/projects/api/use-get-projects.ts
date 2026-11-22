import { useInfiniteQuery } from "@tanstack/react-query";
import type { InferResponseType } from "hono";
import { client } from "@/lib/hono";
export type ResponseType = InferResponseType<
	(typeof client.api.projects)["$get"],
	200
>;

export const useGetProjects = (filters: { search?: string; orientation?: "all" | "portrait" | "landscape" | "square" } = {}) => {
	const query = useInfiniteQuery<ResponseType, Error>({
		// if exits turn it to bool
		initialPageParam: 1,
		getNextPageParam: (lastPage) => lastPage.nextPage,
		queryKey: ["projects", filters],
		queryFn: async ({ pageParam }) => {
			const response = await client.api.projects.$get({
				query: {
					page: (pageParam as number).toString(),
					limit: "5",
                    ...filters,
				},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch projects");
			}

			return response.json();
		},
	});
	return query;
};
