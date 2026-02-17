# User Stories

## Core Experience

**US-1: Watch traffic flow**
As a user, I want to see vehicles driving along a multi-lane highway so I can observe natural traffic patterns.
- Vehicles colored green (fast) → yellow (moderate) → red (stopped)
- Vehicles follow each other realistically (IDM)
- Vehicles change lanes to pass (MOBIL)

**US-2: Place an accident**
As a user, I want to click on the road to place an accident so I can see how it impacts traffic.
- Click location on road → popover with configuration (lanes blocked, severity, duration)
- Blocked lanes show incident marker
- Traffic queues upstream from incident
- Shockwave propagates backward

**US-3: Remove an accident**
As a user, I want to remove an active accident to see traffic recovery dynamics.
- Click incident marker or use incident list to remove
- Watch queue gradually dissolve and flow restore

**US-4: Adjust simulation parameters**
As a user, I want sliders for all key parameters so I can explore "what if" scenarios.
- IDM: desired speed, time headway, max acceleration, comfortable deceleration, minimum gap
- MOBIL: politeness factor, change threshold, safe deceleration
- Road: lane count, spawn rate
- Changes take effect immediately (no restart)

**US-5: Control playback**
As a user, I want play/pause/speed/reset controls to examine specific moments.
- Play/Pause toggle
- Speed: 1x, 2x, 5x, 10x
- Reset: clears all vehicles and incidents, restarts simulation
- Time display (mm:ss of simulation time)

## Analytics

**US-6: Fundamental diagram**
As a user, I want to see a real-time flow vs density chart so I can understand the theoretical relationship.
- Scatter plot builds up over time showing inverted-V shape
- Points fade with age
- See points migrate from free-flow to congested branch when incident occurs

**US-7: Speed heatmap**
As a user, I want a space-time diagram showing speed across the road over time.
- X = position, Y = time (scrolling)
- Color = speed (green/yellow/red)
- Shockwaves visible as backward-diagonal red bands
- Most educational visualization for accident impact

**US-8: Flow time series**
As a user, I want to see flow at a point over time to understand throughput changes.
- Line chart at road midpoint
- Flow drops when incident starts, recovers after clearance

## Dashboard

**US-9: Rearrange dashboard**
As a user, I want to drag and resize panels to customize my view.
- Main canvas, control panel, 3 chart panels
- Draggable and resizable via react-grid-layout

## Scenarios

**US-10: Load pre-built scenario**
As a user, I want to select a scenario from a dropdown to see curated demonstrations.
- 4 scenarios with description text explaining what to watch for
- Loading a scenario resets simulation and applies its parameters + timed events

## On-Ramps

**US-11: Toggle on-ramp**
As a user, I want to toggle an on-ramp to see how merging traffic affects flow.
- On-ramp with 300m acceleration lane feeding into rightmost lane
- Toggle on/off from control panel
- Adds realistic merge congestion
