const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '00', '0', 'backspace']

export default function NumberPad({ onKeyPress }) {
  return (
    <div className="numpad">
      {KEYS.map(k => (
        <button
          key={k}
          className={k === 'backspace' ? 'key--backspace' : ''}
          onClick={() => onKeyPress(k === 'backspace' ? '⌫' : k)}
        >
          {k === 'backspace'
            ? <span className="material-symbols-outlined">backspace</span>
            : k}
        </button>
      ))}
    </div>
  )
}
