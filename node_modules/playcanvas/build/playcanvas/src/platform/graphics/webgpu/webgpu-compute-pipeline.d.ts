export class WebgpuComputePipeline extends WebgpuPipeline {
    lookupHashes: Uint32Array<ArrayBuffer>;
    /**
     * The cache of compute pipelines
     *
     * @type {Map<number, CacheEntry[]>}
     */
    cache: Map<number, CacheEntry[]>;
    /**
     * @param {import('../shader.js').Shader} shader - The compute shader.
     * @param {import('../bind-group-format.js').BindGroupFormat[]} bindGroupFormats - The bind group
     * formats, in bind group index order (dense, no gaps).
     * @returns {object} - The compute pipeline (GPUComputePipeline).
     */
    get(shader: import("../shader.js").Shader, bindGroupFormats: import("../bind-group-format.js").BindGroupFormat[]): object;
    create(shader: any, pipelineLayout: any): any;
}
import { WebgpuPipeline } from './webgpu-pipeline.js';
declare class CacheEntry {
    /**
     * Compute pipeline
     *
     * @type {GPUComputePipeline|null}
     * @private
     */
    private pipeline;
    /**
     * The full array of hashes used to lookup the pipeline, used in case of hash collision.
     *
     * @type {Uint32Array|null}
     */
    hashes: Uint32Array | null;
}
export {};
