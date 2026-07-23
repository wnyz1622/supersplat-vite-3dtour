/**
 * @import { AppBase } from '../../app-base.js'
 */
/**
 * Manages creation of {@link LayoutChildComponent}s.
 *
 * @category User Interface
 */
export class LayoutChildComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof LayoutChildComponent;
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
}
import { ComponentSystem } from '../system.js';
import { LayoutChildComponent } from './component.js';
