# Commit 5: Road and VehicleFactory

## Goal
Implement the road (collection of lanes) and vehicle spawning/despawning logic.

## What to implement

### `src/simulation/Road.ts`
```typescript
export class Road {
  lanes: Lane[];
  length: number;  // meters

  constructor(length: number, laneCount: number)

  getLeader(vehicle: Vehicle): Vehicle | null
    // Delegates to vehicle's lane

  getFollower(vehicle: Vehicle): Vehicle | null

  getNeighbors(vehicle: Vehicle, targetLane: number): { leader: Vehicle | null, follower: Vehicle | null }
    // For MOBIL: find leader and follower in an adjacent lane near vehicle's x position

  getAllVehicles(): Vehicle[]

  changeLane(vehicle: Vehicle, targetLane: number): void
    // Remove from current lane, add to target lane, update vehicle.laneIndex

  resortAllLanes(): void
}
```

### `src/simulation/VehicleFactory.ts`
```typescript
export class VehicleFactory {
  private nextId: number = 0;
  private spawnAccumulator: number = 0;

  trySpawn(dt: number, road: Road, params: SimulationParams): void
    // Poisson process: spawnAccumulator += params.spawnRate × dt
    // While spawnAccumulator >= 1: attempt spawn, spawnAccumulator -= 1
    // Pick lane (weighted random, favor rightmost)
    // Check gap at road entrance (x ≈ 0): if frontmost vehicle in lane is far enough, spawn
    // New vehicle: x=0, speed=desiredSpeed, desiredSpeed=randomNormal(v0, 0.1×v0)

  despawn(road: Road): void
    // Remove all vehicles with x > road.length
}
```

## Tests: `src/simulation/__tests__/Road.test.ts`
- getLeader delegates correctly to Lane
- getNeighbors finds correct leader/follower in adjacent lane by position
- changeLane moves vehicle between lanes correctly
- getAllVehicles returns all vehicles across all lanes

## Tests: `src/simulation/__tests__/VehicleFactory.test.ts`
- Spawns at correct rate (run many steps, count spawned vehicles ≈ expected)
- Spawns with gap check (no spawn when entrance blocked)
- Deferred spawn when road entrance congested
- Despawns vehicles past road end
- Vehicle desiredSpeeds are randomized around v0

## Verification
- `npm test` — all Road and VehicleFactory tests pass
