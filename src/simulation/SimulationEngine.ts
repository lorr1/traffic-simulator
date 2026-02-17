import { Road } from './Road';
import { VehicleFactory } from './VehicleFactory';
import { computeAcceleration } from './models/IDMModel';
import { evaluateLaneChange } from './models/MOBILModel';
import type { SimulationParams, SimulationState, VehicleState } from '../types';
import { DEFAULT_PARAMS } from '../constants';

export class SimulationEngine {
  road: Road;
  vehicleFactory: VehicleFactory;
  params: SimulationParams;
  simulationTime: number = 0;
  private accumulator: number = 0;

  constructor(params: SimulationParams = DEFAULT_PARAMS) {
    this.params = { ...params };
    this.road = new Road(params.roadLengthMeters, params.laneCount);
    this.vehicleFactory = new VehicleFactory();
  }

  update(wallDeltaMs: number): void {
    const dt = this.params.dt;
    const scaledDelta = (wallDeltaMs / 1000) * this.params.speedMultiplier;
    this.accumulator += scaledDelta;

    // Cap accumulator to prevent spiral of death
    if (this.accumulator > 0.5) {
      this.accumulator = 0.5;
    }

    while (this.accumulator >= dt) {
      this.step(dt);
      this.accumulator -= dt;
    }
  }

  step(dt: number): void {
    // 1. Spawn vehicles
    this.vehicleFactory.trySpawn(dt, this.road, this.params);

    // 2. Compute IDM acceleration for each vehicle
    for (const lane of this.road.lanes) {
      for (const vehicle of lane.vehicles) {
        const leader = this.road.getLeader(vehicle);
        vehicle.acceleration = computeAcceleration(vehicle, leader, this.params);
      }
    }

    // 3. MOBIL lane changes (shuffle order to avoid bias)
    const allVehicles = this.road.getAllVehicles();
    for (let i = allVehicles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allVehicles[i], allVehicles[j]] = [allVehicles[j], allVehicles[i]];
    }
    for (const vehicle of allVehicles) {
      const leader = this.road.getLeader(vehicle);
      const decision = evaluateLaneChange(vehicle, leader, this.road, this.params);
      if (decision.shouldChange) {
        this.road.changeLane(vehicle, decision.targetLane);
      }
    }

    // 4. Euler integration
    for (const lane of this.road.lanes) {
      for (const vehicle of lane.vehicles) {
        vehicle.speed += vehicle.acceleration * dt;
        if (vehicle.speed < 0) {
          vehicle.speed = 0;
        }
        vehicle.x += vehicle.speed * dt;
      }
    }

    // 5. Re-sort lanes after position updates
    this.road.resortAllLanes();

    // 6. Remove vehicles past road end
    this.vehicleFactory.despawn(this.road);

    // 7. Advance simulation time
    this.simulationTime += dt;
  }

  getState(): SimulationState {
    const vehicles: VehicleState[] = this.road.getAllVehicles().map((v) => ({
      id: v.id,
      x: v.x,
      laneIndex: v.laneIndex,
      speed: v.speed,
      acceleration: v.acceleration,
      length: v.length,
      desiredSpeed: v.desiredSpeed,
    }));

    return { vehicles, simulationTime: this.simulationTime };
  }

  reset(): void {
    this.road = new Road(this.params.roadLengthMeters, this.params.laneCount);
    this.vehicleFactory = new VehicleFactory();
    this.simulationTime = 0;
    this.accumulator = 0;
  }

  setParams(params: Partial<SimulationParams>): void {
    this.params = { ...this.params, ...params };
  }
}
