import { useMemo, type ReactNode } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface PanelProps {
  title: string;
  children: ReactNode;
}

function Panel({ title, children }: PanelProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg overflow-hidden h-full flex flex-col">
      <div className="drag-handle px-3 py-1.5 bg-gray-750 border-b border-gray-700 cursor-move text-xs font-semibold text-gray-400 uppercase tracking-wider select-none shrink-0">
        {title}
      </div>
      <div className="flex-1 overflow-hidden p-2">{children}</div>
    </div>
  );
}

interface DashboardLayoutProps {
  canvas: ReactNode;
  controlPanel: ReactNode;
  fundamentalDiagram: ReactNode;
  speedHeatmap: ReactNode;
  flowTimeSeries: ReactNode;
}

const LAYOUTS = {
  lg: [
    { i: 'canvas', x: 0, y: 0, w: 9, h: 8, minW: 4, minH: 4 },
    { i: 'controls', x: 9, y: 0, w: 3, h: 8, minW: 2, minH: 4 },
    { i: 'fundamental', x: 0, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'heatmap', x: 4, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'flow', x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
  ],
  md: [
    { i: 'canvas', x: 0, y: 0, w: 8, h: 8, minW: 4, minH: 4 },
    { i: 'controls', x: 8, y: 0, w: 4, h: 8, minW: 2, minH: 4 },
    { i: 'fundamental', x: 0, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'heatmap', x: 4, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
    { i: 'flow', x: 8, y: 8, w: 4, h: 6, minW: 3, minH: 4 },
  ],
  sm: [
    { i: 'canvas', x: 0, y: 0, w: 6, h: 6, minW: 3, minH: 3 },
    { i: 'controls', x: 0, y: 6, w: 6, h: 6, minW: 2, minH: 4 },
    { i: 'fundamental', x: 0, y: 12, w: 6, h: 5, minW: 3, minH: 4 },
    { i: 'heatmap', x: 0, y: 17, w: 6, h: 5, minW: 3, minH: 4 },
    { i: 'flow', x: 0, y: 22, w: 6, h: 5, minW: 3, minH: 4 },
  ],
};

export function DashboardLayout({
  canvas,
  controlPanel,
  fundamentalDiagram,
  speedHeatmap,
  flowTimeSeries,
}: DashboardLayoutProps) {
  const layouts = useMemo(() => LAYOUTS, []);

  return (
    <ResponsiveGridLayout
      className="layout"
      layouts={layouts}
      breakpoints={{ lg: 1200, md: 900, sm: 0 }}
      cols={{ lg: 12, md: 12, sm: 6 }}
      rowHeight={40}
      draggableHandle=".drag-handle"
      margin={[8, 8]}
      containerPadding={[0, 0]}
    >
      <div key="canvas">
        <Panel title="Simulation">{canvas}</Panel>
      </div>
      <div key="controls">
        <Panel title="Parameters">{controlPanel}</Panel>
      </div>
      <div key="fundamental">
        <Panel title="Fundamental Diagram">{fundamentalDiagram}</Panel>
      </div>
      <div key="heatmap">
        <Panel title="Speed Heatmap">{speedHeatmap}</Panel>
      </div>
      <div key="flow">
        <Panel title="Flow Time Series">{flowTimeSeries}</Panel>
      </div>
    </ResponsiveGridLayout>
  );
}
