import type { SimulationParams } from './types';

export const DEFAULT_PARAMS: SimulationParams = {
  // IDM parameters
  desiredSpeed: 33.3,            // v0 = 120 km/h ≈ 33.3 m/s
  timeHeadway: 1.5,              // T = 1.5 seconds
  maxAcceleration: 1.0,          // a = 1.0 m/s²
  comfortDeceleration: 1.5,      // b = 1.5 m/s²
  minimumGap: 2.0,               // s0 = 2.0 meters
  vehicleLength: 5.0,            // 5.0 meters

  // MOBIL parameters
  politenessFactor: 0.5,         // p = 0.5
  changingThreshold: 0.2,        // delta_a_th = 0.2 m/s²
  safeDeceleration: 4.0,         // b_safe = 4.0 m/s²

  // Road parameters
  roadLengthMeters: 2000,        // 2 km road
  laneCount: 3,                  // 3 lanes

  // Traffic demand
  spawnRate: 0.5,                // 0.5 vehicles per second

  // Simulation
  dt: 1 / 60,                    // 60 fps fixed timestep
  speedMultiplier: 1,            // 1x real-time
};
