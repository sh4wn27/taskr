type NavView = 'tasks' | 'ideas' | 'reminders' | 'journal'

interface Props {
  onNavigate: (v: NavView) => void
  activeTasks: number
  ideaCount: number
  upcomingReminders: number
  hasJournalToday: boolean
}

const ROWS: { key: string; view: NavView; label: string }[] = [
  { key: '1', view: 'tasks', label: 'tasks' },
  { key: '2', view: 'ideas', label: 'ideas' },
  { key: '3', view: 'reminders', label: 'reminders' },
  { key: '4', view: 'journal', label: 'journal' },
]

export function Hub({ onNavigate, activeTasks, ideaCount, upcomingReminders, hasJournalToday }: Props) {
  const metas = [
    activeTasks > 0 ? `${activeTasks} active` : 'clear',
    ideaCount > 0 ? `${ideaCount} notes` : 'empty',
    upcomingReminders > 0 ? `${upcomingReminders} set` : 'none',
    hasJournalToday ? 'written today' : 'not yet',
  ]

  return (
    <div className="hub">
      {ROWS.map((row, i) => (
        <button key={row.key} className="hub-row" onClick={() => onNavigate(row.view)}>
          <span className="hub-key">[{row.key}]</span>
          <span className="hub-label">{row.label}</span>
          <span className="hub-meta">{metas[i]}</span>
          <span className="hub-arrow">→</span>
        </button>
      ))}
      <div className="hub-hint">press 1–4 to navigate · esc to close</div>
    </div>
  )
}
