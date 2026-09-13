import { useState } from 'react'
import { formatYen, formatDateLabel } from '../utils/format'
import { computeDisplayBalance } from '../utils/calc'
import { useData } from '../contexts/DataContext'

export default function BalanceCard({ label, account, realBalance, income, expense }) {
  const { recordAndResetAccount } = useData()
  const [saving, setSaving] = useState(false)

  const isAllAccounts = !account
  const displayBalance = isAllAccounts ? realBalance : computeDisplayBalance(account, realBalance)

  const showResetAction = account?.monthlyResetEnabled
  const lastRecord = account?.resetHistory?.length
    ? account.resetHistory[account.resetHistory.length - 1]
    : null

  const monthlyLimit = account?.monthlyLimit
  const limitUsedPct = monthlyLimit ? Math.min(100, Math.round((expense / monthlyLimit) * 100)) : 0
  const limitRemaining = monthlyLimit ? monthlyLimit - expense : null

  async function handleRecordAndReset() {
    if (saving) return
    if (!confirm('今月分として記録し、表示を0円からにリセットします。よろしいですか？（実際の残高は減りません）')) return
    setSaving(true)
    try {
      await recordAndResetAccount(account.id, realBalance)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="balance-card">
      <div className="balance-card__label">{label} の残高</div>
      <div className="balance-card__amount">
        ¥{formatYen(displayBalance)}<span className="unit">円</span>
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

      {monthlyLimit ? (
        <div className="limit-bar-wrap">
          <div className="limit-bar-head">
            <span>今月の上限</span>
            <span>¥{formatYen(expense)} / ¥{formatYen(monthlyLimit)}</span>
          </div>
          <div className="limit-bar-track">
            <div
              className={`limit-bar-fill ${expense > monthlyLimit ? 'limit-bar-fill--over' : ''}`}
              style={{ width: `${limitUsedPct}%` }}
            />
          </div>
          <div className={`limit-bar-remaining ${limitRemaining < 0 ? 'limit-bar-remaining--over' : ''}`}>
            {limitRemaining < 0
              ? `¥${formatYen(Math.abs(limitRemaining))} 超過しています`
              : `残り ¥${formatYen(limitRemaining)}`}
          </div>
        </div>
      ) : null}

      {showResetAction && (
        <div className="reset-action">
          <button className="reset-action__btn" onClick={handleRecordAndReset} disabled={saving}>
            <span className="material-symbols-outlined">restart_alt</span>
            今月分を記録してリセット
          </button>
          {lastRecord && (
            <div className="reset-action__note">
              前回の記録：¥{formatYen(lastRecord.amount)}（{formatDateLabel(lastRecord.date)}）
            </div>
          )}
        </div>
      )}
    </div>
  )
}
