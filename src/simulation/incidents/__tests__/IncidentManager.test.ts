import { describe, it, expect } from 'vitest';
import { IncidentManager } from '../IncidentManager';
import { Vehicle } from '../../Vehicle';
import type { IncidentConfig } from '../../../types';

function makeConfig(overrides: Partial<IncidentConfig> = {}): IncidentConfig {
  return {
    id: 1,
    positionX: 500,
    lanesBlocked: [1],
    severity: 0.5,
    startTime: 0,
    duration: 60,
    rubberneckingFactor: 0.6,
    ...overrides,
  };
}

function makeVehicle(x: number, laneIndex: number): Vehicle {
  return new Vehicle(100, x, 30, laneIndex, 33.3);
}

describe('IncidentManager', () => {
  describe('virtual obstacle', () => {
    it('returns virtual vehicle for vehicle in blocked lane ahead of incident', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ positionX: 500, lanesBlocked: [1] }));

      const vehicle = makeVehicle(400, 1);
      const obstacle = mgr.getVirtualObstacle(vehicle);

      expect(obstacle).not.toBeNull();
      expect(obstacle!.x).toBe(500);
      expect(obstacle!.speed).toBe(0);
    });

    it('returns null for vehicle behind (past) incident', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ positionX: 500, lanesBlocked: [1] }));

      const vehicle = makeVehicle(600, 1);
      expect(mgr.getVirtualObstacle(vehicle)).toBeNull();
    });

    it('returns null for vehicle in unblocked lane', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ positionX: 500, lanesBlocked: [1] }));

      const vehicle = makeVehicle(400, 0);
      expect(mgr.getVirtualObstacle(vehicle)).toBeNull();
    });
  });

  describe('rubbernecking', () => {
    it('returns factor < 1 for vehicle adjacent to incident within radius', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ positionX: 500, lanesBlocked: [1], severity: 0.5 }));

      // Lane 0 is adjacent to blocked lane 1
      const vehicle = makeVehicle(500, 0);
      const factor = mgr.getSpeedReduction(vehicle);

      expect(factor).toBeLessThan(1.0);
    });

    it('returns rubberneckingFactor at incident position', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(
        makeConfig({ positionX: 500, lanesBlocked: [1], rubberneckingFactor: 0.6 }),
      );

      const vehicle = makeVehicle(500, 0);
      const factor = mgr.getSpeedReduction(vehicle);

      expect(factor).toBeCloseTo(0.6);
    });

    it('returns approximately 1.0 near radius edge', () => {
      const mgr = new IncidentManager();
      const incident = mgr.addIncident(
        makeConfig({ positionX: 500, lanesBlocked: [1], severity: 0.5 }),
      );

      // Place vehicle just inside the radius edge
      const vehicle = makeVehicle(500 + incident.rubberneckingRadius - 1, 0);
      const factor = mgr.getSpeedReduction(vehicle);

      expect(factor).toBeGreaterThan(0.99);
      expect(factor).toBeLessThan(1.0);
    });

    it('returns 1.0 for vehicle beyond radius', () => {
      const mgr = new IncidentManager();
      const incident = mgr.addIncident(
        makeConfig({ positionX: 500, lanesBlocked: [1], severity: 0.5 }),
      );

      const vehicle = makeVehicle(500 + incident.rubberneckingRadius + 50, 0);
      expect(mgr.getSpeedReduction(vehicle)).toBe(1.0);
    });

    it('returns 1.0 for vehicle in non-adjacent lane', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ positionX: 500, lanesBlocked: [0] }));

      // Lane 2 is not adjacent to blocked lane 0
      const vehicle = makeVehicle(500, 2);
      expect(mgr.getSpeedReduction(vehicle)).toBe(1.0);
    });
  });

  describe('expiry', () => {
    it('removes expired incidents on update', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ startTime: 0, duration: 60 }));

      expect(mgr.getActiveIncidents()).toHaveLength(1);
      mgr.update(70);
      expect(mgr.getActiveIncidents()).toHaveLength(0);
    });

    it('manual removal incidents never auto-expire', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ startTime: 0, duration: -1 }));

      mgr.update(10000);
      expect(mgr.getActiveIncidents()).toHaveLength(1);
    });
  });

  describe('multiple incidents', () => {
    it('returns closest virtual obstacle', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ id: 1, positionX: 600, lanesBlocked: [1] }));
      mgr.addIncident(makeConfig({ id: 2, positionX: 500, lanesBlocked: [1] }));

      const vehicle = makeVehicle(400, 1);
      const obstacle = mgr.getVirtualObstacle(vehicle);

      expect(obstacle).not.toBeNull();
      expect(obstacle!.x).toBe(500);
    });

    it('rubbernecking uses minimum factor from multiple incidents', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(
        makeConfig({ id: 1, positionX: 500, lanesBlocked: [1], rubberneckingFactor: 0.8 }),
      );
      mgr.addIncident(
        makeConfig({ id: 2, positionX: 500, lanesBlocked: [1], rubberneckingFactor: 0.5 }),
      );

      const vehicle = makeVehicle(500, 0);
      const factor = mgr.getSpeedReduction(vehicle);

      expect(factor).toBeCloseTo(0.5);
    });
  });

  describe('addIncident / removeIncident', () => {
    it('removeIncident removes by id', () => {
      const mgr = new IncidentManager();
      mgr.addIncident(makeConfig({ id: 1 }));
      mgr.addIncident(makeConfig({ id: 2 }));

      mgr.removeIncident(1);
      expect(mgr.getActiveIncidents()).toHaveLength(1);
      expect(mgr.getActiveIncidents()[0].id).toBe(2);
    });
  });
});
