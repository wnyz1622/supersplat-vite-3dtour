/**
 * The AnimationComponentSystem manages creating and deleting AnimationComponents.
 *
 * @category Animation
 */
export class AnimationComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof AnimationComponent;
    /**
     * Called during {@link ComponentSystem#addComponent} to initialize the component data in the
     * store. This can be overridden by derived Component Systems and either called by the derived
     * System or replaced entirely.
     *
     * @param {AnimationComponent} component - The component being initialized.
     * @param {object} data - The data block used to initialize the component.
     * @ignore
     */
    initializeComponentData(component: AnimationComponent, data: object): void;
    /**
     * Create a clone of component. This creates a copy of all component data variables.
     *
     * @param {Entity} entity - The entity to clone the component from.
     * @param {Entity} clone - The entity to clone the component into.
     * @returns {AnimationComponent} The newly cloned component.
     * @ignore
     */
    cloneComponent(entity: Entity, clone: Entity): AnimationComponent;
    /**
     * @param {Entity} entity - The entity having its component removed.
     * @param {AnimationComponent} component - The component being removed.
     * @private
     */
    private onBeforeRemove;
    /**
     * @param {number} dt - The time delta since the last frame.
     * @private
     */
    private onUpdate;
}
import { ComponentSystem } from '../system.js';
import { AnimationComponent } from './component.js';
import type { Entity } from '../../entity.js';
