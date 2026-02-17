# Commit 7: Camera and Base Renderer

## Goal
Set up the coordinate transform system and rendering orchestrator. No visual output yet — just the infrastructure.

## What to implement

### `src/rendering/Camera.ts`
```typescript
export class Camera {
  x: number = 0;         // pan offset (world coords)
  y: number = 0;
  zoom: number = 1;
  private canvasWidth: number;
  private canvasHeight: number;

  // Pixels per meter at zoom=1
  private baseScale: number;

  constructor(canvasWidth, canvasHeight, roadLength)
    // Calculate baseScale so full road fits in canvas width

  worldToScreen(wx: number, wy: number): { x: number, y: number }
  screenToWorld(sx: number, sy: number): { x: number, y: number }

  applyTransform(ctx: CanvasRenderingContext2D): void
    // ctx.translate + ctx.scale based on pan and zoom

  handlePan(dx: number, dy: number): void
  handleZoom(delta: number, centerX: number, centerY: number): void

  resize(width: number, height: number): void
}
```

### `src/rendering/Renderer.ts`
```typescript
export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;

  constructor(canvas: HTMLCanvasElement)

  draw(state: SimulationState): void
    // 1. Clear canvas
    // 2. ctx.save()
    // 3. camera.applyTransform(ctx)
    // 4. RoadRenderer.draw(ctx, ...)
    // 5. VehicleRenderer.draw(ctx, vehicles)
    // 6. ctx.restore()

  getCamera(): Camera
}
```

## Tests: `src/rendering/__tests__/Camera.test.ts`
- worldToScreen and screenToWorld are inverses (round-trip)
- Zoom in increases pixel scale
- Zoom out decreases pixel scale
- Pan shifts world origin
- Resize updates canvas dimensions

## Verification
- `npm test` — Camera tests pass
