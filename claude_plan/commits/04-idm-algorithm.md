# Commit 4: IDM (Intelligent Driver Model) Algorithm

## Goal
Implement the core car-following physics as a pure function. This is the mathematical heart of the simulation.

## What to implement

### `src/simulation/models/IDMModel.ts`
```typescript
export function computeIDMAcceleration(
  speed: number,            // current vehicle speed (m/s)
  desiredSpeed: number,     // v0 for this vehicle (m/s)
  gap: number,              // bumper-to-bumper distance to leader (m)
  leaderSpeed: number,      // leader's speed (m/s)
  params: SimulationParams, // global params (a, b, T, s0)
  speedFactor: number = 1.0 // rubbernecking reduction (1.0 = normal)
): number
```

Implementation:
```
v = speed
v0_eff = desiredSpeed × speedFactor
a = params.maxAcceleration
b = params.comfortDeceleration
s0 = params.minimumGap
T = params.timeHeadway

// Free-road term
freeRoad = 1 - (v / v0_eff)^4

// If no leader (gap = Infinity), return a × freeRoad

// Desired gap
Δv = v - leaderSpeed
s_star = s0 + max(0, v × T + v × Δv / (2 × √(a × b)))

// Interaction term
interaction = (s_star / max(gap, 0.1))^2

return a × (freeRoad - interaction)
```

Also export a convenience wrapper:
```typescript
export function computeAcceleration(
  vehicle: Vehicle,
  leader: Vehicle | null,
  params: SimulationParams,
  speedFactor?: number
): number
```
This extracts gap, speed, leaderSpeed from the Vehicle objects and calls the core function.

## Tests: `src/simulation/models/__tests__/IDMModel.test.ts`

**Free road (no leader):**
- Vehicle at v << v0: acceleration ≈ a (strong acceleration)
- Vehicle at v = v0: acceleration ≈ 0 (at desired speed)
- Vehicle at v > v0: acceleration < 0 (slowing to desired speed)

**Following at equilibrium:**
- Vehicle at same speed as leader, at equilibrium gap: acceleration ≈ 0

**Braking scenarios:**
- Gap much smaller than desired: strong negative acceleration
- Leader suddenly slower (approaching): negative acceleration proportional to Δv
- Gap = s0 (minimum): strong braking

**Speed factor:**
- speedFactor = 0.5 → effective desired speed halved → vehicle decelerates when at original v0

**Edge cases:**
- gap = 0.1 (very small): produces large negative but finite acceleration
- speed = 0: no division by zero, returns reasonable positive acceleration
- Δv negative (leader faster): s_star reduced, less braking

**Quantitative spot checks:**
- Known parameter set from IDM literature, verify numerical output matches expected value

## Verification
- `npm test` — all IDM tests pass
