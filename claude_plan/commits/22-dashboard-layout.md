# Commit 22: Dashboard Layout with react-grid-layout

## Goal
Arrange all panels (canvas, controls, charts) in a draggable/resizable grid.

## What to implement

### `src/ui/DashboardLayout.tsx`
- react-grid-layout `<ResponsiveGridLayout>` wrapping all panels
- Default layout:
  - Main canvas: top row, full width, height 50%
  - Control panel: bottom-left, 1/4 width
  - Fundamental diagram: bottom-center-left, 1/4 width
  - Speed heatmap: bottom-right, 1/4 width
  - Flow time series: below fundamental diagram, 1/4 width
- Panels have drag handles (title bars)
- Panels are resizable (react-grid-layout handles)
- Responsive breakpoints for smaller screens

### Update `src/App.tsx`
Replace simple layout with DashboardLayout.

### Add CSS for react-grid-layout
Import react-grid-layout styles.

## Tests
No unit tests — layout verified manually.

## Verification
- All panels visible in default layout
- Drag any panel to new position
- Resize any panel
- Charts re-render correctly when resized
- Canvas handles resize events (re-scales road view)
