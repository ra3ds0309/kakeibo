import { useState } from 'react'
import { useData } from '../contexts/DataContext'

const COLORS = ['#3E5C7A', '#B8863B', '#3E7A5C', '#B5503D', '#8A6BA1', '#C97A9B', '#5C7A8A', '#1F3B36']

export default function AccountManagerModal({ accounts, onClose }) {
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
        <div className="sheet__handle" />
        <div className="sheet__title">口座（ジャンル）の管理</div>

        <div className="account-manager-list">
          {accounts.map(a => (
            <div className="account-manager-item" key={a.id}>
              {editingId === a.id ? (
                <input
                  type="text"
                  defaultValue={a.name}
                  autoFocus
                  onBlur={(e) => { updateAccount(a.id, { name: e.target.value.trim() || a.name }); setEditingId(null) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
                  style={{ border: '1px solid var(--paper-line)', borderRadius: 8, padding: '6px 10px', flex: 1 }}
                />
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: a.color, display: 'inline-block' }} />
                  {a.name}
                </span>
              )}
              <span style={{ display: 'flex', gap: 12 }}>
                <button className="icon-btn" onClick={() => setEditingId(a.id)}>
                  <span className="material-symbols-outlined">edit</span>
                  編集
                </button>
                <button className="icon-btn" onClick={() => handleDelete(a.id)}>
                  <span className="material-symbols-outlined">delete</span>
                  削除
                </button>
              </span>
            </div>
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
