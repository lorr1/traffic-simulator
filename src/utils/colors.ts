import { clamp } from './math';

/**
 * Map a vehicle speed to a CSS color string using HSL interpolation.
 *  - speed/maxSpeed = 1.0 → green (#22c55e, hue ≈ 142)
 *  - speed/maxSpeed = 0.5 → yellow (#eab308, hue ≈ 48)
 *  - speed/maxSpeed = 0.0 → red (#ef4444, hue ≈ 0)
 */
export function speedToColor(speed: number, maxSpeed: number): string {
  const ratio = clamp(maxSpeed === 0 ? 0 : speed / maxSpeed, 0, 1);
  // Hue: 0 (red) → 48 (yellow) → 142 (green)
  // Use a piecewise linear mapping for natural color transitions
  let hue: number;
  if (ratio <= 0.5) {
    // Red (0) to Yellow (48)
    hue = (ratio / 0.5) * 48;
  } else {
    // Yellow (48) to Green (142)
    hue = 48 + ((ratio - 0.5) / 0.5) * (142 - 48);
  }
  const saturation = 75;
  const lightness = 50;
  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
}
