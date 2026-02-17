# Commit 10: Multi-Lane Road and Rendering

## Goal
Expand from 1 lane to N lanes (default 3). Vehicles now appear in different lanes. No lane-changing yet.

## What to implement

- **Update `Road.ts`**: Constructor takes laneCount, creates N lanes. `getNeighbors(vehicle, targetLane)` method for adjacent lane queries.
- **Update `Lane.ts`**: Add method to find nearest vehicles to a given x position in this lane (for MOBIL neighbor queries).
- **Update `RoadRenderer.ts`**: Draw N lanes with dashed markings between them, solid edges.
- **Update `VehicleRenderer.ts`**: Y position = laneIndex × laneWidth + offset.
- **Update `VehicleFactory.ts`**: Spawn into random lane (weighted: 50% rightmost, 30% middle, 20% leftmost for 3-lane).
- **Update constants**: `laneCount: 3`.

## Tests
- Existing Lane/Road tests still pass with multi-lane setup
- New test: getNeighbors returns correct leader/follower in adjacent lane

## Verification
- `npm run dev` → 3-lane road visible
- Vehicles driving in all 3 lanes independently
- Each lane has its own traffic dynamics
