import { BindGroup } from "../bind-group.js";
import { UniformBuffer } from "../uniform-buffer.js";
const _indirectDispatchEntryByteSize = 3 * 4;
class WebgpuCompute {
	uniformBuffers = [];
	bindGroups = [];
	constructor(compute) {
		this.compute = compute;
		const { device, shader } = compute;
		const {
			computeBindGroupFormat,
			computeUniformBufferFormats,
			computeReflectedBindGroupFormat,
			computeReflectedUniformBufferFormat,
			computeReflectedGroupIndex
		} = shader.impl;
		const formats = [];
		if (computeBindGroupFormat) {
			const bindGroup = new BindGroup(device, computeBindGroupFormat);
			if (computeUniformBufferFormats) {
				for (const name in computeUniformBufferFormats) {
					if (computeUniformBufferFormats.hasOwnProperty(name)) {
						const ub = new UniformBuffer(device, computeUniformBufferFormats[name], true);
						this.uniformBuffers.push(ub);
						bindGroup.setUniformBuffer(name, ub);
					}
				}
			}
			formats[0] = computeBindGroupFormat;
			this.bindGroups[0] = bindGroup;
		}
		if (computeReflectedBindGroupFormat) {
			const reflectedBindGroup = new BindGroup(device, computeReflectedBindGroupFormat);
			if (computeReflectedUniformBufferFormat) {
				const ub = new UniformBuffer(device, computeReflectedUniformBufferFormat, true);
				this.uniformBuffers.push(ub);
				reflectedBindGroup.setUniformBuffer("ub_compute", ub);
			}
			formats[computeReflectedGroupIndex] = computeReflectedBindGroupFormat;
			this.bindGroups[computeReflectedGroupIndex] = reflectedBindGroup;
		}
		this.pipeline = device.computePipeline.get(shader, formats);
	}
	destroy() {
		this.uniformBuffers.forEach((ub) => ub.destroy());
		this.uniformBuffers.length = 0;
		this.bindGroups.forEach((bindGroup) => bindGroup.destroy());
		this.bindGroups.length = 0;
	}
	updateBindGroup() {
		for (let i = 0; i < this.bindGroups.length; i++) {
			const bindGroup = this.bindGroups[i];
			bindGroup.updateUniformBuffers();
			bindGroup.update();
		}
	}
	dispatch(x, y, z) {
		const device = this.compute.device;
		for (let i = 0; i < this.bindGroups.length; i++) {
			device.setBindGroup(i, this.bindGroups[i]);
		}
		const passEncoder = device.passEncoder;
		passEncoder.setPipeline(this.pipeline);
		const { indirectSlotIndex, indirectBuffer, indirectFrameStamp } = this.compute;
		if (indirectSlotIndex >= 0) {
			let gpuBuffer;
			if (indirectBuffer) {
				gpuBuffer = indirectBuffer.impl.buffer;
			} else {
				gpuBuffer = device.indirectDispatchBuffer.impl.buffer;
			}
			const offset = indirectSlotIndex * _indirectDispatchEntryByteSize;
			passEncoder.dispatchWorkgroupsIndirect(gpuBuffer, offset);
		} else {
			passEncoder.dispatchWorkgroups(x, y, z);
		}
	}
}
export {
	WebgpuCompute
};
