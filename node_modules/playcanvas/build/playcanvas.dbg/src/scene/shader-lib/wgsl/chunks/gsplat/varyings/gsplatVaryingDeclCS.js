var gsplatVaryingDeclCS_default = (
  /* wgsl */
  `
var<private> _user_{name}: {type};
fn set{funcName}(value: {type}) { _user_{name} = value; }
`
);
export {
  gsplatVaryingDeclCS_default as default
};
