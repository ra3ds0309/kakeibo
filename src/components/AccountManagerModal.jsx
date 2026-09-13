import { useState } from 'react'
import { useData } from '../contexts/DataContext'

const COLORS = ['#3E5C7A', '#B8863B', '#3E7A5C', '#B5503D', '#8A6BA1', '#C97A9B', '#5C7A8A', '#1F3B36']

function AccountRow({ account, settings, onEditName, onDelete }) {
  const { updateAccount } = useData()
  const [open, setOpen] = useState(false)
  const [monthlyLimitInput, setMonthlyLimitInput] = useState(account.monthlyLimit ?? '')
  const [saving, setSaving] = useState(false)

  const showOptions = settings?.monthlyResetEnabled || settings?.monthlyLimitEnabled

  async function toggleReset() {
    setSaving(true)
    try {
      await updateAccount(account.id, { monthlyResetEnabled: !account.monthlyResetEnabled })
    } finally {
      setSaving(false)
    }
  }

  async function saveLimit() {
    setSaving(true)
    try {
      const v = monthlyLimitInput === '' ? null : Number(monthlyLimitInput)
      await updateAccount(account.id, { monthlyLimit: v })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="account-manager-item-wrap">
      <div className="account-manager-item">
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: account.color, display: 'inline-block' }} />
          {account.name}
        </span>
        <span style={{ display: 'flex', gap: 12 }}>
          <button className="icon-btn" onClick={onEditName}>編集</button>
          <button className="icon-btn" onClick={onDelete}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
          </button>
          {showOptions && (
            <button className="icon-btn" onClick={() => setOpen(o => !o)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {open ? 'expand_less' : 'tune'}
              </span>
            </button>
          )}
        </span>
      </div>

      {open && showOptions && (
        <div className="account-options">
          {settings?.monthlyResetEnabled && (
            <div className="account-options__row">
              <div>
                <div className="settings-row__title">毎月表示リセット</div>
                <div className="settings-row__desc">実際の残高は変えず、表示だけ毎月0円からにする</div>
              </div>
              <label className="switch">
                <input type="checkbox" checked={!!account.monthlyResetEnabled} onChange={toggleReset} disabled={saving} />
                <span className="switch__track" />
              </label>
            </div>
          )}
          {settings?.monthlyLimitEnabled && (
            <div className="account-options__row account-options__row--column">
              <div className="settings-row__title">毎月の上限（クレジット）</div>
              <div className="settings-row__desc">超えても使用は止めず、マイナス表示になるだけです</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="例：30000（空欄で上限なし）"
                  value={monthlyLimitInput}
                  onChange={e => setMonthlyLimitInput(e.target.value)}
                  style={{ flex: 1, border: '1px solid var(--paper-line)', borderRadius: 8, padding: '9px 10px' }}
                />
                <button className="chip chip--active" onClick={saveLimit} disabled={saving}>保存</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function CategorySection({ categories }) {
  const { addCategory, deleteCategory } = useData()
  const [name, setName] = useState('')
  const [type, setType] = useState('expense')
  const [busy, setBusy] = useState(false)

  const expenseCats = categories.filter(c => c.type === 'expense')
  const incomeCats = categories.filter(c => c.type === 'income')

  async function handleAdd() {
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      await addCategory({ name: name.trim(), type })
      setName('')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete(id, catName) {
    if (confirm(`「${catName}」を削除しますか？（このカテゴリが付いた過去の明細は「その他」扱いで表示されます）`)) {
      await deleteCategory(id)
    }
  }

  function renderList(list) {
    if (list.length === 0) {
      return <p className="empty-note" style={{ padding: '10px 2px', textAlign: 'left' }}>まだありません。</p>
    }
    return (
      <div className="account-manager-list" style={{ marginBottom: 4 }}>
        {list.map(c => (
          <div className="account-manager-item" key={c.id}>
            <span>{c.name}</span>
            <button className="icon-btn" onClick={() => handleDelete(c.id, c.name)}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
            </button>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="section-head" style={{ padding: 0, margin: '4px 0 8px' }}>
        <h2>支出カテゴリ</h2>
      </div>
      {renderList(expenseCats)}

      <div className="section-head" style={{ padding: 0, margin: '16px 0 8px' }}>
        <h2>収入カテゴリ</h2>
      </div>
      {renderList(incomeCats)}

      <div className="section-head" style={{ padding: 0, margin: '20px 0 10px' }}>
        <h2>新しいカテゴリを追加</h2>
      </div>
      <div className="mode-switch" style={{ marginBottom: 14 }}>
        <button type="button" className={type === 'expense' ? 'active--expense' : ''} onClick={() => setType('expense')}>支出</button>
        <button type="button" className={type === 'income' ? 'active--income' : ''} onClick={() => setType('income')}>収入</button>
      </div>
      <div className="field-row">
        <label>カテゴリ名</label>
        <input type="text" placeholder="例：交際費" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <button className="submit-btn" onClick={handleAdd} disabled={!name.trim() || busy}>追加する</button>
    </div>
  )
}

export default function AccountManagerModal({ accounts, categories, settings, onClose }) {
  const { addAccount, updateAccount, deleteAccount } = useData()
  const [tab, setTab] = useState('accounts') // accounts | categories
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [editingId, setEditingId] = useState(null)

  async function handleAdd() {
    if (!name.trim()) return
    await addAccount({ name: name.trim(), color })
    setName('')
    setColor(COLORS[0])
  }

  async function handleDelete(id) {
    if (accounts.length <= 1) {
      alert('口座は最低ひとつ必要です。')
      return
    }
    if (confirm('この口座を削除しますか？（過去の明細は残ります）')) {
      await deleteAccount(id)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" onClick={onClose} />
        <div className="sheet__title-row">
          <div className="sheet__title" style={{ flex: 1 }}>口座・カテゴリの管理</div>
          <button className="icon-btn" onClick={onClose} aria-label="閉じる">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mode-switch" style={{ marginBottom: 18 }}>
          <button type="button" className={tab === 'accounts' ? 'active--transfer' : ''} onClick={() => setTab('accounts')}>口座（ジャンル）</button>
          <button type="button" className={tab === 'categories' ? 'active--transfer' : ''} onClick={() => setTab('categories')}>カテゴリ</button>
        </div>

        {tab === 'accounts' ? (
          <>
            <div className="account-manager-list">
              {accounts.map(a => (
                editingId === a.id ? (
                  <div className="account-manager-item" key={a.id}>
                    <input
                      type="text"
                      defaultValue={a.name}
                      autoFocus
                      onBlur={(e) => { updateAccount(a.id, { name: e.target.value.trim() || a.name }); setEditingId(null) }}
                      onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
                      style={{ border: '1px solid var(--paper-line)', borderRadius: 8, padding: '6px 10px', flex: 1 }}
                    />
                    <span style={{ display: 'flex', gap: 12 }}>
                      <button className="icon-btn" onClick={() => handleDelete(a.id)}>
                        <span className="material-symbols-outlined" style={{ fontSize: 18 }}>delete</span>
                      </button>
                    </span>
                  </div>
                ) : (
                  <AccountRow key={a.id} account={a} settings={settings} onEditName={() => setEditingId(a.id)} onDelete={() => handleDelete(a.id)} />
                )
              ))}
            </div>

            <div className="section-head" style={{ padding: 0, margin: '20px 0 10px' }}>
              <h2>新しい口座を追加</h2>
            </div>
            <div className="field-row">
              <label>口座名</label>
              <input type="text" placeholder="例：旅行貯金、子供のお小遣い" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="field-row">
              <label>色</label>
              <div className="color-swatch-row">
                {COLORS.map(c => (
                  <button
                    key={c}
                    className={`color-swatch ${color === c ? 'color-swatch--active' : ''}`}
                    style={{ background: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
            <button className="submit-btn" onClick={handleAdd} disabled={!name.trim()}>追加する</button>
          </>
        ) : (
          <CategorySection categories={categories} />
        )}
      </div>
    </div>
  )
}
