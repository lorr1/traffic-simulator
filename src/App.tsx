import { SimulationCanvas } from './rendering/SimulationCanvas';
import { ControlPanel } from './ui/ControlPanel';
import { useSimulation } from './hooks/useSimulation';
import { DEFAULT_PARAMS } from './constants';

function App() {
  const simulation = useSimulation(DEFAULT_PARAMS);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="p-4">
        <h1 className="text-2xl font-bold">Traffic Simulator</h1>
      </header>
      <main className="flex-1 px-4 pb-4 flex gap-4">
        <ControlPanel
          params={simulation.engine.current.params}
          onParamChange={simulation.setParams}
          onReset={simulation.reset}
        />
        <div className="flex-1">
          <SimulationCanvas simulation={simulation} />
        </div>
      </main>
    </div>
  );
}

export default App;
