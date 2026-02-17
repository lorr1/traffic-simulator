import type { SimulationParams } from '../../types';
import { Vehicle } from '../Vehicle';

/**
 * Compute IDM (Intelligent Driver Model) acceleration.
 *
 * @param speed        current vehicle speed (m/s)
 * @param desiredSpeed v0 for this vehicle (m/s)
 * @param gap          bumper-to-bumper distance to leader (m), Infinity if no leader
 * @param leaderSpeed  leader's speed (m/s)
 * @param params       global simulation params (a, b, T, s0)
 * @param speedFactor  rubbernecking reduction factor (1.0 = normal)
 */
export function computeIDMAcceleration(
  speed: number,
  desiredSpeed: number,
  gap: number,
  leaderSpeed: number,
  params: SimulationParams,
  speedFactor: number = 1.0,
): number {
  const v = speed;
  const v0Eff = desiredSpeed * speedFactor;
  const a = params.maxAcceleration;
  const b = params.comfortDeceleration;
  const s0 = params.minimumGap;
  const T = params.timeHeadway;

  // Free-road term
  const freeRoad = 1 - (v / v0Eff) ** 4;

  // No leader — pure free-road acceleration
  if (!isFinite(gap)) {
    return a * freeRoad;
  }

  // Desired gap (s*)
  const deltaV = v - leaderSpeed;
  const sStar = s0 + Math.max(0, v * T + (v * deltaV) / (2 * Math.sqrt(a * b)));

  // Interaction term
  const interaction = (sStar / Math.max(gap, 0.1)) ** 2;

  return a * (freeRoad - interaction);
}

/**
 * Convenience wrapper that extracts values from Vehicle objects.
 */
export function computeAcceleration(
  vehicle: Vehicle,
  leader: Vehicle | null,
  params: SimulationParams,
  speedFactor: number = 1.0,
): number {
  if (leader === null) {
    return computeIDMAcceleration(
      vehicle.speed,
      vehicle.desiredSpeed,
      Infinity,
      0,
      params,
      speedFactor,
    );
  }

  // Bumper-to-bumper gap: leader's rear minus this vehicle's front
  const gap = leader.x - leader.length - vehicle.x;

  return computeIDMAcceleration(
    vehicle.speed,
    vehicle.desiredSpeed,
    gap,
    leader.speed,
    params,
    speedFactor,
  );
}
