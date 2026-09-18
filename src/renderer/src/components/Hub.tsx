import type { Task } from '../lib/types'
import { fmtDue } from '../lib/dueDate'
import { PRI_CLR } from '../lib/priority'

type NavView = 'tasks' | 'ideas' | 'reminders' | 'journal' | 'scholarships'

interface Props {
  onNavigate: (v: NavView) => void
  activeTasks: number
  ideaCount: number
  upcomingReminders: number
  hasJournalToday: boolean
  activeScholarships: number
  upNextTasks: Task[]
}

const ROWS: { key: string; view: NavView; label: string }[] = [
  { key: '1', view: 'tasks', label: 'tasks' },
  { key: '2', view: 'ideas', label: 'ideas' },
  { key: '3', view: 'reminders', label: 'reminders' },
  { key: '4', view: 'journal', label: 'journal' },
  { key: '5', view: 'scholarships', label: 'scholarships' },
]

export function Hub({ onNavigate, activeTasks, ideaCount, upcomingReminders, hasJournalToday, activeScholarships, upNextTasks }: Props) {
  const metas = [
    activeTasks > 0 ? `${activeTasks} active` : 'clear',
    ideaCount > 0 ? `${ideaCount} notes` : 'empty',
    upcomingReminders > 0 ? `${upcomingReminders} set` : 'none',
    hasJournalToday ? 'written today' : 'not yet',
    activeScholarships > 0 ? `${activeScholarships} active` : 'clear',
  ]

  return (
    <div className="hub">
      {upNextTasks.length > 0 && (
        <div className="hub-upnext">
          <div className="hub-upnext-title">up next</div>
          {upNextTasks.map(t => {
            const due = t.dueDate ? fmtDue(t.dueDate) : null
            return (
              <button key={t.id} className="hub-upnext-row" onClick={() => onNavigate('tasks')}>
                <span className="pri-dot"><span style={{ background: PRI_CLR[t.priority] }} /></span>
                <span className="hub-upnext-label">{t.title}</span>
                {due && <span className={`hub-upnext-due ${due.overdue ? 'overdue' : ''}`}>{due.text}</span>}
              </button>
            )
          })}
        </div>
      )}
      {ROWS.map((row, i) => (
        <button key={row.key} className="hub-row" onClick={() => onNavigate(row.view)}>
          <span className="hub-key">[{row.key}]</span>
          <span className="hub-label">{row.label}</span>
          <span className="hub-meta">{metas[i]}</span>
          <span className="hub-arrow">→</span>
        </button>
      ))}
      <div className="hub-hint">press 1–5 to navigate · esc to close</div>
    </div>
  )
}
