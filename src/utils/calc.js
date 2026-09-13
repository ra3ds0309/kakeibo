// 口座（accountId）ごとの残高・集計ロジック。
// 振替(transfer)は from(accountId) -> to(toAccountId) の移動として記録する。
// 「すべて」を選んだ場合は振替は内部移動として相殺し、収入合計-支出合計のみが残高になる。

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

export function categoryBreakdown(transactions, accountId, categories) {
  const scoped = filterByAccount(transactions, accountId)
    .filter(t => t.type === 'expense' && isThisMonth(t.date))

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

