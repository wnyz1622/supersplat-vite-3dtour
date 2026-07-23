var gsplatVaryingDeclVS_default = (
  /* glsl */
  `
flat varying {type} user_{name};
void set{funcName}({type} value) { user_{name} = value; }
`
);
export {
  gsplatVaryingDeclVS_default as default
};
