export type CameraPose = {
    position: [number, number, number];
    target: [number, number, number];
    fov: number;
};

export const SPLAT_URL = "./splat/meta.json";

// Initial camera pose authored in SuperSplat. Null falls back to auto-framing.
export const CAMERA_POSE: CameraPose | null = {
    "position": [
        7.115272045135498,
        2.483649492263794,
        -8.238931655883789
    ],
    "target": [
        3.2907700377244504,
        2.0498479766736555,
        -3.254743532532307
    ],
    "fov": 75
};
