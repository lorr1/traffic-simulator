import { describe, it, expect } from 'vitest';
import { Road } from '../Road';
import { Vehicle } from '../Vehicle';

function makeVehicle(id: number, x: number, laneIndex: number): Vehicle {
  return new Vehicle(id, x, 30, laneIndex, 33.3);
}

describe('Road', () => {
  it('creates the correct number of lanes', () => {
    const road = new Road(1000, 3);
    expect(road.lanes).toHaveLength(3);
    expect(road.length).toBe(1000);
  });

  it('getLeader delegates to Lane', () => {
    const road = new Road(1000, 2);
    const v1 = makeVehicle(1, 100, 0);
    const v2 = makeVehicle(2, 50, 0);
    road.lanes[0].addVehicle(v1);
    road.lanes[0].addVehicle(v2);

    expect(road.getLeader(v2)).toBe(v1);
    expect(road.getLeader(v1)).toBeNull();
  });

  it('getFollower delegates to Lane', () => {
    const road = new Road(1000, 2);
    const v1 = makeVehicle(1, 100, 0);
    const v2 = makeVehicle(2, 50, 0);
    road.lanes[0].addVehicle(v1);
    road.lanes[0].addVehicle(v2);

    expect(road.getFollower(v1)).toBe(v2);
    expect(road.getFollower(v2)).toBeNull();
  });

  it('getNeighbors finds correct leader/follower in adjacent lane', () => {
    const road = new Road(1000, 3);
    const subject = makeVehicle(0, 50, 1);
    road.lanes[1].addVehicle(subject);

    const ahead = makeVehicle(1, 80, 0);
    const behind = makeVehicle(2, 20, 0);
    road.lanes[0].addVehicle(ahead);
    road.lanes[0].addVehicle(behind);

    const neighbors = road.getNeighbors(subject, 0);
    expect(neighbors.leader).toBe(ahead);
    expect(neighbors.follower).toBe(behind);
  });

  it('getNeighbors returns nulls for out-of-range lane', () => {
    const road = new Road(1000, 2);
    const v = makeVehicle(0, 50, 0);
    road.lanes[0].addVehicle(v);

    const neighbors = road.getNeighbors(v, -1);
    expect(neighbors.leader).toBeNull();
    expect(neighbors.follower).toBeNull();
  });

  it('getNeighbors handles no leader or no follower', () => {
    const road = new Road(1000, 2);
    const subject = makeVehicle(0, 50, 0);
    road.lanes[0].addVehicle(subject);

    // Only a vehicle behind in lane 1
    const behind = makeVehicle(1, 20, 1);
    road.lanes[1].addVehicle(behind);

    const neighbors = road.getNeighbors(subject, 1);
    expect(neighbors.leader).toBeNull();
    expect(neighbors.follower).toBe(behind);
  });

  it('changeLane moves vehicle between lanes', () => {
    const road = new Road(1000, 3);
    const v = makeVehicle(0, 50, 0);
    road.lanes[0].addVehicle(v);

    expect(road.lanes[0].vehicles).toContain(v);
    road.changeLane(v, 1);
    expect(road.lanes[0].vehicles).not.toContain(v);
    expect(road.lanes[1].vehicles).toContain(v);
    expect(v.laneIndex).toBe(1);
  });

  it('changeLane does nothing for out-of-range target', () => {
    const road = new Road(1000, 2);
    const v = makeVehicle(0, 50, 0);
    road.lanes[0].addVehicle(v);

    road.changeLane(v, 5);
    expect(road.lanes[0].vehicles).toContain(v);
    expect(v.laneIndex).toBe(0);
  });

  it('getAllVehicles returns all vehicles across all lanes', () => {
    const road = new Road(1000, 3);
    const v1 = makeVehicle(1, 100, 0);
    const v2 = makeVehicle(2, 200, 1);
    const v3 = makeVehicle(3, 300, 2);
    road.lanes[0].addVehicle(v1);
    road.lanes[1].addVehicle(v2);
    road.lanes[2].addVehicle(v3);

    const all = road.getAllVehicles();
    expect(all).toHaveLength(3);
    expect(all).toContain(v1);
    expect(all).toContain(v2);
    expect(all).toContain(v3);
  });

  it('resortAllLanes resorts all lanes', () => {
    const road = new Road(1000, 2);
    const v1 = makeVehicle(1, 100, 0);
    const v2 = makeVehicle(2, 50, 0);
    road.lanes[0].addVehicle(v1);
    road.lanes[0].addVehicle(v2);

    // Manually mess up the order
    v2.x = 200;
    road.resortAllLanes();

    expect(road.lanes[0].vehicles[0]).toBe(v2);
    expect(road.lanes[0].vehicles[1]).toBe(v1);
  });
});
