# Commit 18: Speed Heatmap (Space-Time Diagram)

## Goal
The most educational visualization: a space-time diagram showing shockwave propagation.

## What to implement

### `src/analytics/SpeedHeatmap.tsx`
- Separate `<canvas>` element (not Recharts — raw pixels for performance)
- X axis = position along road (0 to roadLength)
- Y axis = time (newest at bottom, scrolling upward)
- Each row = one sample interval (0.5s)
- Each cell colored by segment average speed (green→yellow→red)
- Scrolls continuously as new data arrives
- Axis labels: position (m) on X, time (s) on Y

Implementation:
- Maintain an ImageData buffer
- Each sample: shift existing pixels up by 1 row, draw new row at bottom
- Use DataCollector history

Shockwaves appear as backward-diagonal red/yellow bands propagating from right to left (upstream from incident). This is the clearest way to visualize how a local incident creates effects far upstream.

## Tests
No unit tests — visual verification.

## Verification
- `npm run dev` → heatmap shows green (free flow) initially
- Place incident → red zone appears at incident position, diagonal band extends upstream over time
- Remove incident → green gradually returns from downstream to upstream
