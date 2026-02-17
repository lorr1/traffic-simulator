import { useRef, useEffect, useCallback } from 'react';
import { Renderer } from './Renderer';
import { useSimulation } from '../hooks/useSimulation';
import { DEFAULT_PARAMS } from '../constants';

export function SimulationCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });
  const { state } = useSimulation(DEFAULT_PARAMS);

  // Initialize renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size to match CSS size
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

  // Draw on state change
  useEffect(() => {
    rendererRef.current?.draw(state);
  }, [state]);

  // Pan handlers
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = (e.clientX - lastMouse.current.x) * devicePixelRatio;
    const dy = (e.clientY - lastMouse.current.y) * devicePixelRatio;
    rendererRef.current?.getCamera().handlePan(dx, dy);
    lastMouse.current = { x: e.clientX, y: e.clientY };
  }, []);

  const onMouseUp = useCallback(() => {
    isDragging.current = false;
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

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-[400px]"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
    />
  );
}
