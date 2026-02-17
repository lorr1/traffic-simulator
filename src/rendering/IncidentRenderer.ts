import type { Incident } from '../simulation/incidents/Incident';

const LANE_WIDTH = 3.7; // meters

export class IncidentRenderer {
  static draw(
    ctx: CanvasRenderingContext2D,
    incidents: Incident[],
    laneWidth: number = LANE_WIDTH,
    time: number = 0,
  ): void {
    for (const incident of incidents) {
      // 1. Translucent yellow rubbernecking zone on adjacent lanes
      this.drawRubberneckingZone(ctx, incident, laneWidth);

      // 2. Red/orange pulsing zone on blocked lanes
      this.drawBlockedZone(ctx, incident, laneWidth, time);

      // 3. Warning triangle icon
      this.drawWarningIcon(ctx, incident, laneWidth);
    }
  }

  private static drawBlockedZone(
    ctx: CanvasRenderingContext2D,
    incident: Incident,
    laneWidth: number,
    time: number,
  ): void {
    const pulseAlpha = 0.25 + 0.15 * Math.sin(time * 3);
    const zoneWidth = 20; // meters

    for (const laneIndex of incident.lanesBlocked) {
      const y = laneIndex * laneWidth;

      ctx.fillStyle = `rgba(220, 38, 38, ${pulseAlpha})`;
      ctx.fillRect(
        incident.positionX - zoneWidth / 2,
        y,
        zoneWidth,
        laneWidth,
      );

      // Red border
      ctx.strokeStyle = `rgba(220, 38, 38, ${pulseAlpha + 0.2})`;
      ctx.lineWidth = 0.15;
      ctx.setLineDash([]);
      ctx.strokeRect(
        incident.positionX - zoneWidth / 2,
        y,
        zoneWidth,
        laneWidth,
      );
    }
  }

  private static drawRubberneckingZone(
    ctx: CanvasRenderingContext2D,
    incident: Incident,
    laneWidth: number,
  ): void {
    const radius = incident.rubberneckingRadius;

    // Find adjacent lanes (not blocked)
    const adjacentLanes = new Set<number>();
    for (const blocked of incident.lanesBlocked) {
      if (!incident.isLaneBlocked(blocked - 1) && blocked - 1 >= 0) {
        adjacentLanes.add(blocked - 1);
      }
      if (!incident.isLaneBlocked(blocked + 1)) {
        adjacentLanes.add(blocked + 1);
      }
    }

    for (const laneIndex of adjacentLanes) {
      const y = laneIndex * laneWidth;

      ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
      ctx.fillRect(
        incident.positionX - radius,
        y,
        radius * 2,
        laneWidth,
      );
    }
  }

  private static drawWarningIcon(
    ctx: CanvasRenderingContext2D,
    incident: Incident,
    laneWidth: number,
  ): void {
    // Find center Y of blocked lanes
    const minLane = Math.min(...incident.lanesBlocked);
    const maxLane = Math.max(...incident.lanesBlocked);
    const centerY = (minLane + maxLane + 1) * laneWidth / 2;
    const x = incident.positionX;
    const size = laneWidth * 0.6;

    // Warning triangle
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(x, centerY - size / 2);
    ctx.lineTo(x - size / 2, centerY + size / 2);
    ctx.lineTo(x + size / 2, centerY + size / 2);
    ctx.closePath();
    ctx.fill();

    // Exclamation mark
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold ${size * 0.5}px sans-serif`;
    ctx.fillText('!', x, centerY + size * 0.1);
  }
}
