/**
 * Allows scripts to be attached to an Entity and executed.
 *
 * @category Script
 */
export class ScriptComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ScriptComponent;
    _components: SortedLoopArray;
    _enabledComponents: SortedLoopArray;
    preloading: boolean;
    initializeComponentData(component: any, data: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    _resetExecutionOrder(): void;
    _callComponentMethod(components: any, name: any, dt: any): void;
    _onInitialize(): void;
    _onPostInitialize(): void;
    _onUpdate(dt: any): void;
    _onPostUpdate(dt: any): void;
    _addComponentToEnabled(component: any): void;
    _removeComponentFromEnabled(component: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { ScriptComponent } from './component.js';
import { SortedLoopArray } from '../../../core/sorted-loop-array.js';
