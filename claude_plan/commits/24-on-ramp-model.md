# Commit 24: On-Ramp Data Model and Rendering

## Goal
Add on-ramp infrastructure. Not yet functional — just the data model and visual rendering.

## What to implement

### `src/simulation/OnRamp.ts`
```typescript
export class OnRamp {
  positionX: number;           // where it connects to main road (meters)
  accelerationLaneLength: number; // 300m
  spawnRate: number;           // veh/s
  lane: Lane;                  // acceleration lane (mini-lane)
  enabled: boolean;

  constructor(positionX, length?, spawnRate?)
}
```

### Update `Road.ts`
- Add optional `onRamps: OnRamp[]` field
- Methods to add/remove on-ramps

### Update `RoadRenderer.ts`
- Draw on-ramp as an angled lane merging into the rightmost lane
- Starts narrow, widens to full lane width at merge point
- Dashed merge zone marking

## Tests
No new tests — model is simple data. Rendering verified visually.

## Verification
- `npm run dev` → on-ramp visually connects to rightmost lane
- Isometric projection applied to on-ramp geometry
