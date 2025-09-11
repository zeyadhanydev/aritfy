"use client";

import { Table, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import {
	AlertTriangle,
	CopyIcon,
	FileIcon,
	Loader,
	MoreHorizontal,
	Search,
	Trash,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Fragment } from "react";
import { formatDistanceToNow } from "date-fns";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDuplicateProject } from "@/features/projects/api/use-duplicate-project";
import { useDeleteProject } from "@/features/projects/api/use-delete-project";
import { useConfirm } from "@/hooks/use-confirm";

export const ProjectsSection = () => {
	const [ConfirmDialog, confirm] = useConfirm(
		"Are you sure?",
		"You are about to delete this project",
	);
	const duplicateMutation = useDuplicateProject();
	const router = useRouter();
	const onCopy = (id: string) => {
		console.log(id);
		duplicateMutation.mutate({ id });
	};
	const removeMutation = useDeleteProject();
	const onDelete = async (id: string) => {
		const ok = await confirm();
		if (ok) {
			removeMutation.mutate({ id });
		}
	};

	const { data, status, fetchNextPage, isFetchingNextPage, hasNextPage } =
		useGetProjects();

	if (status === "error") {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
						Recent Projects
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Continue working on your designs
					</p>
				</div>
				<div className="flex flex-col gap-y-4 items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
					<AlertTriangle className="size-6 text-gray-400 dark:text-gray-500" />
					<p className="text-gray-500 dark:text-gray-400 text-sm">
						Failed to load projects
					</p>
				</div>
			</div>
		);
	}
	if (status === "pending") {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
						Recent Projects
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Continue working on your designs
					</p>
				</div>
				<div className="flex flex-col gap-y-4 items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg">
					<Loader className="size-6 animate-spin text-gray-400 dark:text-gray-500" />
					<p className="text-gray-500 dark:text-gray-400 text-sm">
						Loading projects...
					</p>
				</div>
			</div>
		);
	}

	if (!data.pages.length || !data.pages[0].data.length) {
		return (
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
						Recent Projects
					</h3>
					<p className="text-sm text-gray-500 dark:text-gray-400">
						Continue working on your designs
					</p>
				</div>
				<div className="flex flex-col gap-y-4 items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
					<Search className="size-6 text-gray-400 dark:text-gray-500" />
					<p className="text-gray-500 dark:text-gray-400 text-sm">
						No projects found
					</p>
				</div>
			</div>
		);
	}
	return (
		<div className="space-y-6">
			<ConfirmDialog />
			<div className="flex items-center justify-between">
				<h3 className="font-semibold text-xl text-gray-900 dark:text-gray-100">
					Recent Projects
				</h3>
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Continue working on your designs
				</p>
			</div>

			<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
				<Table>
					<TableBody>
						{data.pages.map((group, i) => (
							<Fragment key={i}>
								{group.data.map((project) => (
									<TableRow key={project.id}>
										<TableCell
											onClick={() => router.push(`/editor/${project.id}`)}
											className="font-medium flex items-center gap-x-2 cursor-pointer"
										>
											<FileIcon className="size-6" />
											{project.name}
										</TableCell>
										<TableCell className="hidden md:table-cell cursor-pointer">
											{project.width} x {project.height} px
										</TableCell>
										<TableCell className="hidden md:table-cell cursor-pointer">
											{formatDistanceToNow(project.updatedAt, {
												addSuffix: true,
											})}
										</TableCell>

										<TableCell className="flex items-center justify-end">
											<DropdownMenu modal={false}>
												<DropdownMenuTrigger asChild>
													<Button
														size={"icon"}
														disabled={false}
														variant="ghost"
													>
														<MoreHorizontal className="size-4 " />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end" className="w-60">
													<DropdownMenuItem
														className="h-10 cursor-pointer"
														disabled={duplicateMutation.isPending}
														onClick={() => {
															onCopy(project.id);
														}}
													>
														<CopyIcon className="size-4 mr-2" />
														Make a copy
													</DropdownMenuItem>
													<DropdownMenuItem
														className="h-10 cursor-pointer"
														disabled={removeMutation.isPending}
														onClick={() => {
															onDelete(project.id);
														}}
													>
														<Trash className="size-4 mr-2" />
														Delete
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))}
							</Fragment>
						))}
					</TableBody>
				</Table>
			</div>
			{hasNextPage && (
				<div className="w-full items-center justify-center flex pt-4">
					<Button
						variant="outline"
						onClick={() => fetchNextPage()}
						disabled={isFetchingNextPage}
						className="hover:bg-gray-50 dark:hover:bg-gray-800"
					>
						{isFetchingNextPage ? "Loading..." : "Load more"}
					</Button>
				</div>
			)}
		</div>
	);
};
