var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class RaycastResult {
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
  constructor(entity, point, normal, hitFraction) {
    /**
     * The entity that was hit.
     *
     * @type {Entity}
     */
    __publicField(this, "entity");
    /**
     * The point at which the ray hit the entity in world space.
     *
     * @type {Vec3}
     */
    __publicField(this, "point");
    /**
     * The normal vector of the surface where the ray hit in world space.
     *
     * @type {Vec3}
     */
    __publicField(this, "normal");
    /**
     * The normalized distance (between 0 and 1) at which the ray hit occurred from the
     * starting point.
     *
     * @type {number}
     */
    __publicField(this, "hitFraction");
    this.entity = entity;
    this.point = point;
    this.normal = normal;
    this.hitFraction = hitFraction;
  }
}
export {
  RaycastResult
};
