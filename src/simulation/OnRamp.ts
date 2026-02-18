import { Lane } from './Lane';

const DEFAULT_ACCEL_LANE_LENGTH = 300; // meters
const DEFAULT_SPAWN_RATE = 0.3; // veh/s

export class OnRamp {
  positionX: number;
  accelerationLaneLength: number;
  spawnRate: number;
  lane: Lane;
  enabled: boolean;

  constructor(
    positionX: number,
    accelerationLaneLength: number = DEFAULT_ACCEL_LANE_LENGTH,
    spawnRate: number = DEFAULT_SPAWN_RATE,
  ) {
    this.positionX = positionX;
    this.accelerationLaneLength = accelerationLaneLength;
    this.spawnRate = spawnRate;
    this.lane = new Lane(-1); // acceleration lane, not part of main road indices
    this.enabled = true;
  }

  /** Start x of the acceleration lane (upstream of merge point) */
  get startX(): number {
    return this.positionX - this.accelerationLaneLength;
  }

  /** End x of the acceleration lane (merge point) */
  get endX(): number {
    return this.positionX;
  }
}
