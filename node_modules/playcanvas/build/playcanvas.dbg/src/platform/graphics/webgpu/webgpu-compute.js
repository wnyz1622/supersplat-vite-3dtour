var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Debug, DebugHelper } from "../../../core/debug.js";
import { BindGroup } from "../bind-group.js";
import { DebugGraphics } from "../debug-graphics.js";
import { UniformBuffer } from "../uniform-buffer.js";
const _indirectDispatchEntryByteSize = 3 * 4;
class WebgpuCompute {
  constructor(compute) {
    /** @type {UniformBuffer[]} */
    __publicField(this, "uniformBuffers", []);
    /**
     * Bind groups, indexed by bind group index. A caller-provided format occupies group 0;
     * auto-reflected resources occupy their own group (0 when no caller format, otherwise 1).
     * The array is dense (no gaps), as required by WebGPU pipeline layouts.
     *
     * @type {BindGroup[]}
     */
    __publicField(this, "bindGroups", []);
    this.compute = compute;
    const { device, shader } = compute;
    DebugGraphics.pushGpuMarker(device, `Compute:${compute.name}`);
    const {
      computeBindGroupFormat,
      computeUniformBufferFormats,
      computeReflectedBindGroupFormat,
      computeReflectedUniformBufferFormat,
      computeReflectedGroupIndex
    } = shader.impl;
    Debug.assert(
      !computeUniformBufferFormats || computeBindGroupFormat,
      "Compute shader specifies computeUniformBufferFormats but no computeBindGroupFormat to bind them into",
      shader
    );
    const formats = [];
    if (computeBindGroupFormat) {
      const bindGroup = new BindGroup(device, computeBindGroupFormat);
      DebugHelper.setName(bindGroup, `Compute-BindGroup_${bindGroup.id}`);
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
      DebugHelper.setName(reflectedBindGroup, `Compute-ReflectedBindGroup_${reflectedBindGroup.id}`);
      if (computeReflectedUniformBufferFormat) {
        const ub = new UniformBuffer(device, computeReflectedUniformBufferFormat, true);
        this.uniformBuffers.push(ub);
        reflectedBindGroup.setUniformBuffer("ub_compute", ub);
      }
      formats[computeReflectedGroupIndex] = computeReflectedBindGroupFormat;
      this.bindGroups[computeReflectedGroupIndex] = reflectedBindGroup;
    }
    this.pipeline = device.computePipeline.get(shader, formats);
    DebugGraphics.popGpuMarker(device);
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
        Debug.assert(indirectFrameStamp === device.renderVersion, "Indirect dispatch slot must be set each frame using setupIndirectDispatch()");
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
