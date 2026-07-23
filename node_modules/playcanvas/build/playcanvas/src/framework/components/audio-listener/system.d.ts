/**
 * @import { AppBase } from '../../app-base.js'
 */
/**
 * Component System for adding and removing {@link AudioListenerComponent} objects to Entities.
 *
 * @category Sound
 */
export class AudioListenerComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof AudioListenerComponent;
    manager: import("../../../index.js").SoundManager;
    current: any;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onUpdate(dt: any): void;
}
import { ComponentSystem } from '../system.js';
import { AudioListenerComponent } from './component.js';
