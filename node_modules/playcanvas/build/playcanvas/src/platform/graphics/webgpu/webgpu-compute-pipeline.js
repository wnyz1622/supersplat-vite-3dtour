import { array } from "../../../core/array-utils.js";
import { TRACEID_COMPUTEPIPELINE_ALLOC } from "../../../core/constants.js";
import { hash32Fnv1a } from "../../../core/hash.js";
import { WebgpuPipeline } from "./webgpu-pipeline.js";
let _pipelineId = 0;
class CacheEntry {
	pipeline = null;
	hashes = null;
}
class WebgpuComputePipeline extends WebgpuPipeline {
	// shader compute key + up to 2 bind group format keys (caller group 0 + reflected group)
	lookupHashes = new Uint32Array(3);
	cache = /* @__PURE__ */ new Map();
	get(shader, bindGroupFormats) {
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
		_pipelineId++;
		const pipeline = wgpu.createComputePipeline(desc);
		return pipeline;
	}
}
export {
	WebgpuComputePipeline
};
