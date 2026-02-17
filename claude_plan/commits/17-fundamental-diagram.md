# Commit 17: Fundamental Diagram Chart

## Goal
Real-time scatter plot of flow vs density, the signature visualization of traffic flow theory.

## What to implement

### `src/hooks/useDataCollector.ts`
```typescript
export function useDataCollector(engine: RefObject<SimulationEngine>) {
  const collectorRef = useRef(new DataCollector());
  const [chartData, setChartData] = useState<...>(...);

  // Called from the rAF loop: check if should sample, accumulate data
  // Return chart-ready data arrays
}
```

### `src/analytics/FundamentalDiagram.tsx`
- Recharts ScatterChart
- X axis: Density (veh/km), range 0-200
- Y axis: Flow (veh/hr), range 0-3000
- Points colored by age (recent = bright blue, old = faded gray)
- As simulation runs, the inverted-V shape emerges
- When incident occurs, points migrate to lower-right (high density, low flow)

## Tests
No unit tests — visual chart verified manually.

## Verification
- `npm run dev` → scatter plot populates as simulation runs
- Free-flowing traffic: points cluster in upper-left (low density, moderate flow)
- Heavy traffic: points spread along the inverted-V curve
- Incident: visible shift toward congested branch
