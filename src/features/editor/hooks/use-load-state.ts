import { useEffect, useRef } from "react";
import type { fabric } from "fabric";
import { JSON_KEYS } from "../types";

interface UseLoadStateProps {
	autoZoom: () => void;
	canvas: fabric.Canvas | null;
	initialState: React.RefObject<string | undefined>;
	canvasHistory: React.RefObject<string[]>;
	setHistoryIndex: React.Dispatch<React.SetStateAction<number>>;
}

export const useLoadState = ({
	autoZoom,
	canvas,
	canvasHistory,
	initialState,
	setHistoryIndex,
}: UseLoadStateProps) => {
	const initialized = useRef(false);

	useEffect(() => {
		console.log(!initialized.current, initialState.current, canvas);
		if (!initialized.current && initialState?.current && canvas) {
			try {
				// Validate and clean the JSON string
				const jsonString = initialState.current.trim();

				// Check if it's valid JSON
				const parsedData = JSON.parse(jsonString);

				canvas.loadFromJSON(parsedData, () => {
					const currentState = JSON.stringify(canvas.toJSON(JSON_KEYS));
					if (canvasHistory.current) {
						canvasHistory.current = [currentState];
					}
					setHistoryIndex(0);
					autoZoom();
				});
				initialized.current = true;
			} catch (error) {
				console.error("Failed to parse initial state JSON:", error);
				console.error("JSON content:", initialState.current);
				// Reset to empty canvas if JSON is invalid
				canvas.clear();
				const currentState = JSON.stringify(canvas.toJSON(JSON_KEYS));
				if (canvasHistory.current) {
					canvasHistory.current = [currentState];
				}
				setHistoryIndex(0);
				autoZoom();
				initialized.current = true;
			}
		}
		// no need for canvasHistory => ref, initialState => ref, setHistoryIndex => Dispatch
	}, [canvas, autoZoom, initialState, canvasHistory, setHistoryIndex]);
};
