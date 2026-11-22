"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { TemplateFilters, type TemplateAccess, type TemplateSource } from "@/features/projects/components/template-filters";
import { useGetTemplates } from "@/features/projects/api/use-get-templates";
import { Loader, TriangleAlert } from "lucide-react";
import { TemplateCard } from "./template-card";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { useRouter } from "next/navigation";
import { usePaywall } from "@/features/subscription/hooks/use-paywall";

export const TemplatesSection = () => {
	const paywall = usePaywall();
    const [search, setSearch] = useState("");
    const [access, setAccess] = useState<TemplateAccess>("all");
    const [source, setSource] = useState<TemplateSource>("all");
    const debouncedSearch = useDebouncedValue(search);
	const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useGetTemplates({
		page: "1",
		limit: "20",
        search: debouncedSearch, access, source,
	});
	const mutation = useCreateProject();
	const router = useRouter();
	const onClick = (template: NonNullable<typeof data>[number]) => {
		if (template.isPro && paywall.shouldBlock) {
			paywall.triggerPaywall();
			return;
		}
		mutation.mutate(
			{
				name: `${template.name} project`,
				json: template.json,
				width: template.width,
				height: template.height,
			},
			{
				onSuccess: ({ data }) => {
					router.push(`/editor/${data.id}`);
				},
			},
		);
	};
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
					Start from a template
				</h3>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					First-party vectors and community designs
				</p>
			</div>
            <TemplateFilters search={search} onSearch={setSearch} access={access} onAccess={setAccess} source={source} onSource={setSource} />
            <div aria-live="polite" className="text-sm text-muted-foreground">
              {isLoading ? <span className="flex gap-2 items-center"><Loader className="size-4 animate-spin" />Loading templates...</span> : isError ? <span className="flex gap-2 items-center"><TriangleAlert className="size-4" />Failed to load templates. Try another source.</span> : !data?.length ? "No templates match these filters." : `${data.length} templates shown`}
            </div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{data?.map((template) => (
					<TemplateCard
						imgSrc={template.thumbnailUrl || ""}
						key={template.id}
						onClick={() => onClick(template)}
						height={template.height}
						width={template.width}
						isPro={template.isPro}
						title={template.name}
						disabled={mutation.isPending}
						description={
							template.source === "local" ? "First-party vector. No remote image assets." : `Community ${template.name.toLowerCase()} template`
						}
					/>
				))}
			</div>
            {hasNextPage && <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>{isFetchingNextPage ? "Loading..." : "Load more templates"}</Button>}
		</div>
	);
};
