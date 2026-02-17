import { useState } from 'react';
import type { SimulationParams } from '../types';

interface ControlPanelProps {
  params: SimulationParams;
  onParamChange: (params: Partial<SimulationParams>) => void;
  onReset: () => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display?: (v: number) => string;
  onChange: (v: number) => void;
}

function SliderRow({ label, value, min, max, step, display, onChange }: SliderRowProps) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-mono">
          {display ? display(value) : value.toFixed(step < 1 ? 1 : 0)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

interface SectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="mb-3">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1"
      >
        {title}
        <span className="text-gray-500">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="pl-1">{children}</div>}
    </div>
  );
}

export function ControlPanel({ params, onParamChange, onReset }: ControlPanelProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-sm w-64 overflow-y-auto max-h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-200">Parameters</h2>
        <button
          onClick={onReset}
          className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-0.5 rounded"
        >
          Reset
        </button>
      </div>

      <Section title="IDM (Car-Following)">
        <SliderRow
          label="Desired Speed"
          value={params.desiredSpeed}
          min={10}
          max={50}
          step={0.5}
          display={(v) => `${(v * 3.6).toFixed(0)} km/h`}
          onChange={(v) => onParamChange({ desiredSpeed: v })}
        />
        <SliderRow
          label="Time Headway"
          value={params.timeHeadway}
          min={0.5}
          max={3.0}
          step={0.1}
          display={(v) => `${v.toFixed(1)} s`}
          onChange={(v) => onParamChange({ timeHeadway: v })}
        />
        <SliderRow
          label="Max Acceleration"
          value={params.maxAcceleration}
          min={0.3}
          max={3.0}
          step={0.1}
          display={(v) => `${v.toFixed(1)} m/s²`}
          onChange={(v) => onParamChange({ maxAcceleration: v })}
        />
        <SliderRow
          label="Comfort Decel"
          value={params.comfortDeceleration}
          min={1.0}
          max={5.0}
          step={0.1}
          display={(v) => `${v.toFixed(1)} m/s²`}
          onChange={(v) => onParamChange({ comfortDeceleration: v })}
        />
        <SliderRow
          label="Minimum Gap"
          value={params.minimumGap}
          min={1.0}
          max={5.0}
          step={0.1}
          display={(v) => `${v.toFixed(1)} m`}
          onChange={(v) => onParamChange({ minimumGap: v })}
        />
      </Section>

      <Section title="MOBIL (Lane Change)" defaultOpen={false}>
        <SliderRow
          label="Politeness"
          value={params.politenessFactor}
          min={0}
          max={1.0}
          step={0.05}
          display={(v) => v.toFixed(2)}
          onChange={(v) => onParamChange({ politenessFactor: v })}
        />
        <SliderRow
          label="Change Threshold"
          value={params.changingThreshold}
          min={0}
          max={1.0}
          step={0.05}
          display={(v) => `${v.toFixed(2)} m/s²`}
          onChange={(v) => onParamChange({ changingThreshold: v })}
        />
        <SliderRow
          label="Safe Deceleration"
          value={params.safeDeceleration}
          min={2.0}
          max={8.0}
          step={0.5}
          display={(v) => `${v.toFixed(1)} m/s²`}
          onChange={(v) => onParamChange({ safeDeceleration: v })}
        />
      </Section>

      <Section title="Road & Traffic">
        <div className="mb-2">
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-gray-400">Lane Count</span>
            <span className="text-gray-300 font-mono">{params.laneCount}</span>
          </div>
          <select
            value={params.laneCount}
            onChange={(e) => onParamChange({ laneCount: parseInt(e.target.value) })}
            className="w-full bg-gray-700 text-white text-xs px-2 py-1 rounded border border-gray-600"
          >
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} lanes
              </option>
            ))}
          </select>
        </div>
        <SliderRow
          label="Spawn Rate"
          value={params.spawnRate}
          min={0.1}
          max={3.0}
          step={0.1}
          display={(v) => `${v.toFixed(1)} veh/s`}
          onChange={(v) => onParamChange({ spawnRate: v })}
        />
      </Section>
    </div>
  );
}
