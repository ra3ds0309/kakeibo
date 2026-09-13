import { formatYen, formatDateLabel } from '../utils/format'

const TYPE_ICON = { expense: 'shopping_cart', income: 'payments', transfer: 'swap_horiz' }
const TYPE_SIGN = { expense: '-', income: '+', transfer: '' }

export default function TransactionRow({ tx, categories, accounts, onClick }) {
  const category = categories.find(c => c.id === tx.categoryId)
  const account = accounts.find(a => a.id === tx.accountId)
  const toAccount = accounts.find(a => a.id === tx.toAccountId)

  const label = tx.type === 'transfer'
    ? `${account?.name || '?'} → ${toAccount?.name || '?'}`
    : (category?.name || 'その他')

  const meta = tx.type === 'transfer'
    ? `${formatDateLabel(tx.date)}${tx.memo ? ' ・ ' + tx.memo : ''}`
    : `${formatDateLabel(tx.date)}${account ? ' ・ ' + account.name : ''}${tx.memo ? ' ・ ' + tx.memo : ''}`

  return (
    <div className="tx-row" onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className={`tx-row__icon tx-row__icon--${tx.type}`}>
        <span className="material-symbols-outlined">{TYPE_ICON[tx.type]}</span>
      </div>
      <div className="tx-row__body">
        <div className="tx-row__category">{label}</div>
        <div className="tx-row__meta">{meta}</div>
      </div>
      <div className={`tx-row__amount tx-row__amount--${tx.type}`}>
        {TYPE_SIGN[tx.type]}¥{formatYen(tx.amount)}
      </div>
    </div>
  )
}
