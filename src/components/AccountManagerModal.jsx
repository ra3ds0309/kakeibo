import { useState } from 'react'
import { useData } from '../contexts/DataContext'

const COLORS = ['#3E5C7A', '#B8863B', '#3E7A5C', '#B5503D', '#8A6BA1', '#C97A9B', '#5C7A8A', '#1F3B36']

function AccountRow({ account, settings, onEditName }) {
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

export default function AccountManagerModal({ accounts, settings, onClose }) {
  const { addAccount, updateAccount, deleteAccount } = useData()
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
          <div className="sheet__title" style={{ flex: 1 }}>口座（ジャンル）の管理</div>
          <button className="icon-btn" onClick={onClose} aria-label="閉じる">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

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
                  <button className="icon-btn" onClick={() => handleDelete(a.id)}>削除</button>
                </span>
              </div>
            ) : (
              <AccountRow key={a.id} account={a} settings={settings} onEditName={() => setEditingId(a.id)} />
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
      </div>
    </div>
  )
}
