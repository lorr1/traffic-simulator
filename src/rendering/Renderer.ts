import { Camera } from './Camera';
import type { SimulationState } from '../types';
import { DEFAULT_PARAMS } from '../constants';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;

  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D rendering context');
    }
    this.ctx = ctx;
    this.camera = new Camera(
      canvas.width,
      canvas.height,
      DEFAULT_PARAMS.roadLengthMeters,
    );
  }

  draw(state: SimulationState): void {
    const { width, height } = this.ctx.canvas;

    // 1. Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // 2. Save state
    this.ctx.save();

    // 3. Apply camera transform
    this.camera.applyTransform(this.ctx);

    // 4. RoadRenderer.draw(ctx, ...) — added in commit 8
    // 5. VehicleRenderer.draw(ctx, vehicles) — added in commit 8

    // 6. Restore state
    this.ctx.restore();
  }

  getCamera(): Camera {
    return this.camera;
  }
}
