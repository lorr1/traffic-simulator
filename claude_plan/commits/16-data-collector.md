# Commit 16: DataCollector

## Goal
Sample traffic state at regular intervals for analytics charts.

## What to implement

### `src/analytics/DataCollector.ts`
```typescript
export class DataCollector {
  private segmentLength: number = 100; // meters
  private sampleInterval: number = 0.5; // sim-seconds
  private lastSampleTime: number = 0;
  private history: RoadSegmentData[][] = []; // ring buffer
  private maxHistory: number = 600; // 5 min at 0.5s intervals

  shouldSample(simulationTime: number): boolean
  sample(vehicles: VehicleState[], roadLength: number): RoadSegmentData[]
    // For each segment:
    //   density = (count / segmentLength) × 1000  (veh/km)
    //   avgSpeed = mean of vehicle speeds in segment (m/s)
    //   flow = density × avgSpeed × 3.6  (veh/hr, converting m/s to km/h)

  getHistory(): RoadSegmentData[][]
  getLatest(): RoadSegmentData[] | null
  clear(): void
}
```

## Tests: `src/analytics/__tests__/DataCollector.test.ts`

- **Density**: 5 vehicles in 100m segment → density = 50 veh/km
- **Flow**: density × speed relationship holds
- **Empty segment**: 0 vehicles → density=0, flow=0, speed=0
- **Ring buffer**: After 601 samples, oldest is evicted, length stays at 600
- **Sample timing**: Only samples when interval has elapsed

## Verification
- `npm test` — DataCollector tests pass
