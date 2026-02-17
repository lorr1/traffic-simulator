# Commit 2: Types, Constants, and Utility Functions

## Goal
Define all shared types, default parameter values, and pure utility functions. These form the foundation everything else builds on.

## What to implement

### `src/types.ts`
```typescript
export interface SimulationParams {
  // IDM
  desiredSpeed: number;          // v0, m/s
  timeHeadway: number;           // T, seconds
  maxAcceleration: number;       // a, m/s²
  comfortDeceleration: number;   // b, m/s²
  minimumGap: number;            // s0, meters
  vehicleLength: number;         // meters

  // MOBIL
  politenessFactor: number;      // p
  changingThreshold: number;     // delta_a_th, m/s²
  safeDeceleration: number;      // b_safe, m/s²

  // Road
  roadLengthMeters: number;
  laneCount: number;

  // Traffic demand
  spawnRate: number;             // vehicles per second

  // Simulation
  dt: number;                    // fixed timestep, seconds
  speedMultiplier: number;       // 1x, 2x, 5x, 10x
}

export interface VehicleState {
  id: number;
  x: number;
  laneIndex: number;
  speed: number;
  acceleration: number;
  length: number;
  desiredSpeed: number;
}

export interface IncidentConfig {
  id: number;
  positionX: number;
  lanesBlocked: number[];
  severity: number;              // 0-1
  startTime: number;
  duration: number;              // seconds, -1 for manual removal
  rubberneckingFactor: number;   // 0.5-1.0
}

export interface RoadSegmentData {
  segmentIndex: number;
  density: number;               // vehicles per km
  flow: number;                  // vehicles per hour
  averageSpeed: number;          // m/s
}
```

### `src/constants.ts`
Default values for all SimulationParams with documented units.

### `src/utils/math.ts`
- `clamp(value, min, max)` — bound a number
- `lerp(a, b, t)` — linear interpolation
- `randomNormal(mean, stddev)` — Box-Muller transform
- `randomPoisson(lambda)` — for vehicle spawning

### `src/utils/colors.ts`
- `speedToColor(speed, maxSpeed)` — returns CSS color string
  - speed/maxSpeed = 1.0 → green `#22c55e`
  - speed/maxSpeed = 0.5 → yellow `#eab308`
  - speed/maxSpeed = 0.0 → red `#ef4444`
  - HSL interpolation for smooth gradient

## Tests

### `src/utils/__tests__/math.test.ts`
- `clamp`: values below min return min, above max return max, in-range unchanged
- `lerp`: lerp(0, 10, 0.5) = 5, lerp(a, b, 0) = a, lerp(a, b, 1) = b
- `randomNormal`: mean of 10000 samples ≈ target mean (within tolerance)
- `randomPoisson`: mean of samples ≈ lambda

### `src/utils/__tests__/colors.test.ts`
- speedToColor(maxSpeed, maxSpeed) returns green-ish
- speedToColor(0, maxSpeed) returns red-ish
- speedToColor(maxSpeed/2, maxSpeed) returns yellow-ish
- Handles edge cases (speed > maxSpeed, speed < 0)

## Verification
- `npm test` — all utility tests pass
