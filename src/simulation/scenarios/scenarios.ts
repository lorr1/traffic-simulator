import type { SimulationParams, IncidentConfig } from '../../types';

export interface ScenarioEvent {
  time: number; // sim-seconds
  action: 'addIncident' | 'removeIncident' | 'setSpawnRate';
  payload: Partial<IncidentConfig> | number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  params: Partial<SimulationParams>;
  events: ScenarioEvent[];
  onRampEnabled?: boolean;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'phantom-jam',
    name: 'Phantom Traffic Jam',
    description:
      'No accident — just high density. Watch for stop-and-go waves that emerge from tiny speed variations. These "phantom jams" propagate backward at ~15 km/h.',
    params: { spawnRate: 2.5, laneCount: 3 },
    events: [],
  },
  {
    id: 'fender-bender',
    name: 'Fender Bender',
    description:
      'A single lane blocked for 3 minutes. Watch the shockwave propagate upstream — it travels backward even though all vehicles move forward.',
    params: { spawnRate: 1.5, laneCount: 3 },
    events: [
      {
        time: 30,
        action: 'addIncident',
        payload: {
          positionX: 1500,
          lanesBlocked: [1],
          severity: 0.5,
          duration: 180,
          rubberneckingFactor: 0.7,
        },
      },
    ],
  },
  {
    id: 'major-pileup',
    name: 'Major Pileup',
    description:
      'Two of three lanes blocked for 10 minutes. Notice how congestion persists long after the incident clears — the "hysteresis" effect.',
    params: { spawnRate: 2.0, laneCount: 3 },
    events: [
      {
        time: 20,
        action: 'addIncident',
        payload: {
          positionX: 1500,
          lanesBlocked: [0, 1],
          severity: 0.8,
          duration: 600,
          rubberneckingFactor: 0.5,
        },
      },
    ],
  },
  {
    id: 'rush-hour-incident',
    name: 'Rush Hour + Incident',
    description:
      'Demand ramps up to simulate rush hour, then an incident hits at peak. Compare the impact vs the same incident in light traffic.',
    params: { spawnRate: 0.5, laneCount: 3 },
    events: [
      { time: 10, action: 'setSpawnRate', payload: 1.0 },
      { time: 20, action: 'setSpawnRate', payload: 1.5 },
      { time: 30, action: 'setSpawnRate', payload: 2.0 },
      { time: 40, action: 'setSpawnRate', payload: 2.5 },
      {
        time: 45,
        action: 'addIncident',
        payload: {
          positionX: 1500,
          lanesBlocked: [1],
          severity: 0.6,
          duration: 180,
          rubberneckingFactor: 0.6,
        },
      },
    ],
  },
];
