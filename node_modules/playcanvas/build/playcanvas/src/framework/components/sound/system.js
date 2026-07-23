import { ComponentSystem } from "../system.js";
import { SoundComponent } from "./component.js";
const _properties = [
	"volume",
	"pitch",
	"positional",
	"refDistance",
	"maxDistance",
	"rollOffFactor",
	"distanceModel",
	"slots"
];
class SoundComponentSystem extends ComponentSystem {
	constructor(app) {
		super(app);
		this.id = "sound";
		this.ComponentType = SoundComponent;
		this.manager = app.soundManager;
		this.app.systems.on("update", this.onUpdate, this);
		this.on("beforeremove", this.onBeforeRemove, this);
	}
	set volume(volume) {
		this.manager.volume = volume;
	}
	get volume() {
		return this.manager.volume;
	}
	get context() {
		return this.manager.context;
	}
	initializeComponentData(component, data) {
		for (let i = 0; i < _properties.length; i++) {
			if (data.hasOwnProperty(_properties[i])) {
				component[_properties[i]] = data[_properties[i]];
			}
		}
		super.initializeComponentData(component, data);
	}
	cloneComponent(entity, clone) {
		const c = entity.sound;
		const data = {
			enabled: c.enabled
		};
		for (let i = 0; i < _properties.length; i++) {
			const property = _properties[i];
			if (property === "slots") {
				const slots = {};
				for (const key in c.slots) {
					const srcSlot = c.slots[key];
					slots[key] = {
						name: srcSlot.name,
						volume: srcSlot.volume,
						pitch: srcSlot.pitch,
						loop: srcSlot.loop,
						duration: srcSlot.duration,
						startTime: srcSlot.startTime,
						overlap: srcSlot.overlap,
						autoPlay: srcSlot.autoPlay,
						asset: srcSlot.asset
					};
				}
				data.slots = slots;
			} else {
				data[property] = c[property];
			}
		}
		return this.addComponent(clone, data);
	}
	onUpdate(dt) {
		const store = this.store;
		for (const id in store) {
			if (store.hasOwnProperty(id)) {
				const item = store[id];
				const entity = item.entity;
				if (entity.enabled) {
					const component = entity.sound;
					if (component.enabled && component.positional) {
						const position = entity.getPosition();
						const slots = component.slots;
						for (const key in slots) {
							slots[key].updatePosition(position);
						}
					}
				}
			}
		}
	}
	onBeforeRemove(entity, component) {
		const slots = component.slots;
		for (const key in slots) {
			if (!slots[key].overlap) {
				slots[key].stop();
			}
		}
		component.onBeforeRemove();
	}
	destroy() {
		super.destroy();
		this.app.systems.off("update", this.onUpdate, this);
	}
}
export {
	SoundComponentSystem
};
