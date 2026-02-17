# Commit 8: Road and Vehicle Rendering

## Goal
Draw the road and vehicles on canvas. After this commit, there's something visual (but not yet wired to the simulation loop).

## What to implement

### `src/rendering/RoadRenderer.ts`
```typescript
export class RoadRenderer {
  static draw(ctx: CanvasRenderingContext2D, roadLength: number, laneCount: number, laneWidth: number): void
    // 1. Dark gray road surface rectangle
    // 2. White dashed lane markings between lanes
    // 3. Solid white edge lines top and bottom
    // 4. Road shoulders (slightly lighter gray)
}
```

Lane width in world coords = ~3.7m (standard lane width). Road drawn horizontally: x=0 to x=roadLength, y=0 to y=laneCount×laneWidth.

### `src/rendering/VehicleRenderer.ts`
```typescript
export class VehicleRenderer {
  static draw(ctx: CanvasRenderingContext2D, vehicles: VehicleState[], laneWidth: number, maxSpeed: number): void
    // For each vehicle:
    // 1. Calculate screen position: x = vehicle.x, y = vehicle.laneIndex × laneWidth + laneWidth/2
    // 2. Color from speedToColor(vehicle.speed, maxSpeed)
    // 3. Draw rounded rectangle (vehicle.length × ~2m width)
    // 4. Optional: tiny direction indicator
}
```

## Tests
No unit tests — visual output verified manually.

## Verification
- Code compiles without errors (verified via `npm run dev` build check)
