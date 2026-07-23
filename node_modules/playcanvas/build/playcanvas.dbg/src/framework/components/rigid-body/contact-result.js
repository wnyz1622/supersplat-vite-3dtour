var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
class ContactResult {
  /**
   * Create a new ContactResult instance.
   *
   * @param {Entity} other - The entity that was involved in the contact with this entity.
   * @param {ContactPoint[]} contacts - An array of ContactPoints with the other entity.
   * @ignore
   */
  constructor(other, contacts) {
    /**
     * The entity that was involved in the contact with this entity.
     *
     * @type {Entity}
     */
    __publicField(this, "other");
    /**
     * An array of ContactPoints with the other entity.
     *
     * @type {ContactPoint[]}
     */
    __publicField(this, "contacts");
    this.other = other;
    this.contacts = contacts;
  }
}
export {
  ContactResult
};
