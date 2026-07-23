/**
 * @import { AppBase } from '../../app-base.js'
 */
/**
 * A Light Component is used to dynamically light the scene.
 *
 * @category Graphics
 */
export class LightComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof LightComponent;
    initializeComponentData(component: any, _data: any): void;
    onBeforeRemove(entity: any, component: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
}
import { ComponentSystem } from '../system.js';
import { LightComponent } from './component.js';
