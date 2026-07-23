/**
 * A WebGPU implementation of the Compute.
 *
 * @ignore
 */
export class WebgpuCompute {
    constructor(compute: any);
    /** @type {UniformBuffer[]} */
    uniformBuffers: UniformBuffer[];
    /**
     * Bind groups, indexed by bind group index. A caller-provided format occupies group 0;
     * auto-reflected resources occupy their own group (0 when no caller format, otherwise 1).
     * The array is dense (no gaps), as required by WebGPU pipeline layouts.
     *
     * @type {BindGroup[]}
     */
    bindGroups: BindGroup[];
    compute: any;
    pipeline: any;
    destroy(): void;
    updateBindGroup(): void;
    dispatch(x: any, y: any, z: any): void;
}
import { UniformBuffer } from '../uniform-buffer.js';
import { BindGroup } from '../bind-group.js';
