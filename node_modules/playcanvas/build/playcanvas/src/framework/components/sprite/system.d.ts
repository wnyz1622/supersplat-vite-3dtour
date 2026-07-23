/**
 * @import { AppBase } from '../../app-base.js'
 */
/**
 * Manages creation of {@link SpriteComponent}s.
 *
 * @category Graphics
 */
export class SpriteComponentSystem extends ComponentSystem {
    id: string;
    ComponentType: typeof SpriteComponent;
    _defaultTexture: Texture;
    _defaultMaterial: any;
    _default9SlicedMaterialSlicedMode: any;
    _default9SlicedMaterialTiledMode: any;
    set defaultMaterial(material: any);
    get defaultMaterial(): any;
    set default9SlicedMaterialSlicedMode(material: any);
    get default9SlicedMaterialSlicedMode(): any;
    set default9SlicedMaterialTiledMode(material: any);
    get default9SlicedMaterialTiledMode(): any;
    initializeComponentData(component: any, data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onUpdate(dt: any): void;
    onBeforeRemove(entity: any, component: any): void;
}
import { ComponentSystem } from '../system.js';
import { SpriteComponent } from './component.js';
import { Texture } from '../../../platform/graphics/texture.js';
