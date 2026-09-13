import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider, useData } from './contexts/DataContext'
import LoginScreen from './components/LoginScreen'
import AccountTabs from './components/AccountTabs'
import DashboardPage from './components/DashboardPage'
import HistoryPage from './components/HistoryPage'
import EntryModal from './components/EntryModal'
import AccountManagerModal from './components/AccountManagerModal'
import { ALL_ACCOUNT_ID } from './utils/calc'

function Shell() {
  const { user, logout } = useAuth()
  const { accounts, categories, transactions, ready, deleteTransaction } = useData()

  const [tab, setTab] = useState('dashboard') // dashboard | history
  const [selectedAccount, setSelectedAccount] = useState(ALL_ACCOUNT_ID)
  const [entryOpen, setEntryOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)

  if (!ready) {
    return <p className="loading-note">読み込み中です…</p>
  }

  const defaultEntryAccount = selectedAccount === ALL_ACCOUNT_ID ? accounts[0]?.id : selectedAccount

  function openEdit(tx) {
    setEditingTx(tx)
    setEntryOpen(true)
  }

  function openNew() {
    setEditingTx(null)
    setEntryOpen(true)
  }

  async function handleDelete(id) {
    if (confirm('この明細を削除しますか？')) {
      await deleteTransaction(id)
      setEntryOpen(false)
      setEditingTx(null)
    }
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <h1 className="top-bar__title">かけいぼ</h1>
        <button className="top-bar__user" onClick={() => confirm('ログアウトしますか？') && logout()}>
          {user.photoURL
            ? <img className="top-bar__avatar" src={user.photoURL} alt="" />
            : <span className="material-symbols-outlined">account_circle</span>}
          {user.displayName}
        </button>
      </div>

      <AccountTabs
        accounts={accounts}
        selected={selectedAccount}
        onSelect={setSelectedAccount}
        onAddClick={() => setAccountModalOpen(true)}
      />

      <div className="scroll-area">
        {tab === 'dashboard' && (
          <DashboardPage
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            selectedAccount={selectedAccount}
            onSelectTx={openEdit}
          />
        )}
        {tab === 'history' && (
          <HistoryPage
            accounts={accounts}
            categories={categories}
            transactions={transactions}
            onSelectTx={openEdit}
          />
        )}
      </div>

      <button className="fab" onClick={openNew} aria-label="収支を入力">
        <span className="material-symbols-outlined">add</span>
      </button>

      <nav className="bottom-nav">
        <button
          className={`bottom-nav__item ${tab === 'dashboard' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          <span className="bottom-nav__icon material-symbols-outlined">home</span>
          ホーム
        </button>
        <div style={{ width: 58 }} />
        <button
          className={`bottom-nav__item ${tab === 'history' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => setTab('history')}
        >
          <span className="bottom-nav__icon material-symbols-outlined">receipt_long</span>
          履歴
        </button>
      </nav>

      {entryOpen && (
        <EntryModal
          accounts={accounts}
          categories={categories}
          defaultAccountId={defaultEntryAccount}
          initialTx={editingTx}
          onClose={() => { setEntryOpen(false); setEditingTx(null) }}
          onDelete={handleDelete}
        />
      )}

      {accountModalOpen && (
        <AccountManagerModal accounts={accounts} onClose={() => setAccountModalOpen(false)} />
      )}
    </div>
  )
}

function Gate() {
  const { user, loading } = useAuth()
  if (loading) return <p className="loading-note">読み込み中です…</p>
  if (!user) return <LoginScreen />
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
