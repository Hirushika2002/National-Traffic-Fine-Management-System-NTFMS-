import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from 'recharts';

const SEQUENTIAL_BLUE = '#2a78d6';
const GRIDLINE = '#e1e0d9';
const AXIS_INK = '#898781';
const PRIMARY_INK = '#0b0b0b';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 }).format(
    value,
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <strong>{point.name}</strong>
      <div>{formatCurrency(point.value)} collected</div>
      <div>
        {point.paidCount} of {point.totalCount} fines paid
      </div>
    </div>
  );
}

export default function ReportBarChart({ data, title }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const rowHeight = 36;

  return (
    <div className="card chart-card">
      <h2>{title}</h2>
      <ResponsiveContainer width="100%" height={Math.max(sorted.length * rowHeight, 120)}>
        <BarChart data={sorted} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 8 }}>
          <CartesianGrid stroke={GRIDLINE} horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => new Intl.NumberFormat('en-LK').format(value)}
            tick={{ fill: AXIS_INK, fontSize: 12 }}
            axisLine={{ stroke: GRIDLINE }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={110}
            tick={{ fill: PRIMARY_INK, fontSize: 13 }}
            axisLine={{ stroke: GRIDLINE }}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(11,11,11,0.04)' }} />
          <Bar dataKey="value" fill={SEQUENTIAL_BLUE} barSize={20} radius={[0, 4, 4, 0]}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={formatCurrency}
              style={{ fill: PRIMARY_INK, fontSize: 12, fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
