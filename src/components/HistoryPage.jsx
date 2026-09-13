import { useMemo, useState } from 'react'
import TransactionRow from './TransactionRow'
import { monthKey, monthLabel, formatYen } from '../utils/format'
import { ALL_ACCOUNT_ID } from '../utils/calc'

export default function HistoryPage({ accounts, categories, transactions, onSelectTx }) {
  const months = useMemo(() => {
    const set = new Set(transactions.map(t => monthKey(t.date)))
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1))
  }, [transactions])

  const [month, setMonth] = useState(months[0] || monthKey(new Date().toISOString().slice(0, 10)))
  const [accountFilter, setAccountFilter] = useState(ALL_ACCOUNT_ID)

  const filtered = transactions
    .filter(t => monthKey(t.date) === month)
    .filter(t => accountFilter === ALL_ACCOUNT_ID || t.accountId === accountFilter || t.toAccountId === accountFilter)
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  const monthIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div>
      <div className="top-bar">
        <h1 className="top-bar__title">履歴</h1>
      </div>

      <div className="filter-bar">
        <select value={month} onChange={e => setMonth(e.target.value)} style={{ border: '1px solid var(--paper-line)', borderRadius: 999, padding: '8px 14px', fontSize: 13.5, background: 'var(--surface)' }}>
          {months.length === 0 && <option value={month}>{monthLabel(month)}</option>}
          {months.map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
        <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)} style={{ border: '1px solid var(--paper-line)', borderRadius: 999, padding: '8px 14px', fontSize: 13.5, background: 'var(--surface)' }}>
          <option value={ALL_ACCOUNT_ID}>すべての口座</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
      </div>

      <div className="section-head">
        <h2>{monthLabel(month)}の収支</h2>
        <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>
          収入 ¥{formatYen(monthIncome)} ／ 支出 ¥{formatYen(monthExpense)}
        </span>
      </div>

      <div className="tx-list">
        {filtered.length === 0 && <p className="empty-note">この条件の明細はありません。</p>}
        {filtered.map(tx => (
          <TransactionRow key={tx.id} tx={tx} categories={categories} accounts={accounts} onClick={() => onSelectTx(tx)} />
        ))}
      </div>
    </div>
  )
}
