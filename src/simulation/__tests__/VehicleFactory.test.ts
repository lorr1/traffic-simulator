import { describe, it, expect } from 'vitest';
import { VehicleFactory } from '../VehicleFactory';
import { Road } from '../Road';
import { Vehicle } from '../Vehicle';
import { DEFAULT_PARAMS } from '../../constants';
import type { SimulationParams } from '../../types';

function makeParams(overrides: Partial<SimulationParams> = {}): SimulationParams {
  return { ...DEFAULT_PARAMS, ...overrides };
}

describe('VehicleFactory', () => {
  it('spawns at approximately the correct rate', () => {
    const factory = new VehicleFactory();
    const road = new Road(10000, 3);
    const params = makeParams({ spawnRate: 2 }); // 2 vehicles/second
    const dt = 0.1;
    const steps = 100; // 10 seconds total

    for (let i = 0; i < steps; i++) {
      factory.trySpawn(dt, road, params);
      // Move vehicles forward so entrance stays clear
      for (const v of road.getAllVehicles()) {
        v.x += 20;
      }
      road.resortAllLanes();
    }

    const totalVehicles = road.getAllVehicles().length;
    // Expected ~20 vehicles (2/s × 10s), allow reasonable range
    expect(totalVehicles).toBeGreaterThan(10);
    expect(totalVehicles).toBeLessThanOrEqual(30);
  });

  it('does not spawn when entrance is blocked', () => {
    const factory = new VehicleFactory();
    const road = new Road(2000, 1);
    const params = makeParams({ spawnRate: 100 }); // very high rate

    // First spawn should work
    factory.trySpawn(1, road, params);
    const countAfterFirst = road.getAllVehicles().length;
    expect(countAfterFirst).toBeGreaterThan(0);

    // All vehicles are at x=0, so entrance is blocked for additional spawns
    // on subsequent calls within the same accumulator cycle
    // The vehicles at x=0 block further spawns
    const initialCount = road.getAllVehicles().length;

    // Try again — entrance is still blocked (vehicles at x=0)
    const factory2 = new VehicleFactory();
    factory2.trySpawn(1, road, params);
    // Should not add many more since entrance is blocked
    // (might add 0 or a few depending on accumulator)
    const finalCount = road.getAllVehicles().length;
    // The point is: with a blocked entrance and 1 lane, we can't get unbounded spawns
    expect(finalCount).toBeLessThan(initialCount + 5);
  });

  it('defers spawn when road entrance is congested', () => {
    const factory = new VehicleFactory();
    const road = new Road(2000, 1);
    const params = makeParams({ spawnRate: 10 });

    // Spawn once
    factory.trySpawn(1, road, params);
    const count = road.getAllVehicles().length;

    // All spawned vehicles are at x=0, blocking further spawns
    factory.trySpawn(1, road, params);
    // Should not significantly increase since entrance is blocked
    expect(road.getAllVehicles().length).toBeLessThanOrEqual(count + 1);
  });

  it('despawns vehicles past road end', () => {
    const factory = new VehicleFactory();
    const road = new Road(1000, 2);
    const params = makeParams();

    // Manually add vehicles — some past the end
    const v1 = new Vehicle(0, 500, 30, 0, 33.3);
    const v2 = new Vehicle(1, 1001, 30, 0, 33.3); // past end
    const v3 = new Vehicle(2, 999, 30, 1, 33.3);
    const v4 = new Vehicle(3, 1500, 30, 1, 33.3); // past end

    road.lanes[0].addVehicle(v1);
    road.lanes[0].addVehicle(v2);
    road.lanes[1].addVehicle(v3);
    road.lanes[1].addVehicle(v4);

    expect(road.getAllVehicles()).toHaveLength(4);
    factory.despawn(road);
    expect(road.getAllVehicles()).toHaveLength(2);
    expect(road.getAllVehicles()).toContain(v1);
    expect(road.getAllVehicles()).toContain(v3);
  });

  it('spawned vehicles have randomized desiredSpeeds around v0', () => {
    const factory = new VehicleFactory();
    const road = new Road(5000, 3);
    const v0 = 33.3;
    const params = makeParams({ spawnRate: 5, desiredSpeed: v0 });

    // Spawn many vehicles
    for (let i = 0; i < 200; i++) {
      factory.trySpawn(0.1, road, params);
      // Move vehicles forward so entrance isn't blocked
      for (const v of road.getAllVehicles()) {
        v.x += 50;
      }
      road.resortAllLanes();
    }

    const vehicles = road.getAllVehicles();
    expect(vehicles.length).toBeGreaterThan(10);

    const speeds = vehicles.map((v) => v.desiredSpeed);
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;

    // Average should be near v0
    expect(avgSpeed).toBeGreaterThan(v0 * 0.8);
    expect(avgSpeed).toBeLessThan(v0 * 1.2);

    // There should be some variation
    const uniqueSpeeds = new Set(speeds.map((s) => s.toFixed(2)));
    expect(uniqueSpeeds.size).toBeGreaterThan(1);
  });
});
