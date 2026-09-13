import { useState } from 'react'
import NumberPad from './NumberPad'
import { formatYen, todayStr } from '../utils/format'
import { useData } from '../contexts/DataContext'

const MODES = [
  { key: 'expense', label: '支出' },
  { key: 'income', label: '収入' },
  { key: 'transfer', label: '振替' }
]

export default function EntryModal({ accounts, categories, defaultAccountId, initialTx, onClose, onDelete }) {
  const { addTransaction, updateTransaction, addCategory } = useData()
  const isEdit = Boolean(initialTx)

  const [mode, setMode] = useState(initialTx?.type || 'expense')
  const [amount, setAmount] = useState(initialTx ? String(initialTx.amount) : '')
  const [accountId, setAccountId] = useState(initialTx?.accountId || defaultAccountId || accounts[0]?.id || '')
  const [toAccountId, setToAccountId] = useState(initialTx?.toAccountId || accounts.find(a => a.id !== accountId)?.id || '')
  const [categoryId, setCategoryId] = useState(initialTx?.categoryId || '')
  const [date, setDate] = useState(initialTx?.date || todayStr())
  const [memo, setMemo] = useState(initialTx?.memo || '')
  const [newCategoryName, setNewCategoryName] = useState('')
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [saving, setSaving] = useState(false)

  const relevantCategories = categories.filter(c => c.type === mode)

  function handleKey(k) {
    if (k === '⌫') {
      setAmount(a => a.slice(0, -1))
      return
    }
    setAmount(a => {
      const next = (a + k).replace(/^0+(?=\d)/, '')
      return next.length > 9 ? a : next
    })
  }

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return
    const doc = await addCategory({ name: newCategoryName.trim(), type: mode })
    setCategoryId(doc.id)
    setNewCategoryName('')
    setShowNewCategory(false)
  }

  const canSubmit = Number(amount) > 0 && accountId &&
    (mode !== 'transfer' ? categoryId : (toAccountId && toAccountId !== accountId))

  async function handleSubmit() {
    if (!canSubmit || saving) return
    setSaving(true)
    const payload = {
      type: mode,
      amount: Number(amount),
      accountId,
      date,
      memo: memo.trim()
    }
    if (mode === 'transfer') {
      payload.toAccountId = toAccountId
      payload.categoryId = null
    } else {
      payload.categoryId = categoryId
      payload.toAccountId = null
    }

    try {
      if (isEdit) {
        await updateTransaction(initialTx.id, payload)
      } else {
        await addTransaction(payload)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" />
        <div className="sheet__title">{isEdit ? '明細を編集' : '入力'}</div>

        <div className="mode-switch">
          {MODES.map(m => (
            <button
              key={m.key}
              className={mode === m.key ? `active--${m.key}` : ''}
              onClick={() => { setMode(m.key); setCategoryId('') }}
              disabled={isEdit}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="amount-display">¥{formatYen(amount || 0)}</div>
        <NumberPad onKeyPress={handleKey} />

        {mode === 'transfer' ? (
          <>
            <div className="field-row">
              <label>どの口座から</label>
              <div className="chip-grid">
                {accounts.map(a => (
                  <button
                    key={a.id}
                    className={`chip ${accountId === a.id ? 'chip--active' : ''}`}
                    onClick={() => setAccountId(a.id)}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="field-row">
              <label>どの口座へ</label>
              <div className="chip-grid">
                {accounts.filter(a => a.id !== accountId).map(a => (
                  <button
                    key={a.id}
                    className={`chip ${toAccountId === a.id ? 'chip--active' : ''}`}
                    onClick={() => setToAccountId(a.id)}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="field-row">
              <label>口座</label>
              <div className="chip-grid">
                {accounts.map(a => (
                  <button
                    key={a.id}
                    className={`chip ${accountId === a.id ? 'chip--active' : ''}`}
                    onClick={() => setAccountId(a.id)}
                  >
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="field-row">
              <label>カテゴリ</label>
              <div className="chip-grid">
                {relevantCategories.map(c => (
                  <button
                    key={c.id}
                    className={`chip ${categoryId === c.id ? 'chip--active' : ''}`}
                    onClick={() => setCategoryId(c.id)}
                  >
                    {c.name}
                  </button>
                ))}
                <button className="chip" onClick={() => setShowNewCategory(s => !s)}>＋ 新規</button>
              </div>
              {showNewCategory && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <input
                    type="text"
                    placeholder="新しいカテゴリ名"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    style={{ flex: 1, border: '1px solid var(--paper-line)', borderRadius: 8, padding: '9px 10px' }}
                  />
                  <button className="chip chip--active" onClick={handleCreateCategory}>追加</button>
                </div>
              )}
            </div>
          </>
        )}

        <div className="field-row">
          <label>日付</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="field-row">
          <label>メモ（任意）</label>
          <input type="text" placeholder="例：スーパーで買い物" value={memo} onChange={e => setMemo(e.target.value)} />
        </div>

        <button
          className={`submit-btn submit-btn--${mode}`}
          disabled={!canSubmit || saving}
          onClick={handleSubmit}
        >
          {isEdit ? '更新する' : '保存する'}
        </button>

        {isEdit && (
          <button
            className="icon-btn"
            style={{ width: '100%', marginTop: 10 }}
            onClick={() => onDelete(initialTx.id)}
          >
            この明細を削除
          </button>
        )}
      </div>
    </div>
  )
}
