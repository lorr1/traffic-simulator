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

function App() {
  const simulation = useSimulation(DEFAULT_PARAMS);
  const { chartData, heatmapHistory, flowTimeSeries, update, clear } =
    useDataCollector(simulation.engine);

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
