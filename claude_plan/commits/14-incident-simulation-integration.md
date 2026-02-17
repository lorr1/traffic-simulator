# Commit 14: Integrate Incidents into Simulation

## Goal
Make incidents affect vehicle behavior through the existing IDM and MOBIL models.

## What to implement

Update `SimulationEngine`:
- Add `incidentManager: IncidentManager` field
- Expose `addIncident(config)` and `removeIncident(id)` methods

Update `step()`:
```
2. For each vehicle:
     actualLeader = road.getLeader(vehicle)
     virtualObstacle = incidentManager.getVirtualObstacle(vehicle)
     effectiveLeader = closer of (actualLeader, virtualObstacle)
     speedFactor = incidentManager.getSpeedReduction(vehicle)
     vehicle.acceleration = IDM.compute(vehicle, effectiveLeader, params, speedFactor)
```

Update MOBIL integration:
- When evaluating lane change near an incident, add a bias: if current lane is blocked ahead, increase incentive to change away (add bonus to `gain`)
- Prevent lane changes INTO a blocked lane

Update `step()` order:
```
6. incidentManager.update(simulationTime)
```

## Tests
- Vehicle approaching blocked lane decelerates to stop
- Vehicle in blocked lane attempts lane change before reaching incident
- Vehicle in adjacent lane slows due to rubbernecking
- After incident expires, traffic resumes

## Verification
- `npm test` — all tests pass including new integration tests
- Can programmatically add incident and verify queue forms in engine state
