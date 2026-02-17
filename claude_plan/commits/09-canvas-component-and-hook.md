# Commit 9: SimulationCanvas Component + useSimulation Hook

## Goal
Wire the simulation engine to the Canvas via React. After this commit, you see vehicles driving.

## What to implement

### `src/hooks/useSimulation.ts`
```typescript
export function useSimulation(initialParams: SimulationParams) {
  const engineRef = useRef<SimulationEngine>(new SimulationEngine(initialParams));
  const [state, setState] = useState<SimulationState>(...);
  const [paused, setPaused] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    let lastTime = 0;
    const loop = (timestamp: number) => {
      const delta = lastTime ? timestamp - lastTime : 0;
      lastTime = timestamp;
      if (!paused) {
        engineRef.current.update(delta);
        setState(engineRef.current.getState());
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused]);

  return {
    state,
    paused,
    pause: () => setPaused(true),
    resume: () => setPaused(false),
    reset: () => { engineRef.current.reset(); setState(engineRef.current.getState()); },
    setParams: (p: Partial<SimulationParams>) => engineRef.current.setParams(p),
    engine: engineRef,
  };
}
```

### `src/rendering/SimulationCanvas.tsx`
```typescript
export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const { state } = useSimulation(DEFAULT_PARAMS);

  useEffect(() => {
    if (canvasRef.current) {
      rendererRef.current = new Renderer(canvasRef.current);
    }
  }, []);

  useEffect(() => {
    rendererRef.current?.draw(state);
  }, [state]);

  // Handle resize, mouse events for pan/zoom
  return <canvas ref={canvasRef} className="w-full h-[400px]" />;
}
```

### Update `src/App.tsx`
Mount SimulationCanvas in the main app.

## Tests
No unit tests — this is React + Canvas wiring. Verified visually.

## Verification
- `npm run dev` → browser shows:
  - Gray road with lane markings (single lane for now)
  - Vehicles appearing at left edge, driving right
  - Vehicles colored by speed (fast = green, slowed = yellow/red)
  - Vehicles slow down behind slower vehicles
- Pan with mouse drag, zoom with scroll wheel
