import { useState } from 'react'
import { useData } from '../contexts/DataContext'

const ACCOUNT_SUGGESTIONS = ['生活費', '娯楽・お小遣い', '貯金', '固定費']
const CATEGORY_SUGGESTIONS = {
  expense: ['食費', '日用品', '交通', '娯楽', '住居', '医療'],
  income: ['給与', 'お小遣い', '副業']
}
const COLORS = ['#3E5C7A', '#B8863B', '#3E7A5C', '#B5503D', '#8A6BA1', '#5C7A8A']

export default function TutorialOverlay({ accounts, categories, onFinish }) {
  const { addAccount, addCategory } = useData()

  // ステップ構成は最初の1回だけ決める（作成が進むたびに accounts/categories が
  // 増えて steps の中身が変わってしまうと、表示中のステップがズレてしまうため）
  const [steps] = useState(() => {
    const s = ['welcome']
    if (accounts.length === 0) s.push('account')
    if (categories.length === 0) s.push('category')
    s.push('entry', 'whatsnew')
    return s
  })

  const [step, setStep] = useState(0)
  const [accountName, setAccountName] = useState('')
  const [categoryName, setCategoryName] = useState('')
  const [categoryType, setCategoryType] = useState('expense')
  const [busy, setBusy] = useState(false)

  const current = steps[step]

  function next() {
    if (step < steps.length - 1) setStep(s => s + 1)
    else onFinish()
  }

  async function handleCreateAccount() {
    if (!accountName.trim() || busy) return
    setBusy(true)
    try {
      await addAccount({ name: accountName.trim(), color: COLORS[0] })
      setAccountName('')
      next()
    } finally {
      setBusy(false)
    }
  }

  async function handleCreateCategory() {
    if (!categoryName.trim() || busy) return
    setBusy(true)
    try {
      await addCategory({ name: categoryName.trim(), type: categoryType })
      setCategoryName('')
      next()
    } finally {
      setBusy(false)
    }
  }

  // 「スキップ」を押した場合でもアプリが使えなくならないよう、
  // 口座・カテゴリが1つも無ければ最低限のものだけ自動で作っておく
  async function handleSkipAll() {
    if (busy) return
    setBusy(true)
    try {
      if (accounts.length === 0) {
        await addAccount({ name: 'メイン', color: COLORS[0] })
      }
      if (categories.length === 0) {
        await addCategory({ name: 'その他', type: 'expense' })
        await addCategory({ name: 'その他', type: 'income' })
      }
      onFinish()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <button className="tutorial-skip" onClick={handleSkipAll} disabled={busy}>スキップ</button>

        {current === 'welcome' && (
          <div className="tutorial-step">
            <span className="material-symbols-outlined tutorial-icon">savings</span>
            <h2>かけいぼへようこそ</h2>
            <p>口座（ジャンル）を切り替えながら使う家計簿です。まずはかんたんに使い方を紹介します。</p>
          </div>
        )}

        {current === 'account' && (
          <div className="tutorial-step">
            <span className="material-symbols-outlined tutorial-icon">wallet</span>
            <h2>まず口座を作りましょう</h2>
            <p>「生活費」「貯金」のように、お金の使いみちごとに口座を分けて管理できます。あとからいくつでも追加できます。</p>
            <div className="chip-grid">
              {ACCOUNT_SUGGESTIONS.map(s => (
                <button key={s} type="button" className="chip" onClick={() => setAccountName(s)}>{s}</button>
              ))}
            </div>
            <input
              type="text"
              placeholder="口座名を入力"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
            />
          </div>
        )}

        {current === 'category' && (
          <div className="tutorial-step">
            <span className="material-symbols-outlined tutorial-icon">sell</span>
            <h2>カテゴリも1つ作りましょう</h2>
            <p>支出・収入それぞれにカテゴリを付けて記録します。まずは1つだけ作ってみましょう。</p>
            <div className="mode-switch" style={{ marginBottom: 14 }}>
              <button
                type="button"
                className={categoryType === 'expense' ? 'active--expense' : ''}
                onClick={() => setCategoryType('expense')}
              >
                支出
              </button>
              <button
                type="button"
                className={categoryType === 'income' ? 'active--income' : ''}
                onClick={() => setCategoryType('income')}
              >
                収入
              </button>
            </div>
            <div className="chip-grid">
              {CATEGORY_SUGGESTIONS[categoryType].map(s => (
                <button key={s} type="button" className="chip" onClick={() => setCategoryName(s)}>{s}</button>
              ))}
            </div>
            <input
              type="text"
              placeholder="カテゴリ名を入力"
              value={categoryName}
              onChange={e => setCategoryName(e.target.value)}
            />
          </div>
        )}

        {current === 'entry' && (
          <div className="tutorial-step">
            <span className="material-symbols-outlined tutorial-icon">add_circle</span>
            <h2>入力は画面下の＋ボタンから</h2>
            <p>支出・収入・振替を切り替えながら入力できます。数字キーパッドなので、片手でも入力しやすくなっています。</p>
          </div>
        )}

        {current === 'whatsnew' && (
          <div className="tutorial-step">
            <span className="material-symbols-outlined tutorial-icon">new_releases</span>
            <h2>今回のアップデート内容</h2>
            <ul className="tutorial-list">
              <li>右上のアイコンから「設定」画面を開けるようになりました</li>
              <li>口座ごとに「毎月表示リセット」機能を追加</li>
              <li>口座ごとに「毎月使えるお金（上限）」機能を追加</li>
              <li>アイコンをシンプルなMaterial Symbolsに統一</li>
            </ul>
          </div>
        )}

        <div className="tutorial-actions">
          {current === 'account' && (
            <button className="submit-btn" disabled={!accountName.trim() || busy} onClick={handleCreateAccount}>
              作って次へ
            </button>
          )}
          {current === 'category' && (
            <button className="submit-btn" disabled={!categoryName.trim() || busy} onClick={handleCreateCategory}>
              作って次へ
            </button>
          )}
          {current !== 'account' && current !== 'category' && (
            <button className="submit-btn" onClick={next} disabled={busy}>
              {step === steps.length - 1 ? 'はじめる' : '次へ'}
            </button>
          )}
        </div>

        <div className="tutorial-dots">
          {steps.map((_, i) => (
            <span key={i} className={`tutorial-dot ${i === step ? 'tutorial-dot--active' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
