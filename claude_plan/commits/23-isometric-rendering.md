# Commit 23: Isometric Rendering

## Goal
Transform the flat 2D view into an angled isometric perspective for visual depth.

## What to implement

### Update `Camera.ts`
- Add isometric projection mode
- Tilt angle: ~15-20° (configurable)
- `worldToScreen` applies: y_screen = y_world × cos(tilt), x_screen offset += y_world × sin(tilt)
- Perspective foreshortening: lanes further from viewer slightly smaller
- `screenToWorld` inverse transform (for click detection)

### Update `RoadRenderer.ts`
- Road surface as parallelogram instead of rectangle
- Lane markings follow isometric angle
- Subtle gradient on road surface (lighter near bottom/closer edge)

### Update `VehicleRenderer.ts`
- Vehicles as parallelograms matching road tilt
- Drop shadow beneath each vehicle (offset by tilt)
- Slight 3D effect: vehicle top face slightly lighter than side

### Update `IncidentRenderer.ts`
- Incident markers projected to isometric space

## Tests
### Update `Camera.test.ts`
- worldToScreen/screenToWorld still inverses in isometric mode
- Known point transforms correctly

## Verification
- Road has visual depth (recedes slightly)
- Vehicles have subtle 3D appearance
- Click-to-place incidents still works (inverse transform correct)
- Pan/zoom still work
- Overall aesthetic improvement from flat view
