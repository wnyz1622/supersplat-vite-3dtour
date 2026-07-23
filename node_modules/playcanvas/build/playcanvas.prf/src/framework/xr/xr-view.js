import { RenderView } from "../../scene/render-view.js";
import { Texture } from "../../platform/graphics/texture.js";
import { Mat4 } from "../../core/math/mat4.js";
import { ADDRESS_CLAMP_TO_EDGE, FILTER_LINEAR, FILTER_NEAREST, PIXELFORMAT_RGB8, PIXELFORMAT_R32F } from "../../platform/graphics/constants.js";
class XrView extends RenderView {
	static EVENT_DEPTHRESIZE = "depth:resize";
	_manager;
	_xrView;
	_xrCamera = null;
	_textureColor = null;
	_textureDepth = null;
	_depthInfo = null;
	_emptyDepthBuffer = new Uint8Array(32);
	_depthMatrix = new Mat4();
	constructor(manager, xrView, viewsCount) {
		super();
		this._manager = manager;
		this._xrView = xrView;
		const device = this._manager.app.graphicsDevice;
		if (this._manager.views.supportedColor) {
			this._xrCamera = this._xrView.camera;
			if (this._manager.views.availableColor && this._xrCamera) {
				this._textureColor = new Texture(device, {
					format: PIXELFORMAT_RGB8,
					mipmaps: false,
					addressU: ADDRESS_CLAMP_TO_EDGE,
					addressV: ADDRESS_CLAMP_TO_EDGE,
					minFilter: FILTER_LINEAR,
					magFilter: FILTER_LINEAR,
					width: this._xrCamera.width,
					height: this._xrCamera.height,
					name: `XrView-${this._xrView.eye}-Color`
				});
			}
		}
		if (this._manager.views.supportedDepth && this._manager.views.availableDepth) {
			const filtering = this._manager.views.depthGpuOptimized ? FILTER_NEAREST : FILTER_LINEAR;
			this._textureDepth = new Texture(device, {
				format: this._manager.views.depthPixelFormat,
				arrayLength: viewsCount === 1 ? 0 : viewsCount,
				mipmaps: false,
				addressU: ADDRESS_CLAMP_TO_EDGE,
				addressV: ADDRESS_CLAMP_TO_EDGE,
				minFilter: filtering,
				magFilter: filtering,
				width: 4,
				height: 4,
				name: `XrView-${this._xrView.eye}-Depth`
			});
			for (let i = 0; i < this._textureDepth._levels.length; i++) {
				this._textureDepth._levels[i] = this._emptyDepthBuffer;
			}
			this._textureDepth.upload();
		}
		if (this._textureColor || this._textureDepth) {
			device.on("devicelost", this._onDeviceLost, this);
		}
	}
	get textureColor() {
		return this._textureColor;
	}
	get textureDepth() {
		return this._textureDepth;
	}
	get depthUvMatrix() {
		return this._depthMatrix;
	}
	get depthValueToMeters() {
		return this._depthInfo?.rawValueToMeters || 0;
	}
	get eye() {
		return this._xrView.eye;
	}
	update(frame, xrView) {
		this._xrView = xrView;
		if (this._manager.views.availableColor) {
			this._xrCamera = this._xrView.camera;
		}
		const viewport = this._manager.xrBridge.getViewport(frame, this._xrView);
		this.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
		this.setView(
			this._xrView.projectionMatrix,
			this._xrView.transform.matrix,
			this._xrView.transform.inverse.matrix
		);
		this._updateTextureColor();
		this._updateDepth(frame);
	}
	_updateTextureColor() {
		if (!this._manager.views.availableColor || !this._xrCamera || !this._textureColor) {
			return;
		}
		this._manager.xrBridge?.syncCameraColorTexture(this._xrCamera, this._textureColor);
	}
	_updateDepth(frame) {
		if (!this._manager.views.availableDepth || !this._textureDepth) {
			return;
		}
		const gpu = this._manager.views.depthGpuOptimized;
		const infoSource = gpu ? this._manager.graphicsBinding : frame;
		if (!infoSource) {
			this._depthInfo = null;
			return;
		}
		const depthInfo = infoSource.getDepthInformation(this._xrView);
		if (!depthInfo) {
			this._depthInfo = null;
			return;
		}
		let matrixDirty = !this._depthInfo !== !depthInfo;
		this._depthInfo = depthInfo;
		const width = this._depthInfo?.width || 4;
		const height = this._depthInfo?.height || 4;
		let resized = false;
		if (this._textureDepth.width !== width || this._textureDepth.height !== height) {
			this._textureDepth._width = width;
			this._textureDepth._height = height;
			matrixDirty = true;
			resized = true;
		}
		if (matrixDirty) {
			if (this._depthInfo) {
				this._depthMatrix.data.set(this._depthInfo.normDepthBufferFromNormView.matrix);
			} else {
				this._depthMatrix.setIdentity();
			}
		}
		if (this._depthInfo) {
			if (gpu) {
				this._manager.xrBridge?.syncCameraDepthTexture(
					this._depthInfo,
					this._textureDepth,
					this._manager.views.depthPixelFormat ?? PIXELFORMAT_R32F
				);
			} else {
				this._textureDepth._levels[0] = new Uint8Array(this._depthInfo.data);
				this._textureDepth.upload();
			}
		} else {
			this._textureDepth._levels[0] = this._emptyDepthBuffer;
			this._textureDepth.upload();
		}
		if (resized) this.fire("depth:resize", width, height);
	}
	_onDeviceLost() {
		this._depthInfo = null;
	}
	getDepth(u, v) {
		if (this._manager.views.depthGpuOptimized) {
			return null;
		}
		return this._depthInfo?.getDepthInMeters(u, v) ?? null;
	}
	destroy() {
		this._depthInfo = null;
		if (this._textureColor) {
			this._textureColor.destroy();
			this._textureColor = null;
		}
		if (this._textureDepth) {
			this._textureDepth.destroy();
			this._textureDepth = null;
		}
	}
}
export {
	XrView
};
