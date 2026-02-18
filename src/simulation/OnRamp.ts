import { Lane } from './Lane';
import { Vehicle } from './Vehicle';
import { Road } from './Road';
import { computeAcceleration, computeIDMAcceleration } from './models/IDMModel';
import { randomNormal } from '../utils/math';
import type { SimulationParams } from '../types';

const DEFAULT_ACCEL_LANE_LENGTH = 300; // meters
const DEFAULT_SPAWN_RATE = 0.3; // veh/s

let nextRampVehicleId = 100_000; // high offset to avoid ID collisions

export class OnRamp {
  positionX: number;
  accelerationLaneLength: number;
  spawnRate: number;
  lane: Lane;
  enabled: boolean;
  private spawnAccumulator: number = 0;

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

  trySpawn(dt: number, params: SimulationParams): void {
    if (!this.enabled) return;

    this.spawnAccumulator += this.spawnRate * dt;

    while (this.spawnAccumulator >= 1) {
      this.spawnAccumulator -= 1;
      this.attemptSpawn(params);
    }
  }

  private attemptSpawn(params: SimulationParams): void {
    const spawnX = this.startX;
    const minGap = params.minimumGap + params.vehicleLength;

    // Check if entrance is clear
    if (this.lane.vehicles.length > 0) {
      const last = this.lane.vehicles[this.lane.vehicles.length - 1];
      if (last.x - spawnX < minGap) {
        return; // entrance blocked
      }
    }

    const desiredSpeed = Math.max(1, randomNormal(params.desiredSpeed, 0.1 * params.desiredSpeed));
    const initialSpeed = desiredSpeed * 0.5; // enter ramp at lower speed
    const vehicle = new Vehicle(
      nextRampVehicleId++,
      spawnX,
      initialSpeed,
      -1, // ramp lane index
      desiredSpeed,
      params.vehicleLength,
    );
    this.lane.addVehicle(vehicle);
  }

  stepVehicles(dt: number, mainRoad: Road, params: SimulationParams): void {
    if (!this.enabled) return;

    const mergeLaneIndex = mainRoad.lanes.length - 1; // rightmost lane
    const mergeLane = mainRoad.lanes[mergeLaneIndex];
    const toMerge: Vehicle[] = [];

    // 1. Compute acceleration and check merge for each ramp vehicle
    for (const vehicle of this.lane.vehicles) {
      // IDM: follow leader in acceleration lane
      const leader = this.lane.getLeaderOf(vehicle);
      vehicle.acceleration = computeAcceleration(vehicle, leader, params);

      // Forced yield: if near end of acceleration lane and can't merge, must stop
      const distToEnd = this.endX - vehicle.x;
      if (distToEnd < params.vehicleLength * 2 && distToEnd > 0) {
        // Create a virtual stopped vehicle at the end of the ramp
        const stopAccel = computeIDMAcceleration(
          vehicle.speed,
          vehicle.desiredSpeed,
          Math.max(distToEnd - params.vehicleLength, 0.1),
          0, // stopped obstacle
          params,
        );
        vehicle.acceleration = Math.min(vehicle.acceleration, stopAccel);
      }

      // Attempt merge: check gap in rightmost main road lane
      if (vehicle.x >= this.startX && vehicle.x <= this.endX) {
        if (this.canMerge(vehicle, mergeLane, params)) {
          toMerge.push(vehicle);
        }
      }
    }

    // 2. Execute merges
    for (const vehicle of toMerge) {
      this.lane.removeVehicle(vehicle);
      vehicle.laneIndex = mergeLaneIndex;
      mergeLane.addVehicle(vehicle);
    }

    // 3. Euler integration for remaining ramp vehicles
    for (const vehicle of this.lane.vehicles) {
      vehicle.speed += vehicle.acceleration * dt;
      if (vehicle.speed < 0) vehicle.speed = 0;
      vehicle.x += vehicle.speed * dt;
    }

    // 4. Remove vehicles past end of ramp that couldn't merge
    const toRemove: Vehicle[] = [];
    for (const vehicle of this.lane.vehicles) {
      if (vehicle.x > this.endX + params.vehicleLength) {
        toRemove.push(vehicle);
      }
    }
    for (const v of toRemove) {
      this.lane.removeVehicle(v);
    }

    // 5. Re-sort
    this.lane.resort();
  }

  private canMerge(vehicle: Vehicle, mergeLane: Lane, params: SimulationParams): boolean {
    // Find leader and follower in merge lane at vehicle's position
    let leader: Vehicle | null = null;
    let follower: Vehicle | null = null;

    for (let i = mergeLane.vehicles.length - 1; i >= 0; i--) {
      const v = mergeLane.vehicles[i];
      if (v.x >= vehicle.x) {
        leader = v;
      } else {
        follower = v;
        break;
      }
    }

    // Check gap to leader
    if (leader !== null) {
      const gapToLeader = leader.x - leader.length - vehicle.x;
      if (gapToLeader < params.minimumGap) return false;
    }

    // Check gap to follower
    if (follower !== null) {
      const gapToFollower = vehicle.x - vehicle.length - follower.x;
      if (gapToFollower < params.minimumGap) return false;

      // Safety: follower must not need to brake harder than safe deceleration
      const followerAccelAfter = computeIDMAcceleration(
        follower.speed,
        follower.desiredSpeed,
        gapToFollower,
        vehicle.speed,
        params,
      );
      if (followerAccelAfter < -params.safeDeceleration) return false;
    }

    return true;
  }
}
