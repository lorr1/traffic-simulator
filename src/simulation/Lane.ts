import { Vehicle } from './Vehicle';

export class Lane {
  index: number;
  vehicles: Vehicle[];

  constructor(index: number) {
    this.index = index;
    this.vehicles = [];
  }

  addVehicle(vehicle: Vehicle): void {
    // Insert in correct sorted position (descending by x)
    let insertIndex = 0;
    while (insertIndex < this.vehicles.length && this.vehicles[insertIndex].x > vehicle.x) {
      insertIndex++;
    }
    this.vehicles.splice(insertIndex, 0, vehicle);
  }

  removeVehicle(vehicle: Vehicle): void {
    const idx = this.vehicles.indexOf(vehicle);
    if (idx !== -1) {
      this.vehicles.splice(idx, 1);
    }
  }

  getLeaderOf(vehicle: Vehicle): Vehicle | null {
    const idx = this.vehicles.indexOf(vehicle);
    if (idx <= 0) return null;
    return this.vehicles[idx - 1];
  }

  getFollowerOf(vehicle: Vehicle): Vehicle | null {
    const idx = this.vehicles.indexOf(vehicle);
    if (idx === -1 || idx >= this.vehicles.length - 1) return null;
    return this.vehicles[idx + 1];
  }

  getVehicleAhead(x: number): Vehicle | null {
    // Find first vehicle with position > x (sorted descending, so search from end)
    for (let i = this.vehicles.length - 1; i >= 0; i--) {
      if (this.vehicles[i].x > x) {
        return this.vehicles[i];
      }
    }
    return null;
  }

  resort(): void {
    // Insertion sort — efficient for nearly-sorted arrays
    for (let i = 1; i < this.vehicles.length; i++) {
      const current = this.vehicles[i];
      let j = i - 1;
      while (j >= 0 && this.vehicles[j].x < current.x) {
        this.vehicles[j + 1] = this.vehicles[j];
        j--;
      }
      this.vehicles[j + 1] = current;
    }
  }
}
