import { useMemo } from 'react'
import BalanceCard from './BalanceCard'
import TransactionRow from './TransactionRow'
import CategoryPieChart from './CategoryPieChart'
import { computeBalance, filterByAccount, categoryBreakdown, isThisMonth, ALL_ACCOUNT_ID } from '../utils/calc'

export default function DashboardPage({ accounts, categories, transactions, selectedAccount, onSelectTx }) {
  const scoped = filterByAccount(transactions, selectedAccount)
  const { balance } = computeBalance(transactions, selectedAccount)

  const monthTx = scoped.filter(t => isThisMonth(t.date))
  const monthIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const label = selectedAccount === ALL_ACCOUNT_ID
    ? 'すべての口座'
    : (accounts.find(a => a.id === selectedAccount)?.name || '')

  const currentAccount = selectedAccount === ALL_ACCOUNT_ID
    ? null
    : accounts.find(a => a.id === selectedAccount)

  const recent = [...scoped].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5)
  const pieData = useMemo(
    () => categoryBreakdown(transactions, selectedAccount, categories),
    [transactions, selectedAccount, categories]
  )

  return (
    <div>
      <BalanceCard
        label={label}
        account={currentAccount}
        realBalance={balance}
        income={monthIncome}
        expense={monthExpense}
      />

      <div className="section-head">
        <h2>直近の取引</h2>
      </div>
      <div className="tx-list">
        {recent.length === 0 && <p className="empty-note">まだ明細がありません。右下の＋から入力してみましょう。</p>}
        {recent.map(tx => (
          <TransactionRow key={tx.id} tx={tx} categories={categories} accounts={accounts} onClick={() => onSelectTx(tx)} />
        ))}
      </div>

      <div className="section-head">
        <h2>今月の支出内訳</h2>
      </div>
      <CategoryPieChart data={pieData} />
    </div>
  )
}
