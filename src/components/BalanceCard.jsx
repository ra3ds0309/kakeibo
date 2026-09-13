import { formatYen } from '../utils/format'

export default function BalanceCard({ label, balance, income, expense }) {
  return (
    <div className="balance-card">
      <div className="balance-card__label">{label} の残高</div>
      <div className="balance-card__amount">
        ¥{formatYen(balance)}<span className="unit">円</span>
      </div>
      <div className="balance-card__breakdown">
        <div className="balance-card__stat">
          今月の収入
          <strong>¥{formatYen(income)}</strong>
        </div>
        <div className="balance-card__stat">
          今月の支出
          <strong>¥{formatYen(expense)}</strong>
        </div>
      </div>
    </div>
  )
}
