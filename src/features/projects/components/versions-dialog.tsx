"use client";
import {useRef, useState} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {Clock3, Loader, RotateCcw, Save, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {client} from '@/lib/hono';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {useConfirm} from '@/hooks/use-confirm';
import {type Editor, JSON_KEYS} from '@/features/editor/types';
import {VersionPreview} from './version-preview';

type Summary = {id: string; label: string; width: number; height: number; kind: 'manual' | 'pre_restore'; createdAt: string};
const read = async <T,>(response: Response): Promise<T> => {
  const body = await response.json();
  if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'This version action could not be completed.');
  return body as T;
};
interface Props {open: boolean; onOpenChange: (value: boolean) => void; projectId: string; editor: Editor | undefined; onFlush: () => Promise<string>}

export const VersionsDialog = ({open, onOpenChange, projectId, editor, onFlush}: Props) => {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState('Design checkpoint');
  const [selected, setSelected] = useState<string | null>(null);
  const [previewReady, setPreviewReady] = useState(false);
  const [ConfirmRestore, confirmRestore] = useConfirm('Restore this version?', 'Your current design will be backed up first. The editor will then reopen with this version. One free version slot is required.');
  const [ConfirmDelete, confirmDelete] = useConfirm('Delete this saved version?', 'This deletes only the selected saved version, not the current project. This cannot be undone.');
  const saveRequest = useRef<{signature: string; id: string} | null>(null);
  const restoreRequest = useRef<{versionId: string; id: string} | null>(null);
  const route = client.api.projects[':id'].versions;
  const key = ['versions', {projectId}];
  const versions = useQuery({queryKey: key, enabled: open, queryFn: async () => read<{data: Summary[]}>(await route.$get({param: {id: projectId}}))});
  const version = useQuery({queryKey: [...key, selected], enabled: open && !!selected, queryFn: async () => read<{data: Summary & {json: string}}>(await route[':versionId'].$get({param: {id: projectId, versionId: selected!}}))});
  const save = useMutation({
    mutationFn: async () => {
      if (!editor) throw new Error('The editor is not ready.');
      const workspace = editor.canvas.getObjects().find(object => object.name === 'clip');
      if (!workspace?.width || !workspace.height) throw new Error('The workspace could not be read.');
      const json = JSON.stringify(editor.canvas.toJSON(JSON_KEYS));
      if (new TextEncoder().encode(json).length > 524288) throw new Error('This design is above the 512 KB version limit. Export its JSON instead.');
      const signature = JSON.stringify([label.trim(), json, workspace.width, workspace.height]);
      if (saveRequest.current?.signature !== signature) saveRequest.current = {signature, id: crypto.randomUUID()};
      return read<{data: {id: string}}>(await route.$post({param: {id: projectId}, json: {id: saveRequest.current.id, label: label.trim(), json, width: workspace.width, height: workspace.height}}));
    },
    onSuccess: result => {setSelected(result.data.id); setPreviewReady(false); saveRequest.current = null; void queryClient.invalidateQueries({queryKey: key}); toast.success('Saved version created.');},
    onError: (error: Error) => {toast.error(error.message); void queryClient.invalidateQueries({queryKey: key});},
  });
  const restore = useMutation({
    mutationFn: async () => {
      if (!selected || !previewReady) throw new Error('Preview this version before restoring it.');
      const baseRevision = await onFlush();
      if (restoreRequest.current?.versionId !== selected) restoreRequest.current = {versionId: selected, id: crypto.randomUUID()};
      return read<{data: {restored: boolean}}>(await route[':versionId'].restore.$post({param: {id: projectId, versionId: selected}, json: {operationId: restoreRequest.current.id, baseRevision}}));
    },
    onSuccess: () => {toast.success('Version restored. Reopening the editor...'); window.location.reload();},
    onError: (error: Error) => {toast.error(error.message); void queryClient.invalidateQueries({queryKey: key});},
  });
  const remove = useMutation({
    mutationFn: async (versionId: string) => read<{data: {id: string}}>(await route[':versionId'].$delete({param: {id: projectId, versionId}})),
    onSuccess: result => {if (selected === result.data.id) {setSelected(null); setPreviewReady(false);} void queryClient.invalidateQueries({queryKey: key}); toast.success('Saved version deleted.');},
    onError: (error: Error) => toast.error(error.message),
  });
  const busy = save.isPending || restore.isPending || remove.isPending;
  const selectedSummary = versions.data?.data.find(item => item.id === selected);
  return <Dialog open={open} onOpenChange={value => {if (!busy) onOpenChange(value);}}><DialogContent className="sm:max-w-5xl max-h-[90dvh] overflow-y-auto">
    <ConfirmRestore /><ConfirmDelete />
    <DialogHeader><DialogTitle className="flex items-center gap-2"><Clock3 className="size-5" />Saved versions</DialogTitle><DialogDescription>Named restore points stay available after reopening. Autosave and session undo are separate.</DialogDescription></DialogHeader>
    <div className="flex flex-col sm:flex-row gap-2"><Input aria-label="Version name" maxLength={80} value={label} onChange={event => setLabel(event.target.value)} disabled={busy} /><Button onClick={() => save.mutate()} disabled={busy || !label.trim() || !editor || versions.isError || versions.isPending || (versions.data?.data.length ?? 0) >= 20}><Save className="size-4 mr-2" />{save.isPending ? 'Saving version...' : 'Save current version'}</Button></div>
    <p className="text-xs text-muted-foreground">{versions.data?.data.length ?? 0}/20 versions in this project. Up to 50 per account, 512 KB per version and 32 MB total free version storage. Old versions are never deleted automatically. Restore needs a free slot for its backup.</p>
    <div className="grid gap-5 md:grid-cols-[240px_minmax(0,1fr)]">
      <div className="space-y-2 max-h-[420px] overflow-y-auto">
        {versions.isPending ? <p role="status" className="flex items-center gap-2 text-sm"><Loader className="size-4 animate-spin" />Loading versions...</p> : versions.isError ? <div role="alert" className="text-sm space-y-2"><p>{versions.error.message}</p><Button variant="outline" size="sm" onClick={() => versions.refetch()}>Try again</Button></div> : !versions.data.data.length ? <p className="text-sm text-muted-foreground">No saved versions yet. Save a named checkpoint before your next change.</p> : versions.data.data.map(item => <button key={item.id} type="button" disabled={busy} aria-pressed={selected === item.id} onClick={() => {setSelected(item.id); setPreviewReady(false);}} className={`w-full rounded-lg border p-3 text-left text-sm hover:bg-muted ${selected === item.id ? 'border-primary bg-muted' : ''}`}><span className="block font-medium break-words">{item.label}</span><span className="block text-xs text-muted-foreground mt-1">{new Date(item.createdAt).toLocaleString()}<br />{item.width} x {item.height}{item.kind === 'pre_restore' ? ' · Automatic restore backup' : ''}</span></button>)}
      </div>
      <div className="min-w-0 space-y-3">
        {!selected ? <div className="min-h-64 rounded-lg border border-dashed flex items-center justify-center text-sm text-muted-foreground p-6 text-center">Choose a saved version to inspect it without changing your canvas.</div> : version.isPending ? <p role="status">Loading preview...</p> : version.isError ? <p role="alert" className="text-sm text-destructive">{version.error.message}</p> : <><VersionPreview key={selected} json={version.data.data.json} onReady={setPreviewReady} /><p className="text-sm font-medium">{selectedSummary?.label}</p><div className="flex flex-wrap gap-2"><Button disabled={busy || !previewReady || (versions.data?.data.length ?? 0) >= 20} onClick={async () => {if (await confirmRestore()) restore.mutate();}}><RotateCcw className="size-4 mr-2" />{restore.isPending ? 'Restoring...' : 'Restore this version'}</Button><Button variant="outline" disabled={busy} onClick={async () => {if (await confirmDelete()) remove.mutate(selected);}}><Trash2 className="size-4 mr-2" />Delete version</Button></div></>}
      </div>
    </div>
  </DialogContent></Dialog>;
};
