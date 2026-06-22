import { useMemo } from 'react';
import { computeSubwayLayout } from '../utils/layoutAlgorithm';

/**
 * Custom hook to compute and memoize the SVG layout and bounding box.
 * 
 * @param {Array} stations - The list of all stations in the network.
 * @param {Array} lines - The list of all lines in the network.
 * @param {number} [baseWidth=1000] - Base width used for calculating the layout.
 * @param {number} [baseHeight=1000] - Base height used for calculating the layout.
 * @param {number} [margin=80] - The margin padding around the bounding box.
 * @returns {object} An object containing:
 *  - stationCoords: The calculated { x, y } coordinates for each station.
 *  - viewBox: The computed SVG viewBox string ensuring all stations fit.
 *  - stationLineCounts: A mapping of station IDs to the number of lines they serve.
 */
export function useMapLayout(stations, lines, baseWidth = 1000, baseHeight = 1000, margin = 80) {
  return useMemo(() => {
    // Compute topology-aware station coordinates
    const stationCoords = computeSubwayLayout(stations, lines, baseWidth, baseHeight);

    // ViewBox: fit the computed bounding box with a margin
    const allCoords = Object.values(stationCoords);
    const minX = allCoords.length ? Math.min(...allCoords.map(c => c.x)) : 0;
    const maxX = allCoords.length ? Math.max(...allCoords.map(c => c.x)) : baseWidth;
    const minY = allCoords.length ? Math.min(...allCoords.map(c => c.y)) : 0;
    const maxY = allCoords.length ? Math.max(...allCoords.map(c => c.y)) : baseHeight;
    const vbX = minX - margin;
    const vbY = minY - margin;
    const vbWidth = (maxX - minX) + margin * 2;
    const vbHeight = (maxY - minY) + margin * 2;

    // Calculate interchanges (in order to make their dots bigger in the PLANNING view)
    const stationLineCounts = {};
    lines.forEach(line => {
      line.stations.forEach(s => {
        stationLineCounts[s.id] = (stationLineCounts[s.id] || 0) + 1;
      });
    });

    return {
      stationCoords,
      viewBox: `${vbX} ${vbY} ${vbWidth} ${vbHeight}`,
      stationLineCounts
    };
  }, [stations, lines, baseWidth, baseHeight, margin]);
}
