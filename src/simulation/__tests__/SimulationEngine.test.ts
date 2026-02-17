import { describe, it, expect } from 'vitest';
import { SimulationEngine } from '../SimulationEngine';
import { Vehicle } from '../Vehicle';
import { DEFAULT_PARAMS } from '../../constants';
import type { SimulationParams } from '../../types';

function makeParams(overrides: Partial<SimulationParams> = {}): SimulationParams {
  return { ...DEFAULT_PARAMS, ...overrides };
}

describe('SimulationEngine', () => {
  it('vehicles move forward after stepping', () => {
    const params = makeParams({ laneCount: 1, spawnRate: 2 });
    const engine = new SimulationEngine(params);

    // Run 100 steps
    for (let i = 0; i < 100; i++) {
      engine.step(params.dt);
    }

    const { vehicles } = engine.getState();
    expect(vehicles.length).toBeGreaterThan(0);
    for (const v of vehicles) {
      expect(v.x).toBeGreaterThan(0);
    }
  });

  it('follower decelerates when close to leader', () => {
    const params = makeParams({ laneCount: 1, spawnRate: 0 });
    const engine = new SimulationEngine(params);

    // Manually place two vehicles: leader far ahead, follower close behind
    const leader = new Vehicle(0, 50, 10, 0, 33.3);
    const follower = new Vehicle(1, 40, 20, 0, 33.3); // faster, close behind
    engine.road.lanes[0].addVehicle(leader);
    engine.road.lanes[0].addVehicle(follower);

    // Step once to compute accelerations
    engine.step(params.dt);

    // Follower should decelerate (gap is only 50-5-40 = 5m, approaching fast)
    expect(follower.acceleration).toBeLessThan(0);
  });

  it('no collisions after many steps with high spawn rate', () => {
    const params = makeParams({ laneCount: 1, spawnRate: 3 });
    const engine = new SimulationEngine(params);

    for (let i = 0; i < 1000; i++) {
      engine.step(params.dt);
    }

    const lane = engine.road.lanes[0];
    for (let i = 0; i < lane.vehicles.length - 1; i++) {
      const front = lane.vehicles[i];
      const behind = lane.vehicles[i + 1];
      // Rear of front vehicle should be ahead of front of behind vehicle
      const gap = front.x - front.length - behind.x;
      expect(gap).toBeGreaterThanOrEqual(-0.1); // small tolerance for floating point
    }
  });

  it('speed is always non-negative', () => {
    const params = makeParams({ laneCount: 1, spawnRate: 3 });
    const engine = new SimulationEngine(params);

    for (let i = 0; i < 500; i++) {
      engine.step(params.dt);
      for (const v of engine.road.getAllVehicles()) {
        expect(v.speed).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('accumulator: update(16) + update(17) equals update(33)', () => {
    const params = makeParams({ laneCount: 1, spawnRate: 0 });

    // Engine A: two separate updates
    const engineA = new SimulationEngine(params);
    const vehicleA = new Vehicle(0, 100, 20, 0, 33.3);
    engineA.road.lanes[0].addVehicle(vehicleA);
    engineA.update(16);
    engineA.update(17);

    // Engine B: one combined update
    const engineB = new SimulationEngine(params);
    const vehicleB = new Vehicle(0, 100, 20, 0, 33.3);
    engineB.road.lanes[0].addVehicle(vehicleB);
    engineB.update(33);

    // Both should have advanced the same simulation time
    expect(engineA.simulationTime).toBeCloseTo(engineB.simulationTime, 10);
  });

  it('speed multiplier makes simulation advance faster', () => {
    const params1x = makeParams({ laneCount: 1, spawnRate: 0, speedMultiplier: 1 });
    const params2x = makeParams({ laneCount: 1, spawnRate: 0, speedMultiplier: 2 });

    const engine1x = new SimulationEngine(params1x);
    const engine2x = new SimulationEngine(params2x);

    // Same wall-clock time
    engine1x.update(100);
    engine2x.update(100);

    // 2x should advance ~twice as much simulation time
    expect(engine2x.simulationTime).toBeCloseTo(engine1x.simulationTime * 2, 5);
  });

  it('reset clears all state', () => {
    const params = makeParams({ laneCount: 1, spawnRate: 2 });
    const engine = new SimulationEngine(params);

    // Run for a while
    for (let i = 0; i < 100; i++) {
      engine.step(params.dt);
    }
    expect(engine.getState().vehicles.length).toBeGreaterThan(0);
    expect(engine.simulationTime).toBeGreaterThan(0);

    engine.reset();

    expect(engine.getState().vehicles.length).toBe(0);
    expect(engine.simulationTime).toBe(0);
  });

  it('faster vehicle changes lane to overtake slower vehicle', () => {
    const params = makeParams({ laneCount: 3, spawnRate: 0 });
    const engine = new SimulationEngine(params);

    // Slow vehicle in lane 1, fast vehicle behind it
    const slow = new Vehicle(0, 200, 15, 1, 15);
    const fast = new Vehicle(1, 170, 30, 1, 33.3);
    engine.road.lanes[1].addVehicle(slow);
    engine.road.lanes[1].addVehicle(fast);

    // Run enough steps for a lane change to occur
    let changed = false;
    for (let i = 0; i < 300; i++) {
      engine.step(params.dt);
      if (fast.laneIndex !== 1) {
        changed = true;
        break;
      }
    }

    expect(changed).toBe(true);
    expect([0, 2]).toContain(fast.laneIndex);
  });

  it('no vehicles end up in invalid lanes after many steps', () => {
    const params = makeParams({ laneCount: 3, spawnRate: 2 });
    const engine = new SimulationEngine(params);

    for (let i = 0; i < 1000; i++) {
      engine.step(params.dt);
      for (const v of engine.road.getAllVehicles()) {
        expect(v.laneIndex).toBeGreaterThanOrEqual(0);
        expect(v.laneIndex).toBeLessThan(params.laneCount);
      }
    }
  });

  it('high politeness results in fewer lane changes than low politeness', () => {
    function countLaneChanges(politeness: number): number {
      const params = makeParams({
        laneCount: 3,
        spawnRate: 1.5,
        politenessFactor: politeness,
      });
      const engine = new SimulationEngine(params);
      let changes = 0;

      // Track lane indices to detect changes
      const lastLane = new Map<number, number>();

      for (let i = 0; i < 2000; i++) {
        engine.step(params.dt);
        for (const v of engine.road.getAllVehicles()) {
          const prev = lastLane.get(v.id);
          if (prev !== undefined && prev !== v.laneIndex) {
            changes++;
          }
          lastLane.set(v.id, v.laneIndex);
        }
      }
      return changes;
    }

    const highPoliteChanges = countLaneChanges(5.0);
    const lowPoliteChanges = countLaneChanges(0.0);

    expect(lowPoliteChanges).toBeGreaterThan(highPoliteChanges);
  });

  it('vehicles past road end are despawned', () => {
    const params = makeParams({ laneCount: 1, spawnRate: 0, roadLengthMeters: 100 });
    const engine = new SimulationEngine(params);

    // Place a vehicle near the end moving fast
    const vehicle = new Vehicle(0, 99, 30, 0, 33.3);
    engine.road.lanes[0].addVehicle(vehicle);

    // Step enough times for vehicle to pass end
    for (let i = 0; i < 60; i++) {
      engine.step(params.dt);
    }

    expect(engine.getState().vehicles.length).toBe(0);
  });
});
