import { Vec3 } from "../../../core/math/vec3.js";
class SingleContactResult {
	a;
	b;
	impulse;
	localPointA;
	localPointB;
	pointA;
	pointB;
	normal;
	constructor(a, b, contactPoint) {
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
