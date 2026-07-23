/**
 * Allows an Entity to render a gsplat.
 *
 * @category Graphics
 */
export class GSplatComponentSystem extends ComponentSystem {
    /**
     * Fired when a GSplat material is created for a camera and layer combination. Materials are
     * created during the first frame update when the GSplat is rendered. The handler is passed
     * the {@link ShaderMaterial}, the {@link CameraComponent}, and the {@link Layer}.
     *
     * This event is useful for setting up custom material chunks and parameters before the
     * first render.
     *
     * @event
     * @example
     * app.systems.gsplat.on('material:created', (material, camera, layer) => {
     *     console.log(`Material created for camera ${camera.entity.name} on layer ${layer.name}`);
     *     // Set custom material parameters before first render
     *     material.setParameter('myParam', value);
     * });
     */
    static EVENT_MATERIALCREATED: string;
    /**
     * Fired every frame for each camera and layer combination rendering GSplats.
     * The handler is passed the {@link CameraComponent}, the {@link Layer}, a boolean indicating
     * if the current frame has up-to-date sorting, and a number indicating how many resources are
     * loading.
     *
     * The `ready` parameter indicates whether the current frame reflects all recent changes (camera
     * movement, splat transforms, lod updates, etc.) with the latest sorting applied. The `loadingCount`
     * parameter reports the total number of octree LOD resources currently loading or queued to load.
     *
     * This event is useful for video capture or other workflows that need to wait for frames
     * to be fully ready. Only capture frames and move camera to next position when both
     * `ready === true` and `loadingCount === 0`. Note that `loadingCount` can be used as a boolean
     * in conditionals (0 is falsy, non-zero is truthy) for backward compatibility.
     *
     * @event
     * @example
     * // Wait for frame to be ready before capturing
     * app.systems.gsplat.on('frame:ready', (camera, layer, ready, loadingCount) => {
     *     if (ready && !loadingCount) {
     *         console.log(`Frame ready to capture for camera ${camera.entity.name}`);
     *         // Capture frame here
     *     }
     * });
     * @example
     * // Track loading progress (0..1)
     * let maxLoadingCount = 0;
     * app.systems.gsplat.on('frame:ready', (camera, layer, ready, loadingCount) => {
     *     maxLoadingCount = Math.max(maxLoadingCount, loadingCount);
     *     const progress = maxLoadingCount > 0 ? (maxLoadingCount - loadingCount) / maxLoadingCount : 1;
     *     console.log(`Loading progress: ${(progress * 100).toFixed(1)}%`);
     * });
     */
    static EVENT_FRAMEREADY: string;
    /**
     * Fired once per frame, after the component/script updates and before rendering, when GSplat
     * streaming has produced new data that a render would show (newly streamed octree LOD) or a CPU
     * sort result is ready to be applied. This drives on-demand rendering for apps that run with
     * {@link AppBase#autoRender} set to false: a typical handler sets {@link AppBase#renderNextFrame}
     * so the new data is shown.
     *
     * Streaming (LOD evaluation, file loading) runs every frame regardless of `autoRender`, so the
     * scene keeps loading in the background; this event tells you when it's worth rendering.
     *
     * Note: this event covers streaming changes only. Changes you make yourself — moving the camera,
     * modifying the scene, or adding, removing, or changing properties of gsplat components — should
     * trigger a render yourself.
     *
     * @event
     * @example
     * app.autoRender = false;
     * app.systems.gsplat.on('frame:request', () => {
     *     app.renderNextFrame = true;
     * });
     */
    static EVENT_FRAMEREQUEST: string;
    id: string;
    ComponentType: typeof GSplatComponent;
    onFrameRender(): void;
    initializeComponentData(component: any, _data: any, properties: any): void;
    cloneComponent(entity: any, clone: any): import("../component.js").Component;
    onBeforeRemove(entity: any, component: any): void;
    /**
     * Gets the GSplat material for the given camera and layer.
     *
     * Returns null if the material hasn't been created yet. Materials are created during the first
     * frame update when the GSplat is rendered. To be notified immediately when materials are
     * created, listen to the 'material:created' event on GSplatComponentSystem:
     *
     * @param {Camera} camera - The camera instance.
     * @param {Layer} layer - The layer instance.
     * @returns {ShaderMaterial|null} The material, or null if not created yet.
     * @example
     * app.systems.gsplat.on('material:created', (material, camera, layer) => {
     *     // Material is now available
     *     material.setParameter('myParam', value);
     * });
     */
    getMaterial(camera: Camera, layer: Layer): ShaderMaterial | null;
    getGSplatMaterial(camera: any, layer: any): ShaderMaterial;
}
import { ComponentSystem } from '../system.js';
import { GSplatComponent } from './component.js';
import type { Camera } from '../../../scene/camera.js';
import type { Layer } from '../../../scene/layer.js';
import type { ShaderMaterial } from '../../../scene/materials/shader-material.js';
