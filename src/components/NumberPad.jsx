const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '00', '0', '⌫']

export default function NumberPad({ onKeyPress }) {
  return (
    <div className="numpad">
      {KEYS.map(k => (
        <button key={k} onClick={() => onKeyPress(k)}>{k}</button>
      ))}
    </div>
  )
}
