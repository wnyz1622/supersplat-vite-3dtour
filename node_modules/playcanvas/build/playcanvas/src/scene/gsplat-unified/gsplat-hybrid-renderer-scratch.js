import { StorageBuffer } from "../../platform/graphics/storage-buffer.js";
import { BUFFERUSAGE_COPY_SRC } from "../../platform/graphics/constants.js";
class GSplatHybridRendererScratch {
	device;
	compactedSplatIds = null;
	_allocatedCompacted = 0;
	constructor(device) {
		this.device = device;
	}
	ensureCompactedSplatIds(capacity) {
		if (capacity > this._allocatedCompacted) {
			this.compactedSplatIds?.destroy();
			this._allocatedCompacted = capacity;
			this.compactedSplatIds = new StorageBuffer(this.device, capacity * 4, BUFFERUSAGE_COPY_SRC);
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
