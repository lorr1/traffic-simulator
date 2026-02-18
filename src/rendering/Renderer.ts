import { Camera } from './Camera';
import { RoadRenderer } from './RoadRenderer';
import { VehicleRenderer } from './VehicleRenderer';
import { IncidentRenderer } from './IncidentRenderer';
import type { Incident } from '../simulation/incidents/Incident';
import type { OnRamp } from '../simulation/OnRamp';
import type { SimulationState } from '../types';
import { DEFAULT_PARAMS } from '../constants';

const LANE_WIDTH = 3.7; // meters

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

  draw(state: SimulationState, incidents: Incident[] = [], onRamps: OnRamp[] = []): void {
    const { width, height } = this.ctx.canvas;

    // 1. Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // 2. Save state
    this.ctx.save();

    // 3. Apply camera transform
    this.camera.applyTransform(this.ctx);

    // 4. Draw road
    RoadRenderer.draw(
      this.ctx,
      DEFAULT_PARAMS.roadLengthMeters,
      DEFAULT_PARAMS.laneCount,
      LANE_WIDTH,
      onRamps,
    );

    // 5. Draw incidents
    IncidentRenderer.draw(
      this.ctx,
      incidents,
      LANE_WIDTH,
      state.simulationTime,
    );

    // 6. Draw vehicles
    VehicleRenderer.draw(
      this.ctx,
      state.vehicles,
      LANE_WIDTH,
      DEFAULT_PARAMS.desiredSpeed,
    );

    // 7. Restore state
    this.ctx.restore();
  }

  getCamera(): Camera {
    return this.camera;
  }
}
