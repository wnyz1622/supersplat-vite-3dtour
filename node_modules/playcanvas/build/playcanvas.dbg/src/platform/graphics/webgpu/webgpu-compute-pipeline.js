var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { array } from "../../../core/array-utils.js";
import { Debug, DebugHelper } from "../../../core/debug.js";
import { TRACEID_COMPUTEPIPELINE_ALLOC } from "../../../core/constants.js";
import { hash32Fnv1a } from "../../../core/hash.js";
import { WebgpuDebug } from "./webgpu-debug.js";
import { WebgpuPipeline } from "./webgpu-pipeline.js";
let _pipelineId = 0;
class CacheEntry {
  constructor() {
    /**
     * Compute pipeline
     *
     * @type {GPUComputePipeline|null}
     * @private
     */
    __publicField(this, "pipeline", null);
    /**
     * The full array of hashes used to lookup the pipeline, used in case of hash collision.
     *
     * @type {Uint32Array|null}
     */
    __publicField(this, "hashes", null);
  }
}
class WebgpuComputePipeline extends WebgpuPipeline {
  constructor() {
    super(...arguments);
    // shader compute key + up to 2 bind group format keys (caller group 0 + reflected group)
    __publicField(this, "lookupHashes", new Uint32Array(3));
    /**
     * The cache of compute pipelines
     *
     * @type {Map<number, CacheEntry[]>}
     */
    __publicField(this, "cache", /* @__PURE__ */ new Map());
  }
  /**
   * @param {import('../shader.js').Shader} shader - The compute shader.
   * @param {import('../bind-group-format.js').BindGroupFormat[]} bindGroupFormats - The bind group
   * formats, in bind group index order (dense, no gaps).
   * @returns {object} - The compute pipeline (GPUComputePipeline).
   */
  get(shader, bindGroupFormats) {
    Debug.assert(bindGroupFormats.length <= 2);
    const lookupHashes = this.lookupHashes;
    lookupHashes[0] = shader.impl.computeKey;
    lookupHashes[1] = bindGroupFormats[0] ? bindGroupFormats[0].impl.key : 0;
    lookupHashes[2] = bindGroupFormats[1] ? bindGroupFormats[1].impl.key : 0;
    const hash = hash32Fnv1a(lookupHashes);
    let cacheEntries = this.cache.get(hash);
    if (cacheEntries) {
      for (let i = 0; i < cacheEntries.length; i++) {
        const entry = cacheEntries[i];
        if (array.equals(entry.hashes, lookupHashes)) {
          return entry.pipeline;
        }
      }
    }
    const impls = [];
    if (bindGroupFormats[0]) impls.push(bindGroupFormats[0].impl);
    if (bindGroupFormats[1]) impls.push(bindGroupFormats[1].impl);
    const pipelineLayout = this.getPipelineLayout(impls);
    const cacheEntry = new CacheEntry();
    cacheEntry.hashes = new Uint32Array(lookupHashes);
    cacheEntry.pipeline = this.create(shader, pipelineLayout);
    if (cacheEntries) {
      cacheEntries.push(cacheEntry);
    } else {
      cacheEntries = [cacheEntry];
    }
    this.cache.set(hash, cacheEntries);
    return cacheEntry.pipeline;
  }
  create(shader, pipelineLayout) {
    const wgpu = this.device.wgpu;
    const webgpuShader = shader.impl;
    const desc = {
      compute: {
        module: webgpuShader.getComputeShaderModule(),
        entryPoint: webgpuShader.computeEntryPoint
      },
      // uniform / texture binding layout
      layout: pipelineLayout
    };
    WebgpuDebug.validate(this.device);
    _pipelineId++;
    DebugHelper.setLabel(desc, `ComputePipelineDescr-${_pipelineId}`);
    const pipeline = wgpu.createComputePipeline(desc);
    DebugHelper.setLabel(pipeline, `ComputePipeline-${_pipelineId}`);
    Debug.trace(TRACEID_COMPUTEPIPELINE_ALLOC, `Alloc: Id ${_pipelineId}`, desc);
    WebgpuDebug.end(this.device, "ComputePipeline creation", {
      computePipeline: this,
      desc,
      shader
    });
    return pipeline;
  }
}
export {
  WebgpuComputePipeline
};
