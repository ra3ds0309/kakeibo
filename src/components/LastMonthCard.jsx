import { formatYen } from '../utils/format'

export default function LastMonthCard({ label, income, expense }) {
  const net = income - expense

  return (
    <div className="last-month-card">
      <div className="last-month-card__title">{label}の収支</div>
      <div className="last-month-card__row">
        <div className="last-month-card__stat">
          <span className="last-month-card__label">収入</span>
          <span className="last-month-card__value last-month-card__value--income">¥{formatYen(income)}</span>
        </div>
        <div className="last-month-card__stat">
          <span className="last-month-card__label">支出</span>
          <span className="last-month-card__value last-month-card__value--expense">¥{formatYen(expense)}</span>
        </div>
        <div className="last-month-card__stat">
          <span className="last-month-card__label">差引</span>
          <span className={`last-month-card__value ${net >= 0 ? 'last-month-card__value--income' : 'last-month-card__value--expense'}`}>
            {net >= 0 ? '+' : ''}¥{formatYen(net)}
          </span>
        </div>
      </div>
    </div>
  )
}
