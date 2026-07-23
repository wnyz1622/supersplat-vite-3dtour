/**
 * @import { AppBase } from '../../app-base.js'
 */
/**
 * Manages creation of {@link ScreenComponent}s.
 *
 * @category User Interface
 */
export class ScreenComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof ScreenComponent;
    windowResolution: Vec2;
    _drawOrderSyncQueue: IndexedList;
    initializeComponentData(component: any, data: any, properties: any): void;
    _updateDescendantElements(entity: any, screenEntity: any): void;
    _onUpdate(dt: any): void;
    _onResize(width: any, height: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onBeforeRemove(entity: any, component: any): void;
    processDrawOrderSyncQueue(): void;
    queueDrawOrderSync(id: any, fn: any, scope: any): void;
}
import { ComponentSystem } from '../system.js';
import { ScreenComponent } from './component.js';
import { Vec2 } from '../../../core/math/vec2.js';
import { IndexedList } from '../../../core/indexed-list.js';
