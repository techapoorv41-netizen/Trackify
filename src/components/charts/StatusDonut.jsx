import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { STATUS_COLORS } from '@/components/charts/chartTheme';

export default function StatusDonut({ data, onSelect }) {
  if (!data.length) return <p className="py-10 text-center text-sm text-muted">No data for the selected scope.</p>;
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} onClick={(d) => onSelect?.(d.name)} cursor={onSelect ? 'pointer' : 'default'}>
          {data.map((d) => <Cell key={d.name} fill={STATUS_COLORS[d.name] || '#64748B'} stroke="none" />)}
        </Pie>
        <Tooltip formatter={(v, n) => [`${v} (${Math.round((v / total) * 100)}%)`, n]} />
        <Legend verticalAlign="bottom" iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}
