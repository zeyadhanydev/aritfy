import { useEffect, useRef, useState } from "react";
import type { fabric } from "fabric";
import { JSON_KEYS } from "../types";
import { designIsComplete, INCOMPLETE_DESIGN_MESSAGE, normalizeDesignForLoad } from "../design-integrity";

interface UseLoadStateProps {
	autoZoom: () => void;
	canvas: fabric.Canvas | null;
	initialState: React.RefObject<string | undefined>;
	canvasHistory: React.RefObject<string[]>;
	skipSave: React.RefObject<boolean>;
	setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const useLoadState = ({
	autoZoom,
	canvas,
	canvasHistory,
	initialState,
	setHistoryIndex,
	skipSave,
}: UseLoadStateProps) => {
	const initialized = useRef(false);
	const [loadError, setLoadError] = useState<string | null>(null);

	useEffect(() => {
		if (!initialized.current && initialState?.current && canvas) {
			skipSave.current = true;
			try {
				// Validate and clean the JSON string
				const jsonString = initialState.current.trim();

				// Check if it's valid JSON
				const parsedData = JSON.parse(jsonString);
                normalizeDesignForLoad(parsedData);
                if (!parsedData || !Array.isArray(parsedData.objects)) throw new Error("Invalid design data");

				canvas.loadFromJSON(parsedData, () => {
					const loaded = canvas.toJSON(JSON_KEYS);
                    if (!designIsComplete(parsedData, loaded)) {
                        setLoadError(INCOMPLETE_DESIGN_MESSAGE);
                        return;
                    }
                    const currentState = JSON.stringify(loaded);
					if (canvasHistory.current) {
						canvasHistory.current = [currentState];
					}
					setHistoryIndex(0);
					autoZoom();
					skipSave.current = false;
				});
				initialized.current = true;
			} catch {
				console.error("Failed to load saved design.");
                // Keep the stored design untouched and block autosave after a load failure.
                initialized.current = true;
                skipSave.current = true;
                setLoadError("This saved design could not be loaded. Your stored data has not been changed.");
			}
		}
		// no need for canvasHistory => ref, initialState => ref, setHistoryIndex => Dispatch
	}, [canvas, autoZoom, initialState, canvasHistory, setHistoryIndex, skipSave]);
	return loadError;
};
