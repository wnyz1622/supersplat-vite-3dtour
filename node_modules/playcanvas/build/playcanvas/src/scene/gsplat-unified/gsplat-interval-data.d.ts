/**
 * Builds the flat interval metadata array for a world state, shared by the forward GPU-sort path
 * ({@link GSplatIntervalCompaction}) and the directional-shadow path ({@link GSplatShadowRenderer}).
 *
 * Each interval is a contiguous run of work-buffer splat slots for one octree node (or one whole
 * splat in the non-octree case), packed as 4 u32s:
 * - `workBufferBase` — first work-buffer pixel index of the run
 * - `splatCount` — number of splats in the run
 * - `boundsIndex` — index into the frustum culler's per-node bounds (for coarse sphere culling)
 * - `pad` — padding to 16 bytes
 *
 * @param {GSplatWorldState} worldState - The world state to extract intervals from.
 * @returns {Uint32Array} The packed interval data (`worldState.totalIntervals * INTERVAL_STRIDE` u32s).
 */
export function buildGSplatIntervalData(worldState: GSplatWorldState): Uint32Array;
/**
 * @import { GSplatWorldState } from './gsplat-world-state.js'
 */
export const INTERVAL_STRIDE: 4;
import type { GSplatWorldState } from './gsplat-world-state.js';
