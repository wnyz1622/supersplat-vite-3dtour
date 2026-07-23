import indirectCoreCS from "../common/comp/indirect-core.js";
const computeGsplatShadowIndirectArgsSource = (
  /* wgsl */
  `

${indirectCoreCS}

// Visible splat count (element 0), produced by the shadow cull's atomic counter.
@group(0) @binding(0) var<storage, read> countBuffer: array<u32>;

// Device's shared indirect draw buffer, indexed by slot.
@group(0) @binding(1) var<storage, read_write> indirectDrawArgs: array<DrawIndexedIndirectArgs>;

struct ShadowArgsUniforms {
    drawSlot: u32,      // slot index into indirectDrawArgs
    indexCount: u32,    // indices per instance (768 = 6 * 128)
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
        0u,     // firstIndex
        0,      // baseVertex
        0u      // firstInstance
    );
}
`
);
var compute_gsplat_shadow_indirect_args_default = computeGsplatShadowIndirectArgsSource;
export {
  computeGsplatShadowIndirectArgsSource,
  compute_gsplat_shadow_indirect_args_default as default
};
