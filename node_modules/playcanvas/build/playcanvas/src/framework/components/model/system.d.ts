/**
 * Allows an Entity to render a model or a primitive shape like a box, capsule, sphere, cylinder,
 * cone etc.
 *
 * @category Graphics
 */
export class ModelComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ModelComponent;
    defaultMaterial: import("../../../index.js").StandardMaterial;
    initializeComponentData(component: any, _data: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ModelComponent } from './component.js';
