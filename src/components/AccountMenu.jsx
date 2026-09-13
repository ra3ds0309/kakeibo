export default function AccountMenu({ user, onOpenSettings, onLogout, onClose }) {
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet sheet--compact" onClick={e => e.stopPropagation()}>
        <div className="sheet__handle" onClick={onClose} />

        <div className="account-menu-header">
          {user.photoURL && <img className="account-menu-avatar" src={user.photoURL} alt="" />}
          <div>
            <div className="account-menu-name">{user.displayName}</div>
            <div className="account-menu-email">{user.email}</div>
          </div>
        </div>

        <button className="menu-row" onClick={onOpenSettings}>
          <span className="material-symbols-outlined">settings</span>
          設定
        </button>
        <button className="menu-row menu-row--danger" onClick={onLogout}>
          <span className="material-symbols-outlined">logout</span>
          ログアウト
        </button>
      </div>
    </div>
  )
}
