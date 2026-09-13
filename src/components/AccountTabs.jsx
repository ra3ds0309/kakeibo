import { ALL_ACCOUNT_ID } from '../utils/calc'

export default function AccountTabs({ accounts, selected, onSelect, onAddClick }) {
  return (
    <div className="account-tabs">
      <button
        className={`account-tab ${selected === ALL_ACCOUNT_ID ? 'account-tab--active' : ''}`}
        onClick={() => onSelect(ALL_ACCOUNT_ID)}
      >
        すべて
      </button>
      {accounts.map(a => (
        <button
          key={a.id}
          className={`account-tab ${selected === a.id ? 'account-tab--active' : ''}`}
          onClick={() => onSelect(a.id)}
        >
          {a.name}
        </button>
      ))}
      <button className="account-tab account-tab--add" onClick={onAddClick}>
        ＋ 口座
      </button>
    </div>
  )
}
