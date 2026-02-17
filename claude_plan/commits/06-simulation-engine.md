# Commit 6: SimulationEngine (Single Lane, No Rendering)

## Goal
Wire everything together into the main simulation loop. After this commit, the simulation runs headlessly and produces correct physics.

## What to implement

### `src/simulation/SimulationEngine.ts`
```typescript
export class SimulationEngine {
  road: Road;
  vehicleFactory: VehicleFactory;
  params: SimulationParams;
  simulationTime: number = 0;
  private accumulator: number = 0;

  constructor(params: SimulationParams)

  update(wallDeltaMs: number): void
    // Fixed-timestep accumulator pattern
    // Cap accumulator at 0.5s
    // Run step(dt) until accumulator < dt

  step(dt: number): void
    // 1. vehicleFactory.trySpawn(dt, road, params)
    // 2. For each vehicle: compute IDM acceleration (from leader)
    // 3. Euler integration: speed += accel*dt, x += speed*dt, clamp speed >= 0
    // 4. road.resortAllLanes()
    // 5. vehicleFactory.despawn(road)
    // 6. simulationTime += dt

  getState(): { vehicles: VehicleState[], simulationTime: number }

  reset(): void

  setParams(params: Partial<SimulationParams>): void
}
```

Note: MOBIL and incidents not integrated yet — added in later commits.

## Tests: `src/simulation/__tests__/SimulationEngine.test.ts`

- **Vehicles move forward**: After 100 steps, spawned vehicles have x > 0
- **Car following**: Place two vehicles — follower decelerates when close to leader
- **No collisions**: Run 1000 steps with high spawn rate, verify no vehicle's rear overlaps another's front
- **Speed non-negative**: After many steps, all vehicles have speed >= 0
- **Accumulator**: Calling update(16) then update(17) produces same result as one update(33)
- **Speed multiplier**: At 2x speed, simulation time advances twice as fast per wall-clock ms
- **Reset**: After reset, no vehicles, simulationTime = 0
- **Despawn**: Vehicles that reach road end are removed

## Verification
- `npm test` — SimulationEngine tests pass
- Can instantiate engine, run 1000 steps, inspect state programmatically
