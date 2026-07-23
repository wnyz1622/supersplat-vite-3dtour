const computeGsplatShadowCullSource = `
const SPLAT_FRUSTUM_SIGMA: f32 = 3.0;
struct CullUniforms {
	frustumPlanes: array<vec4f, 6>,
	numIntervals: u32,
	splatTextureSize: u32,
	alphaClip: f32,
	worldSizeThreshold: f32
};
@group(0) @binding(0) var<uniform> uniforms: CullUniforms;
@group(0) @binding(1) var<storage, read> compactedSplatIds: array<u32>;
@group(0) @binding(2) var<storage, read> candidateCountBuffer: array<u32>;
@group(0) @binding(3) var<storage, read_write> outputIndices: array<u32>;
@group(0) @binding(4) var<storage, read_write> globalCount: array<atomic<u32>>;
#include "gsplatComputeSplatCS"
#include "gsplatFormatDeclCS"
#include "gsplatFormatReadCS"
#include "gsplatHelpersVS"
#include "gsplatModifyVS"
fn fineCull(splatId: u32) -> bool {
	setSplat(splatId);
	let originalCenter = getCenter();
	var center = originalCenter;
	modifySplatCenter(&center);
	let opacity = getOpacity();
	if (opacity <= uniforms.alphaClip) {
		return false;
	}
	var rotation: vec4f = getRotation().yzwx;
	var scale: vec3f = getScale();
	modifySplatRotationScale(originalCenter, center, &rotation, &scale);
	let maxScale = max(scale.x, max(scale.y, scale.z));
	if (maxScale < uniforms.worldSizeThreshold) {
		return false;
	}
	let splatRadius = maxScale * SPLAT_FRUSTUM_SIGMA;
	for (var p = 0; p < 6; p++) {
		let plane = uniforms.frustumPlanes[p];
		if (dot(plane.xyz, center) + plane.w <= -splatRadius) {
			return false;
		}
	}
	return true;
}
var<workgroup> wgCount: atomic<u32>;
var<workgroup> wgBase: u32;
@compute @workgroup_size({WORKGROUP_SIZE})
fn main(
	@builtin(global_invocation_id) gid: vec3u,
	@builtin(num_workgroups) numWorkgroups: vec3u,
	@builtin(local_invocation_index) localIdx: u32
) {
	if (localIdx == 0u) {
		atomicStore(&wgCount, 0u);
	}
	workgroupBarrier();
	let threadIdx = gid.y * (numWorkgroups.x * {WORKGROUP_SIZE}u) + gid.x;
	let candidateCount = candidateCountBuffer[uniforms.numIntervals];
	var valid = false;
	var splatId = 0u;
	if (threadIdx < candidateCount) {
		splatId = compactedSplatIds[threadIdx];
		valid = fineCull(splatId);
	}
	var localSlot = 0u;
	if (valid) {
		localSlot = atomicAdd(&wgCount, 1u);
	}
	workgroupBarrier();
	if (localIdx == 0u) {
		wgBase = atomicAdd(&globalCount[0], atomicLoad(&wgCount));
	}
	workgroupBarrier();
	if (valid) {
		outputIndices[wgBase + localSlot] = splatId;
	}
}
`;
var compute_gsplat_shadow_cull_default = computeGsplatShadowCullSource;
export {
	computeGsplatShadowCullSource,
	compute_gsplat_shadow_cull_default as default
};
