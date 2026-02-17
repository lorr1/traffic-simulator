import type { VehicleState } from '../types';
import { speedToColor } from '../utils/colors';

const VEHICLE_WIDTH = 2.0; // meters
const CORNER_RADIUS = 0.5; // meters

export class VehicleRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    vehicles: VehicleState[],
    laneWidth: number,
    maxSpeed: number,
  ): void {
    for (const vehicle of vehicles) {
      const x = vehicle.x - vehicle.length / 2;
      const y = vehicle.laneIndex * laneWidth + (laneWidth - VEHICLE_WIDTH) / 2;
      const w = vehicle.length;
      const h = VEHICLE_WIDTH;
      const r = Math.min(CORNER_RADIUS, w / 2, h / 2);

      // Color based on speed
      ctx.fillStyle = speedToColor(vehicle.speed, maxSpeed);

      // Draw rounded rectangle
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.arcTo(x + w, y, x + w, y + r, r);
      ctx.lineTo(x + w, y + h - r);
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
      ctx.lineTo(x + r, y + h);
      ctx.arcTo(x, y + h, x, y + h - r, r);
      ctx.lineTo(x, y + r);
      ctx.arcTo(x, y, x + r, y, r);
      ctx.closePath();
      ctx.fill();

      // Direction indicator (small triangle at front)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      const triSize = Math.min(0.8, w * 0.2);
      const triX = x + w - triSize - 0.2;
      const triCenterY = y + h / 2;
      ctx.beginPath();
      ctx.moveTo(triX + triSize, triCenterY);
      ctx.lineTo(triX, triCenterY - triSize / 2);
      ctx.lineTo(triX, triCenterY + triSize / 2);
      ctx.closePath();
      ctx.fill();
    }
  }
}
