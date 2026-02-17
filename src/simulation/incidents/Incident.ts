import type { IncidentConfig } from '../../types';

const BASE_RUBBERNECKING_RADIUS = 100; // meters
const MAX_RUBBERNECKING_RADIUS = 300; // meters

export class Incident {
  id: number;
  positionX: number;
  lanesBlocked: number[];
  severity: number;
  startTime: number;
  duration: number;
  rubberneckingFactor: number;
  rubberneckingRadius: number;

  constructor(config: IncidentConfig) {
    this.id = config.id;
    this.positionX = config.positionX;
    this.lanesBlocked = config.lanesBlocked;
    this.severity = config.severity;
    this.startTime = config.startTime;
    this.duration = config.duration;
    this.rubberneckingFactor = config.rubberneckingFactor;
    this.rubberneckingRadius =
      BASE_RUBBERNECKING_RADIUS +
      config.severity * (MAX_RUBBERNECKING_RADIUS - BASE_RUBBERNECKING_RADIUS);
  }

  isLaneBlocked(laneIndex: number): boolean {
    return this.lanesBlocked.includes(laneIndex);
  }

  isExpired(currentTime: number): boolean {
    if (this.duration === -1) return false;
    return currentTime >= this.startTime + this.duration;
  }
}
