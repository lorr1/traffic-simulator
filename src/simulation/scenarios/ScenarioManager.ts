import type { SimulationParams } from '../../types';
import type { Scenario, ScenarioEvent } from './scenarios';

export class ScenarioManager {
  private scenario: Scenario | null = null;
  private eventIndex: number = 0;

  loadScenario(scenario: Scenario): Partial<SimulationParams> {
    this.scenario = scenario;
    this.eventIndex = 0;
    return { ...scenario.params };
  }

  checkEvents(simulationTime: number): ScenarioEvent[] {
    if (!this.scenario) return [];

    const fired: ScenarioEvent[] = [];
    const events = this.scenario.events;

    while (
      this.eventIndex < events.length &&
      events[this.eventIndex].time <= simulationTime
    ) {
      fired.push(events[this.eventIndex]);
      this.eventIndex++;
    }

    return fired;
  }

  getScenario(): Scenario | null {
    return this.scenario;
  }

  clear(): void {
    this.scenario = null;
    this.eventIndex = 0;
  }
}
