type DesignNode = { objects?: unknown[]; backgroundImage?: unknown; overlayImage?: unknown };

function objectCount(value: unknown): number {
    if (!value || typeof value !== 'object') return 0;
    const node = value as DesignNode;
    return (Array.isArray(node.objects) ? node.objects : []).reduce<number>((total, object) => total + 1 + objectCount(object), 0)
        + (node.backgroundImage ? 1 : 0) + (node.overlayImage ? 1 : 0);
}

// Fabric can finish loading successfully after silently omitting failed images.
export function designIsComplete(expected: unknown, actual: unknown): boolean {
    return objectCount(expected) === objectCount(actual);
}

export const INCOMPLETE_DESIGN_MESSAGE = 'Some design objects or images could not be loaded. Editing and autosave are paused to protect your stored design. Check the image sources, then reopen the project.';

export function normalizeDesignForLoad(value: unknown): void {
    if (!value || typeof value !== 'object') return;
    const node = value as { type?: string; styles?: unknown; objects?: unknown[] };
    if (['textbox', 'text', 'i-text'].includes(node.type ?? '') && node.styles == null) node.styles = {};
    if (Array.isArray(node.objects)) node.objects.forEach(normalizeDesignForLoad);
}

export function portableDesign(value: unknown, origin = typeof window === 'undefined' ? undefined : window.location.origin): unknown {
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map(item => portableDesign(item, origin));
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value)) result[key] = portableDesign(item, origin);
    if (origin && result.type === 'image' && typeof result.src === 'string') {
        try {
            const url = new URL(result.src, origin);
            if (url.origin === origin && url.pathname === '/samples/studio-still-life.svg' && !url.search && !url.hash) result.src = url.pathname;
        } catch { /* An unrelated image source is left untouched. */ }
    }
    return result;
}
