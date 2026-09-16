import { isToday, isTomorrow, isPast, parseISO, format } from 'date-fns'

export function fmtDue(s: string) {
  try {
    const d = parseISO(s)
    if (isToday(d)) return { text: 'today', overdue: false }
    if (isTomorrow(d)) return { text: 'tmrw', overdue: false }
    return { text: format(d, 'MMM d'), overdue: isPast(d) }
  } catch { return { text: s, overdue: false } }
}
