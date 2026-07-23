var particleOutput_default = `
void writeOutput() {
	vec4 row = gl_FragCoord.y < 1.0 ?
		vec4(outPos, (outAngle + 1000.0) * visMode) :
		vec4(outVel, outLife);
	#ifdef CAPS_TEXTURE_FLOAT_RENDERABLE
		gl_FragColor = row;
	#else
		gl_FragColor = floatBitsToUint(row);
	#endif
}
`;
export {
	particleOutput_default as default
};
