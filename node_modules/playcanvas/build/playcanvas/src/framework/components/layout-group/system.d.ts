/**
 * Manages creation of {@link LayoutGroupComponent}s.
 *
 * @category User Interface
 */
export class LayoutGroupComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof LayoutGroupComponent;
    _reflowQueue: any[];
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    scheduleReflow(component: any): void;
    _onPostUpdate(): void;
    _processReflowQueue(): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { LayoutGroupComponent } from './component.js';
