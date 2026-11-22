"use client";
import { VersionsDialog } from "@/features/projects/components/versions-dialog";
import { toast } from "sonner";
import {
	ChevronDown,
	Clock3,
	Download,
	Loader,
	MousePointerClick,
	Pencil,
	Redo2,
	Undo2,
} from "lucide-react";
import React, { useState } from "react";
import { BsCloudCheck, BsCloudSlash } from "react-icons/bs";
import { CiFileOn } from "react-icons/ci";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Hint } from "@/components/hint";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { UserButton } from "@/features/auth/components/user-button";
import { Logo } from "@/features/editor/components/logo";
import type { ActiveTool, Editor } from "@/features/editor/types";
import { cn } from "@/lib/utils";
import { useMutationState } from "@tanstack/react-query";
import { ModeToggle } from "@/components/mode-toggle";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { RenameProjectDialog } from "@/features/projects/components/rename-project-dialog";

interface NavbarProps {
	editor: Editor | undefined;
	activeTool: ActiveTool;
	onChangeActiveTool: (tool: ActiveTool) => void;
	id: string;
    saveStatus: "saved" | "pending" | "error";
    saveError: string | null;
    onFlush: () => Promise<string>;
}

export const Navbar = ({
	activeTool,
	onChangeActiveTool,
	editor,
	id, saveStatus, saveError, onFlush,
}: NavbarProps) => {
	const [isRenaming, setIsRenaming] = useState(false);
    const [versionsOpen, setVersionsOpen] = useState(false);
	const { data: project } = useGetProject(id);
	const data = useMutationState({
		filters: {
			mutationKey: ["project", { id }],
			exact: true,
		},
		select: (mutation) => mutation.state.status,
	});
	const currentStatus = data[data.length - 1];

	const isError = saveStatus === "error" || currentStatus === "error";
	const isPending = saveStatus === "pending" || currentStatus === "pending";

    const [importOpen, setImportOpen] = useState(false);
    const importFile = async (file: File | undefined) => {
        if (!file || !editor) return;
        if (file.size > 1024 * 1024) { toast.error("Choose a JSON design smaller than 1 MB."); return; }
        try {
            editor.loadJson(await file.text());
            setImportOpen(false);
        } catch { toast.error("This JSON file could not be opened."); }
    };
	return (
		<div className="w-full flex items-center p-2 sm:p-4 h-[68px] gap-x-2 lg:gap-x-8 border-b bg-background lg:pl-[34px]">
			<VersionsDialog open={versionsOpen} onOpenChange={setVersionsOpen} projectId={id} editor={editor} onFlush={onFlush} />
            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Open JSON design</DialogTitle><DialogDescription>A successful import replaces the current canvas. Choose an Aritfy JSON design, up to 1 MB. Export a JSON backup before replacing a design.</DialogDescription></DialogHeader>
                    <Input type="file" accept=".json,application/json" aria-label="Choose JSON design" onChange={(event) => { void importFile(event.currentTarget.files?.[0]); }} />
                </DialogContent>
            </Dialog>
            <Logo />
			<div className="flex-1 min-w-0 flex items-center gap-x-0.5 sm:gap-x-1 h-full">
				{project && (
					<>
						<DropdownMenu modal={false}>
							<DropdownMenuTrigger asChild>
								<Button
									size="sm"
									variant="ghost"
									className="hidden md:flex gap-x-2 max-w-[200px]"
								>
									<span className="truncate">{project.name}</span>
									<ChevronDown className="size-4" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="min-w-48">
								<DropdownMenuItem
									onClick={() => setIsRenaming(true)}
									className="flex items-center gap-x-2"
								>
									<Pencil className="size-4" />
									<div>
										<p>Rename Project</p>
										<p className="text-xs text-muted-foreground">
											Change the project name
										</p>
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<Separator orientation="vertical" className="hidden lg:block mx-2" />
					</>
				)}
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger asChild>
						<Button size="sm" variant={"ghost"}>
							File
							<ChevronDown className="size-4 ml-2" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="min-w-60">
                        {project && <DropdownMenuItem onClick={() => setIsRenaming(true)}><Pencil className="size-4 mr-2" />Rename Project</DropdownMenuItem>}
						<DropdownMenuItem
							onClick={() => setImportOpen(true)}
							className="flex items-center gap-x-2"
						>
							<CiFileOn className="size-8" />
							<div>
								<p>Open</p>
								<p className="text-xs text-muted-foreground">
									Open a JSON file
								</p>
							</div>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
				<Separator orientation="vertical" className="hidden lg:block mx-2" />
				<Hint label="Select" side="bottom" sideOffset={10}>
					<Button
						variant={"ghost"}
						size={"icon"}
						onClick={() => {
							onChangeActiveTool("select");
						}}
						aria-label="Select objects"
                        className={cn("size-8 shrink-0", activeTool === "select" && "bg-background/50")}
					>
						<MousePointerClick className="size-4" />
					</Button>
				</Hint>
				<Hint label="Undo" side="bottom" sideOffset={10}>
					<Button
                        aria-label="Undo" className="size-8 shrink-0"
						variant={"ghost"}
						disabled={!editor?.canUndo()}
						size={"icon"}
						onClick={() => {
							editor?.onUndo();
						}}
					>
						<Undo2 className="size-4" />
					</Button>
				</Hint>
				<Hint label="Redo" side="bottom" sideOffset={10}>
					<Button aria-label="Redo" className="size-8 shrink-0"
						variant={"ghost"}
						size={"icon"}
						disabled={!editor?.canRedo()}
						onClick={() => {
							editor?.onRedo();
						}}
					>
						<Redo2 className="size-4" />
					</Button>
				</Hint>
				<Separator orientation="vertical" className="hidden lg:block mx-2" />
				{isPending && (
					<div className="flex items-center gap-x-2">
						<Loader className="size-4 text-muted-foreground animate-spin" />
						<p className="sr-only sm:not-sr-only text-xs text-muted-foreground">Saving...</p>
					</div>
				)}
				{!isPending && isError && (
					<div className="flex items-center gap-x-2">
						<BsCloudSlash className="size-[20px] text-muted-foreground" />
						<button type="button" className="text-xs text-destructive underline" title={saveError ?? "Failed to save"} onClick={() => {void onFlush().catch(() => {});}}>Save failed. Retry</button>
					</div>
				)}

				{!isPending && !isError && (
					<div className="flex items-center gap-x-2">
						<BsCloudCheck className="size-[20px] text-muted-foreground" />
						<p className="sr-only sm:not-sr-only text-xs text-muted-foreground">Saved</p>
					</div>
				)}

				<div className="ml-auto flex items-center gap-x-0.5 sm:gap-x-4">
                    <Button aria-label="Versions" className="px-2 sm:px-3" variant="ghost" size="sm" onClick={() => setVersionsOpen(true)}><Clock3 className="size-4 sm:hidden" /><span className="sr-only sm:not-sr-only">Versions</span></Button>
					<DropdownMenu modal={false}>
						<DropdownMenuTrigger asChild>
							<Button aria-label="Export" className="px-2 sm:px-3" variant={"ghost"} size={"sm"}>
								<span className="sr-only sm:not-sr-only">Export</span>
								<Download className="size-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="min-w-60">
							<DropdownMenuItem
								className="flex items-center gap-x-2"
								onClick={() => {
									editor?.saveJson();
								}}
							>
								<CiFileOn className="size-8" />
								<div>
									<p>JSON</p>
									<p className="text-xs text-muted-foreground">
										Save for later editing
									</p>
								</div>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="flex items-center gap-x-2"
								onClick={() => {
									editor?.savePng();
								}}
							>
								<CiFileOn className="size-8" />
								<div>
									<p>PNG</p>
									<p className="text-xs text-muted-foreground">
										Best for sharing on the web
									</p>
								</div>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="flex items-center gap-x-2"
								onClick={() => {
									editor?.saveJpg();
								}}
							>
								<CiFileOn className="size-8" />
								<div>
									<p>JPG</p>
									<p className="text-xs text-muted-foreground">
										Best for printing
									</p>
								</div>
							</DropdownMenuItem>
							<DropdownMenuItem
								className="flex items-center gap-x-2"
								onClick={() => {
									editor?.saveSvg();
								}}
							>
								<CiFileOn className="size-8" />
								<div>
									<p>SVG</p>
									<p className="text-xs text-muted-foreground">
										Best for editing in vector software
									</p>
								</div>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<div className="hidden md:flex items-center gap-x-4">
						<ModeToggle />
						<UserButton />
					</div>
				</div>
				{project && (
					<RenameProjectDialog
						projectId={project.id}
						currentName={project.name}
						isOpen={isRenaming}
						onClose={() => setIsRenaming(false)}
					/>
				)}
			</div>
		</div>
	);
};
