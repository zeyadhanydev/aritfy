import type { fabric } from "fabric";
import { useEffect, useRef } from "react";
import { JSON_KEYS } from "../types";
interface UseLoadStateProps {
	autoZoom: () => void;
	canvas: fabric.Canvas | null;
	initialState: React.MutableRefObject<string | undefined>;
	canvasHistory: React.MutableRefObject<string[]>;
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
			canvas.loadFromJSON(JSON.parse(initialState.current), () => {
				const currentState = JSON.stringify(canvas.toJSON(JSON_KEYS));
				canvasHistory.current = [currentState];
				setHistoryIndex(0);
				autoZoom();
			});
			initialized.current = true;
		}
		// no need for canvasHistory => ref, initialState => ref, setHistoryIndex => Dispatch
	}, [canvas, autoZoom, initialState, canvasHistory, setHistoryIndex]);
};
