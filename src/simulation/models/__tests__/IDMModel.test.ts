import { describe, it, expect } from 'vitest';
import { computeIDMAcceleration, computeAcceleration } from '../IDMModel';
import { DEFAULT_PARAMS } from '../../../constants';
import { Vehicle } from '../../Vehicle';

const params = DEFAULT_PARAMS;
const { maxAcceleration: a, comfortDeceleration: b, minimumGap: s0, timeHeadway: T } = params;

describe('computeIDMAcceleration', () => {
  describe('free road (no leader)', () => {
    it('accelerates strongly when speed << desiredSpeed', () => {
      const acc = computeIDMAcceleration(5, 33.3, Infinity, 0, params);
      // v/v0 is small, so freeRoad ≈ 1, acc ≈ a
      expect(acc).toBeGreaterThan(0.9 * a);
      expect(acc).toBeLessThanOrEqual(a);
    });

    it('returns ~0 acceleration at desired speed', () => {
      const acc = computeIDMAcceleration(33.3, 33.3, Infinity, 0, params);
      expect(Math.abs(acc)).toBeLessThan(0.01);
    });

    it('decelerates when speed > desiredSpeed', () => {
      const acc = computeIDMAcceleration(40, 33.3, Infinity, 0, params);
      expect(acc).toBeLessThan(0);
    });
  });

  describe('following at equilibrium', () => {
    it('returns ~0 acceleration at equilibrium gap and speed', () => {
      // At equilibrium: speed = leaderSpeed, gap = s0 + v*T
      const v = 20;
      const eqGap = s0 + v * T;
      const acc = computeIDMAcceleration(v, 33.3, eqGap, v, params);
      // Should be close to zero (not perfectly zero due to free-road term)
      expect(Math.abs(acc)).toBeLessThan(0.3);
    });
  });

  describe('braking scenarios', () => {
    it('brakes hard when gap is much smaller than desired', () => {
      const acc = computeIDMAcceleration(20, 33.3, 3, 20, params);
      expect(acc).toBeLessThan(-1);
    });

    it('brakes when approaching a slower leader', () => {
      const acc = computeIDMAcceleration(30, 33.3, 30, 10, params);
      expect(acc).toBeLessThan(0);
    });

    it('brakes hard at minimum gap', () => {
      const acc = computeIDMAcceleration(20, 33.3, s0, 20, params);
      expect(acc).toBeLessThan(-1);
    });
  });

  describe('speed factor (rubbernecking)', () => {
    it('decelerates at v0 when speedFactor = 0.5', () => {
      const acc = computeIDMAcceleration(33.3, 33.3, Infinity, 0, params, 0.5);
      // Effective desired speed is 16.65, but going 33.3 → strong deceleration
      expect(acc).toBeLessThan(-a);
    });
  });

  describe('edge cases', () => {
    it('produces large negative but finite acceleration at very small gap', () => {
      const acc = computeIDMAcceleration(20, 33.3, 0.1, 20, params);
      expect(acc).toBeLessThan(0);
      expect(isFinite(acc)).toBe(true);
    });

    it('handles speed = 0 without division by zero', () => {
      const acc = computeIDMAcceleration(0, 33.3, 50, 0, params);
      expect(isFinite(acc)).toBe(true);
      expect(acc).toBeGreaterThan(0); // should accelerate from standstill
    });

    it('reduces braking when leader is faster (negative delta-v)', () => {
      // Leader faster → deltaV negative → s_star reduced
      const accApproaching = computeIDMAcceleration(15, 33.3, 20, 10, params);
      const accReceding = computeIDMAcceleration(15, 33.3, 20, 25, params);
      expect(accReceding).toBeGreaterThan(accApproaching);
    });
  });

  describe('quantitative spot check', () => {
    it('matches expected IDM value for known parameters', () => {
      // Standard IDM: a=1, b=1.5, s0=2, T=1.5, v0=33.3
      // v=20, gap=40, leaderSpeed=20
      // freeRoad = 1 - (20/33.3)^4 = 1 - 0.1306 = 0.8694
      // deltaV = 0, s_star = 2 + 20*1.5 + 0 = 32
      // interaction = (32/40)^2 = 0.64
      // acc = 1.0 * (0.8694 - 0.64) = 0.2294
      const acc = computeIDMAcceleration(20, 33.3, 40, 20, params);
      expect(acc).toBeCloseTo(0.2294, 1);
    });
  });
});

describe('computeAcceleration (Vehicle wrapper)', () => {
  it('returns free-road acceleration with no leader', () => {
    const vehicle = new Vehicle(1, 100, 10, 0, 33.3);
    const acc = computeAcceleration(vehicle, null, params);
    const expected = computeIDMAcceleration(10, 33.3, Infinity, 0, params);
    expect(acc).toBe(expected);
  });

  it('computes correct gap from vehicle positions', () => {
    const vehicle = new Vehicle(1, 100, 20, 0, 33.3);
    const leader = new Vehicle(2, 140, 20, 0, 33.3); // length=5, rear at 135
    // gap = 140 - 5 - 100 = 35
    const acc = computeAcceleration(vehicle, leader, params);
    const expected = computeIDMAcceleration(20, 33.3, 35, 20, params);
    expect(acc).toBe(expected);
  });

  it('passes speedFactor through', () => {
    const vehicle = new Vehicle(1, 100, 30, 0, 33.3);
    const acc = computeAcceleration(vehicle, null, params, 0.5);
    const expected = computeIDMAcceleration(30, 33.3, Infinity, 0, params, 0.5);
    expect(acc).toBe(expected);
  });
});
