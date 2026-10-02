import { useMemo } from 'react'
import BalanceCard from './BalanceCard'
import LastMonthCard from './LastMonthCard'
import TransactionRow from './TransactionRow'
import CategoryPieChart from './CategoryPieChart'
import MonthlyTrendChart from './MonthlyTrendChart'
import {
  computeBalance, filterByAccount, categoryBreakdown, isThisMonth,
  isLastMonth, lastMonthLabel, monthlySummary, monthlyTrend, ALL_ACCOUNT_ID
} from '../utils/calc'

export default function DashboardPage({ accounts, categories, transactions, selectedAccount, onSelectTx }) {
  const scoped = filterByAccount(transactions, selectedAccount)
  const { balance } = computeBalance(transactions, selectedAccount)

  const monthTx = scoped.filter(t => isThisMonth(t.date))
  const monthIncome = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const monthExpense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  const lastMonth = useMemo(
    () => monthlySummary(transactions, selectedAccount, isLastMonth),
    [transactions, selectedAccount]
  )

  const label = selectedAccount === ALL_ACCOUNT_ID
    ? 'すべての口座'
    : (accounts.find(a => a.id === selectedAccount)?.name || '')

  const currentAccount = selectedAccount === ALL_ACCOUNT_ID
    ? null
    : accounts.find(a => a.id === selectedAccount)

  const recent = [...scoped].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 5)

  const expensePieData = useMemo(
    () => categoryBreakdown(transactions, selectedAccount, categories, 'expense'),
    [transactions, selectedAccount, categories]
  )
  const incomePieData = useMemo(
    () => categoryBreakdown(transactions, selectedAccount, categories, 'income'),
    [transactions, selectedAccount, categories]
  )
  const trendData = useMemo(
    () => monthlyTrend(transactions, selectedAccount, 6),
    [transactions, selectedAccount]
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

      <LastMonthCard label={lastMonthLabel()} income={lastMonth.income} expense={lastMonth.expense} />

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
      <CategoryPieChart data={expensePieData} />

      <div className="section-head">
        <h2>今月の収入内訳</h2>
      </div>
      <CategoryPieChart data={incomePieData} />

      <div className="section-head">
        <h2>直近6か月の推移</h2>
      </div>
      <MonthlyTrendChart data={trendData} />
    </div>
  )
}
