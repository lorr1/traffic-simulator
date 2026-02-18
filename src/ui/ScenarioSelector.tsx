import { useState } from 'react';
import { SCENARIOS, type Scenario } from '../simulation/scenarios/scenarios';

interface ScenarioSelectorProps {
  onSelect: (scenario: Scenario | null) => void;
}

export function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const [selectedId, setSelectedId] = useState<string>('free-play');
  const selected = SCENARIOS.find((s) => s.id === selectedId) ?? null;

  const handleChange = (id: string) => {
    setSelectedId(id);
    const scenario = SCENARIOS.find((s) => s.id === id) ?? null;
    onSelect(scenario);
  };

  return (
    <div className="flex items-center gap-3">
      <select
        value={selectedId}
        onChange={(e) => handleChange(e.target.value)}
        className="bg-gray-700 text-white text-xs px-2 py-1.5 rounded border border-gray-600 max-w-[180px]"
      >
        <option value="free-play">Free Play</option>
        {SCENARIOS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      {selected && (
        <span className="text-xs text-gray-400 max-w-[300px] truncate" title={selected.description}>
          {selected.description}
        </span>
      )}
    </div>
  );
}
