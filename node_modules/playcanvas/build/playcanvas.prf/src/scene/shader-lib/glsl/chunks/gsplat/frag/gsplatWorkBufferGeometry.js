var gsplatWorkBufferGeometry_default = `
#ifdef GSPLAT_WORKBUFFER_GEOMETRY
	uniform highp usampler2D uWorkBufferTransformA;
	uniform highp usampler2D uWorkBufferTransformB;
	uniform mat4 matrix_model_inverse;
	uniform vec3 uCameraPosition;
	ivec2 wbCoord;
	uvec4 wbTransformA;
	void initWorkBufferGeometry(ivec2 coord) {
		wbCoord = coord;
		wbTransformA = texelFetch(uWorkBufferTransformA, coord, 0);
	}
	vec3 workBufferWorldCenter() {
		return vec3(uintBitsToFloat(wbTransformA.x), uintBitsToFloat(wbTransformA.y), uintBitsToFloat(wbTransformA.z));
	}
	vec4 workBufferWorldRotation() {
		#ifdef GSPLAT_WORKBUFFER_COMPACT
			uint data = texelFetch(uWorkBufferTransformB, wbCoord, 0).x;
			vec3 p = vec3(
				float(data & 0x7FFu) / 2047.0 * 2.0 - 1.0,
				float((data >> 11u) & 0x7FFu) / 2047.0 * 2.0 - 1.0,
				float((data >> 22u) & 0x3FFu) / 1023.0 * 2.0 - 1.0
			);
			float d = dot(p, p);
			return vec4(sqrt(max(0.0, 2.0 - d)) * p, 1.0 - d);
		#else
			vec2 rotXY = unpackHalf2x16(wbTransformA.w);
			vec3 r = vec3(rotXY, unpackHalf2x16(texelFetch(uWorkBufferTransformB, wbCoord, 0).x).x);
			return vec4(r, sqrt(max(0.0, 1.0 - dot(r, r))));
		#endif
	}
	vec3 workBufferWorldScale() {
		#ifdef GSPLAT_WORKBUFFER_COMPACT
			uint data = wbTransformA.w;
			float sx = float(data & 0xFFu);
			float sy = float((data >> 8u) & 0xFFu);
			float sz = float((data >> 16u) & 0xFFu);
			const float logRange = 21.0 / 255.0;
			const float logMin = -12.0;
			return vec3(
				sx == 0.0 ? 0.0 : exp(sx * logRange + logMin),
				sy == 0.0 ? 0.0 : exp(sy * logRange + logMin),
				sz == 0.0 ? 0.0 : exp(sz * logRange + logMin)
			);
		#else
			uvec2 b = texelFetch(uWorkBufferTransformB, wbCoord, 0).xy;
			return vec3(unpackHalf2x16(b.x).y, unpackHalf2x16(b.y));
		#endif
	}
	vec3 quatRotateInv(vec4 q, vec3 v) {
		vec3 t = -q.xyz;
		return v + 2.0 * cross(t, cross(t, v) + q.w * v);
	}
	vec3 getCenter() {
		return (matrix_model_inverse * vec4(workBufferWorldCenter(), 1.0)).xyz;
	}
	vec4 getRotation() {
		vec4 worldRotation = workBufferWorldRotation();
		vec4 localRotation = quatMul(vec4(-model_rotation.xyz, model_rotation.w), worldRotation);
		return localRotation.wxyz;
	}
	vec3 getScale() {
		return workBufferWorldScale() / model_scale;
	}
#endif
`;
export {
	gsplatWorkBufferGeometry_default as default
};
