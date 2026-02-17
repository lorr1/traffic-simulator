import { describe, it, expect } from 'vitest';
import { DataCollector } from '../DataCollector';
import type { VehicleState } from '../../types';

function makeVehicle(x: number, speed: number, laneIndex: number = 0): VehicleState {
  return {
    id: Math.random(),
    x,
    laneIndex,
    speed,
    acceleration: 0,
    length: 5,
    desiredSpeed: 33.3,
  };
}

describe('DataCollector', () => {
  it('computes correct density for vehicles in a segment', () => {
    const collector = new DataCollector();
    // 5 vehicles in the first 100m segment
    const vehicles = [
      makeVehicle(10, 20),
      makeVehicle(30, 20),
      makeVehicle(50, 20),
      makeVehicle(70, 20),
      makeVehicle(90, 20),
    ];

    const segments = collector.sample(vehicles, 200, 0);

    // 5 vehicles in 100m = 50 veh/km
    expect(segments[0].density).toBe(50);
    // Second segment is empty
    expect(segments[1].density).toBe(0);
  });

  it('flow equals density times speed times 3.6', () => {
    const collector = new DataCollector();
    const vehicles = [
      makeVehicle(10, 20),
      makeVehicle(50, 20),
    ];

    const segments = collector.sample(vehicles, 100, 0);

    const seg = segments[0];
    // density = 2/100 * 1000 = 20 veh/km
    // avgSpeed = 20 m/s
    // flow = 20 * 20 * 3.6 = 1440 veh/hr
    expect(seg.density).toBe(20);
    expect(seg.averageSpeed).toBe(20);
    expect(seg.flow).toBeCloseTo(1440);
  });

  it('empty segment has zero density, flow, and speed', () => {
    const collector = new DataCollector();
    const segments = collector.sample([], 100, 0);

    expect(segments[0].density).toBe(0);
    expect(segments[0].flow).toBe(0);
    expect(segments[0].averageSpeed).toBe(0);
  });

  it('ring buffer evicts oldest after maxHistory', () => {
    const collector = new DataCollector();

    // Sample 601 times
    for (let i = 0; i <= 600; i++) {
      collector.sample([], 100, i * 0.5);
    }

    expect(collector.getHistory()).toHaveLength(600);
  });

  it('only samples when interval has elapsed', () => {
    const collector = new DataCollector();

    expect(collector.shouldSample(0)).toBe(true);
    collector.sample([], 100, 0);

    expect(collector.shouldSample(0.3)).toBe(false);
    expect(collector.shouldSample(0.5)).toBe(true);
  });

  it('getLatest returns most recent sample', () => {
    const collector = new DataCollector();

    expect(collector.getLatest()).toBeNull();

    collector.sample([makeVehicle(50, 10)], 100, 0);
    collector.sample([makeVehicle(50, 20)], 100, 0.5);

    const latest = collector.getLatest();
    expect(latest).not.toBeNull();
    expect(latest![0].averageSpeed).toBe(20);
  });

  it('clear resets history and timing', () => {
    const collector = new DataCollector();
    collector.sample([], 100, 0);
    collector.sample([], 100, 0.5);

    collector.clear();

    expect(collector.getHistory()).toHaveLength(0);
    expect(collector.getLatest()).toBeNull();
    expect(collector.shouldSample(0)).toBe(true);
  });
});
