import type { IncidentConfig } from '../../types';
import { Vehicle } from '../Vehicle';
import { Incident } from './Incident';

export class IncidentManager {
  private incidents: Incident[] = [];

  addIncident(config: IncidentConfig): Incident {
    const incident = new Incident(config);
    this.incidents.push(incident);
    return incident;
  }

  removeIncident(id: number): void {
    this.incidents = this.incidents.filter((i) => i.id !== id);
  }

  getActiveIncidents(): Incident[] {
    return this.incidents;
  }

  update(simulationTime: number): void {
    this.incidents = this.incidents.filter((i) => !i.isExpired(simulationTime));
  }

  /**
   * If the vehicle's lane is blocked by an incident ahead, return a virtual
   * stopped vehicle at the incident position. Returns the closest such
   * obstacle if multiple incidents block the lane ahead.
   */
  getVirtualObstacle(vehicle: Vehicle): Vehicle | null {
    let closest: Incident | null = null;
    let closestDist = Infinity;

    for (const incident of this.incidents) {
      if (!incident.isLaneBlocked(vehicle.laneIndex)) continue;
      const dist = incident.positionX - vehicle.x;
      if (dist > 0 && dist < closestDist) {
        closest = incident;
        closestDist = dist;
      }
    }

    if (closest === null) return null;

    // Return a virtual stopped vehicle at the incident position
    return new Vehicle(-closest.id, closest.positionX, 0, vehicle.laneIndex, 0, 0);
  }

  /**
   * For rubbernecking: if vehicle is near an incident in an adjacent (unblocked)
   * lane, return a speed factor < 1. Otherwise return 1.0.
   * Factor decreases linearly from rubberneckingFactor at incident to 1.0 at radius edge.
   * If multiple incidents affect the vehicle, the minimum factor is returned.
   */
  getSpeedReduction(vehicle: Vehicle): number {
    let minFactor = 1.0;

    for (const incident of this.incidents) {
      // Rubbernecking only applies to vehicles NOT in blocked lanes
      if (incident.isLaneBlocked(vehicle.laneIndex)) continue;

      // Check if vehicle is in an adjacent lane to any blocked lane
      let isAdjacent = false;
      for (const blocked of incident.lanesBlocked) {
        if (Math.abs(vehicle.laneIndex - blocked) === 1) {
          isAdjacent = true;
          break;
        }
      }
      if (!isAdjacent) continue;

      const dist = Math.abs(vehicle.x - incident.positionX);
      if (dist >= incident.rubberneckingRadius) continue;

      // Linear interpolation: at incident position → rubberneckingFactor, at radius edge → 1.0
      const t = dist / incident.rubberneckingRadius;
      const factor = incident.rubberneckingFactor + t * (1.0 - incident.rubberneckingFactor);
      if (factor < minFactor) {
        minFactor = factor;
      }
    }

    return minFactor;
  }
}
