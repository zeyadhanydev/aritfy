import { useCallback, useEffect, useRef, useState } from "react";
import { useUpdateProject } from "./use-update-project";

type Design = {json: string; width: number; height: number};
export const useProjectAutosave = (id: string, initialRevision: string) => {
  const {mutateAsync} = useUpdateProject(id);
  const mutateRef = useRef(mutateAsync);
  mutateRef.current = mutateAsync;
  const revision = useRef(initialRevision);
  const pending = useRef<Design | null>(null);
  const running = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [status, setStatus] = useState<"saved" | "pending" | "error">("saved");
  const [error, setError] = useState<string | null>(null);
  const flush = useCallback(async () => {
    clearTimeout(timer.current);
    if (running.current) await running.current;
    if (pending.current) {
      const drain = async () => {
        while (pending.current) {
          const values = pending.current;
          pending.current = null;
          try {
            const response = await mutateRef.current({...values, baseRevision: revision.current});
            revision.current = response.data.revision;
          } catch (cause) {
            pending.current ??= values;
            setStatus("error");
            setError(cause instanceof Error ? cause.message : "Your design could not be saved.");
            throw cause;
          }
        }
        setError(null);
        setStatus("saved");
      };
      const operation = drain();
      running.current = operation;
      try {await operation;} finally {if (running.current === operation) running.current = null;}
    }
    return revision.current;
  }, []);
  const queue = useCallback((values: Design) => {
    pending.current = values;
    setStatus("pending");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {void flush().catch(() => {});}, 500);
  }, [flush]);
  useEffect(() => () => {clearTimeout(timer.current); void flush().catch(() => {});}, [flush]);
  return {save: queue, flush, status, error};
};
