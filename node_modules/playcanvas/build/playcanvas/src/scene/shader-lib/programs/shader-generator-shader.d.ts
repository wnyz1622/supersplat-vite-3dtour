export const shaderGeneratorShader: ShaderGeneratorShader;
declare class ShaderGeneratorShader extends ShaderGenerator {
    generateKey(options: any): string;
    createAttributesDefinition(definitionOptions: any, options: any): void;
    /**
     * Adds object / mesh level defines (derived from {@link MeshInstance} shader defines) to the
     * supplied map. These describe properties of the rendered mesh and so are made available to
     * both the vertex and fragment shaders.
     *
     * @param {Map<string, any>} defines - The defines map to add to.
     * @param {object} options - The shader generation options.
     */
    addSharedDefines(defines: Map<string, any>, options: object): void;
    createVertexDefinition(definitionOptions: any, options: any, sharedIncludes: any, wgsl: any): void;
    createFragmentDefinition(definitionOptions: any, options: any, sharedIncludes: any, wgsl: any): void;
    createShaderDefinition(device: any, options: any): any;
}
import { ShaderGenerator } from './shader-generator.js';
export {};
