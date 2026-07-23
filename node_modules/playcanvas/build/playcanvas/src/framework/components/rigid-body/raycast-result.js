class RaycastResult {
	entity;
	point;
	normal;
	hitFraction;
	constructor(entity, point, normal, hitFraction) {
		this.entity = entity;
		this.point = point;
		this.normal = normal;
		this.hitFraction = hitFraction;
	}
}
export {
	RaycastResult
};
