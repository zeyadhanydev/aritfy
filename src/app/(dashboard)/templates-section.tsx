"use client";

import { useGetTemplates } from "@/features/projects/api/use-get-templates";
import { Loader, TriangleAlert } from "lucide-react";
import { TemplateCard } from "./template-card";
import { useCreateProject } from "@/features/projects/api/use-create-project";
import { useRouter } from "next/navigation";

export const TemplatesSection = () => {
	const { data, isLoading, isError } = useGetTemplates({
		page: "1",
		limit: "4",
	});
	const mutation = useCreateProject();
	const router = useRouter()
	if (isLoading) {
		return (
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Start from a template</h3>
				<div className="flex items-center justify-center h-32">
					<Loader className="size-6 animate-spin text-muted-foreground" />
				</div>
			</div>
		);
	}
	if (isError) {
		return (
			<div className="space-y-4">
				<h3 className="font-medium text-lg">Start from a template</h3>
				<div className="flex flex-col gap-y-4 items-center justify-center h-32">
					<TriangleAlert className="size-6 text-muted-foreground" />
					<p>Failed to load templates</p>
				</div>
			</div>
		);
	}
	if (!data.length) {
		return null;
	}
	const onClick = (template: any) => {
	// TODO: check if the tempalate is pro
	mutation.mutate({
	    name:`${template.name} project`,
			json: template.json,
			width: template.width,
			height: template.height
	}, {
	onSuccess: ({data}) => {
	  router.push(`/editor/${data.id}`)
	}
	})

	}
	return (
		<div className="space-y-4">
			<h3 className="font-medium text-lg">Start from a template</h3>
			<div className="grid grid-cols-2 md:grid-cols-4 mt-4 gap-4">
				{data.map((template) => (
					<TemplateCard
						imgSrc={template.thumbnailUrl || ""}
						key={template.id}
						onClick={() => onClick(template)}
						height={template.height}

						width={template.width}
						isPro={template.isPro}
						title={template.name}
						disabled={mutation.isPending}
						description={`${template.width} x ${template.height} px`}
					/>
				))}
			</div>
		</div>
	);
};
