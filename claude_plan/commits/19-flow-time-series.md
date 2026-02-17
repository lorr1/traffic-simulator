# Commit 19: Flow Time Series Chart

## Goal
Line chart showing flow at a measurement point over time.

## What to implement

### `src/analytics/FlowTimeSeries.tsx`
- Recharts LineChart
- X axis: simulation time (seconds)
- Y axis: flow (veh/hr)
- Measurement point: road midpoint (configurable later)
- Shows last 5 minutes of data
- Smooth line with dot at latest value

This clearly shows:
- Steady flow during normal traffic
- Sharp drop when incident starts
- Gradual recovery after incident clears
- Oscillations during congestion

## Tests
No unit tests — visual verification.

## Verification
- `npm run dev` → line chart shows steady flow
- Place incident upstream of midpoint → flow drops
- Remove incident → flow recovers
- Flow value matches fundamental diagram qualitatively
