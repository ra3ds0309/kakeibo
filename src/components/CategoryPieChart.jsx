import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatYen } from '../utils/format'

export default function CategoryPieChart({ data }) {
  if (!data.length) {
    return <p className="empty-note">今月の支出データがまだありません。</p>
  }

  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={56}
            outerRadius={82}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v) => `¥${formatYen(v)}`} />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-legend">
        {data.map((d, i) => (
          <div className="chart-legend__item" key={i}>
            <span className="chart-legend__dot" style={{ background: d.color }} />
            {d.name}（{Math.round((d.value / total) * 100)}%）
          </div>
        ))}
      </div>
    </div>
  )
}
