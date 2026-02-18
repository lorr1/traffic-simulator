import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface FlowTimePoint {
  time: number; // simulation seconds
  flow: number; // veh/hr
}

interface FlowTimeSeriesProps {
  data: FlowTimePoint[];
}

export function FlowTimeSeries({ data }: FlowTimeSeriesProps) {
  return (
    <div className="h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis
            dataKey="time"
            type="number"
            domain={['dataMin', 'dataMax']}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            tickFormatter={(v: number) => `${Math.round(v)}s`}
            label={{
              value: 'Time (s)',
              position: 'bottom',
              offset: 5,
              style: { fontSize: 11, fill: '#9ca3af' },
            }}
          />
          <YAxis
            domain={[0, 'auto']}
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
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '6px',
              fontSize: '12px',
            }}
            formatter={(value: number) => [`${Math.round(value)} veh/hr`, 'Flow']}
            labelFormatter={(label: number) => `Time: ${Math.round(label)}s`}
          />
          <Line
            type="monotone"
            dataKey="flow"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
