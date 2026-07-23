var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { DebugHelper } from "../../core/debug.js";
import { StorageBuffer } from "../../platform/graphics/storage-buffer.js";
import { BUFFERUSAGE_COPY_SRC } from "../../platform/graphics/constants.js";
class GSplatHybridRendererScratch {
  /**
   * @param {GraphicsDevice} device - The graphics device (must support compute).
   */
  constructor(device) {
    /** @type {GraphicsDevice} */
    __publicField(this, "device");
    /**
     * Dense compacted work-buffer index list produced by {@link GSplatIntervalCompaction} (the
     * coarse-cull survivors). Sized to the work buffer's active splat count; grows monotonically.
     *
     * @type {StorageBuffer|null}
     */
    __publicField(this, "compactedSplatIds", null);
    /** @type {number} */
    __publicField(this, "_allocatedCompacted", 0);
    this.device = device;
  }
  /**
   * Ensures the shared candidate-index scratch holds at least `capacity` u32 entries, growing it
   * if needed. Returns the buffer so the caller can bind it.
   *
   * @param {number} capacity - Required entry count (work-buffer total active splats).
   * @returns {StorageBuffer} The candidate-index scratch buffer.
   */
  ensureCompactedSplatIds(capacity) {
    if (capacity > this._allocatedCompacted) {
      this.compactedSplatIds?.destroy();
      this._allocatedCompacted = capacity;
      this.compactedSplatIds = new StorageBuffer(this.device, capacity * 4, BUFFERUSAGE_COPY_SRC);
      DebugHelper.setName(this.compactedSplatIds, "GSplatHybridRendererScratch.compactedSplatIds");
    }
    return this.compactedSplatIds;
  }
  destroy() {
    this.compactedSplatIds?.destroy();
    this.compactedSplatIds = null;
    this._allocatedCompacted = 0;
  }
}
export {
  GSplatHybridRendererScratch
};
