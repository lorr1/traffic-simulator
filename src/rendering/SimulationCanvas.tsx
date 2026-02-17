import { useRef, useEffect, useCallback, useState } from 'react';
import { Renderer } from './Renderer';
import { useSimulation } from '../hooks/useSimulation';
import { useDataCollector } from '../hooks/useDataCollector';
import { IncidentPopover, IncidentList } from '../ui/IncidentControls';
import { FundamentalDiagram } from '../analytics/FundamentalDiagram';
import { SpeedHeatmap } from '../analytics/SpeedHeatmap';
import { FlowTimeSeries } from '../analytics/FlowTimeSeries';
import { DEFAULT_PARAMS } from '../constants';
import type { IncidentConfig } from '../types';

const LANE_WIDTH = 3.7;

export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const isDragging = useRef(false);
  const dragMoved = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const {
    state,
    addIncident,
    removeIncident,
    getActiveIncidents,
    engine: engineRef,
  } = useSimulation(DEFAULT_PARAMS);
  const { chartData, heatmapHistory, flowTimeSeries, update: updateCollector } = useDataCollector(engineRef);

  const [popover, setPopover] = useState<{
    positionX: number;
    screenX: number;
    screenY: number;
  } | null>(null);

  // Force re-render to update incident list
  const [, setIncidentVersion] = useState(0);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;

    rendererRef.current = new Renderer(canvas);
  }, []);

  // Handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        rendererRef.current?.getCamera().resize(canvas.width, canvas.height);
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Draw on state change and update data collector
  useEffect(() => {
    rendererRef.current?.draw(state, getActiveIncidents());
    updateCollector();
  }, [state, getActiveIncidents, updateCollector]);

  // Pan handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    dragMoved.current = false;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = (e.clientX - lastMouse.current.x) * devicePixelRatio;
    const dy = (e.clientY - lastMouse.current.y) * devicePixelRatio;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      dragMoved.current = true;
    }
    rendererRef.current?.getCamera().handlePan(dx, dy);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      const wasDragging = dragMoved.current;
      isDragging.current = false;
      dragMoved.current = false;

      // Only show popover on click (not drag)
      if (wasDragging || !rendererRef.current) return;

      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const sx = (e.clientX - rect.left) * devicePixelRatio;
      const sy = (e.clientY - rect.top) * devicePixelRatio;
      const world = rendererRef.current.getCamera().screenToWorld(sx, sy);

      // Check if click is on the road
      const roadHeight = DEFAULT_PARAMS.laneCount * LANE_WIDTH;
      if (
        world.x >= 0 &&
        world.x <= DEFAULT_PARAMS.roadLengthMeters &&
        world.y >= 0 &&
        world.y <= roadHeight
      ) {
        setPopover({
          positionX: world.x,
          screenX: e.clientX - rect.left,
          screenY: e.clientY - rect.top,
        });
      } else {
        setPopover(null);
      }
    },
    [],
  );

  const onMouseLeave = useCallback(() => {
    isDragging.current = false;
    dragMoved.current = false;
  }, []);

  // Zoom handler
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left) * devicePixelRatio;
    const y = (e.clientY - rect.top) * devicePixelRatio;
    rendererRef.current?.getCamera().handleZoom(-e.deltaY, x, y);
  }, []);

  const handleCreateIncident = useCallback(
    (config: IncidentConfig) => {
      addIncident(config);
      setPopover(null);
      setIncidentVersion((v) => v + 1);
    },
    [addIncident],
  );

  const handleRemoveIncident = useCallback(
    (id: number) => {
      removeIncident(id);
      setIncidentVersion((v) => v + 1);
    },
    [removeIncident],
  );

  const incidents = getActiveIncidents();

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-[400px]"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
      />
      {popover && (
        <IncidentPopover
          positionX={popover.positionX}
          screenX={popover.screenX}
          screenY={popover.screenY}
          laneCount={DEFAULT_PARAMS.laneCount}
          simulationTime={state.simulationTime}
          onCreat={handleCreateIncident}
          onCancel={() => setPopover(null)}
        />
      )}
      <IncidentList incidents={incidents} onRemove={handleRemoveIncident} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        <FundamentalDiagram data={chartData} />
        <SpeedHeatmap history={heatmapHistory} maxSpeed={DEFAULT_PARAMS.desiredSpeed} />
        <FlowTimeSeries data={flowTimeSeries} />
      </div>
    </div>
  );
}
