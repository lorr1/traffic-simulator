import { useState } from 'react';
import type { Incident } from '../simulation/incidents/Incident';
import type { IncidentConfig } from '../types';

interface IncidentPopoverProps {
  positionX: number;
  screenX: number;
  screenY: number;
  laneCount: number;
  simulationTime: number;
  onCreat: (config: IncidentConfig) => void;
  onCancel: () => void;
}

let nextIncidentId = 1;

export function IncidentPopover({
  positionX,
  screenX,
  screenY,
  laneCount,
  simulationTime,
  onCreat: onCreate,
  onCancel,
}: IncidentPopoverProps) {
  const [lanesBlocked, setLanesBlocked] = useState<number[]>([0]);
  const [severity, setSeverity] = useState(0.5);
  const [duration, setDuration] = useState(-1);
  const [useManualRemoval, setUseManualRemoval] = useState(true);

  const toggleLane = (lane: number) => {
    setLanesBlocked((prev) =>
      prev.includes(lane) ? prev.filter((l) => l !== lane) : [...prev, lane],
    );
  };

  const handleCreate = () => {
    if (lanesBlocked.length === 0) return;
    onCreate({
      id: nextIncidentId++,
      positionX,
      lanesBlocked,
      severity,
      startTime: simulationTime,
      duration: useManualRemoval ? -1 : duration,
      rubberneckingFactor: 0.5 + 0.5 * (1 - severity),
    });
  };

  return (
    <div
      className="absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl text-sm w-56"
      style={{ left: screenX + 10, top: screenY - 10 }}
    >
      <div className="text-gray-400 mb-2">
        Position: {Math.round(positionX)}m
      </div>

      <div className="mb-2">
        <div className="text-gray-300 mb-1">Block lanes:</div>
        <div className="flex gap-1">
          {Array.from({ length: laneCount }, (_, i) => (
            <button
              key={i}
              onClick={() => toggleLane(i)}
              className={`px-2 py-0.5 rounded text-xs ${
                lanesBlocked.includes(i)
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <label className="text-gray-300 block mb-1">
          Severity: {severity.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={severity}
          onChange={(e) => setSeverity(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div className="mb-3">
        <label className="flex items-center gap-2 text-gray-300 mb-1">
          <input
            type="checkbox"
            checked={useManualRemoval}
            onChange={(e) => setUseManualRemoval(e.target.checked)}
          />
          Until removed
        </label>
        {!useManualRemoval && (
          <input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
            className="w-full bg-gray-700 text-white px-2 py-1 rounded text-xs"
            placeholder="Duration (seconds)"
          />
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCreate}
          disabled={lanesBlocked.length === 0}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-2 py-1 rounded text-xs"
        >
          Create
        </button>
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded text-xs"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

interface IncidentListProps {
  incidents: Incident[];
  onRemove: (id: number) => void;
}

export function IncidentList({ incidents, onRemove }: IncidentListProps) {
  if (incidents.length === 0) return null;

  return (
    <div className="mt-2 bg-gray-800 border border-gray-700 rounded-lg p-2">
      <div className="text-xs text-gray-400 mb-1">Active incidents</div>
      {incidents.map((incident) => (
        <div
          key={incident.id}
          className="flex items-center justify-between text-xs py-1 border-b border-gray-700 last:border-0"
        >
          <span className="text-gray-300">
            @ {Math.round(incident.positionX)}m — lanes{' '}
            {incident.lanesBlocked.join(', ')}
          </span>
          <button
            onClick={() => onRemove(incident.id)}
            className="text-red-400 hover:text-red-300 px-1"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
