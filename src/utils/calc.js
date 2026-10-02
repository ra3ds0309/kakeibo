// 口座（accountId）ごとの残高・集計ロジック。
// 振替(transfer)は from(accountId) -> to(toAccountId) の移動として記録する。
// 「すべて」を選んだ場合は振替は内部移動として相殺し、収入合計-支出合計のみが残高になる。
import { monthKey } from './format'

export const ALL_ACCOUNT_ID = '__all__'

export function filterByAccount(transactions, accountId) {
  if (accountId === ALL_ACCOUNT_ID) return transactions
  return transactions.filter(t =>
    t.accountId === accountId || (t.type === 'transfer' && t.toAccountId === accountId)
  )
}

export function computeBalance(transactions, accountId) {
  let income = 0
  let expense = 0
  let transferNet = 0

  for (const t of transactions) {
    const amount = Number(t.amount) || 0
    if (accountId === ALL_ACCOUNT_ID) {
      if (t.type === 'income') income += amount
      if (t.type === 'expense') expense += amount
      // 振替はすべて内部移動なので合計には影響しない
      continue
    }
    if (t.type === 'income' && t.accountId === accountId) income += amount
    if (t.type === 'expense' && t.accountId === accountId) expense += amount
    if (t.type === 'transfer') {
      if (t.accountId === accountId) transferNet -= amount
      if (t.toAccountId === accountId) transferNet += amount
    }
  }

  return {
    income,
    expense,
    transferNet,
    balance: income - expense + transferNet
  }
}

export function isThisMonth(dateStr) {
  const now = new Date()
  const d = new Date(dateStr)
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
}

export function isLastMonth(dateStr) {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const d = new Date(dateStr)
  return d.getFullYear() === target.getFullYear() && d.getMonth() === target.getMonth()
}

export function lastMonthLabel() {
  const now = new Date()
  const target = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  return `${target.getMonth() + 1}月`
}

// 指定した月判定関数（isThisMonth / isLastMonth など）に合う範囲の収入・支出合計
export function monthlySummary(transactions, accountId, monthPredicate) {
  const scoped = filterByAccount(transactions, accountId).filter(t => monthPredicate(t.date))
  const income = scoped.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const expense = scoped.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0)
  return { income, expense }
}

// 直近 monthsCount か月分（当月含む）の収入・支出の推移
export function monthlyTrend(transactions, accountId, monthsCount = 6) {
  const scoped = filterByAccount(transactions, accountId)
  const now = new Date()
  const result = []
  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const monthTx = scoped.filter(t => monthKey(t.date) === key)
    const income = monthTx.filter(t => t.type === 'income').reduce((s, t) => s + (Number(t.amount) || 0), 0)
    const expense = monthTx.filter(t => t.type === 'expense').reduce((s, t) => s + (Number(t.amount) || 0), 0)
    result.push({ key, label: `${d.getMonth() + 1}月`, income, expense })
  }
  return result
}

export function categoryBreakdown(transactions, accountId, categories, type = 'expense') {
  const scoped = filterByAccount(transactions, accountId)
    .filter(t => t.type === type && isThisMonth(t.date))

  const totals = {}
  for (const t of scoped) {
    totals[t.categoryId] = (totals[t.categoryId] || 0) + (Number(t.amount) || 0)
  }

  const palette = ['#B5503D', '#B8863B', '#3E5C7A', '#3E7A5C', '#8A6BA1', '#C97A9B', '#5C7A8A', '#8A9A93']

  return Object.entries(totals)
    .map(([categoryId, value], i) => {
      const cat = categories.find(c => c.id === categoryId)
      return { categoryId, name: cat?.name || '未分類', value, color: palette[i % palette.length] }
    })
    .sort((a, b) => b.value - a.value)
}

// 「毎月表示リセット」が有効な口座の表示用残高。
// 実際の残高(realBalance)自体は変えず、直近のリセット時点との差分だけを表示する。
export function computeDisplayBalance(account, realBalance) {
  if (!account?.monthlyResetEnabled || !account?.resetBaseline) return realBalance
  return realBalance - (Number(account.resetBaseline.amount) || 0)
}

