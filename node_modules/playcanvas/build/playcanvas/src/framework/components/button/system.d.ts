/**
 * Manages creation of {@link ButtonComponent}s.
 *
 * @category User Interface
 */
export class ButtonComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ButtonComponent;
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onUpdate(dt: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ButtonComponent } from './component.js';
