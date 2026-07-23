import indirectCoreCS from "../common/comp/indirect-core.js";
const computeGsplatShadowIndirectArgsSource = `
${indirectCoreCS}
@group(0) @binding(0) var<storage, read> countBuffer: array<u32>;
@group(0) @binding(1) var<storage, read_write> indirectDrawArgs: array<DrawIndexedIndirectArgs>;
struct ShadowArgsUniforms {
	drawSlot: u32,
	indexCount: u32,
	pad0: u32,
	pad1: u32
};
@group(0) @binding(2) var<uniform> uniforms: ShadowArgsUniforms;
@compute @workgroup_size(1)
fn main() {
	let count = countBuffer[0];
	let instanceCount = (count + {INSTANCE_SIZE}u - 1u) / {INSTANCE_SIZE}u;
	indirectDrawArgs[uniforms.drawSlot] = DrawIndexedIndirectArgs(
		uniforms.indexCount,
		instanceCount,
		0u,
		0,
		0u
	);
}
`;
var compute_gsplat_shadow_indirect_args_default = computeGsplatShadowIndirectArgsSource;
export {
	computeGsplatShadowIndirectArgsSource,
	compute_gsplat_shadow_indirect_args_default as default
};
