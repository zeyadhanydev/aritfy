import type { fabric } from "fabric";
import { useCallback, useRef, useState } from "react";
import { JSON_KEYS } from "../types";
import { designIsComplete, INCOMPLETE_DESIGN_MESSAGE, normalizeDesignForLoad } from "../design-integrity";

type UseHistoryProps = {
	canvas: fabric.Canvas | null;
	saveCallback?: (values: { json: string; width: number; height: number }) => void;
};

export const useHistory = ({ canvas, saveCallback }: UseHistoryProps) => {
	const [historyIndex, setHistoryIndexState] = useState(0);
    const [restoreError, setRestoreError] = useState<string | null>(null);
	const indexRef = useRef(0);
	const canvasHistory = useRef<string[]>([]);
	const skipSave = useRef(false);

	const setHistoryIndex = useCallback((value: React.SetStateAction<number>) => {
		const next = typeof value === "function" ? value(indexRef.current) : value;
		indexRef.current = next;
		setHistoryIndexState(next);
	}, []);

	const canUndo = useCallback(() => historyIndex > 0, [historyIndex]);
	const canRedo = useCallback(
		() => historyIndex < canvasHistory.current.length - 1,
		[historyIndex],
	);

	const persist = useCallback(() => {
		if (!canvas) return;
		const workspace = canvas.clipPath;
		const width = workspace?.width;
		const height = workspace?.height;
		if (!width || !height) return;
		saveCallback?.({
			json: JSON.stringify(canvas.toJSON(JSON_KEYS)),
			width,
			height,
		});
	}, [canvas, saveCallback]);

	const save = useCallback(
		(skip = false) => {
			// Fabric emits object events while loading a saved state. Do not
			// record or persist those incomplete intermediate canvases.
			if (!canvas || skipSave.current) return;
			const json = JSON.stringify(canvas.toJSON(JSON_KEYS));
			if (!skip && canvasHistory.current[indexRef.current] !== json) {
				canvasHistory.current = canvasHistory.current.slice(0, indexRef.current + 1);
				canvasHistory.current.push(json);
				setHistoryIndex(canvasHistory.current.length - 1);
			}
			persist();
		},
		[canvas, persist, setHistoryIndex],
	);

	const restore = useCallback(
		(nextIndex: number) => {
			if (!canvas || skipSave.current || nextIndex < 0 || nextIndex >= canvasHistory.current.length) return;
			const state = JSON.parse(canvasHistory.current[nextIndex]);
            normalizeDesignForLoad(state);
			skipSave.current = true;
			try {
				canvas.loadFromJSON(state, () => {
					if (!designIsComplete(state, canvas.toJSON(JSON_KEYS))) {
                        setRestoreError(INCOMPLETE_DESIGN_MESSAGE);
                        return;
                    }
                    canvas.renderAll();
                    setHistoryIndex(nextIndex);
					skipSave.current = false;
					persist();
				});
			} catch {
                skipSave.current = true;
                setRestoreError(INCOMPLETE_DESIGN_MESSAGE);
			}
		},
		[canvas, persist, setHistoryIndex],
	);
	const undo = useCallback(() => restore(indexRef.current - 1), [restore]);
	const redo = useCallback(() => restore(indexRef.current + 1), [restore]);

	return { save, redo, undo, canRedo, canUndo, setHistoryIndex, canvasHistory, skipSave, restoreError };
};
