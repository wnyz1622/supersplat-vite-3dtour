import { Vec3 } from "../../../core/math/vec3.js";
class ContactPoint {
	localPoint;
	localPointOther;
	point;
	pointOther;
	normal;
	impulse;
	constructor(localPoint = new Vec3(), localPointOther = new Vec3(), point = new Vec3(), pointOther = new Vec3(), normal = new Vec3(), impulse = 0) {
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
