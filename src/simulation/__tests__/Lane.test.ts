import { describe, it, expect } from 'vitest';
import { Lane } from '../Lane';
import { Vehicle } from '../Vehicle';

function makeVehicle(id: number, x: number, laneIndex = 0): Vehicle {
  return new Vehicle(id, x, 20, laneIndex, 33);
}

describe('Lane', () => {
  describe('sort invariant', () => {
    it('maintains descending x order when adding vehicles', () => {
      const lane = new Lane(0);
      lane.addVehicle(makeVehicle(1, 100));
      lane.addVehicle(makeVehicle(2, 300));
      lane.addVehicle(makeVehicle(3, 200));
      lane.addVehicle(makeVehicle(4, 50));

      expect(lane.vehicles.map(v => v.x)).toEqual([300, 200, 100, 50]);
    });

    it('handles adding vehicles with the same position', () => {
      const lane = new Lane(0);
      lane.addVehicle(makeVehicle(1, 100));
      lane.addVehicle(makeVehicle(2, 100));

      expect(lane.vehicles.length).toBe(2);
    });
  });

  describe('getLeaderOf', () => {
    it('returns the vehicle immediately ahead', () => {
      const lane = new Lane(0);
      const rear = makeVehicle(1, 100);
      const front = makeVehicle(2, 200);
      lane.addVehicle(rear);
      lane.addVehicle(front);

      expect(lane.getLeaderOf(rear)).toBe(front);
    });

    it('returns null for the frontmost vehicle', () => {
      const lane = new Lane(0);
      const front = makeVehicle(1, 200);
      const rear = makeVehicle(2, 100);
      lane.addVehicle(front);
      lane.addVehicle(rear);

      expect(lane.getLeaderOf(front)).toBeNull();
    });
  });

  describe('getFollowerOf', () => {
    it('returns the vehicle immediately behind', () => {
      const lane = new Lane(0);
      const rear = makeVehicle(1, 100);
      const front = makeVehicle(2, 200);
      lane.addVehicle(rear);
      lane.addVehicle(front);

      expect(lane.getFollowerOf(front)).toBe(rear);
    });

    it('returns null for the rearmost vehicle', () => {
      const lane = new Lane(0);
      const rear = makeVehicle(1, 100);
      const front = makeVehicle(2, 200);
      lane.addVehicle(rear);
      lane.addVehicle(front);

      expect(lane.getFollowerOf(rear)).toBeNull();
    });
  });

  describe('removeVehicle', () => {
    it('removes the vehicle and maintains sort order', () => {
      const lane = new Lane(0);
      const v1 = makeVehicle(1, 100);
      const v2 = makeVehicle(2, 200);
      const v3 = makeVehicle(3, 300);
      lane.addVehicle(v1);
      lane.addVehicle(v2);
      lane.addVehicle(v3);

      lane.removeVehicle(v2);

      expect(lane.vehicles.length).toBe(2);
      expect(lane.vehicles.map(v => v.x)).toEqual([300, 100]);
    });

    it('does nothing when removing a vehicle not in the lane', () => {
      const lane = new Lane(0);
      const v1 = makeVehicle(1, 100);
      const v2 = makeVehicle(2, 200);
      lane.addVehicle(v1);

      lane.removeVehicle(v2);

      expect(lane.vehicles.length).toBe(1);
    });
  });

  describe('resort', () => {
    it('fixes order after vehicle positions are modified', () => {
      const lane = new Lane(0);
      const v1 = makeVehicle(1, 100);
      const v2 = makeVehicle(2, 200);
      const v3 = makeVehicle(3, 300);
      lane.addVehicle(v1);
      lane.addVehicle(v2);
      lane.addVehicle(v3);

      // Simulate position updates that break ordering
      v1.x = 350; // was behind, now in front
      v3.x = 50;  // was in front, now behind

      lane.resort();

      expect(lane.vehicles.map(v => v.x)).toEqual([350, 200, 50]);
      expect(lane.vehicles[0]).toBe(v1);
      expect(lane.vehicles[2]).toBe(v3);
    });
  });

  describe('getVehicleAhead', () => {
    it('returns the closest vehicle ahead of a given position', () => {
      const lane = new Lane(0);
      lane.addVehicle(makeVehicle(1, 100));
      lane.addVehicle(makeVehicle(2, 200));
      lane.addVehicle(makeVehicle(3, 300));

      const ahead = lane.getVehicleAhead(150);
      expect(ahead).not.toBeNull();
      expect(ahead!.x).toBe(200);
    });

    it('returns null if no vehicle is ahead', () => {
      const lane = new Lane(0);
      lane.addVehicle(makeVehicle(1, 100));
      lane.addVehicle(makeVehicle(2, 200));

      expect(lane.getVehicleAhead(300)).toBeNull();
    });
  });

  describe('empty lane', () => {
    it('returns null for all queries', () => {
      const lane = new Lane(0);
      const v = makeVehicle(1, 100);

      expect(lane.getLeaderOf(v)).toBeNull();
      expect(lane.getFollowerOf(v)).toBeNull();
      expect(lane.getVehicleAhead(50)).toBeNull();
    });
  });
});
