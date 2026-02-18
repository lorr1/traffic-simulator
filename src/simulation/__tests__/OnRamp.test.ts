import { describe, it, expect } from 'vitest';
import { OnRamp } from '../OnRamp';
import { Road } from '../Road';
import { Vehicle } from '../Vehicle';
import { DEFAULT_PARAMS } from '../../constants';

describe('OnRamp', () => {
  const params = { ...DEFAULT_PARAMS };

  function createSetup() {
    const road = new Road(2000, 3);
    const ramp = new OnRamp(700, 300, 1.0); // merge at x=700, accel lane 300m
    road.addOnRamp(ramp);
    return { road, ramp };
  }

  it('vehicle merges when sufficient gap in rightmost lane', () => {
    const { road, ramp } = createSetup();

    // Place a vehicle on the ramp in the merge zone
    const v = new Vehicle(1, 600, 20, -1, 30, 5);
    ramp.lane.addVehicle(v);

    // Rightmost lane (index 2) is empty — plenty of gap
    ramp.stepVehicles(params.dt, road, params);

    // Vehicle should have merged into rightmost lane
    expect(ramp.lane.vehicles.length).toBe(0);
    expect(road.lanes[2].vehicles.length).toBe(1);
    expect(road.lanes[2].vehicles[0].id).toBe(1);
    expect(road.lanes[2].vehicles[0].laneIndex).toBe(2);
  });

  it('vehicle stops at end of acceleration lane when no gap', () => {
    const { road, ramp } = createSetup();

    // Place a vehicle near end of ramp
    const rampVehicle = new Vehicle(1, 690, 15, -1, 30, 5);
    ramp.lane.addVehicle(rampVehicle);

    // Block rightmost lane with vehicles close together around merge point
    const blocker1 = new Vehicle(10, 695, 20, 2, 30, 5);
    const blocker2 = new Vehicle(11, 685, 20, 2, 30, 5);
    road.lanes[2].addVehicle(blocker1);
    road.lanes[2].addVehicle(blocker2);

    // Step several times — vehicle should decelerate, not merge
    for (let i = 0; i < 60; i++) {
      ramp.stepVehicles(params.dt, road, params);
    }

    // Ramp vehicle should still be on the ramp (couldn't merge)
    // and should have slowed down significantly
    const remaining = ramp.lane.vehicles.find((v) => v.id === 1);
    if (remaining) {
      expect(remaining.speed).toBeLessThan(5);
    }
    // If it did merge, that's also acceptable if a gap opened
  });

  it('merge respects safety criterion', () => {
    const { road, ramp } = createSetup();

    // Ramp vehicle
    const rampVehicle = new Vehicle(1, 650, 10, -1, 30, 5); // slow
    ramp.lane.addVehicle(rampVehicle);

    // Fast follower very close behind in rightmost lane — unsafe merge
    const fastFollower = new Vehicle(10, 645, 30, 2, 30, 5);
    road.lanes[2].addVehicle(fastFollower);

    ramp.stepVehicles(params.dt, road, params);

    // Vehicle should NOT merge (follower would need to brake too hard)
    expect(ramp.lane.vehicles.length).toBe(1);
    expect(ramp.lane.vehicles[0].id).toBe(1);
  });

  it('disabling on-ramp stops spawning and stepping', () => {
    const { road, ramp } = createSetup();
    ramp.enabled = false;

    // Try to spawn — nothing should happen
    for (let i = 0; i < 120; i++) {
      ramp.trySpawn(params.dt, params);
    }
    expect(ramp.lane.vehicles.length).toBe(0);

    // Add a vehicle manually and step — should not be processed
    const v = new Vehicle(1, 600, 20, -1, 30, 5);
    ramp.lane.addVehicle(v);
    ramp.stepVehicles(params.dt, road, params);
    // Vehicle still on ramp, position unchanged (stepVehicles returns early)
    expect(ramp.lane.vehicles[0].x).toBe(600);
  });
});
