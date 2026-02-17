import { describe, it, expect } from 'vitest';
import { speedToColor } from '../colors';

/** Parse an HSL string into { h, s, l } values. */
function parseHSL(hsl: string) {
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) throw new Error(`Invalid HSL: ${hsl}`);
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

describe('speedToColor', () => {
  it('returns green-ish at max speed', () => {
    const { h } = parseHSL(speedToColor(100, 100));
    expect(h).toBeGreaterThanOrEqual(120);
    expect(h).toBeLessThanOrEqual(150);
  });

  it('returns red-ish at zero speed', () => {
    const { h } = parseHSL(speedToColor(0, 100));
    expect(h).toBe(0);
  });

  it('returns yellow-ish at half speed', () => {
    const { h } = parseHSL(speedToColor(50, 100));
    expect(h).toBeGreaterThanOrEqual(40);
    expect(h).toBeLessThanOrEqual(55);
  });

  it('clamps speed above maxSpeed to green', () => {
    const { h } = parseHSL(speedToColor(200, 100));
    expect(h).toBeGreaterThanOrEqual(120);
  });

  it('clamps negative speed to red', () => {
    const { h } = parseHSL(speedToColor(-10, 100));
    expect(h).toBe(0);
  });

  it('handles maxSpeed of 0 without error', () => {
    const color = speedToColor(10, 0);
    expect(color).toBeDefined();
    const { h } = parseHSL(color);
    expect(h).toBe(0); // Treated as zero ratio → red
  });
});
