# Commit 15: Incident Placement UI

## Goal
Users can click on the road to place and configure incidents visually.

## What to implement

### `src/rendering/IncidentRenderer.ts`
```typescript
export class IncidentRenderer {
  static draw(ctx: CanvasRenderingContext2D, incidents: Incident[], laneWidth: number): void
    // For each incident:
    // 1. Red/orange pulsing zone on blocked lanes
    // 2. Warning triangle icon
    // 3. Translucent yellow rubbernecking zone on adjacent lanes
}
```

### `src/ui/IncidentControls.tsx`
Simple popover that appears on road click:
- Position display (read-only, from click)
- Lane checkboxes (which lanes to block)
- Severity slider (0-1)
- Duration input (seconds, or "Until removed")
- "Create" and "Cancel" buttons

Also: list of active incidents below control panel with "Remove" button for each.

### Wire into SimulationCanvas:
- onClick → camera.screenToWorld → determine road position → show IncidentControls popover
- On create → engine.addIncident(config)
- On remove → engine.removeIncident(id)

### Update Renderer.draw():
Add IncidentRenderer.draw() call.

## Tests
No unit tests — UI interaction verified manually.

## Verification
- `npm run dev` → click on road → popover appears → configure → create
- Incident marker visible on road
- Traffic queues upstream
- Vehicles change lanes to avoid blocked lane
- Shockwave propagates backward
- Remove incident → traffic slowly recovers
