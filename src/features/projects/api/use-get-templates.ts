import { useInfiniteQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { InferRequestType, InferResponseType } from "hono";
type RequestType = InferRequestType<
	typeof client.api.projects.templates.$get
>["query"];

export const useGetTemplates = (apiQuery: RequestType, enabled = true) => {
	const query = useInfiniteQuery<InferResponseType<typeof client.api.projects.templates.$get, 200>, Error>({
        enabled,
        initialPageParam: Number(apiQuery.page ?? 1),
        getNextPageParam: lastPage => lastPage.nextPage,
		queryKey: ["templates", apiQuery],
		queryFn: async ({pageParam}) => {
			const response = await client.api.projects.templates.$get({
				query: {...apiQuery, page: String(pageParam)},
			});
			if (!response.ok) {
				throw new Error("Failed to fetch templates");
			}
			const result = await response.json();
            const {data} = result;
			return {data, nextPage: result.nextPage};
		},
	});
	return {...query, data: query.data?.pages.flatMap(page => page.data)};
};
