import {
	SHADERLANGUAGE_GLSL,
	SHADERLANGUAGE_WGSL,
	TYPE_FLOAT32,
	TYPE_INT32,
	TYPE_UINT32
} from "../../platform/graphics/constants.js";
import { CACHE_STRIDE } from "./gsplat-projector-constants.js";
import glslVaryingDeclVS from "../shader-lib/glsl/chunks/gsplat/varyings/gsplatVaryingDeclVS.js";
import glslVaryingDeclPS from "../shader-lib/glsl/chunks/gsplat/varyings/gsplatVaryingDeclPS.js";
import wgslVaryingDeclVS from "../shader-lib/wgsl/chunks/gsplat/varyings/gsplatVaryingDeclVS.js";
import wgslVaryingFlushVS from "../shader-lib/wgsl/chunks/gsplat/varyings/gsplatVaryingFlushVS.js";
import wgslVaryingDeclCS from "../shader-lib/wgsl/chunks/gsplat/varyings/gsplatVaryingDeclCS.js";
import wgslVaryingDeclPS from "../shader-lib/wgsl/chunks/gsplat/varyings/gsplatVaryingDeclPS.js";
import wgslVaryingCacheWriteCS from "../shader-lib/wgsl/chunks/gsplat/varyings/gsplatVaryingCacheWriteCS.js";
import wgslVaryingCacheReadVS from "../shader-lib/wgsl/chunks/gsplat/varyings/gsplatVaryingCacheReadVS.js";
const GLSL_TYPES = {
	[TYPE_FLOAT32]: ["float", "vec2", "vec3", "vec4"],
	[TYPE_INT32]: ["int", "ivec2", "ivec3", "ivec4"],
	[TYPE_UINT32]: ["uint", "uvec2", "uvec3", "uvec4"]
};
const WGSL_TYPES = {
	[TYPE_FLOAT32]: ["f32", "vec2f", "vec3f", "vec4f"],
	[TYPE_INT32]: ["i32", "vec2i", "vec3i", "vec4i"],
	[TYPE_UINT32]: ["u32", "vec2u", "vec3u", "vec4u"]
};
const COMPONENT_SWIZZLE = ["x", "y", "z", "w"];
const IDENTIFIER_REGEX = /^[a-z_]\w*$/i;
const RE_NAME = /\{name\}/g;
const RE_TYPE = /\{type\}/g;
const RE_FUNC_NAME = /\{funcName\}/g;
const RE_WORD = /\{word\}/g;
const RE_VALUE = /\{value\}/g;
const GLSL_CHUNK_NAMES = ["gsplatUserVaryingsVS", "gsplatUserVaryingsPS"];
const WGSL_CHUNK_NAMES = [
	"gsplatUserVaryingsVS",
	"gsplatUserVaryingsFlushVS",
	"gsplatUserVaryingsCS",
	"gsplatUserVaryingsPS",
	"gsplatUserCacheWriteCS",
	"gsplatUserCacheReadVS"
];
const pascal = (name) => name.charAt(0).toUpperCase() + name.slice(1);
const encodeWord = (type, expr) => {
	return type === TYPE_UINT32 ? expr : `bitcast<u32>(${expr})`;
};
const decodeWord = (type, expr) => {
	if (type === TYPE_UINT32) return expr;
	return type === TYPE_INT32 ? `bitcast<i32>(${expr})` : `bitcast<f32>(${expr})`;
};
class GSplatVaryings {
	_device;
	_streams = [];
	_words = 0;
	_version = 0;
	constructor(device) {
		this._device = device;
	}
	get streams() {
		return this._streams;
	}
	get words() {
		return this._words;
	}
	get version() {
		return this._version;
	}
	add(streams) {
		for (const s of streams) {
			this._streams.push({ name: s.name, type: s.type, components: s.components });
		}
		this._changed();
	}
	remove(names) {
		const count = this._streams.length;
		this._streams = this._streams.filter((v) => !names.includes(v.name));
		if (this._streams.length !== count) {
			this._changed();
		}
	}
	_changed() {
		this._words = this._streams.reduce((sum, s) => sum + s.components, 0);
		this._version++;
	}
	_generateChunks() {
		const isWebGPU = this._device.isWebGPU;
		const types = isWebGPU ? WGSL_TYPES : GLSL_TYPES;
		const declVSTemplate = isWebGPU ? wgslVaryingDeclVS : glslVaryingDeclVS;
		const declPSTemplate = isWebGPU ? wgslVaryingDeclPS : glslVaryingDeclPS;
		const vs = [];
		const ps = [];
		const flush = [];
		const cs = [];
		const cacheWrite = [];
		const cacheRead = [];
		let wordOffset = 0;
		for (const s of this._streams) {
			const { name, type, components } = s;
			const shaderType = types[type][components - 1];
			const funcName = pascal(name);
			const sub = (template) => template.replace(RE_NAME, name).replace(RE_TYPE, shaderType).replace(RE_FUNC_NAME, funcName);
			vs.push(sub(declVSTemplate));
			ps.push(sub(declPSTemplate));
			if (isWebGPU) {
				flush.push(sub(wgslVaryingFlushVS));
				cs.push(sub(wgslVaryingDeclCS));
				const words = [];
				for (let c = 0; c < components; c++) {
					const component = components === 1 ? `_user_${name}` : `_user_${name}.${COMPONENT_SWIZZLE[c]}`;
					cacheWrite.push(wgslVaryingCacheWriteCS.replace(RE_WORD, String(CACHE_STRIDE + wordOffset + c)).replace(RE_VALUE, encodeWord(type, component)));
					words.push(decodeWord(type, `projCache[base + ${CACHE_STRIDE + wordOffset + c}u]`));
				}
				cacheRead.push(wgslVaryingCacheReadVS.replace(RE_NAME, name).replace(RE_VALUE, components === 1 ? words[0] : `${shaderType}(${words.join(", ")})`));
			}
			wordOffset += components;
		}
		const chunks = {
			gsplatUserVaryingsVS: vs.join(""),
			gsplatUserVaryingsPS: ps.join("")
		};
		if (isWebGPU) {
			chunks.gsplatUserVaryingsFlushVS = flush.join("");
			chunks.gsplatUserVaryingsCS = cs.join("");
			chunks.gsplatUserCacheWriteCS = cacheWrite.join("");
			chunks.gsplatUserCacheReadVS = cacheRead.join("");
		}
		return chunks;
	}
	apply(material) {
		const isWebGPU = this._device.isWebGPU;
		const chunks = material.getShaderChunks(isWebGPU ? SHADERLANGUAGE_WGSL : SHADERLANGUAGE_GLSL);
		material.setDefine("GSPLAT_USER_VARYINGS", this._streams.length > 0);
		if (this._streams.length > 0) {
			const sources = this._generateChunks();
			for (const name in sources) {
				chunks.set(name, sources[name]);
			}
		} else {
			const names = isWebGPU ? WGSL_CHUNK_NAMES : GLSL_CHUNK_NAMES;
			names.forEach((name) => chunks.delete(name));
		}
		material.update();
	}
}
export {
	GSplatVaryings
};
