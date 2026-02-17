# Commit 21: Playback Controls

## Goal
Play/pause, speed control, reset, and time display.

## What to implement

### `src/ui/PlaybackControls.tsx`
- **Play/Pause** toggle button (shadcn Button with Lucide Play/Pause icons)
- **Speed selector**: button group for 1x, 2x, 5x, 10x (highlight active)
- **Reset** button: clears vehicles and incidents, resets time to 0
- **Time display**: formatted as mm:ss.s of simulation time

Layout: horizontal bar above the main canvas.

Wire into `useSimulation` hook methods.

## Tests
No unit tests — interactive verified manually.

## Verification
- Pause freezes simulation, vehicles stop moving
- Resume continues from where paused
- Speed 10x makes vehicles move visibly faster
- Reset clears everything
- Time display advances at correct rate per speed multiplier
