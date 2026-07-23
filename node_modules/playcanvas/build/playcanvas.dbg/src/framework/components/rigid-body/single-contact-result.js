var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
import { Vec3 } from "../../../core/math/vec3.js";
class SingleContactResult {
  /**
   * Create a new SingleContactResult instance.
   *
   * @param {Entity} a - The first entity involved in the contact.
   * @param {Entity} b - The second entity involved in the contact.
   * @param {ContactPoint} contactPoint - The contact point between the two entities.
   * @ignore
   */
  constructor(a, b, contactPoint) {
    /**
     * The first entity involved in the contact.
     *
     * @type {Entity}
     */
    __publicField(this, "a");
    /**
     * The second entity involved in the contact.
     *
     * @type {Entity}
     */
    __publicField(this, "b");
    /**
     * The total accumulated impulse applied by the constraint solver during the last
     * sub-step. Describes how hard two bodies collided.
     *
     * @type {number}
     */
    __publicField(this, "impulse");
    /**
     * The point on Entity A where the contact occurred, relative to A.
     *
     * @type {Vec3}
     */
    __publicField(this, "localPointA");
    /**
     * The point on Entity B where the contact occurred, relative to B.
     *
     * @type {Vec3}
     */
    __publicField(this, "localPointB");
    /**
     * The point on Entity A where the contact occurred, in world space.
     *
     * @type {Vec3}
     */
    __publicField(this, "pointA");
    /**
     * The point on Entity B where the contact occurred, in world space.
     *
     * @type {Vec3}
     */
    __publicField(this, "pointB");
    /**
     * The normal vector of the contact on Entity B, in world space.
     *
     * @type {Vec3}
     */
    __publicField(this, "normal");
    if (arguments.length !== 0) {
      this.a = a;
      this.b = b;
      this.impulse = contactPoint.impulse;
      this.localPointA = contactPoint.localPoint;
      this.localPointB = contactPoint.localPointOther;
      this.pointA = contactPoint.point;
      this.pointB = contactPoint.pointOther;
      this.normal = contactPoint.normal;
    } else {
      this.a = null;
      this.b = null;
      this.impulse = 0;
      this.localPointA = new Vec3();
      this.localPointB = new Vec3();
      this.pointA = new Vec3();
      this.pointB = new Vec3();
      this.normal = new Vec3();
    }
  }
}
export {
  SingleContactResult
};
