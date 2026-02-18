import { Road } from './Road';
import { OnRamp } from './OnRamp';
import { VehicleFactory } from './VehicleFactory';
import { IncidentManager } from './incidents/IncidentManager';
import { computeAcceleration } from './models/IDMModel';
import { evaluateLaneChange } from './models/MOBILModel';
import type { SimulationParams, SimulationState, VehicleState, IncidentConfig } from '../types';
import { DEFAULT_PARAMS } from '../constants';

export class SimulationEngine {
  road: Road;
  vehicleFactory: VehicleFactory;
  incidentManager: IncidentManager;
  params: SimulationParams;
  simulationTime: number = 0;
  private accumulator: number = 0;

  constructor(params: SimulationParams = DEFAULT_PARAMS) {
    this.params = { ...params };
    this.road = new Road(params.roadLengthMeters, params.laneCount);
    this.vehicleFactory = new VehicleFactory();
    this.incidentManager = new IncidentManager();

    // Default on-ramp at 1/3 of road length
    const ramp = new OnRamp(Math.round(params.roadLengthMeters / 3));
    this.road.addOnRamp(ramp);
  }

  addIncident(config: IncidentConfig) {
    return this.incidentManager.addIncident(config);
  }

  removeIncident(id: number) {
    this.incidentManager.removeIncident(id);
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

    // 2. Compute IDM acceleration for each vehicle (with incident effects)
    for (const lane of this.road.lanes) {
      for (const vehicle of lane.vehicles) {
        const actualLeader = this.road.getLeader(vehicle);
        const virtualObstacle = this.incidentManager.getVirtualObstacle(vehicle);

        // Use the closer of actual leader and virtual obstacle
        let effectiveLeader = actualLeader;
        if (virtualObstacle !== null) {
          if (actualLeader === null || virtualObstacle.x < actualLeader.x) {
            effectiveLeader = virtualObstacle;
          }
        }

        const speedFactor = this.incidentManager.getSpeedReduction(vehicle);
        vehicle.acceleration = computeAcceleration(
          vehicle,
          effectiveLeader,
          this.params,
          speedFactor,
        );
      }
    }

    // 3. MOBIL lane changes (shuffle order to avoid bias)
    const allVehicles = this.road.getAllVehicles();
    for (let i = allVehicles.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allVehicles[i], allVehicles[j]] = [allVehicles[j], allVehicles[i]];
    }

    // Build set of blocked lanes from active incidents for MOBIL
    const blockedLanes = new Set<number>();
    for (const incident of this.incidentManager.getActiveIncidents()) {
      for (const lane of incident.lanesBlocked) {
        blockedLanes.add(lane);
      }
    }

    for (const vehicle of allVehicles) {
      const leader = this.road.getLeader(vehicle);
      const virtualObstacle = this.incidentManager.getVirtualObstacle(vehicle);
      const incidentAhead = virtualObstacle !== null;

      // Use effective leader for MOBIL evaluation too
      let effectiveLeader = leader;
      if (virtualObstacle !== null) {
        if (leader === null || virtualObstacle.x < leader.x) {
          effectiveLeader = virtualObstacle;
        }
      }

      const decision = evaluateLaneChange(
        vehicle,
        effectiveLeader,
        this.road,
        this.params,
        { blockedLanes, incidentAhead },
      );
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

    // 7. On-ramp spawning and merge
    for (const ramp of this.road.onRamps) {
      ramp.trySpawn(dt, this.params);
      ramp.stepVehicles(dt, this.road, this.params);
    }

    // 8. Update incidents (remove expired)
    this.incidentManager.update(this.simulationTime);

    // 9. Advance simulation time
    this.simulationTime += dt;
  }

  getState(): SimulationState {
    const toState = (v: { id: number; x: number; laneIndex: number; speed: number; acceleration: number; length: number; desiredSpeed: number }) => ({
      id: v.id,
      x: v.x,
      laneIndex: v.laneIndex,
      speed: v.speed,
      acceleration: v.acceleration,
      length: v.length,
      desiredSpeed: v.desiredSpeed,
    });

    const vehicles: VehicleState[] = this.road.getAllVehicles().map(toState);

    // Include on-ramp vehicles with ramp position metadata
    for (const ramp of this.road.onRamps) {
      for (const v of ramp.lane.vehicles) {
        const state = toState(v);
        state.onRamp = {
          startX: ramp.startX,
          endX: ramp.endX,
          laneCount: this.road.lanes.length,
        };
        vehicles.push(state);
      }
    }

    return { vehicles, simulationTime: this.simulationTime };
  }

  reset(): void {
    this.road = new Road(this.params.roadLengthMeters, this.params.laneCount);
    this.vehicleFactory = new VehicleFactory();
    this.incidentManager = new IncidentManager();
    this.simulationTime = 0;
    this.accumulator = 0;

    // Re-add default on-ramp
    const ramp = new OnRamp(Math.round(this.params.roadLengthMeters / 3));
    this.road.addOnRamp(ramp);
  }

  setParams(params: Partial<SimulationParams>): void {
    this.params = { ...this.params, ...params };
  }
}
