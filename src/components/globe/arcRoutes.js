/**
 * Arc routes emanating from Riyadh (24.71°N, 46.68°E) to major logistics hubs.
 * Each arc draws itself incrementally as globeProgress passes its triggerAt value.
 *
 * Coordinates: [lat, lng]
 */

export const ARC_ROUTES = [
  {
    id: 'london',
    from:      [24.71, 46.68],  // Riyadh
    to:        [51.51, -0.13],  // London
    label:     'London',
    triggerAt: 0.06,
    color:     '#c8a84e',
  },
  {
    id: 'shanghai',
    from:      [24.71, 46.68],  // Riyadh
    to:        [31.23, 121.47], // Shanghai
    label:     'Shanghai',
    triggerAt: 0.10,
    color:     '#e8d48a',
  },
  {
    id: 'newyork',
    from:      [24.71, 46.68],  // Riyadh
    to:        [40.71, -74.01], // New York
    label:     'New York',
    triggerAt: 0.14,
    color:     '#c8a84e',
  },
  {
    id: 'dubai',
    from:      [24.71, 46.68],  // Riyadh
    to:        [25.20, 55.27],  // Dubai
    label:     'Dubai',
    triggerAt: 0.04,
    color:     '#ffd580',
  },
  {
    id: 'singapore',
    from:      [24.71, 46.68],  // Riyadh
    to:        [1.35, 103.82],  // Singapore
    label:     'Singapore',
    triggerAt: 0.08,
    color:     '#e8d48a',
  },
];
