import { ComponentSystem } from "../system.js";
import { AnimationComponent } from "./component.js";
const _properties = ["activate", "enabled", "loop", "speed", "assets"];
class AnimationComponentSystem extends ComponentSystem {
	constructor(app) {
		super(app);
		this.id = "animation";
		this.ComponentType = AnimationComponent;
		this.on("beforeremove", this.onBeforeRemove, this);
		this.app.systems.on("update", this.onUpdate, this);
	}
	initializeComponentData(component, data) {
		for (const property of _properties) {
			if (data.hasOwnProperty(property)) {
				component[property] = data[property];
			}
		}
		super.initializeComponentData(component, data);
	}
	cloneComponent(entity, clone) {
		const c = entity.animation;
		const data = {};
		for (const property of _properties) {
			data[property] = property === "assets" ? c.assets.slice() : c[property];
		}
		const component = this.addComponent(clone, data);
		const clonedAnimations = {};
		const animations = c.animations;
		for (const key in animations) {
			if (animations.hasOwnProperty(key)) {
				clonedAnimations[key] = animations[key];
			}
		}
		component.animations = clonedAnimations;
		const clonedAnimationsIndex = {};
		const animationsIndex = c.animationsIndex;
		for (const key in animationsIndex) {
			if (animationsIndex.hasOwnProperty(key)) {
				clonedAnimationsIndex[key] = animationsIndex[key];
			}
		}
		component.animationsIndex = clonedAnimationsIndex;
		return component;
	}
	onBeforeRemove(entity, component) {
		component.onBeforeRemove();
	}
	onUpdate(dt) {
		const components = this.store;
		for (const id in components) {
			if (components.hasOwnProperty(id)) {
				const { entity } = components[id];
				if (entity.animation.enabled && entity.enabled) {
					entity.animation.update(dt);
				}
			}
		}
	}
	destroy() {
		super.destroy();
		this.app.systems.off("update", this.onUpdate, this);
	}
}
export {
	AnimationComponentSystem
};
