import { useRef, useEffect } from 'react';
import { clamp } from '../utils/math';
import type { RoadSegmentData } from '../types';

interface SpeedHeatmapProps {
  history: RoadSegmentData[][];
  maxSpeed: number;
  width?: number;
  height?: number;
}

const LABEL_LEFT = 40;
const LABEL_BOTTOM = 20;

function speedToRgb(
  speed: number,
  maxSpeed: number,
): [number, number, number] {
  const ratio = clamp(maxSpeed === 0 ? 0 : speed / maxSpeed, 0, 1);
  // Red → Yellow → Green
  let r: number, g: number, b: number;
  if (ratio <= 0.5) {
    const t = ratio / 0.5;
    r = 220;
    g = Math.round(50 + t * 170);
    b = 30;
  } else {
    const t = (ratio - 0.5) / 0.5;
    r = Math.round(220 - t * 180);
    g = Math.round(220 - t * 20);
    b = Math.round(30 + t * 60);
  }
  return [r, g, b];
}

export function SpeedHeatmap({
  history,
  maxSpeed,
  width = 600,
  height = 200,
}: SpeedHeatmapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const plotW = width - LABEL_LEFT;
    const plotH = height - LABEL_BOTTOM;

    canvas.width = width;
    canvas.height = height;

    // Clear
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(0, 0, width, height);

    if (history.length === 0) return;

    const segmentCount = history[0].length;
    const rowCount = Math.min(history.length, plotH);
    const cellW = plotW / segmentCount;
    const cellH = plotH / rowCount;

    // Draw rows: newest at bottom
    const startIdx = Math.max(0, history.length - rowCount);
    for (let row = 0; row < rowCount; row++) {
      const dataRow = history[startIdx + row];
      const y = plotH - (row + 1) * cellH;

      for (let col = 0; col < dataRow.length; col++) {
        const [r, g, b] = speedToRgb(dataRow[col].averageSpeed, maxSpeed);
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(LABEL_LEFT + col * cellW, y, Math.ceil(cellW), Math.ceil(cellH));
      }
    }

    // Axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';

    // X axis: position labels
    const segLen = history[0]?.[0] ? 100 : 1; // segment length
    for (let i = 0; i <= segmentCount; i += Math.max(1, Math.floor(segmentCount / 5))) {
      const x = LABEL_LEFT + i * cellW;
      ctx.fillText(`${i * segLen}`, x, height - 4);
    }

    // Y axis: time labels
    ctx.textAlign = 'right';
    const sampleInterval = 0.5;
    for (let row = 0; row < rowCount; row += Math.max(1, Math.floor(rowCount / 5))) {
      const y = plotH - row * cellH;
      const timeAgo = row * sampleInterval;
      ctx.fillText(`-${timeAgo.toFixed(0)}s`, LABEL_LEFT - 4, y + 3);
    }

    // Axis titles
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Position (m)', LABEL_LEFT + plotW / 2, height - 1);
  }, [history, maxSpeed, width, height]);

  return (
    <div className="h-full">
      <canvas ref={canvasRef} className="w-full h-full" style={{ imageRendering: 'pixelated' }} />
    </div>
  );
}
