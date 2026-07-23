import { EventHandler } from "../core/event-handler.js";
import { Vec4 } from "../core/math/vec4.js";
import { Mat3 } from "../core/math/mat3.js";
import { Mat4 } from "../core/math/mat4.js";
class RenderView extends EventHandler {
	_positionData = new Float32Array(3);
	_viewport = new Vec4();
	_projMat = new Mat4();
	_projViewOffMat = new Mat4();
	_viewMat = new Mat4();
	_viewOffMat = new Mat4();
	_viewMat3 = new Mat3();
	_viewInvMat = new Mat4();
	_viewInvOffMat = new Mat4();
	get viewport() {
		return this._viewport;
	}
	get projMat() {
		return this._projMat;
	}
	get projViewOffMat() {
		return this._projViewOffMat;
	}
	get viewOffMat() {
		return this._viewOffMat;
	}
	get viewInvOffMat() {
		return this._viewInvOffMat;
	}
	get viewMat3() {
		return this._viewMat3;
	}
	get positionData() {
		return this._positionData;
	}
	setView(projMat, viewInvMat, viewMat) {
		this._projMat.set(projMat);
		this._viewInvMat.set(viewInvMat);
		if (viewMat) {
			this._viewMat.set(viewMat);
		} else {
			this._viewMat.copy(this._viewInvMat).invert();
		}
	}
	setViewport(x, y, width, height) {
		this._viewport.set(x, y, width, height);
	}
	updateTransforms(parentWorldTransform) {
		if (parentWorldTransform) {
			this._viewInvOffMat.mul2(parentWorldTransform, this._viewInvMat);
			this._viewOffMat.copy(this._viewInvOffMat).invert();
		} else {
			this._viewInvOffMat.copy(this._viewInvMat);
			this._viewOffMat.copy(this._viewMat);
		}
		this._viewMat3.setFromMat4(this._viewOffMat);
		this._projViewOffMat.mul2(this._projMat, this._viewOffMat);
		this._positionData[0] = this._viewInvOffMat.data[12];
		this._positionData[1] = this._viewInvOffMat.data[13];
		this._positionData[2] = this._viewInvOffMat.data[14];
	}
}
export {
	RenderView
};
