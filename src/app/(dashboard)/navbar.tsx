"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@/features/auth/components/user-button";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Clock, FileIcon, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { useCreateProject } from "@/features/projects/api/use-create-project";

export const Navbar = () => {
	const router = useRouter();
	const { data, isLoading } = useGetProjects();
	const createProjectMutation = useCreateProject();

	const recentProjects = data?.pages?.[0]?.data?.slice(0, 5) || [];

	const handleCreateProject = () => {
		createProjectMutation.mutate(
			{
				name: "Untitled project",
				json: "",
				width: 900,
				height: 1200,
			},
			{
				onSuccess: ({ data }) => {
					router.push(`/editor/${data.id}`);
				},
			},
		);
	};

	return (
		<nav className="w-full flex items-center p-4 h-[68px]">
			<div className="flex items-center gap-x-4">
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="gap-2">
							<Clock className="size-4" />
							Recent Projects
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-80">
						{isLoading ? (
							<DropdownMenuItem disabled>Loading projects...</DropdownMenuItem>
						) : recentProjects.length > 0 ? (
							<>
								{recentProjects.map((project: any) => (
									<DropdownMenuItem
										key={project.id}
										className="flex items-center gap-2 cursor-pointer"
										onClick={() => router.push(`/editor/${project.id}`)}
									>
										<FileIcon className="size-4" />
										<div className="flex-1 min-w-0">
											<div className="font-medium truncate">{project.name}</div>
											<div className="text-xs text-muted-foreground">
												{formatDistanceToNow(project.updatedAt, {
													addSuffix: true,
												})}
											</div>
										</div>
									</DropdownMenuItem>
								))}
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="flex items-center gap-2 cursor-pointer"
									onClick={handleCreateProject}
									disabled={createProjectMutation.isPending}
								>
									<Plus className="size-4" />
									Create New Project
								</DropdownMenuItem>
							</>
						) : (
							<>
								<DropdownMenuItem disabled>No recent projects</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									className="flex items-center gap-2 cursor-pointer"
									onClick={handleCreateProject}
									disabled={createProjectMutation.isPending}
								>
									<Plus className="size-4" />
									Create New Project
								</DropdownMenuItem>
							</>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="ml-auto flex items-center gap-x-4">
				<ModeToggle />
				<UserButton></UserButton>
			</div>
		</nav>
	);
};
