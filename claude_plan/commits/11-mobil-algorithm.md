# Commit 11: MOBIL Lane-Change Algorithm

## Goal
Implement MOBIL as a pure function. Not yet integrated into the simulation loop.

## What to implement

### `src/simulation/models/MOBILModel.ts`
```typescript
export interface LaneChangeDecision {
  shouldChange: boolean;
  targetLane: number;
}

export function evaluateLaneChange(
  vehicle: Vehicle,
  currentLeader: Vehicle | null,
  road: Road,
  params: SimulationParams
): LaneChangeDecision
```

Algorithm:
```
For each adjacent lane (left, right):
  1. Find new leader and new follower in target lane
  2. SAFETY: Compute new follower's acceleration if vehicle moved in
     - If newFollowerAccel < -params.safeDeceleration → UNSAFE, skip

  3. INCENTIVE:
     - currentAccel = IDM(vehicle, currentLeader)
     - newAccel = IDM(vehicle, newLeader)
     - newFollowerAccelBefore = IDM(newFollower, newLeader)  [before lane change]
     - newFollowerAccelAfter = IDM(newFollower, vehicle)     [after lane change]
     - gain = (newAccel - currentAccel) - p × (newFollowerAccelAfter - newFollowerAccelBefore)
     - If gain > Δa_th → lane change is beneficial

Pick the adjacent lane with highest gain (if any passes both criteria).
```

## Tests: `src/simulation/models/__tests__/MOBILModel.test.ts`

- **No change — equal lanes**: Vehicle with similar leaders in both adjacent lanes → no change
- **Change to faster lane**: Slow leader in current lane, fast/no leader in adjacent → changes
- **Safety violation**: Adjacent lane has close fast follower → no change (would cause dangerous braking)
- **Politeness effect**: Same setup, high politeness → no change; low politeness → changes
- **Boundary**: Vehicle in leftmost lane can't go further left. Rightmost can't go further right.
- **No follower in target**: Empty target lane → always safe
- **Threshold**: Marginal benefit below Δa_th → no change

## Verification
- `npm test` — MOBIL tests pass
