# Commit 12: Integrate MOBIL into SimulationEngine

## Goal
Wire MOBIL into the simulation step so vehicles actually change lanes.

## What to implement

Update `SimulationEngine.step()`:
```
After computing IDM accelerations (step 2), before Euler integration (step 4):
  3. Shuffle vehicle order (Fisher-Yates)
  4. For each vehicle:
       decision = evaluateLaneChange(vehicle, leader, road, params)
       if decision.shouldChange:
         road.changeLane(vehicle, decision.targetLane)
```

Lane change is instant — vehicle teleports to new lane at same x position. This is standard in traffic simulation.

Update `Road.changeLane()` to handle the transfer: remove from old Lane, add to new Lane, update vehicle.laneIndex.

## Tests
- Run engine with a slow vehicle in lane 1, faster vehicle behind → faster vehicle changes to lane 0 or 2
- Run engine for many steps → no vehicles end up in invalid lanes (laneIndex out of bounds)
- High politeness simulation has fewer lane changes than low politeness

## Verification
- `npm run dev` → vehicles visibly change lanes to overtake slower traffic
- Natural lane organization emerges (slower right, faster left)
- No visual glitches during lane changes
