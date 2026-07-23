/**
 * Represents a single view of the scene - a region of the render target rendered from a single
 * viewpoint. A standard camera produces one view, while in XR each eye (or screen) is a separate
 * view. This is the base class for {@link XrView}.
 *
 * @category Graphics
 */
export class RenderView extends EventHandler {
    /**
     * World space position of the view, used by shaders. Derived by {@link updateTransforms}.
     *
     * @type {Float32Array}
     * @private
     */
    private _positionData;
    /**
     * The viewport (x, y, width, height) this view renders into.
     *
     * @type {Vec4}
     * @private
     */
    private _viewport;
    /**
     * Projection matrix, supplied by the producer.
     *
     * @type {Mat4}
     * @private
     */
    private _projMat;
    /**
     * Combined projection * view matrix, with the camera's parent transform applied. Derived.
     *
     * @type {Mat4}
     * @private
     */
    private _projViewOffMat;
    /**
     * View matrix (world-to-view), supplied by the producer.
     *
     * @type {Mat4}
     * @private
     */
    private _viewMat;
    /**
     * View matrix with the camera's parent transform applied. Derived.
     *
     * @type {Mat4}
     * @private
     */
    private _viewOffMat;
    /**
     * 3x3 rotational part of {@link _viewOffMat}. Derived.
     *
     * @type {Mat3}
     * @private
     */
    private _viewMat3;
    /**
     * Inverse view matrix (view-to-world), supplied by the producer.
     *
     * @type {Mat4}
     * @private
     */
    private _viewInvMat;
    /**
     * Inverse view matrix with the camera's parent transform applied. Derived.
     *
     * @type {Mat4}
     * @private
     */
    private _viewInvOffMat;
    /**
     * A Vec4 (x, y, width, height) that represents the view's viewport. For a monoscopic screen it
     * defines the fullscreen view; for stereoscopic views (left/right eye) it defines the part of
     * the screen the view occupies.
     *
     * @type {Vec4}
     */
    get viewport(): Vec4;
    /**
     * @type {Mat4}
     * @ignore
     */
    get projMat(): Mat4;
    /**
     * @type {Mat4}
     * @ignore
     */
    get projViewOffMat(): Mat4;
    /**
     * @type {Mat4}
     * @ignore
     */
    get viewOffMat(): Mat4;
    /**
     * @type {Mat4}
     * @ignore
     */
    get viewInvOffMat(): Mat4;
    /**
     * @type {Mat3}
     * @ignore
     */
    get viewMat3(): Mat3;
    /**
     * @type {Float32Array}
     * @ignore
     */
    get positionData(): Float32Array;
    /**
     * Sets the projection and pose matrices for this view. Each matrix is supplied as a 16-element
     * array (a `Float32Array` from WebXR, or the `data` of a {@link Mat4}). The inverse view matrix
     * (view-to-world) is the source of truth; the view matrix is optional and is derived by
     * inverting it when not supplied (WebXR provides both, so it is passed to avoid the inverse).
     *
     * @param {Float32Array|number[]} projMat - Projection matrix data (16 elements).
     * @param {Float32Array|number[]} viewInvMat - Inverse view (view-to-world) matrix data (16
     * elements).
     * @param {Float32Array|number[]} [viewMat] - View (world-to-view) matrix data (16 elements). If
     * omitted, it is computed by inverting `viewInvMat`.
     * @ignore
     */
    setView(projMat: Float32Array | number[], viewInvMat: Float32Array | number[], viewMat?: Float32Array | number[]): void;
    /**
     * Sets the viewport this view renders into.
     *
     * @param {number} x - The x coordinate of the viewport.
     * @param {number} y - The y coordinate of the viewport.
     * @param {number} width - The width of the viewport.
     * @param {number} height - The height of the viewport.
     * @ignore
     */
    setViewport(x: number, y: number, width: number, height: number): void;
    /**
     * Updates the derived "off" matrices from the supplied view matrices and the camera's parent
     * world transform. Cheap and idempotent, so it can be called multiple times per frame (the
     * gsplat passes refresh these before {@link Renderer#setCameraUniforms} runs).
     *
     * @param {Mat4|null} parentWorldTransform - World transform of the camera's parent node, or
     * null when the camera has no parent.
     * @ignore
     */
    updateTransforms(parentWorldTransform: Mat4 | null): void;
}
import { EventHandler } from '../core/event-handler.js';
import { Vec4 } from '../core/math/vec4.js';
import { Mat4 } from '../core/math/mat4.js';
import { Mat3 } from '../core/math/mat3.js';
