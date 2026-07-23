/**
 * Allows an Entity to render a particle system.
 *
 * @category Graphics
 */
export class ParticleSystemComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ParticleSystemComponent;
    initializeComponentData(component: any, _data: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onUpdate(dt: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ParticleSystemComponent } from './component.js';
