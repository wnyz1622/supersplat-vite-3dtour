/**
 * Manages creation of {@link ScrollbarComponent}s.
 *
 * @category User Interface
 */
export class ScrollbarComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ScrollbarComponent;
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    _onAddComponent(entity: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ScrollbarComponent } from './component.js';
