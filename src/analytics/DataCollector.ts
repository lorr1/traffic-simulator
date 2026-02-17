import type { VehicleState, RoadSegmentData } from '../types';

export class DataCollector {
  private segmentLength: number = 100; // meters
  private sampleInterval: number = 0.5; // sim-seconds
  private lastSampleTime: number = -Infinity;
  private history: RoadSegmentData[][] = [];
  private maxHistory: number = 600; // 5 min at 0.5s intervals

  shouldSample(simulationTime: number): boolean {
    return simulationTime - this.lastSampleTime >= this.sampleInterval;
  }

  sample(
    vehicles: VehicleState[],
    roadLength: number,
    simulationTime: number,
  ): RoadSegmentData[] {
    this.lastSampleTime = simulationTime;

    const segmentCount = Math.ceil(roadLength / this.segmentLength);
    const segments: RoadSegmentData[] = [];

    for (let i = 0; i < segmentCount; i++) {
      const segStart = i * this.segmentLength;
      const segEnd = segStart + this.segmentLength;

      const inSegment = vehicles.filter(
        (v) => v.x >= segStart && v.x < segEnd,
      );

      const count = inSegment.length;
      const density = (count / this.segmentLength) * 1000; // veh/km

      let averageSpeed = 0;
      if (count > 0) {
        averageSpeed =
          inSegment.reduce((sum, v) => sum + v.speed, 0) / count;
      }

      // flow = density (veh/km) × avgSpeed (m/s) × 3.6 (km/h per m/s) = veh/hr
      const flow = density * averageSpeed * 3.6;

      segments.push({ segmentIndex: i, density, flow, averageSpeed });
    }

    this.history.push(segments);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    return segments;
  }

  getHistory(): RoadSegmentData[][] {
    return this.history;
  }

  getLatest(): RoadSegmentData[] | null {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1];
  }

  clear(): void {
    this.history = [];
    this.lastSampleTime = -Infinity;
  }
}
