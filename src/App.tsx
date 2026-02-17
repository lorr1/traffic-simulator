import { SimulationCanvas } from './rendering/SimulationCanvas';

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header className="p-4">
        <h1 className="text-2xl font-bold">Traffic Simulator</h1>
      </header>
      <main className="flex-1 px-4 pb-4">
        <SimulationCanvas />
      </main>
    </div>
  );
}

export default App;
