import type { SimulationParams } from '../types';
import { randomNormal } from '../utils/math';
import { Road } from './Road';
import { Vehicle } from './Vehicle';

export class VehicleFactory {
  private nextId: number = 0;
  private spawnAccumulator: number = 0;

  trySpawn(dt: number, road: Road, params: SimulationParams): void {
    this.spawnAccumulator += params.spawnRate * dt;

    while (this.spawnAccumulator >= 1) {
      this.spawnAccumulator -= 1;
      this.attemptSpawn(road, params);
    }
  }

  despawn(road: Road): void {
    for (const lane of road.lanes) {
      const toRemove: Vehicle[] = [];
      for (const v of lane.vehicles) {
        if (v.x > road.length) {
          toRemove.push(v);
        }
      }
      for (const v of toRemove) {
        lane.removeVehicle(v);
      }
    }
  }

  private attemptSpawn(road: Road, params: SimulationParams): void {
    const laneIndex = this.pickLane(road.lanes.length);
    const lane = road.lanes[laneIndex];

    // Check gap at entrance: last vehicle in sorted order (closest to x=0) must be far enough
    const minGap = params.minimumGap + params.vehicleLength;
    if (lane.vehicles.length > 0) {
      const last = lane.vehicles[lane.vehicles.length - 1];
      if (last.x < minGap) {
        return; // entrance blocked
      }
    }

    const desiredSpeed = Math.max(1, randomNormal(params.desiredSpeed, 0.1 * params.desiredSpeed));
    const vehicle = new Vehicle(
      this.nextId++,
      0,
      desiredSpeed,
      laneIndex,
      desiredSpeed,
      params.vehicleLength,
    );
    lane.addVehicle(vehicle);
  }

  /** Pick a lane with bias toward rightmost (higher index = more weight). */
  private pickLane(laneCount: number): number {
    // Weights: lane 0 gets weight 1, lane 1 gets weight 2, etc.
    const totalWeight = (laneCount * (laneCount + 1)) / 2;
    let r = Math.random() * totalWeight;
    for (let i = laneCount - 1; i >= 0; i--) {
      r -= i + 1;
      if (r <= 0) return i;
    }
    return 0;
  }
}
