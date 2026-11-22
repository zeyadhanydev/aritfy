import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { BUILT_IN_TEMPLATES } from "../built-in-templates";
import { InferRequestType } from "hono";
type RequestType = InferRequestType<
	typeof client.api.projects.templates.$get
>["query"];

export const useGetTemplates = (apiQuery: RequestType) => {
	const query = useQuery({
		queryKey: ["templates", { page: apiQuery.page, limit: apiQuery.limit }],
		queryFn: async () => {
			const response = await client.api.projects.templates.$get({
				query: apiQuery,
			});
			if (!response.ok) {
				throw new Error("Failed to fetch templates");
			}
			const { data } = await response.json();
			return [...BUILT_IN_TEMPLATES, ...data];
		},
	});
	return query;
};
