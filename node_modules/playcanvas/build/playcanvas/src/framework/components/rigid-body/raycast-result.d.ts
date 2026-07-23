/**
 * @import { Entity } from '../../entity.js'
 * @import { Vec3 } from '../../../core/math/vec3.js'
 */
/**
 * Contains the result of a successful raycast intersection with a rigid body. When a ray
 * intersects with a rigid body in the physics simulation, this class stores the complete
 * information about that intersection including the entity, the exact point of impact, the normal
 * at the impact point, and the fractional distance along the ray where the intersection occurred.
 *
 * Instances of this class are created and returned by {@link RigidBodyComponentSystem#raycastFirst}
 * and {@link RigidBodyComponentSystem#raycastAll} methods when performing physics raycasts.
 *
 * @category Physics
 */
export class RaycastResult {
    /**
     * Create a new RaycastResult instance.
     *
     * @param {Entity} entity - The entity that was hit.
     * @param {Vec3} point - The point at which the ray hit the entity in world space.
     * @param {Vec3} normal - The normal vector of the surface where the ray hit in world space.
     * @param {number} hitFraction - The normalized distance (between 0 and 1) at which the ray hit
     * occurred from the starting point.
     * @ignore
     */
    constructor(entity: Entity, point: Vec3, normal: Vec3, hitFraction: number);
    /**
     * The entity that was hit.
     *
     * @type {Entity}
     */
    entity: Entity;
    /**
     * The point at which the ray hit the entity in world space.
     *
     * @type {Vec3}
     */
    point: Vec3;
    /**
     * The normal vector of the surface where the ray hit in world space.
     *
     * @type {Vec3}
     */
    normal: Vec3;
    /**
     * The normalized distance (between 0 and 1) at which the ray hit occurred from the
     * starting point.
     *
     * @type {number}
     */
    hitFraction: number;
}
import type { Entity } from '../../entity.js';
import type { Vec3 } from '../../../core/math/vec3.js';
