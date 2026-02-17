# Commit 3: Vehicle and Lane Data Structures

## Goal
Implement the core data structures for individual vehicles and the lane that holds them in sorted order.

## What to implement

### `src/simulation/Vehicle.ts`
```typescript
export class Vehicle {
  id: number;
  x: number;              // position along road (meters)
  speed: number;          // m/s
  acceleration: number;   // m/s²
  laneIndex: number;
  length: number;         // meters (default 5)
  desiredSpeed: number;   // per-vehicle (randomized around v0)

  constructor(id, x, speed, laneIndex, desiredSpeed, length?)
}
```

### `src/simulation/Lane.ts`
```typescript
export class Lane {
  index: number;
  vehicles: Vehicle[];    // sorted by x DESCENDING (front of road first)

  addVehicle(vehicle: Vehicle): void
    // Insert in correct sorted position (binary search or linear scan)

  removeVehicle(vehicle: Vehicle): void
    // Remove and maintain order

  getLeaderOf(vehicle: Vehicle): Vehicle | null
    // Return vehicle immediately ahead (lower array index)
    // O(1) since vehicles are sorted

  getFollowerOf(vehicle: Vehicle): Vehicle | null
    // Return vehicle immediately behind (higher array index)

  getVehicleAhead(x: number): Vehicle | null
    // Find first vehicle ahead of position x (for spawn gap check)

  resort(): void
    // After position updates, re-sort. Nearly sorted → O(n) insertion sort
}
```

Key design: vehicles sorted by x descending means index 0 is the frontmost vehicle. `getLeaderOf(v)` returns `vehicles[indexOf(v) - 1]`. This makes the most common operation (finding the leader for IDM) O(1).

## Tests: `src/simulation/__tests__/Lane.test.ts`

- **Sort invariant**: Adding vehicles at various positions maintains descending x order
- **getLeaderOf**: Returns vehicle with next higher x. Returns null for frontmost vehicle.
- **getFollowerOf**: Returns vehicle with next lower x. Returns null for rearmost vehicle.
- **removeVehicle**: Removes correctly, remaining vehicles still sorted
- **resort**: After modifying vehicle positions, resort fixes order
- **getVehicleAhead**: Returns correct vehicle for given x position. Returns null if no vehicle ahead.
- **Empty lane**: All queries return null

## Verification
- `npm test` — Lane tests pass
