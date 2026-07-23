var gsplatVaryingDeclPS_default = (
  /* glsl */
  `
flat varying {type} user_{name};
{type} get{funcName}() { return user_{name}; }
`
);
export {
  gsplatVaryingDeclPS_default as default
};
