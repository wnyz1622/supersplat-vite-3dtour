var gsplatVaryingDeclVS_default = (
  /* wgsl */
  `
varying @interpolate(flat) user_{name}: {type};
var<private> _user_{name}: {type};
fn set{funcName}(value: {type}) { _user_{name} = value; }
`
);
export {
  gsplatVaryingDeclVS_default as default
};
