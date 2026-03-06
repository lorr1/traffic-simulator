import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
  className?: string;
}

function Panel({ title, children, className = '' }: PanelProps) {
  return (
    <div className={`bg-gray-800 border border-gray-700 rounded-lg overflow-hidden flex flex-col ${className}`}>
      <div className="px-3 py-1.5 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
        {title}
      </div>
      <div className="flex-1 overflow-hidden p-2 min-h-0">{children}</div>
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

export function DashboardLayout({
  canvas,
  controlPanel,
  fundamentalDiagram,
  speedHeatmap,
  flowTimeSeries,
}: DashboardLayoutProps) {
  return (
    <div className="grid gap-2 h-[calc(100vh-56px)]" style={{
      gridTemplateColumns: '1fr 280px',
      gridTemplateRows: '1fr 280px',
    }}>
      <Panel title="Simulation" className="min-h-0">
        {canvas}
      </Panel>
      <Panel title="Parameters" className="row-span-2 min-h-0">
        {controlPanel}
      </Panel>
      <div className="grid grid-cols-3 gap-2 min-h-0">
        <Panel title="Fundamental Diagram">{fundamentalDiagram}</Panel>
        <Panel title="Speed Heatmap">{speedHeatmap}</Panel>
        <Panel title="Flow Time Series">{flowTimeSeries}</Panel>
      </div>
    </div>
  );
}
