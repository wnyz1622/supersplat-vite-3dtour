/**
 * @import { WebgpuGraphicsDevice } from './webgpu-graphics-device.js'
 */
/**
 * A WebGPU implementation of the Buffer.
 *
 * @ignore
 */
export class WebgpuBuffer {
    constructor(usageFlags?: number);
    /**
     * @type {GPUBuffer|null}
     * @private
     */
    private buffer;
    usageFlags: number;
    destroy(device: any): void;
    get initialized(): boolean;
    loseContext(): void;
    allocate(device: any, size: any): void;
    /**
     * @param {WebgpuGraphicsDevice} device - Graphics device.
     * @param {*} storage -
     */
    unlock(device: WebgpuGraphicsDevice, storage: any): void;
    read(device: any, offset: any, size: any, data: any, immediate: any): any;
    /**
     * @param {WebgpuGraphicsDevice} device - Graphics device.
     * @param {number} bufferOffset - The offset in bytes to start writing to the storage buffer.
     * @param {ArrayBufferView|ArrayBuffer} data - The data to write to the storage buffer.
     * @param {number} dataOffset - Offset in data to begin writing from. Given in elements if data
     * is a TypedArray and bytes otherwise.
     * @param {number} size - Size of content to write from data to buffer. Given in elements if
     * data is a TypedArray and bytes otherwise.
     */
    write(device: WebgpuGraphicsDevice, bufferOffset: number, data: ArrayBufferView | ArrayBuffer, dataOffset: number, size: number): void;
    clear(device: any, offset: any, size: any): void;
}
import type { WebgpuGraphicsDevice } from './webgpu-graphics-device.js';
