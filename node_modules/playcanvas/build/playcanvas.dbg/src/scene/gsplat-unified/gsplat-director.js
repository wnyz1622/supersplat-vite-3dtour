var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { GSplatManager } from "./gsplat-manager.js";
import { SetUtils } from "../../core/set-utils.js";
import { GSPLAT_FORWARD, GSPLAT_SHADOW } from "../constants.js";
import { GSplatResourceCleanup } from "../gsplat/gsplat-resource-cleanup.js";
const tempLayersToRemove = [];
class GSplatLayerData {
  /**
   * @param {GraphicsDevice} device - The graphics device.
   * @param {GSplatDirector} director - The director.
   * @param {Layer} layer - The layer.
   * @param {Camera} camera - The camera.
   */
  constructor(device, director, layer, camera) {
    /**
     * @type {GSplatManager|null}
     */
    __publicField(this, "gsplatManager", null);
    /**
     * @type {GSplatManager|null}
     */
    __publicField(this, "gsplatManagerShadow", null);
    this.updateConfiguration(device, director, layer, camera);
  }
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
  createManager(device, director, layer, cameraNode, camera, renderMode) {
    const manager = new GSplatManager(device, director, layer, cameraNode);
    manager.setRenderMode(renderMode);
    if (director.eventHandler) {
      director.eventHandler.fire("material:created", manager.material, camera, layer);
    }
    return manager;
  }
  /**
   * Updates the manager configuration based on current layer placements.
   *
   * @param {GraphicsDevice} device - The graphics device.
   * @param {GSplatDirector} director - The director.
   * @param {Layer} layer - The layer.
   * @param {Camera} camera - The camera.
   */
  updateConfiguration(device, director, layer, camera) {
    const cameraNode = camera.node;
    const hasNormalPlacements = layer.gsplatPlacements.length > 0;
    const hasShadowCasters = layer.gsplatShadowCasters.length > 0;
    const setsEqual = SetUtils.equals(layer.gsplatPlacementsSet, layer.gsplatShadowCastersSet);
    const useSharedManager = setsEqual && hasNormalPlacements;
    const desiredMainMode = useSharedManager ? GSPLAT_FORWARD | GSPLAT_SHADOW : hasNormalPlacements ? GSPLAT_FORWARD : 0;
    const desiredShadowMode = useSharedManager ? 0 : hasShadowCasters ? GSPLAT_SHADOW : 0;
    if (desiredMainMode) {
      if (this.gsplatManager) {
        this.gsplatManager.setRenderMode(desiredMainMode);
      } else {
        this.gsplatManager = this.createManager(device, director, layer, cameraNode, camera, desiredMainMode);
      }
    } else if (this.gsplatManager) {
      this.gsplatManager.destroy();
      this.gsplatManager = null;
    }
    if (desiredShadowMode) {
      if (this.gsplatManagerShadow) {
        this.gsplatManagerShadow.setRenderMode(desiredShadowMode);
      } else {
        this.gsplatManagerShadow = this.createManager(device, director, layer, cameraNode, camera, desiredShadowMode);
      }
    } else if (this.gsplatManagerShadow) {
      this.gsplatManagerShadow.destroy();
      this.gsplatManagerShadow = null;
    }
  }
  destroy() {
    this.gsplatManager?.destroy();
    this.gsplatManager = null;
    this.gsplatManagerShadow?.destroy();
    this.gsplatManagerShadow = null;
  }
}
class GSplatCameraData {
  constructor() {
    /**
     * @type {Map<Layer, GSplatLayerData>}
     */
    __publicField(this, "layersMap", /* @__PURE__ */ new Map());
  }
  destroy() {
    this.layersMap.forEach((layerData) => layerData.destroy());
    this.layersMap.clear();
  }
  removeLayerData(layer) {
    const layerData = this.layersMap.get(layer);
    if (layerData) {
      layerData.destroy();
      this.layersMap.delete(layer);
    }
  }
  getLayerData(device, director, layer, camera) {
    let layerData = this.layersMap.get(layer);
    if (!layerData) {
      layerData = new GSplatLayerData(device, director, layer, camera);
      this.layersMap.set(layer, layerData);
    }
    return layerData;
  }
}
class GSplatDirector {
  /**
   * @param {GraphicsDevice} device - The graphics device.
   * @param {Renderer} renderer - The renderer.
   * @param {Scene} scene - The scene.
   * @param {EventHandler} eventHandler - Event handler for firing events.
   */
  constructor(device, renderer, scene, eventHandler) {
    /**
     * @type {GraphicsDevice}
     */
    __publicField(this, "device");
    /**
     * Per camera data.
     *
     * @type {Map<Camera, GSplatCameraData>}
     */
    __publicField(this, "camerasMap", /* @__PURE__ */ new Map());
    /**
     * @type {Scene}
     */
    __publicField(this, "scene");
    /**
     * @type {EventHandler}
     */
    __publicField(this, "eventHandler");
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
    __publicField(this, "_streamToken", 0);
    this.device = device;
    this.renderer = renderer;
    this.scene = scene;
    this.eventHandler = eventHandler;
  }
  destroy() {
    this.camerasMap.forEach((cameraData) => cameraData.destroy());
    this.camerasMap.clear();
  }
  getCameraData(camera) {
    let cameraData = this.camerasMap.get(camera);
    if (!cameraData) {
      cameraData = new GSplatCameraData();
      this.camerasMap.set(camera, cameraData);
    }
    return cameraData;
  }
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
  prepareForPicking(camera, width, height, layer) {
    const cameraData = this.camerasMap.get(camera);
    if (!cameraData) return null;
    const layerData = cameraData.layersMap.get(layer);
    if (!layerData?.gsplatManager) return null;
    return layerData.gsplatManager.prepareForPicking(camera, width, height);
  }
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
  updateStreaming() {
    this.scene.gsplat.frameUpdate();
    GSplatResourceCleanup.process(this.device);
    const token = ++this._streamToken;
    let needRender = false;
    let streamed = false;
    this.camerasMap.forEach((cameraData) => {
      cameraData.layersMap.forEach((layerData) => {
        const manager = layerData.gsplatManager;
        if (manager) {
          needRender = manager.updateStreaming(token) || needRender;
          needRender = manager.hasPendingSort || needRender;
          streamed = true;
        }
        const shadowManager = layerData.gsplatManagerShadow;
        if (shadowManager) {
          needRender = shadowManager.updateStreaming(token) || needRender;
          needRender = shadowManager.hasPendingSort || needRender;
          streamed = true;
        }
      });
    });
    if (streamed) {
      this.scene.gsplat.dirty = false;
    }
    if (needRender) {
      this.eventHandler.fire("frame:request");
    }
  }
  /**
   * Updates the director for the given layer composition cameras and layers.
   *
   * @param {LayerComposition} comp - The layer composition.
   */
  update(comp) {
    this.camerasMap.forEach((cameraData, camera) => {
      if (!comp.camerasSet.has(camera)) {
        cameraData.destroy();
        this.camerasMap.delete(camera);
      } else {
        cameraData.layersMap.forEach((layerData, layer) => {
          if (!camera.layersSet.has(layer.id) || !layer.enabled) {
            tempLayersToRemove.push(layer);
          }
        });
        for (let i = 0; i < tempLayersToRemove.length; i++) {
          const layer = tempLayersToRemove[i];
          const layerData = cameraData.layersMap.get(layer);
          if (layerData) {
            layerData.destroy();
            cameraData.layersMap.delete(layer);
          }
        }
        tempLayersToRemove.length = 0;
      }
    });
    let gsplatCount = 0;
    let bufferCopyUploaded = 0;
    let bufferCopyTotal = 0;
    const camerasComponents = comp.cameras;
    for (let i = 0; i < camerasComponents.length; i++) {
      const camera = camerasComponents[i].camera;
      let cameraData = this.camerasMap.get(camera);
      const layerIds = camera.layers;
      for (let j = 0; j < layerIds.length; j++) {
        const layer = comp.getLayerById(layerIds[j]);
        if (layer?.enabled) {
          if (layer.gsplatPlacementsDirty || !cameraData) {
            const hasNormalPlacements = layer.gsplatPlacements.length > 0;
            const hasShadowCasters = layer.gsplatShadowCasters.length > 0;
            if (!hasNormalPlacements && !hasShadowCasters) {
              if (cameraData) {
                cameraData.removeLayerData(layer);
              }
            } else {
              cameraData ?? (cameraData = this.getCameraData(camera));
              const layerData = cameraData.getLayerData(this.device, this, layer, camera);
              layerData.updateConfiguration(this.device, this, layer, camera);
              if (layerData.gsplatManager) {
                layerData.gsplatManager.reconcile(layer.gsplatPlacements);
              }
              if (layerData.gsplatManagerShadow) {
                layerData.gsplatManagerShadow.reconcile(layer.gsplatShadowCasters);
              }
            }
          }
        }
      }
      if (cameraData) {
        for (const layerData of cameraData.layersMap.values()) {
          if (layerData.gsplatManager) {
            gsplatCount += layerData.gsplatManager.update();
            bufferCopyUploaded += layerData.gsplatManager.bufferCopyUploaded;
            bufferCopyTotal += layerData.gsplatManager.bufferCopyTotal;
          }
          if (layerData.gsplatManagerShadow) {
            gsplatCount += layerData.gsplatManagerShadow.update();
            bufferCopyUploaded += layerData.gsplatManagerShadow.bufferCopyUploaded;
            bufferCopyTotal += layerData.gsplatManagerShadow.bufferCopyTotal;
          }
        }
      }
    }
    this.renderer._gsplatCount = gsplatCount;
    this.renderer._gsplatBufferCopy = bufferCopyTotal > 0 ? bufferCopyUploaded / bufferCopyTotal * 100 : 0;
    this.scene.gsplat.frameEnd();
    for (let i = 0; i < comp.layerList.length; i++) {
      comp.layerList[i].gsplatPlacementsDirty = false;
    }
  }
  /**
   * Post-cull shadow pass. Runs AFTER `cullComposition` (so each directional light's shadow-camera
   * frustum has been fitted) and before the frame graph renders the shadow maps, dispatching each
   * manager's per-light gsplat shadow cull. Only managers whose forward renderer is GPU-sort
   * (which cannot self-cast) hold a shadow renderer; for the rest this is a no-op. The CPU-sort
   * quad renderer self-casts and is unaffected.
   */
  updateShadows() {
    this.camerasMap.forEach((cameraData) => {
      cameraData.layersMap.forEach((layerData) => {
        layerData.gsplatManager?.updateShadows();
        layerData.gsplatManagerShadow?.updateShadows();
      });
    });
  }
}
export {
  GSplatDirector
};
