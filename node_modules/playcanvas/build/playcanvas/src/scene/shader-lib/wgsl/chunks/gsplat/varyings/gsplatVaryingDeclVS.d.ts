declare const _default: "\nvarying @interpolate(flat) user_{name}: {type};\nvar<private> _user_{name}: {type};\nfn set{funcName}(value: {type}) { _user_{name} = value; }\n";
export default _default;
