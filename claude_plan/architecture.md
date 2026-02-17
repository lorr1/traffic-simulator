# Architecture

## High-Level Design

```
┌─────────────────────────────────────────────────────────┐
│                    React App (App.tsx)                   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │            DashboardLayout                       │    │
│  │         (react-grid-layout)                      │    │
│  │                                                  │    │
│  │  ┌──────────────────────────────────────────┐   │    │
│  │  │     SimulationCanvas (Canvas element)     │   │    │
│  │  │     Renderer → RoadRenderer              │   │    │
│  │  │              → VehicleRenderer            │   │    │
│  │  │              → IncidentRenderer           │   │    │
│  │  └──────────────────────────────────────────┘   │    │
│  │                                                  │    │
│  │  ┌──────────┐ ┌─────────────┐ ┌────────────┐   │    │
│  │  │ Control  │ │ Fundamental │ │   Speed    │   │    │
│  │  │ Panel    │ │ Diagram     │ │  Heatmap   │   │    │
│  │  │(shadcn)  │ │ (Recharts)  │ │  (Canvas)  │   │    │
│  │  └──────────┘ └─────────────┘ └────────────┘   │    │
│  │               ┌─────────────┐                    │    │
│  │               │ Flow Time   │                    │    │
│  │               │ Series      │                    │    │
│  │               │ (Recharts)  │                    │    │
│  │               └─────────────┘                    │    │
│  └─────────────────────────────────────────────────┘    │
│                                                         │
│  Hooks: useSimulation ←→ SimulationEngine               │
│         useDataCollector ←→ DataCollector                │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│              Simulation Engine (pure TS)                 │
│                                                         │
│  SimulationEngine                                       │
│    ├── Road                                             │
│    │     ├── Lane[] (sorted vehicles)                   │
│    │     └── OnRamp? (optional)                         │
│    ├── VehicleFactory (spawn/despawn)                   │
│    ├── IncidentManager                                  │
│    │     └── Incident[]                                 │
│    ├── ScenarioManager                                  │
│    └── Models                                           │
│          ├── IDMModel.computeAcceleration()             │
│          └── MOBILModel.evaluateLaneChange()            │
└─────────────────────────────────────────────────────────┘
```

## Key Design Principles

### 1. Simulation/Rendering Separation
`src/simulation/` has **zero imports** from React, DOM, or Canvas. Every class is testable with pure Vitest unit tests. The simulation exposes state snapshots that the rendering layer consumes.

### 2. Fixed-Timestep Physics
```
update(wallDeltaMs):
  accumulator += (wallDeltaMs / 1000) × speedMultiplier
  accumulator = min(accumulator, 0.5)  // cap to prevent spiral of death

  while accumulator >= dt:
    step(dt)
    accumulator -= dt
```
- dt = 0.033s (~30 Hz physics)
- Rendering at display refresh rate via requestAnimationFrame
- Deterministic regardless of frame rate

### 3. Each Step
```
step(dt):
  1. vehicleFactory.trySpawn(dt)           // Poisson process
  2. for each vehicle:
       leader = min(road.getLeader(v), incidentManager.getVirtualObstacle(v))
       speedFactor = incidentManager.getSpeedReduction(v)
       v.acceleration = IDM.compute(v, leader, params, speedFactor)
  3. for each vehicle (random order):
       decision = MOBIL.evaluate(v, road, params)
       if decision.shouldChange: road.changeLane(v, decision.targetLane)
  4. for each vehicle:
       v.speed = max(0, v.speed + v.acceleration × dt)
       v.x += v.speed × dt
  5. vehicleFactory.despawn()
  6. incidentManager.update(simulationTime)
  7. scenarioManager.checkEvents(simulationTime)
```

### 4. Vehicle Ordering
Each Lane keeps vehicles sorted by x (descending — front of road first). After position updates, a single pass re-sorts (nearly sorted → O(n) insertion sort). Leader lookup is O(1) by array index.

### 5. Lane Changes
Processed in shuffled order each step to avoid directional bias. A lane change is instant (vehicle teleported to new lane at same x). Standard in traffic simulation.

### 6. Parameter Hot-Swap
SimulationEngine reads from a shared SimulationParams object every step. UI sliders mutate this object. No restart needed.

### 7. Per-Vehicle Variation
Each vehicle's desiredSpeed = randomNormal(v₀, 0.1 × v₀). This creates natural speed differentials that drive lane-changing, critical for realism.

## File Structure

```
traffic-simulator/
  claude_plan/                  ← This documentation
  LICENSE
  index.html
  package.json
  tsconfig.json
  vite.config.ts
  tailwind.config.ts
  postcss.config.js
  .gitignore
  src/
    main.tsx
    App.tsx
    index.css
    types.ts
    constants.ts
    simulation/
      SimulationEngine.ts
      Road.ts
      Lane.ts
      Vehicle.ts
      VehicleFactory.ts
      OnRamp.ts
      models/
        IDMModel.ts
        MOBILModel.ts
      incidents/
        Incident.ts
        IncidentManager.ts
      scenarios/
        ScenarioManager.ts
        scenarios.ts
      __tests__/
        Lane.test.ts
        Road.test.ts
        VehicleFactory.test.ts
        SimulationEngine.test.ts
        OnRamp.test.ts
      models/__tests__/
        IDMModel.test.ts
        MOBILModel.test.ts
      incidents/__tests__/
        IncidentManager.test.ts
      scenarios/__tests__/
        ScenarioManager.test.ts
    rendering/
      SimulationCanvas.tsx
      Renderer.ts
      RoadRenderer.ts
      VehicleRenderer.ts
      IncidentRenderer.ts
      Camera.ts
      __tests__/
        Camera.test.ts
    analytics/
      DataCollector.ts
      FundamentalDiagram.tsx
      SpeedHeatmap.tsx
      FlowTimeSeries.tsx
      __tests__/
        DataCollector.test.ts
    ui/
      ControlPanel.tsx
      IncidentControls.tsx
      PlaybackControls.tsx
      ScenarioSelector.tsx
      DashboardLayout.tsx
    hooks/
      useSimulation.ts
      useDataCollector.ts
    utils/
      math.ts
      colors.ts
      __tests__/
        math.test.ts
        colors.test.ts
    components/ui/              ← shadcn/ui components (auto-generated)
```

## Data Flow

```
User clicks slider → ControlPanel → useSimulation.setParams() → engine.params mutated
                                                                         │
requestAnimationFrame ──► useSimulation.update() ──► engine.update(dt) ──┤
                                                          │               │
                                                    engine.getState() ◄──┘
                                                          │
                              ┌────────────────────────────┤
                              ▼                            ▼
                    Renderer.draw(state)        DataCollector.sample(state)
                              │                            │
                         Canvas pixels              Chart data arrays
                                                          │
                                                ┌─────────┼──────────┐
                                                ▼         ▼          ▼
                                          FundDiagram  Heatmap  TimeSeries
```
