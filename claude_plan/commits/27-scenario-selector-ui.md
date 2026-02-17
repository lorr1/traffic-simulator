# Commit 27: Scenario Selector UI

## Goal
Dropdown to load scenarios with description display.

## What to implement

### `src/ui/ScenarioSelector.tsx`
- shadcn Select dropdown with scenario names
- "Free Play" as default option (no scenario)
- On select:
  1. Reset simulation
  2. Apply scenario params
  3. Load scenario into ScenarioManager
  4. Enable/disable on-ramp per scenario config
- Description card below dropdown showing scenario explanation text

### Update `SimulationEngine`
- Add `scenarioManager: ScenarioManager` field
- In `step()`: check for scenario events, execute them (addIncident, setSpawnRate, etc.)

### Wire into PlaybackControls bar
Place scenario selector in the top bar alongside play/pause/speed.

## Tests
No unit tests — UI interaction verified manually.

## Verification
- Select "Phantom Traffic Jam" → simulation resets, high spawn rate, stop-and-go waves emerge after ~30s
- Select "Fender Bender" → incident appears at t=30s, shockwave visible in heatmap
- Select "Major Pileup" → severe congestion, slow recovery visible
- Select "Rush Hour + Incident" → demand ramps up, incident at peak has dramatic effect
- Description text updates for each scenario
- Select "Free Play" → clears scenario, returns to manual control
