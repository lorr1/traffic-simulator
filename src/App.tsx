import { SimulationCanvas } from './rendering/SimulationCanvas';
import { ControlPanel } from './ui/ControlPanel';
import { PlaybackControls } from './ui/PlaybackControls';
import { DashboardLayout } from './ui/DashboardLayout';
import { FundamentalDiagram } from './analytics/FundamentalDiagram';
import { SpeedHeatmap } from './analytics/SpeedHeatmap';
import { FlowTimeSeries } from './analytics/FlowTimeSeries';
import { useSimulation } from './hooks/useSimulation';
import { useDataCollector } from './hooks/useDataCollector';
import { DEFAULT_PARAMS } from './constants';
import { useState, useCallback } from 'react';

function App() {
  const simulation = useSimulation(DEFAULT_PARAMS);
  const { chartData, heatmapHistory, flowTimeSeries, update, clear } =
    useDataCollector(simulation.engine);

  const getOnRamp = () => simulation.engine.current.road.onRamps[0];

  const [onRampState, setOnRampState] = useState({
    enabled: getOnRamp()?.enabled ?? true,
    spawnRate: getOnRamp()?.spawnRate ?? 0.3,
  });

  const handleOnRampChange = useCallback((changes: Partial<typeof onRampState>) => {
    const ramp = getOnRamp();
    if (!ramp) return;
    if (changes.enabled !== undefined) ramp.enabled = changes.enabled;
    if (changes.spawnRate !== undefined) ramp.spawnRate = changes.spawnRate;
    setOnRampState((prev) => ({ ...prev, ...changes }));
  }, []);

  // Trigger data collection on each state change
  if (simulation.state.simulationTime > 0) {
    update();
  }

  const handleReset = () => {
    simulation.reset();
    clear();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="flex items-center justify-between px-4 py-2">
        <h1 className="text-xl font-bold">Traffic Simulator</h1>
        <PlaybackControls
          paused={simulation.paused}
          simulationTime={simulation.state.simulationTime}
          speedMultiplier={simulation.engine.current.params.speedMultiplier}
          onPause={simulation.pause}
          onResume={simulation.resume}
          onReset={handleReset}
          onSpeedChange={(m) => simulation.setParams({ speedMultiplier: m })}
        />
      </header>
      <main className="flex-1 px-2 pb-2">
        <DashboardLayout
          canvas={<SimulationCanvas simulation={simulation} />}
          controlPanel={
            <ControlPanel
              params={simulation.engine.current.params}
              onParamChange={simulation.setParams}
              onReset={handleReset}
              onRamp={onRampState}
              onOnRampChange={handleOnRampChange}
            />
          }
          fundamentalDiagram={<FundamentalDiagram data={chartData} />}
          speedHeatmap={
            <SpeedHeatmap
              history={heatmapHistory}
              maxSpeed={simulation.engine.current.params.desiredSpeed}
            />
          }
          flowTimeSeries={<FlowTimeSeries data={flowTimeSeries} />}
        />
      </main>
    </div>
  );
}

export default App;
