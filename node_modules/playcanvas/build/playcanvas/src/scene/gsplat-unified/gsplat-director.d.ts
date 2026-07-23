/**
 * Class responsible for managing {@link GSplatManager} instances for Cameras and their Layers.
 *
 * @ignore
 */
export class GSplatDirector {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {Renderer} renderer - The renderer.
     * @param {Scene} scene - The scene.
     * @param {EventHandler} eventHandler - Event handler for firing events.
     */
    constructor(device: GraphicsDevice, renderer: Renderer, scene: Scene, eventHandler: EventHandler);
    /**
     * @type {GraphicsDevice}
     */
    device: GraphicsDevice;
    /**
     * Per camera data.
     *
     * @type {Map<Camera, GSplatCameraData>}
     */
    camerasMap: Map<Camera, GSplatCameraData>;
    /**
     * @type {Scene}
     */
    scene: Scene;
    /**
     * @type {EventHandler}
     */
    eventHandler: EventHandler;
    /**
     * Per-frame token, incremented once each streaming tick ({@link updateStreaming}). A manager's
     * streaming work (LOD evaluation, world-state update) can run from two places in a frame: the
     * streaming tick, which advances managers that already exist, and the render path
     * ({@link GSplatManager#update}), which additionally covers managers created during that render
     * — e.g. at startup, or when a camera, layer, or gsplat component is added — so they render in
     * the same frame instead of a frame later.
     *
     * The manager records the token it last streamed for and skips the work when the token is
     * unchanged, so the streaming runs at most once per frame regardless of which path reaches it
     * first (the render-path call is a no-op for managers the tick already advanced).
     *
     * @type {number}
     */
    _streamToken: number;
    renderer: Renderer;
    destroy(): void;
    getCameraData(camera: any): GSplatCameraData;
    /**
     * Dispatches pick compute for the given camera and layer, returning a ready-to-render
     * pick mesh instance (or null if no gsplat data exists for this camera/layer pair).
     *
     * @param {Camera} camera - The camera.
     * @param {number} width - Pick target width.
     * @param {number} height - Pick target height.
     * @param {Layer} layer - The layer to pick from.
     * @returns {import('../mesh-instance.js').MeshInstance|null} The configured pick mesh instance.
     */
    prepareForPicking(camera: Camera, width: number, height: number, layer: Layer): import("../mesh-instance.js").MeshInstance | null;
    /**
     * CPU streaming tick. Driven by the gsplat component system every frame (even when rendering is
     * skipped, e.g. `app.autoRender = false`). Applies pending param changes, processes resource
     * cleanup, and advances each existing manager's LOD/streaming/world-state via
     * {@link GSplatManager#updateStreaming}. Fires `frame:request` once when a render would show new
     * data (a new world-state version) or when a CPU-sort result is waiting to be applied.
     *
     * Uses the cached `camerasMap` topology (built by {@link update} on the render path) — newly
     * added cameras, layers, or gsplat components register on the next rendered frame. Does no GPU
     * draw work.
     */
    updateStreaming(): void;
    /**
     * Updates the director for the given layer composition cameras and layers.
     *
     * @param {LayerComposition} comp - The layer composition.
     */
    update(comp: LayerComposition): void;
    /**
     * Post-cull shadow pass. Runs AFTER `cullComposition` (so each directional light's shadow-camera
     * frustum has been fitted) and before the frame graph renders the shadow maps, dispatching each
     * manager's per-light gsplat shadow cull. Only managers whose forward renderer is GPU-sort
     * (which cannot self-cast) hold a shadow renderer; for the rest this is a no-op. The CPU-sort
     * quad renderer self-casts and is unaffected.
     */
    updateShadows(): void;
}
import type { GraphicsDevice } from '../../platform/graphics/graphics-device.js';
import type { Camera } from '../camera.js';
/**
 * Per camera data the director keeps track of.
 *
 * @ignore
 */
declare class GSplatCameraData {
    /**
     * @type {Map<Layer, GSplatLayerData>}
     */
    layersMap: Map<Layer, GSplatLayerData>;
    destroy(): void;
    removeLayerData(layer: any): void;
    getLayerData(device: any, director: any, layer: any, camera: any): GSplatLayerData;
}
import type { Scene } from '../scene.js';
import type { EventHandler } from '../../core/event-handler.js';
import type { Renderer } from '../renderer/renderer.js';
import type { Layer } from '../layer.js';
import type { LayerComposition } from '../composition/layer-composition.js';
/**
 * Per layer data the director keeps track of.
 *
 * @ignore
 */
declare class GSplatLayerData {
    /**
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatDirector} director - The director.
     * @param {Layer} layer - The layer.
     * @param {Camera} camera - The camera.
     */
    constructor(device: GraphicsDevice, director: GSplatDirector, layer: Layer, camera: Camera);
    /**
     * @type {GSplatManager|null}
     */
    gsplatManager: GSplatManager | null;
    /**
     * @type {GSplatManager|null}
     */
    gsplatManagerShadow: GSplatManager | null;
    /**
     * Creates a new GSplatManager, sets its render mode, and fires the material:created event.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatDirector} director - The director.
     * @param {Layer} layer - The layer.
     * @param {GraphNode} cameraNode - The camera node.
     * @param {Camera} camera - The camera.
     * @param {number} renderMode - The render mode flags.
     * @returns {GSplatManager} The created manager.
     * @private
     */
    private createManager;
    /**
     * Updates the manager configuration based on current layer placements.
     *
     * @param {GraphicsDevice} device - The graphics device.
     * @param {GSplatDirector} director - The director.
     * @param {Layer} layer - The layer.
     * @param {Camera} camera - The camera.
     */
    updateConfiguration(device: GraphicsDevice, director: GSplatDirector, layer: Layer, camera: Camera): void;
    destroy(): void;
}
import { GSplatManager } from './gsplat-manager.js';
export {};
