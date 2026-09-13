import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider, useData } from './contexts/DataContext'
import LoginScreen from './components/LoginScreen'
import AccountTabs from './components/AccountTabs'
import DashboardPage from './components/DashboardPage'
import HistoryPage from './components/HistoryPage'
import EntryModal from './components/EntryModal'
import AccountManagerModal from './components/AccountManagerModal'
import AccountMenu from './components/AccountMenu'
import SettingsModal from './components/SettingsModal'
import TutorialOverlay from './components/TutorialOverlay'
import { ALL_ACCOUNT_ID } from './utils/calc'
import { CURRENT_TUTORIAL_VERSION } from './utils/tutorial'

function Shell() {
  const { user, logout } = useAuth()
  const { accounts, categories, transactions, userDoc, ready, deleteTransaction, completeTutorial } = useData()

  const [tab, setTab] = useState('dashboard') // dashboard | history
  const [selectedAccount, setSelectedAccount] = useState(ALL_ACCOUNT_ID)
  const [entryOpen, setEntryOpen] = useState(false)
  const [editingTx, setEditingTx] = useState(null)
  const [accountModalOpen, setAccountModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (!ready || !userDoc) {
    return <p className="loading-note">読み込み中です…</p>
  }

  const needsTutorial = (userDoc.tutorialSeenVersion || 0) < CURRENT_TUTORIAL_VERSION
  const settings = userDoc.settings || {}

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

  async function handleLogout() {
    if (confirm('ログアウトしますか？')) {
      await logout()
    }
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <h1 className="top-bar__title">かけいぼ</h1>
        <button className="top-bar__user" onClick={() => setMenuOpen(true)}>
          {user.photoURL && <img className="top-bar__avatar" src={user.photoURL} alt="" />}
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
          <span className="material-symbols-outlined bottom-nav__icon">home</span>
          ホーム
        </button>
        <div style={{ width: 58 }} />
        <button
          className={`bottom-nav__item ${tab === 'history' ? 'bottom-nav__item--active' : ''}`}
          onClick={() => setTab('history')}
        >
          <span className="material-symbols-outlined bottom-nav__icon">receipt_long</span>
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
        <AccountManagerModal accounts={accounts} settings={settings} onClose={() => setAccountModalOpen(false)} />
      )}

      {menuOpen && (
        <AccountMenu
          user={user}
          onOpenSettings={() => { setMenuOpen(false); setSettingsOpen(true) }}
          onLogout={() => { setMenuOpen(false); handleLogout() }}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onClose={() => setSettingsOpen(false)}
          onLogout={() => { setSettingsOpen(false); handleLogout() }}
        />
      )}

      {needsTutorial && (
        <TutorialOverlay
          accounts={accounts}
          categories={categories}
          onFinish={() => completeTutorial(CURRENT_TUTORIAL_VERSION)}
        />
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
