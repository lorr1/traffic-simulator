import type { SimulationParams } from '../types';

interface PlaybackControlsProps {
  paused: boolean;
  simulationTime: number;
  speedMultiplier: number;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSpeedChange: (multiplier: number) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toFixed(1).padStart(4, '0')}`;
}

const SPEEDS = [1, 2, 5, 10];

export function PlaybackControls({
  paused,
  simulationTime,
  speedMultiplier,
  onPause,
  onResume,
  onReset,
  onSpeedChange,
}: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 mb-3">
      {/* Play/Pause */}
      <button
        onClick={paused ? onResume : onPause}
        className="flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
        title={paused ? 'Play' : 'Pause'}
      >
        {paused ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="3" width="6" height="18" />
            <rect x="14" y="3" width="6" height="18" />
          </svg>
        )}
      </button>

      {/* Reset */}
      <button
        onClick={onReset}
        className="flex items-center justify-center w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-md text-white"
        title="Reset"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 1 9 9" />
          <polyline points="3 3 3 12 12 12" />
        </svg>
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Speed selector */}
      <div className="flex gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2 py-0.5 rounded text-xs font-mono ${
              speedMultiplier === s
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-600" />

      {/* Time display */}
      <div className="font-mono text-sm text-gray-300" title="Simulation time">
        {formatTime(simulationTime)}
      </div>
    </div>
  );
}
