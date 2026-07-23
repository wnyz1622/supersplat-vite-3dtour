var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Vec3 } from "../../../core/math/vec3.js";
class ContactPoint {
  /**
   * Create a new ContactPoint instance.
   *
   * @param {Vec3} [localPoint] - The point on the entity where the contact occurred, relative to
   * the entity.
   * @param {Vec3} [localPointOther] - The point on the other entity where the contact occurred,
   * relative to the other entity.
   * @param {Vec3} [point] - The point on the entity where the contact occurred, in world space.
   * @param {Vec3} [pointOther] - The point on the other entity where the contact occurred, in
   * world space.
   * @param {Vec3} [normal] - The normal vector of the contact on the other entity, in world
   * space.
   * @param {number} [impulse] - The total accumulated impulse applied by the constraint solver
   * during the last sub-step. Describes how hard two objects collide. Defaults to 0.
   * @ignore
   */
  constructor(localPoint = new Vec3(), localPointOther = new Vec3(), point = new Vec3(), pointOther = new Vec3(), normal = new Vec3(), impulse = 0) {
    /**
     * The point on the entity where the contact occurred, relative to the entity.
     *
     * @type {Vec3}
     */
    __publicField(this, "localPoint");
    /**
     * The point on the other entity where the contact occurred, relative to the other entity.
     *
     * @type {Vec3}
     */
    __publicField(this, "localPointOther");
    /**
     * The point on the entity where the contact occurred, in world space.
     *
     * @type {Vec3}
     */
    __publicField(this, "point");
    /**
     * The point on the other entity where the contact occurred, in world space.
     *
     * @type {Vec3}
     */
    __publicField(this, "pointOther");
    /**
     * The normal vector of the contact on the other entity, in world space. This vector points
     * away from the surface of the other entity at the point of contact.
     *
     * @type {Vec3}
     */
    __publicField(this, "normal");
    /**
     * The total accumulated impulse applied by the constraint solver during the last sub-step.
     * This value represents how hard two objects collided. Higher values indicate stronger impacts.
     *
     * @type {number}
     */
    __publicField(this, "impulse");
    this.localPoint = localPoint;
    this.localPointOther = localPointOther;
    this.point = point;
    this.pointOther = pointOther;
    this.normal = normal;
    this.impulse = impulse;
  }
}
export {
  ContactPoint
};
