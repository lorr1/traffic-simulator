export interface SimulationParams {
  // IDM
  desiredSpeed: number;          // v0, m/s
  timeHeadway: number;           // T, seconds
  maxAcceleration: number;       // a, m/s²
  comfortDeceleration: number;   // b, m/s²
  minimumGap: number;            // s0, meters
  vehicleLength: number;         // meters

  // MOBIL
  politenessFactor: number;      // p
  changingThreshold: number;     // delta_a_th, m/s²
  safeDeceleration: number;      // b_safe, m/s²

  // Road
  roadLengthMeters: number;
  laneCount: number;

  // Traffic demand
  spawnRate: number;             // vehicles per second

  // Simulation
  dt: number;                    // fixed timestep, seconds
  speedMultiplier: number;       // 1x, 2x, 5x, 10x
}

export interface VehicleState {
  id: number;
  x: number;
  laneIndex: number;
  speed: number;
  acceleration: number;
  length: number;
  desiredSpeed: number;
}

export interface IncidentConfig {
  id: number;
  positionX: number;
  lanesBlocked: number[];
  severity: number;              // 0-1
  startTime: number;
  duration: number;              // seconds, -1 for manual removal
  rubberneckingFactor: number;   // 0.5-1.0
}

export interface SimulationState {
  vehicles: VehicleState[];
  simulationTime: number;
}

export interface RoadSegmentData {
  segmentIndex: number;
  density: number;               // vehicles per km
  flow: number;                  // vehicles per hour
  averageSpeed: number;          // m/s
}
