import { Lane } from './Lane';
import { OnRamp } from './OnRamp';
import { Vehicle } from './Vehicle';

export class Road {
  lanes: Lane[];
  length: number;
  onRamps: OnRamp[];

  constructor(length: number, laneCount: number) {
    this.length = length;
    this.lanes = [];
    this.onRamps = [];
    for (let i = 0; i < laneCount; i++) {
      this.lanes.push(new Lane(i));
    }
  }

  addOnRamp(onRamp: OnRamp): void {
    this.onRamps.push(onRamp);
  }

  removeOnRamp(onRamp: OnRamp): void {
    const idx = this.onRamps.indexOf(onRamp);
    if (idx !== -1) {
      this.onRamps.splice(idx, 1);
    }
  }

  getLeader(vehicle: Vehicle): Vehicle | null {
    return this.lanes[vehicle.laneIndex].getLeaderOf(vehicle);
  }

  getFollower(vehicle: Vehicle): Vehicle | null {
    return this.lanes[vehicle.laneIndex].getFollowerOf(vehicle);
  }

  getNeighbors(
    vehicle: Vehicle,
    targetLane: number,
  ): { leader: Vehicle | null; follower: Vehicle | null } {
    if (targetLane < 0 || targetLane >= this.lanes.length) {
      return { leader: null, follower: null };
    }
    const lane = this.lanes[targetLane];
    let leader: Vehicle | null = null;
    let follower: Vehicle | null = null;

    for (let i = 0; i < lane.vehicles.length; i++) {
      const v = lane.vehicles[i];
      if (v.x >= vehicle.x) {
        leader = v;
      } else {
        follower = v;
        break;
      }
    }

    return { leader, follower };
  }

  getAllVehicles(): Vehicle[] {
    const all: Vehicle[] = [];
    for (const lane of this.lanes) {
      for (const v of lane.vehicles) {
        all.push(v);
      }
    }
    return all;
  }

  changeLane(vehicle: Vehicle, targetLane: number): void {
    if (targetLane < 0 || targetLane >= this.lanes.length) return;
    this.lanes[vehicle.laneIndex].removeVehicle(vehicle);
    vehicle.laneIndex = targetLane;
    this.lanes[targetLane].addVehicle(vehicle);
  }

  resortAllLanes(): void {
    for (const lane of this.lanes) {
      lane.resort();
    }
  }
}
