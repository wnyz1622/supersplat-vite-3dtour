const INTERVAL_STRIDE = 4;
function buildGSplatIntervalData(worldState) {
  const splats = worldState.splats;
  const numIntervals = worldState.totalIntervals;
  const data = new Uint32Array(numIntervals * INTERVAL_STRIDE);
  let writeIdx = 0;
  for (let s = 0; s < splats.length; s++) {
    const splat = splats[s];
    if (splat.intervals.length > 0) {
      const nodeIndices = splat.intervalNodeIndices;
      for (let i = 0; i < splat.intervals.length; i += 2) {
        const count = splat.intervals[i + 1] - splat.intervals[i];
        data[writeIdx++] = splat.intervalOffsets[i / 2];
        data[writeIdx++] = count;
        data[writeIdx++] = splat.boundsBaseIndex + (nodeIndices.length > 0 ? nodeIndices[i / 2] : 0);
        data[writeIdx++] = 0;
      }
    } else {
      data[writeIdx++] = splat.intervalOffsets[0];
      data[writeIdx++] = splat.activeSplats;
      data[writeIdx++] = splat.boundsBaseIndex;
      data[writeIdx++] = 0;
    }
  }
  return data;
}
export {
  INTERVAL_STRIDE,
  buildGSplatIntervalData
};
