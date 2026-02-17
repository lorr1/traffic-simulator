import { describe, it, expect } from 'vitest';
import { evaluateLaneChange } from '../MOBILModel';
import { Road } from '../../Road';
import { Vehicle } from '../../Vehicle';
import { DEFAULT_PARAMS } from '../../../constants';
import type { SimulationParams } from '../../../types';

function makeVehicle(
  id: number,
  x: number,
  speed: number,
  laneIndex: number,
  desiredSpeed: number = 33.3,
): Vehicle {
  return new Vehicle(id, x, speed, laneIndex, desiredSpeed);
}

function setupRoad(laneCount = 3, length = 2000): Road {
  return new Road(length, laneCount);
}

function addToRoad(road: Road, vehicle: Vehicle): void {
  road.lanes[vehicle.laneIndex].addVehicle(vehicle);
}

describe('MOBILModel', () => {
  const params: SimulationParams = { ...DEFAULT_PARAMS };

  it('no change when adjacent lanes have similar leaders', () => {
    const road = setupRoad();
    const subject = makeVehicle(0, 100, 30, 1);
    const leaderCurrent = makeVehicle(1, 130, 25, 1);
    const leaderLeft = makeVehicle(2, 130, 25, 0);
    const leaderRight = makeVehicle(3, 130, 25, 2);

    addToRoad(road, subject);
    addToRoad(road, leaderCurrent);
    addToRoad(road, leaderLeft);
    addToRoad(road, leaderRight);

    const decision = evaluateLaneChange(subject, leaderCurrent, road, params);
    expect(decision.shouldChange).toBe(false);
  });

  it('changes to faster lane when current lane has slow leader', () => {
    const road = setupRoad();
    const subject = makeVehicle(0, 100, 30, 1);
    const slowLeader = makeVehicle(1, 115, 10, 1); // very slow, close

    addToRoad(road, subject);
    addToRoad(road, slowLeader);
    // Lane 0 is empty — no leader, free road

    const decision = evaluateLaneChange(subject, slowLeader, road, params);
    expect(decision.shouldChange).toBe(true);
    // Should pick an adjacent lane (0 or 2)
    expect([0, 2]).toContain(decision.targetLane);
  });

  it('does not change when safety criterion is violated', () => {
    const road = setupRoad();
    const subject = makeVehicle(0, 100, 20, 1);
    const slowLeader = makeVehicle(1, 115, 10, 1);

    // Fast follower very close in target lane — would need to brake hard
    const fastFollower = makeVehicle(2, 97, 33, 0);

    addToRoad(road, subject);
    addToRoad(road, slowLeader);
    addToRoad(road, fastFollower);

    const decision = evaluateLaneChange(subject, slowLeader, road, {
      ...params,
      safeDeceleration: 0.5, // very strict safety threshold
    });

    // With strict safety, the fast close follower makes lane 0 unsafe
    // Lane 2 might still be available, so check that lane 0 is not chosen
    // or if lane 2 also has a close follower, no change at all
    const fastFollowerRight = makeVehicle(3, 97, 33, 2);
    addToRoad(road, fastFollowerRight);

    const decision2 = evaluateLaneChange(subject, slowLeader, road, {
      ...params,
      safeDeceleration: 0.5,
    });
    expect(decision2.shouldChange).toBe(false);
  });

  it('politeness effect prevents change at high politeness', () => {
    const road = setupRoad();
    // Subject with a moderately slow leader — enough incentive for a lane change but not overwhelming
    const subject = makeVehicle(0, 100, 28, 1);
    const leader = makeVehicle(1, 160, 26, 1);
    // Follower in target lane close enough to create significant disadvantage
    // but passing the safety check (gap = 100-5-50 = 45m, same speed, safe)
    const followerLeft = makeVehicle(2, 50, 27, 0);
    // Block right lane so only left lane is evaluated
    const blockerRight = makeVehicle(3, 98, 33, 2);

    addToRoad(road, subject);
    addToRoad(road, leader);
    addToRoad(road, followerLeft);
    addToRoad(road, blockerRight);

    // With high politeness, the disadvantage to the follower outweighs the benefit
    const highPoliteness = evaluateLaneChange(subject, leader, road, {
      ...params,
      politenessFactor: 100.0,
      changingThreshold: 0.1,
    });

    // With zero politeness, only own benefit matters
    const lowPoliteness = evaluateLaneChange(subject, leader, road, {
      ...params,
      politenessFactor: 0.0,
      changingThreshold: 0.1,
    });

    expect(highPoliteness.shouldChange).toBe(false);
    expect(lowPoliteness.shouldChange).toBe(true);
  });

  it('boundary: leftmost vehicle cannot go further left', () => {
    const road = setupRoad();
    const subject = makeVehicle(0, 100, 30, 0);
    const slowLeader = makeVehicle(1, 115, 10, 0);

    addToRoad(road, subject);
    addToRoad(road, slowLeader);

    const decision = evaluateLaneChange(subject, slowLeader, road, params);

    // Can only go right (lane 1), not left (lane -1)
    if (decision.shouldChange) {
      expect(decision.targetLane).toBe(1);
    }
  });

  it('boundary: rightmost vehicle cannot go further right', () => {
    const road = setupRoad();
    const subject = makeVehicle(0, 100, 30, 2);
    const slowLeader = makeVehicle(1, 115, 10, 2);

    addToRoad(road, subject);
    addToRoad(road, slowLeader);

    const decision = evaluateLaneChange(subject, slowLeader, road, params);

    // Can only go left (lane 1), not right (lane 3)
    if (decision.shouldChange) {
      expect(decision.targetLane).toBe(1);
    }
  });

  it('empty target lane is always safe', () => {
    const road = setupRoad();
    const subject = makeVehicle(0, 100, 30, 1);
    const slowLeader = makeVehicle(1, 115, 5, 1); // very slow leader

    addToRoad(road, subject);
    addToRoad(road, slowLeader);
    // Both adjacent lanes are empty

    const decision = evaluateLaneChange(subject, slowLeader, road, params);
    expect(decision.shouldChange).toBe(true);
  });

  it('marginal benefit below threshold does not trigger change', () => {
    const road = setupRoad();
    const subject = makeVehicle(0, 100, 30, 1);
    // Leaders at nearly the same distance and speed in all lanes
    const leaderCurrent = makeVehicle(1, 150, 29, 1);
    const leaderLeft = makeVehicle(2, 152, 29, 0);
    const leaderRight = makeVehicle(3, 151, 29, 2);

    addToRoad(road, subject);
    addToRoad(road, leaderCurrent);
    addToRoad(road, leaderLeft);
    addToRoad(road, leaderRight);

    // Very high threshold so marginal gains don't qualify
    const decision = evaluateLaneChange(subject, leaderCurrent, road, {
      ...params,
      changingThreshold: 100.0,
    });
    expect(decision.shouldChange).toBe(false);
  });
});
