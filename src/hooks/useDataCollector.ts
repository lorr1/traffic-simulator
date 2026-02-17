import { useRef, useState, useCallback, type RefObject } from 'react';
import { DataCollector } from '../analytics/DataCollector';
import type { SimulationEngine } from '../simulation/SimulationEngine';
import type { FlowTimePoint } from '../analytics/FlowTimeSeries';
import type { RoadSegmentData } from '../types';

export interface FlowDensityPoint {
  density: number;
  flow: number;
  age: number; // 0 = newest, 1 = oldest
}

const MAX_CHART_POINTS = 500;
const SAMPLE_INTERVAL = 0.5; // must match DataCollector

export function useDataCollector(engineRef: RefObject<SimulationEngine>) {
  const collectorRef = useRef(new DataCollector());
  const [chartData, setChartData] = useState<FlowDensityPoint[]>([]);
  const [heatmapHistory, setHeatmapHistory] = useState<RoadSegmentData[][]>([]);
  const [flowTimeSeries, setFlowTimeSeries] = useState<FlowTimePoint[]>([]);

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

    // Flow time series at road midpoint
    const roadLength = engine.params.roadLengthMeters;
    const midSegmentIndex = Math.floor(roadLength / 2 / 100); // 100m segments
    const flowPoints: FlowTimePoint[] = [];
    for (let i = 0; i < history.length; i++) {
      const seg = history[i][midSegmentIndex];
      if (seg) {
        flowPoints.push({
          time: parseFloat((i * SAMPLE_INTERVAL).toFixed(1)),
          flow: seg.flow,
        });
      }
    }
    setFlowTimeSeries(flowPoints);
  }, [engineRef]);

  const clear = useCallback(() => {
    collectorRef.current.clear();
    setChartData([]);
    setHeatmapHistory([]);
    setFlowTimeSeries([]);
  }, []);

  return { chartData, heatmapHistory, flowTimeSeries, update, clear };
}
