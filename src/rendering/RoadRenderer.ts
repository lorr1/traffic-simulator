import type { OnRamp } from '../simulation/OnRamp';

const LANE_WIDTH = 3.7; // meters (standard lane width)
const SHOULDER_WIDTH = 1.5; // meters
const DASH_LENGTH = 3.0; // meters
const DASH_GAP = 9.0; // meters
const MARKING_WIDTH = 0.15; // meters

const ROAD_COLOR_NEAR = '#424d5e'; // lighter near bottom (closer edge)
const ROAD_COLOR_FAR = '#2d3544'; // darker far edge
const SHOULDER_COLOR = '#4b5563'; // lighter gray
const MARKING_COLOR = '#ffffff';
const RAMP_COLOR = '#3a4556';

export class RoadRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    roadLength: number,
    laneCount: number,
    laneWidth: number = LANE_WIDTH,
    onRamps: OnRamp[] = [],
  ): void {
    const roadHeight = laneCount * laneWidth;

    // 1. Road shoulders
    ctx.fillStyle = SHOULDER_COLOR;
    ctx.fillRect(0, -SHOULDER_WIDTH, roadLength, roadHeight + 2 * SHOULDER_WIDTH);

    // 2. Road surface with gradient (lighter near bottom = closer)
    const gradient = ctx.createLinearGradient(0, 0, 0, roadHeight);
    gradient.addColorStop(0, ROAD_COLOR_FAR);
    gradient.addColorStop(1, ROAD_COLOR_NEAR);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, roadLength, roadHeight);

    // 3. Solid white edge lines top and bottom
    ctx.strokeStyle = MARKING_COLOR;
    ctx.lineWidth = MARKING_WIDTH;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(roadLength, 0);
    ctx.moveTo(0, roadHeight);
    ctx.lineTo(roadLength, roadHeight);
    ctx.stroke();

    // 4. White dashed lane markings between lanes
    ctx.setLineDash([DASH_LENGTH, DASH_GAP]);
    for (let i = 1; i < laneCount; i++) {
      const y = i * laneWidth;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(roadLength, y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 5. On-ramps (merge into rightmost lane = bottom of road)
    for (const ramp of onRamps) {
      if (!ramp.enabled) continue;
      this.drawOnRamp(ctx, ramp, roadHeight, laneWidth);
    }
  }

  private static drawOnRamp(
    ctx: CanvasRenderingContext2D,
    ramp: OnRamp,
    roadHeight: number,
    laneWidth: number,
  ): void {
    const startX = ramp.startX;
    const endX = ramp.endX;
    const mergeY = roadHeight; // bottom edge of road (rightmost lane)
    const rampOffset = laneWidth * 1.5; // how far ramp extends below road

    // Ramp surface: tapered shape from narrow entry to full lane width at merge
    ctx.fillStyle = RAMP_COLOR;
    ctx.beginPath();
    // Start narrow at upstream end
    ctx.moveTo(startX, mergeY + rampOffset);
    ctx.lineTo(startX, mergeY + rampOffset - laneWidth * 0.3);
    // Widen to full lane at merge point
    ctx.lineTo(endX, mergeY);
    ctx.lineTo(endX, mergeY + laneWidth);
    // Bottom edge curves back
    ctx.lineTo(startX + (endX - startX) * 0.3, mergeY + rampOffset + laneWidth * 0.2);
    ctx.closePath();
    ctx.fill();

    // Ramp edge line
    ctx.strokeStyle = MARKING_COLOR;
    ctx.lineWidth = MARKING_WIDTH;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(startX, mergeY + rampOffset - laneWidth * 0.3);
    ctx.lineTo(endX, mergeY);
    ctx.stroke();

    // Dashed merge zone marking along the bottom road edge
    ctx.setLineDash([DASH_LENGTH, DASH_GAP]);
    ctx.strokeStyle = MARKING_COLOR;
    ctx.lineWidth = MARKING_WIDTH;
    ctx.beginPath();
    ctx.moveTo(startX, mergeY);
    ctx.lineTo(endX, mergeY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
