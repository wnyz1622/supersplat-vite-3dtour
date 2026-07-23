import { ComponentSystem } from "../system.js";
import { AudioListenerComponent } from "./component.js";
class AudioListenerComponentSystem extends ComponentSystem {
	constructor(app) {
		super(app);
		this.id = "audiolistener";
		this.ComponentType = AudioListenerComponent;
		this.manager = app.soundManager;
		this.current = null;
		this.app.systems.on("update", this.onUpdate, this);
	}
	cloneComponent(entity, clone) {
		return this.addComponent(clone, {
			enabled: entity.audiolistener.enabled
		});
	}
	onUpdate(dt) {
		if (this.current) {
			const position = this.current.getPosition();
			this.manager.listener.setPosition(position);
			const wtm = this.current.getWorldTransform();
			this.manager.listener.setOrientation(wtm);
		}
	}
	destroy() {
		super.destroy();
		this.app.systems.off("update", this.onUpdate, this);
	}
}
export {
	AudioListenerComponentSystem
};
