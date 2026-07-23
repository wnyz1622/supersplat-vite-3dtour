var gsplatCopyToWorkbuffer_default = `
#define GSPLAT_CENTER_NOPROJ
uniform vec3 model_scale;
uniform vec4 model_rotation;
#include "gsplatHelpersVS"
#include "gsplatFormatVS"
#include "gsplatStructsVS"
#include "gsplatDeclarationsVS"
#include "gsplatCenterVS"
#include "gsplatEvalSHVS"
#include "gsplatQuatToMat3VS"
#include "gsplatReadVS"
#include "gsplatWorkBufferGeometryPS"
#include "gsplatWorkBufferOutputVS"
#include "gsplatWriteVS"
#include "gsplatModifyVS"
flat varying ivec4 vSubDraw;
uniform vec3 uColorMultiply;
#ifdef GSPLAT_ID
	uniform uint uId;
#endif
void main(void) {
	int localRow = int(gl_FragCoord.y) - vSubDraw.w;
	int localCol = int(gl_FragCoord.x) - vSubDraw.y;
	uint originalIndex = uint(vSubDraw.x + localRow * vSubDraw.z + localCol);
	setSplat(originalIndex);
	vec3 worldCenter;
	vec4 worldRotation = vec4(0.0, 0.0, 0.0, 1.0);
	vec3 worldScale = vec3(1.0);
	#if SH_BANDS > 0
		vec3 dir;
	#endif
	#ifdef GSPLAT_WORKBUFFER_GEOMETRY
		initWorkBufferGeometry(ivec2(gl_FragCoord.xy));
		worldCenter = workBufferWorldCenter();
		#if SH_BANDS > 0
			dir = normalize(quatRotateInv(model_rotation, worldCenter - uCameraPosition));
		#endif
	#else
		vec3 modelCenter = getCenter();
		worldCenter = (matrix_model * vec4(modelCenter, 1.0)).xyz;
		SplatCenter center;
		initCenter(modelCenter, center);
		vec4 srcRotation = getRotation().yzwx;
		vec3 srcScale = getScale();
		worldRotation = quatMul(model_rotation, srcRotation);
		if (worldRotation.w < 0.0) {
			worldRotation = -worldRotation;
		}
		worldScale = model_scale * srcScale;
		vec3 originalCenter = worldCenter;
		modifySplatCenter(worldCenter);
		modifySplatRotationScale(originalCenter, worldCenter, worldRotation, worldScale);
		#if SH_BANDS > 0
			dir = normalize(center.view * mat3(center.modelView));
		#endif
	#endif
	vec4 color = getColor();
	#if SH_BANDS > 0
		vec3 sh[SH_COEFFS];
		float scale;
		readSHData(sh, scale);
		color.xyz += evalSH(sh, dir) * scale;
	#endif
	modifySplatColor(worldCenter, color);
	color.xyz *= uColorMultiply;
	writeSplat(worldCenter, worldRotation, worldScale, color);
	#ifdef GSPLAT_ID
		writePcId(uvec4(uId, 0u, 0u, 0u));
	#endif
}
`;
export {
	gsplatCopyToWorkbuffer_default as default
};
