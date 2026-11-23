/** Festival map island hit regions — percentages of the map stage (object-fit: cover). */

export type MapPoint = { x: number; y: number };

export type MapIsland = {
  themeId: string;
  /** Display label above the island (does not sit under the avatar). */
  label: { yue: string; pu: string };
  /** Ellipse hit region covering the whole island (percent of stage). */
  hit: { cx: number; cy: number; rx: number; ry: number };
  /** Where the avatar stands after walking (percent). Keep clear of label. */
  stand: MapPoint;
  /** Label anchor above the island art. */
  labelPos: MapPoint;
};

/** Central clearing where the player starts. */
export const mapHubStand: MapPoint = { x: 48, y: 58 };

/**
 * Approximate island layout on map_bg.webp (cover framing):
 * - Left: 農曆新年
 * - Top: 中秋
 * - Right-upper bamboo / boat: 端午
 * - Right tea house: 飲茶
 */
export const mapIslands: MapIsland[] = [
  {
    themeId: 'newyear',
    label: { yue: '農曆新年', pu: '农历新年' },
    hit: { cx: 16, cy: 55, rx: 14, ry: 20 },
    stand: { x: 22, y: 68 },
    labelPos: { x: 18, y: 28 },
  },
  {
    themeId: 'midautumn',
    label: { yue: '中秋節', pu: '中秋节' },
    hit: { cx: 47, cy: 27, rx: 15, ry: 19 },
    stand: { x: 48, y: 42 },
    labelPos: { x: 48, y: 8 },
  },
  {
    themeId: 'dragonboat',
    label: { yue: '端午節', pu: '端午节' },
    hit: { cx: 79, cy: 34, rx: 14, ry: 16 },
    stand: { x: 74, y: 52 },
    labelPos: { x: 78, y: 14 },
  },
  {
    themeId: 'yumcha',
    label: { yue: '飲茶', pu: '饮茶' },
    hit: { cx: 80, cy: 66, rx: 13, ry: 12 },
    stand: { x: 76, y: 78 },
    labelPos: { x: 82, y: 52 },
  },
];

export function getMapIsland(themeId: string): MapIsland | undefined {
  return mapIslands.find((i) => i.themeId === themeId);
}

/** Point-in-ellipse test using percent coordinates. */
export function hitTestIsland(island: MapIsland, x: number, y: number): boolean {
  const dx = (x - island.hit.cx) / island.hit.rx;
  const dy = (y - island.hit.cy) / island.hit.ry;
  return dx * dx + dy * dy <= 1;
}
