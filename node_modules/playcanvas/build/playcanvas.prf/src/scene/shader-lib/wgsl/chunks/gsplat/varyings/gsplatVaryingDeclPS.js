var gsplatVaryingDeclPS_default = `
varying @interpolate(flat) user_{name}: {type};
fn get{funcName}() -> {type} { return user_{name}; }
`;
export {
	gsplatVaryingDeclPS_default as default
};
