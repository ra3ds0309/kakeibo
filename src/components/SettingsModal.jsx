import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { RELEASE_NOTES } from '../utils/tutorial'

export default function SettingsModal({ settings, onClose, onLogout }) {
  const { updateSettings } = useData()
  const [tab, setTab] = useState('settings') // settings | notes
  const [saving, setSaving] = useState(false)

  async function toggle(key) {
    setSaving(true)
    try {
      await updateSettings({ [key]: !settings[key] })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" onClick={onClose} />
        <div className="sheet__title-row">
          <div className="sheet__title" style={{ flex: 1 }}>設定</div>
          <button className="icon-btn" onClick={onClose} aria-label="閉じる">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="mode-switch" style={{ marginBottom: 18 }}>
          <button className={tab === 'settings' ? 'active--transfer' : ''} onClick={() => setTab('settings')}>機能設定</button>
          <button className={tab === 'notes' ? 'active--transfer' : ''} onClick={() => setTab('notes')}>リリースノート</button>
        </div>

        {tab === 'settings' && (
          <div className="settings-list">
            <div className="settings-row">
              <div>
                <div className="settings-row__title">毎月表示リセット</div>
                <div className="settings-row__desc">口座ごとに、実際の残高はそのままに表示だけ毎月0円からにできます</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!!settings.monthlyResetEnabled}
                  onChange={() => toggle('monthlyResetEnabled')}
                  disabled={saving}
                />
                <span className="switch__track" />
              </label>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row__title">毎月の上限（クレジット）</div>
                <div className="settings-row__desc">口座ごとに毎月使える上限額を設定し、使いすぎに気づけます</div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={!!settings.monthlyLimitEnabled}
                  onChange={() => toggle('monthlyLimitEnabled')}
                  disabled={saving}
                />
                <span className="switch__track" />
              </label>
            </div>
            <p className="empty-note" style={{ padding: '8px 2px', textAlign: 'left' }}>
              OFFにしても設定した内容は消えません。口座ごとの詳細は「口座の管理」画面から設定できます。
            </p>
          </div>
        )}

        {tab === 'notes' && (
          <div className="release-notes">
            {RELEASE_NOTES.map(n => (
              <div key={n.version} className="release-note">
                <div className="release-note__head">v{n.version} ・ {n.date}</div>
                <ul>
                  {n.items.map((it, i) => <li key={i}>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        <button className="settings-logout" onClick={onLogout}>
          <span className="material-symbols-outlined">logout</span>
          ログアウト
        </button>
      </div>
    </div>
  )
}
