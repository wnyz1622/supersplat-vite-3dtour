import type { CameraPose } from './splat-config';

export type HotspotType = 'info' | 'gallery' | 'video' | 'pdf';

export type GalleryImage = {
    src: string;
    caption: string;
};

export type HotspotData = {
    id: string;
    type: HotspotType;
    title: string;
    /**
     * Used by the info popup, and as a subtitle everywhere else. Optional —
     * omit it on media hotspots where the title and the embed say enough, and
     * the popup drops the paragraph entirely.
     */
    description?: string;
    /** World-space location of the marker, same coordinate frame as CAMERA_POSE in splat-config.ts. */
    position: [number, number, number];
    /**
     * Optional authored "zoom to" view for this hotspot (e.g. exported from a
     * Blender camera placed against a glb of the scene). When omitted, a
     * reasonable view is computed automatically from `position`.
     */
    cameraPose?: CameraPose;
    images?: GalleryImage[];
    videoUrl?: string;
    pdfUrl?: string;
};

const HOTSPOTS_URL = './hotspots.json';

export async function loadHotspots(): Promise<HotspotData[]> {
    const response = await fetch(HOTSPOTS_URL);
    if (!response.ok) {
        throw new Error(`Failed to load ${HOTSPOTS_URL}: ${response.status} ${response.statusText}`);
    }
    return (await response.json()) as HotspotData[];
}
