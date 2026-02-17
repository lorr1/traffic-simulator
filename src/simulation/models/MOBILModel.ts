import type { SimulationParams } from '../../types';
import { Road } from '../Road';
import { Vehicle } from '../Vehicle';
import { computeAcceleration } from './IDMModel';

export interface LaneChangeDecision {
  shouldChange: boolean;
  targetLane: number;
}

/**
 * Evaluate whether a vehicle should change lanes using the MOBIL algorithm.
 *
 * For each adjacent lane (left and right):
 *   1. Find new leader and new follower in the target lane.
 *   2. Safety check: new follower's deceleration must not exceed safeDeceleration.
 *   3. Incentive check: acceleration gain minus politeness-weighted disadvantage
 *      to the new follower must exceed the changing threshold.
 *
 * Returns the best lane change (highest gain) that passes both criteria,
 * or { shouldChange: false } if none qualifies.
 */
export function evaluateLaneChange(
  vehicle: Vehicle,
  currentLeader: Vehicle | null,
  road: Road,
  params: SimulationParams,
): LaneChangeDecision {
  const currentAccel = computeAcceleration(vehicle, currentLeader, params);

  let bestGain = -Infinity;
  let bestLane = vehicle.laneIndex;

  const candidates = [vehicle.laneIndex - 1, vehicle.laneIndex + 1];

  for (const targetLane of candidates) {
    if (targetLane < 0 || targetLane >= road.lanes.length) continue;

    const { leader: newLeader, follower: newFollower } = road.getNeighbors(
      vehicle,
      targetLane,
    );

    // Safety criterion: new follower must not brake dangerously
    if (newFollower !== null) {
      const newFollowerAccelAfter = computeAcceleration(
        newFollower,
        vehicle,
        params,
      );
      if (newFollowerAccelAfter < -params.safeDeceleration) continue;
    }

    // Incentive criterion
    const newAccel = computeAcceleration(vehicle, newLeader, params);

    let newFollowerAccelBefore = 0;
    let newFollowerAccelAfter = 0;
    if (newFollower !== null) {
      newFollowerAccelBefore = computeAcceleration(
        newFollower,
        newLeader,
        params,
      );
      newFollowerAccelAfter = computeAcceleration(
        newFollower,
        vehicle,
        params,
      );
    }

    const gain =
      newAccel -
      currentAccel -
      params.politenessFactor *
        (newFollowerAccelBefore - newFollowerAccelAfter);

    if (gain > params.changingThreshold && gain > bestGain) {
      bestGain = gain;
      bestLane = targetLane;
    }
  }

  if (bestLane !== vehicle.laneIndex) {
    return { shouldChange: true, targetLane: bestLane };
  }

  return { shouldChange: false, targetLane: vehicle.laneIndex };
}
