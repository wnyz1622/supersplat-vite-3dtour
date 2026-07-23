import { Vec2 } from "../../../core/math/vec2.js";
import { Vec4 } from "../../../core/math/vec4.js";
import { ComponentSystem } from "../system.js";
import { LayoutGroupComponent } from "./component.js";
const MAX_ITERATIONS = 100;
class LayoutGroupComponentSystem extends ComponentSystem {
	constructor(app) {
		super(app);
		this.id = "layoutgroup";
		this.ComponentType = LayoutGroupComponent;
		this._reflowQueue = [];
		this.on("beforeremove", this.onBeforeRemove, this);
		this.app.systems.on("postUpdate", this._onPostUpdate, this);
	}
	initializeComponentData(component, data, properties) {
		if (data.enabled !== void 0) component.enabled = data.enabled;
		if (data.orientation !== void 0) component.orientation = data.orientation;
		if (data.reverseX !== void 0) component.reverseX = data.reverseX;
		if (data.reverseY !== void 0) component.reverseY = data.reverseY;
		if (data.alignment !== void 0) {
			component.alignment = Array.isArray(data.alignment) ? new Vec2(data.alignment) : data.alignment;
		}
		if (data.padding !== void 0) {
			component.padding = Array.isArray(data.padding) ? new Vec4(data.padding) : data.padding;
		}
		if (data.spacing !== void 0) {
			component.spacing = Array.isArray(data.spacing) ? new Vec2(data.spacing) : data.spacing;
		}
		if (data.widthFitting !== void 0) component.widthFitting = data.widthFitting;
		if (data.heightFitting !== void 0) component.heightFitting = data.heightFitting;
		if (data.wrap !== void 0) component.wrap = data.wrap;
		super.initializeComponentData(component, data, []);
	}
	cloneComponent(entity, clone) {
		const layoutGroup = entity.layoutgroup;
		return this.addComponent(clone, {
			enabled: layoutGroup.enabled,
			orientation: layoutGroup.orientation,
			reverseX: layoutGroup.reverseX,
			reverseY: layoutGroup.reverseY,
			alignment: layoutGroup.alignment,
			padding: layoutGroup.padding,
			spacing: layoutGroup.spacing,
			widthFitting: layoutGroup.widthFitting,
			heightFitting: layoutGroup.heightFitting,
			wrap: layoutGroup.wrap
		});
	}
	scheduleReflow(component) {
		if (this._reflowQueue.indexOf(component) === -1) {
			this._reflowQueue.push(component);
		}
	}
	_onPostUpdate() {
		this._processReflowQueue();
	}
	_processReflowQueue() {
		if (this._reflowQueue.length === 0) {
			return;
		}
		let iterationCount = 0;
		while (this._reflowQueue.length > 0) {
			const queue = this._reflowQueue.slice();
			this._reflowQueue.length = 0;
			queue.sort((componentA, componentB) => {
				return componentA.entity.graphDepth - componentB.entity.graphDepth;
			});
			for (let i = 0; i < queue.length; ++i) {
				queue[i].reflow();
			}
			if (++iterationCount >= MAX_ITERATIONS) {
				console.warn("Max reflow iterations limit reached, bailing.");
				break;
			}
		}
	}
	onBeforeRemove(entity, component) {
		component.onBeforeRemove();
	}
	destroy() {
		super.destroy();
		this.app.systems.off("postUpdate", this._onPostUpdate, this);
	}
}
export {
	LayoutGroupComponentSystem
};
