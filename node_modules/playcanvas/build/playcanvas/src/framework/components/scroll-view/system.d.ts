/**
 * Manages creation of {@link ScrollViewComponent}s.
 *
 * @category User Interface
 */
export class ScrollViewComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ScrollViewComponent;
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onUpdate(dt: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ScrollViewComponent } from './component.js';
