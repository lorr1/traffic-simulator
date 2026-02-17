# Commit 20: shadcn/ui Control Panel

## Goal
Full parameter control with real-time feedback.

## What to implement

1. **Initialize shadcn/ui**
   - `npx shadcn-ui@latest init` (New York style, dark theme)
   - Add components: Slider, Button, Input, Label, Select, Card, Separator, Popover

2. **`src/ui/ControlPanel.tsx`**
   Organized in collapsible sections:

   **IDM Parameters:**
   - Desired Speed: slider 10-50 m/s (display as km/h)
   - Time Headway: slider 0.5-3.0 s
   - Max Acceleration: slider 0.3-3.0 m/s²
   - Comfortable Decel: slider 1.0-5.0 m/s²
   - Minimum Gap: slider 1.0-5.0 m

   **MOBIL Parameters:**
   - Politeness: slider 0.0-1.0
   - Change Threshold: slider 0.0-1.0 m/s²
   - Safe Deceleration: slider 2.0-8.0 m/s²

   **Road Configuration:**
   - Lane Count: select 2/3/4/5
   - Spawn Rate: slider 0.5-3.0 veh/s

   Each slider: shows current value, updates `engine.params` on change.

3. **Wire into App.tsx** alongside SimulationCanvas.

## Tests
No unit tests — interactive UI verified manually.

## Verification
- Move any slider → simulation behavior changes immediately
- Increase spawn rate → more vehicles appear
- Decrease desired speed → all vehicles slow down
- Increase politeness → fewer lane changes
- Change lane count → road updates (may require reset)
