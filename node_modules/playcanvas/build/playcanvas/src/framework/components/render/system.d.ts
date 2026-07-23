/**
 * Allows an Entity to render a mesh or a primitive shape like a box, capsule, sphere, cylinder,
 * cone etc.
 *
 * @category Graphics
 */
export class RenderComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof RenderComponent;
    defaultMaterial: import("../../../index.js").StandardMaterial;
    initializeComponentData(component: any, _data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { RenderComponent } from './component.js';
