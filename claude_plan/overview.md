# Traffic Simulator — Project Overview

## Problem

Traffic accidents create cascading effects — shockwaves, capacity reduction, secondary incidents — that are counterintuitive and hard to reason about. This simulator lets users see and interact with these dynamics in real-time, building intuition about how accidents impact traffic flow.

## Solution

An interactive web-based traffic simulator implementing the **Intelligent Driver Model (IDM)** for car-following and **MOBIL** for lane-changing on a multi-lane highway. Users can:

- Place accidents on the road and watch shockwaves form
- Adjust all simulation parameters in real-time (speed, headway, politeness, demand)
- See real-time analytics: fundamental diagram (flow vs density), space-time speed heatmap, flow time series
- Load pre-built educational scenarios demonstrating key phenomena
- Toggle on-ramps to see merge effects

## Tech Stack

| Component | Choice | Why |
|-----------|--------|-----|
| Language | TypeScript | Type safety for simulation math |
| Framework | React 19 | Modular UI, large ecosystem |
| UI Components | shadcn/ui (Radix + Tailwind) | Customizable, copy-paste ownership |
| Dashboard | react-grid-layout | Draggable/resizable panels |
| Charts | Recharts | Lightweight, React-native |
| Rendering | HTML5 Canvas (isometric 2D) | ~10k vehicles at 60fps |
| Build | Vite | Fast dev server |
| Testing | Vitest | Fast, Vite-native |

## Core Models

### IDM (Intelligent Driver Model)
```
acceleration = a × [1 - (v/v₀)⁴ - (s*/s)²]
s* = s₀ + max(0, v·T + v·Δv / (2·√(a·b)))
```

| Param | Default | Description |
|-------|---------|-------------|
| v₀ | 33 m/s (120 km/h) | Desired speed |
| T | 1.5 s | Safe time headway |
| a | 1.0 m/s² | Max acceleration |
| b | 2.0 m/s² | Comfortable deceleration |
| s₀ | 2.0 m | Minimum gap |

### MOBIL (Lane-Change Model)
- **Safety:** new follower's deceleration < b_safe
- **Incentive:** own acceleration gain - p × impact on new follower > threshold

| Param | Default | Description |
|-------|---------|-------------|
| p | 0.3 | Politeness factor |
| Δa_th | 0.2 m/s² | Change threshold |
| b_safe | 4.0 m/s² | Max safe decel for follower |

### Incident Effects
1. **Lane blockage** — virtual stopped vehicle, IDM queues traffic naturally
2. **Rubbernecking** — speed reduction in adjacent lanes near incident
3. **Avoidance** — MOBIL incentive boosted to change away from blocked lanes

## 4 Educational Scenarios
1. **Phantom Traffic Jam** — stop-and-go waves from density alone
2. **Fender Bender** — 1 lane blocked, shockwave propagation
3. **Major Pileup** — 2/3 lanes blocked, recovery dynamics
4. **Rush Hour + Incident** — same incident, different demand = different impact
