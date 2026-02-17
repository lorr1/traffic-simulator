import { useRef, useState, useCallback, type RefObject } from 'react';
import { DataCollector } from '../analytics/DataCollector';
import type { SimulationEngine } from '../simulation/SimulationEngine';
import type { RoadSegmentData } from '../types';

export interface FlowDensityPoint {
  density: number;
  flow: number;
  age: number; // 0 = newest, 1 = oldest
}

const MAX_CHART_POINTS = 500;

export function useDataCollector(engineRef: RefObject<SimulationEngine>) {
  const collectorRef = useRef(new DataCollector());
  const [chartData, setChartData] = useState<FlowDensityPoint[]>([]);
  const [heatmapHistory, setHeatmapHistory] = useState<RoadSegmentData[][]>([]);

  const update = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const collector = collectorRef.current;
    if (!collector.shouldSample(engine.simulationTime)) return;

    const state = engine.getState();
    collector.sample(state.vehicles, engine.params.roadLengthMeters, engine.simulationTime);

    const history = collector.getHistory();
    const points: FlowDensityPoint[] = [];

    for (let i = 0; i < history.length; i++) {
      const age = 1 - i / Math.max(history.length - 1, 1);
      for (const seg of history[i]) {
        if (seg.density > 0) {
          points.push({ density: seg.density, flow: seg.flow, age });
        }
      }
    }

    // Keep only the most recent points if too many
    const trimmed = points.length > MAX_CHART_POINTS
      ? points.slice(points.length - MAX_CHART_POINTS)
      : points;

    setChartData(trimmed);
    setHeatmapHistory([...history]);
  }, [engineRef]);

  const clear = useCallback(() => {
    collectorRef.current.clear();
    setChartData([]);
    setHeatmapHistory([]);
  }, []);

  return { chartData, heatmapHistory, update, clear };
}
