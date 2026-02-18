import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import type { FlowDensityPoint } from '../hooks/useDataCollector';

interface FundamentalDiagramProps {
  data: FlowDensityPoint[];
}

function pointColor(age: number): string {
  // Recent = bright blue, old = faded gray
  const r = Math.round(100 + age * 120);
  const g = Math.round(100 + age * 120);
  const b = Math.round(255 - age * 60);
  const a = 0.3 + (1 - age) * 0.5;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function FundamentalDiagram({ data }: FundamentalDiagramProps) {
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            type="number"
            dataKey="density"
            name="Density"
            unit=" veh/km"
            domain={[0, 200]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            label={{
              value: 'Density (veh/km)',
              position: 'bottom',
              offset: 5,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
          />
          <YAxis
            type="number"
            dataKey="flow"
            name="Flow"
            unit=" veh/hr"
            domain={[0, 3000]}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            label={{
              value: 'Flow (veh/hr)',
              angle: -90,
              position: 'insideLeft',
              offset: 10,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
          />
          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              fontSize: '12px',
            }}
          />
          <Scatter data={data} isAnimationActive={false}>
            {data.map((point, i) => (
              <Cell key={i} fill={pointColor(point.age)} r={2} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

