import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { formatYen } from '../utils/format'

export default function MonthlyTrendChart({ data }) {
  const hasData = data.some(d => d.income || d.expense)
  if (!hasData) {
    return <p className="empty-note">まだ表示できるデータがありません。</p>
  }

  return (
    <div className="chart-card">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#D8D2BE" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#4C6259' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#8A9A93' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip formatter={(v) => `¥${formatYen(v)}`} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="income" name="収入" fill="#3E7A5C" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="支出" fill="#B5503D" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
