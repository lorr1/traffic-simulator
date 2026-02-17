# Commit 13: Incident Data Model and IncidentManager

## Goal
Implement incident logic: virtual obstacles for blocked lanes, rubbernecking for adjacent lanes.

## What to implement

### `src/simulation/incidents/Incident.ts`
```typescript
export class Incident {
  id: number;
  positionX: number;
  lanesBlocked: number[];
  severity: number;           // 0-1
  startTime: number;
  duration: number;           // seconds, -1 = manual removal
  rubberneckingFactor: number; // speed multiplier (0.5-1.0)
  rubberneckingRadius: number; // computed from severity

  isLaneBlocked(laneIndex: number): boolean
  isExpired(currentTime: number): boolean
}
```

### `src/simulation/incidents/IncidentManager.ts`
```typescript
export class IncidentManager {
  private incidents: Incident[] = [];

  addIncident(config: IncidentConfig): Incident
  removeIncident(id: number): void
  getActiveIncidents(): Incident[]

  update(simulationTime: number): void
    // Remove expired incidents

  getVirtualObstacle(vehicle: Vehicle): Vehicle | null
    // If vehicle's lane is blocked by an incident ahead, return a
    // virtual stopped vehicle at the incident position.
    // Returns the CLOSEST such obstacle if multiple incidents.

  getSpeedReduction(vehicle: Vehicle): number
    // For rubbernecking: if vehicle is near an incident in an adjacent lane,
    // return speed factor < 1. Otherwise return 1.0.
    // Factor decreases linearly from rubberneckingFactor at incident to 1.0 at radius edge.
}
```

## Tests: `src/simulation/incidents/__tests__/IncidentManager.test.ts`

- **Virtual obstacle**: Vehicle in blocked lane ahead of incident → returns virtual vehicle at incident pos. Vehicle behind incident → no obstacle (already passed).
- **Unblocked lane**: Vehicle in unblocked lane → no virtual obstacle
- **Rubbernecking**: Vehicle adjacent to incident within radius → factor < 1. Vehicle at incident position → factor = rubberneckingFactor. Vehicle at radius edge → factor ≈ 1.0. Vehicle beyond radius → factor = 1.0.
- **Expiry**: Incident with duration=60, at time 70 → removed by update()
- **Manual removal**: Incident with duration=-1 → never auto-expires
- **Multiple incidents**: Closest virtual obstacle is returned. Rubbernecking stacks (minimum factor).

## Verification
- `npm test` — IncidentManager tests pass
