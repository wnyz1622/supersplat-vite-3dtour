/**
 * @import { AppBase } from '../../app-base.js'
 */
/**
 * Creates and manages {@link ZoneComponent} instances.
 *
 * @ignore
 */
export class ZoneComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ZoneComponent;
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ZoneComponent } from './component.js';
