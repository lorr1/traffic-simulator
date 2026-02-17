# Commit 25: On-Ramp Merge Logic

## Goal
Vehicles spawn on the on-ramp, accelerate, and merge into the main road.

## What to implement

### Update `OnRamp.ts`
```typescript
  trySpawn(dt: number, params: SimulationParams): void
    // Poisson spawn into acceleration lane

  stepVehicles(dt: number, mainRoad: Road, params: SimulationParams): void
    // 1. For each vehicle in acceleration lane:
    //    a. IDM follow leader in acceleration lane
    //    b. Attempt merge: check gap in main road lane 0 at vehicle's x position
    //       - Gap acceptance: use MOBIL safety criterion
    //       - If gap sufficient: move vehicle to main road lane 0
    //    c. If at end of acceleration lane and can't merge: stop (forced yield)
    // 2. Euler integration for acceleration lane vehicles
```

### Update `SimulationEngine.step()`
- After main road step, step each on-ramp

### Update `ControlPanel.tsx`
- Add "On-Ramp" toggle (checkbox)
- On-ramp spawn rate slider

## Tests: `src/simulation/__tests__/OnRamp.test.ts`
- Vehicle merges when sufficient gap in lane 0
- Vehicle stops at end of acceleration lane when no gap
- Merge respects safety criterion (no dangerous braking for main road follower)
- Enabling/disabling on-ramp starts/stops spawning

## Verification
- `npm run dev` → toggle on-ramp on → vehicles appear on ramp, accelerate, merge
- Merging creates realistic congestion at merge point
- Heavy main road traffic → on-ramp vehicles queue on acceleration lane
- Fundamental diagram shows impact of on-ramp demand
