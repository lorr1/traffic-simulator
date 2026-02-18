import type { SimulationParams } from '../types';

const LANE_WIDTH = 3.7; // meters (standard lane width)
const SHOULDER_WIDTH = 1.5; // meters
const DASH_LENGTH = 3.0; // meters
const DASH_GAP = 9.0; // meters
const MARKING_WIDTH = 0.15; // meters

const ROAD_COLOR_NEAR = '#424d5e'; // lighter near bottom (closer edge)
const ROAD_COLOR_FAR = '#2d3544'; // darker far edge
const SHOULDER_COLOR = '#4b5563'; // lighter gray
const MARKING_COLOR = '#ffffff';

export class RoadRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    roadLength: number,
    laneCount: number,
    laneWidth: number = LANE_WIDTH,
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
  }
}
