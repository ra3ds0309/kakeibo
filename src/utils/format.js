export function formatYen(amount) {
  const n = Number(amount) || 0
  return n.toLocaleString('ja-JP')
}

export function todayStr() {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

export function formatDateLabel(dateStr) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

export function monthKey(dateStr) {
  return dateStr.slice(0, 7) // YYYY-MM
}

export function monthLabel(key) {
  const [y, m] = key.split('-')
  return `${y}年${Number(m)}月`
}
