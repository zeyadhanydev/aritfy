"use client";

import { Fragment, useState } from "react";
import { Table, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { AlertTriangle, CopyIcon, FileIcon, Loader, MoreHorizontal, Pencil, Search, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useDuplicateProject } from "@/features/projects/api/use-duplicate-project";
import { useDeleteProject } from "@/features/projects/api/use-delete-project";
import { useConfirm } from "@/hooks/use-confirm";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { RenameProjectDialog } from "@/features/projects/components/rename-project-dialog";

type Orientation = "all" | "portrait" | "landscape" | "square";

export const ProjectsSection = () => {
  const [ConfirmDialog, confirm] = useConfirm("Delete project?", "This permanently deletes the project and its saved versions.");
  const [renameProject, setRenameProject] = useState<{id: string; name: string} | null>(null);
  const [search, setSearch] = useState("");
  const [orientation, setOrientation] = useState<Orientation>("all");
  const debouncedSearch = useDebouncedValue(search);
  const duplicateMutation = useDuplicateProject();
  const removeMutation = useDeleteProject();
  const router = useRouter();
  const {data, status, fetchNextPage, isFetchingNextPage, hasNextPage, refetch} = useGetProjects({search: debouncedSearch, orientation});
  const onDelete = async (id: string) => {if (await confirm()) removeMutation.mutate({id});};
  const empty = !data?.pages.some(page => page.data.length);

  return (
    <section className="space-y-6">
      <ConfirmDialog />
      {renameProject && <RenameProjectDialog projectId={renameProject.id} currentName={renameProject.name} isOpen onClose={() => setRenameProject(null)} />}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-xl">Recent Projects</h3>
        <p className="text-sm text-muted-foreground">Search all your designs, not only this page</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <Input aria-label="Search projects" placeholder="Search your projects..." maxLength={100} value={search} onChange={event => setSearch(event.target.value)} />
        <select aria-label="Project orientation" className="h-10 rounded-md border bg-background px-3 text-sm" value={orientation} onChange={event => setOrientation(event.target.value as Orientation)}>
          <option value="all">All sizes</option><option value="portrait">Portrait</option><option value="landscape">Landscape</option><option value="square">Square</option>
        </select>
        {(search || orientation !== "all") && <Button variant="outline" onClick={() => {setSearch(""); setOrientation("all");}}>Clear filters</Button>}
      </div>
      {status === "pending" ? <div role="status" className="flex items-center justify-center gap-2 h-32 rounded-lg bg-muted"><Loader className="size-5 animate-spin" />Loading projects...</div> : status === "error" ? <div role="alert" className="flex items-center justify-center flex-wrap gap-3 h-32 rounded-lg bg-muted"><AlertTriangle className="size-5" />Failed to load projects.<Button variant="outline" onClick={() => refetch()}>Try again</Button></div> : empty ? <div role="status" className="flex items-center justify-center gap-2 h-32 rounded-lg border border-dashed"><Search className="size-5" />No projects match these filters.</div> : (
        <div className="bg-background border rounded-lg overflow-hidden">
          <Table><TableBody>
            {data?.pages.map((group, index) => <Fragment key={index}>{group.data.map(project => (
              <TableRow key={project.id}>
                <TableCell className="font-medium"><button type="button" onClick={() => router.push(`/editor/${project.id}`)} className="flex items-center gap-2 text-left hover:underline"><FileIcon className="size-6 shrink-0" /><span>{project.name}</span></button></TableCell>
                <TableCell className="hidden md:table-cell">{project.width} x {project.height} px</TableCell>
                <TableCell className="hidden md:table-cell">{formatDistanceToNow(project.updatedAt, {addSuffix: true})}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu modal={false}><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label={`Actions for ${project.name}`}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuItem className="h-10 cursor-pointer" onClick={() => setRenameProject({id: project.id, name: project.name})}><Pencil className="size-4 mr-2" />Rename</DropdownMenuItem>
                      <DropdownMenuItem className="h-10 cursor-pointer" disabled={duplicateMutation.isPending} onClick={() => duplicateMutation.mutate({id: project.id})}><CopyIcon className="size-4 mr-2" />Make a copy</DropdownMenuItem>
                      <DropdownMenuItem className="h-10 cursor-pointer" disabled={removeMutation.isPending} onClick={() => onDelete(project.id)}><Trash className="size-4 mr-2" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}</Fragment>)}
          </TableBody></Table>
        </div>
      )}
      {hasNextPage && <div className="flex justify-center"><Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>{isFetchingNextPage ? "Loading..." : "Load more"}</Button></div>}
    </section>
  );
};
