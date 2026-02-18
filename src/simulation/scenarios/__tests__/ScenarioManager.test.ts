import { describe, it, expect } from 'vitest';
import { ScenarioManager } from '../ScenarioManager';
import type { Scenario } from '../scenarios';

function makeScenario(events: Scenario['events'] = []): Scenario {
  return {
    id: 'test',
    name: 'Test Scenario',
    description: 'A test scenario',
    params: { spawnRate: 2.0, laneCount: 3 },
    events,
  };
}

describe('ScenarioManager', () => {
  it('events fire at correct times', () => {
    const mgr = new ScenarioManager();
    const scenario = makeScenario([
      { time: 10, action: 'setSpawnRate', payload: 1.5 },
      { time: 20, action: 'setSpawnRate', payload: 2.0 },
    ]);
    mgr.loadScenario(scenario);

    // Before first event
    expect(mgr.checkEvents(5)).toEqual([]);

    // At first event
    const first = mgr.checkEvents(10);
    expect(first).toHaveLength(1);
    expect(first[0].action).toBe('setSpawnRate');
    expect(first[0].payload).toBe(1.5);

    // Between events
    expect(mgr.checkEvents(15)).toEqual([]);

    // At second event
    const second = mgr.checkEvents(20);
    expect(second).toHaveLength(1);
    expect(second[0].payload).toBe(2.0);
  });

  it('no events fire if no scenario loaded', () => {
    const mgr = new ScenarioManager();
    expect(mgr.checkEvents(100)).toEqual([]);
  });

  it('loadScenario resets event tracking', () => {
    const mgr = new ScenarioManager();
    const scenario = makeScenario([
      { time: 5, action: 'setSpawnRate', payload: 1.0 },
    ]);

    mgr.loadScenario(scenario);
    expect(mgr.checkEvents(10)).toHaveLength(1);

    // Reload — event should fire again
    mgr.loadScenario(scenario);
    expect(mgr.checkEvents(10)).toHaveLength(1);
  });

  it('multiple events at same time all fire', () => {
    const mgr = new ScenarioManager();
    const scenario = makeScenario([
      { time: 10, action: 'setSpawnRate', payload: 1.0 },
      { time: 10, action: 'addIncident', payload: { positionX: 500, lanesBlocked: [0], severity: 0.5, duration: 60, rubberneckingFactor: 0.7 } },
    ]);
    mgr.loadScenario(scenario);

    const events = mgr.checkEvents(10);
    expect(events).toHaveLength(2);
    expect(events[0].action).toBe('setSpawnRate');
    expect(events[1].action).toBe('addIncident');
  });

  it('loadScenario returns scenario params', () => {
    const mgr = new ScenarioManager();
    const scenario = makeScenario();
    const params = mgr.loadScenario(scenario);
    expect(params.spawnRate).toBe(2.0);
    expect(params.laneCount).toBe(3);
  });

  it('clear removes scenario', () => {
    const mgr = new ScenarioManager();
    const scenario = makeScenario([
      { time: 5, action: 'setSpawnRate', payload: 1.0 },
    ]);
    mgr.loadScenario(scenario);
    mgr.clear();

    expect(mgr.getScenario()).toBeNull();
    expect(mgr.checkEvents(100)).toEqual([]);
  });
});
