import { useState } from 'react'
import { format, parseISO, isPast } from 'date-fns'
import type { Reminder } from '../lib/types'

interface Props {
  reminders: Reminder[]
  onAdd: (r: Reminder) => void
  onUpdate: (id: string, u: Partial<Reminder>) => void
  onDelete: (id: string) => void
}

function fmtDatetime(s: string) {
  try { return format(parseISO(s), "MMM d 'at' h:mm a") } catch { return s }
}

export function RemindersView({ reminders, onAdd, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [datetime, setDatetime] = useState('')

  const close = () => { setOpen(false); setTitle(''); setDatetime('') }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !datetime) return
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      datetime,
      completed: false,
      createdAt: new Date().toISOString()
    })
    close()
  }

  const sorted = [...reminders].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
  const active = sorted.filter(r => !r.completed)
  const done = sorted.filter(r => r.completed)

  return (
    <div className="section-view">
      <div className="scroll-area">
        {active.length === 0 && done.length === 0 && <div className="empty-msg">no reminders set</div>}

        {active.map(r => (
          <div key={r.id} className={`reminder-item ${isPast(parseISO(r.datetime)) ? 'overdue' : ''}`}>
            <button className="task-check" onClick={() => onUpdate(r.id, { completed: true })}>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>○</span>
            </button>
            <div className="reminder-body">
              <span className="reminder-title">{r.title}</span>
              <span className="reminder-time">{fmtDatetime(r.datetime)}</span>
            </div>
            <button className="del-btn" onClick={() => onDelete(r.id)}>×</button>
          </div>
        ))}

        {done.length > 0 && (
          <>
            <div className="section-divider">completed</div>
            {done.map(r => (
              <div key={r.id} className="reminder-item is-done">
                <button className="task-check" onClick={() => onUpdate(r.id, { completed: false })}>
                  <span style={{ color: '#FF2D78' }}>✓</span>
                </button>
                <div className="reminder-body">
                  <span className="reminder-title struck">{r.title}</span>
                  <span className="reminder-time">{fmtDatetime(r.datetime)}</span>
                </div>
                <button className="del-btn" onClick={() => onDelete(r.id)}>×</button>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="section-footer">
        {open ? (
          <form className="add-form" onSubmit={submit}>
            <input
              autoFocus
              className="add-input"
              placeholder="reminder title..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && close()}
            />
            <input
              type="datetime-local"
              className="add-date"
              value={datetime}
              onChange={e => setDatetime(e.target.value)}
            />
            <div className="add-actions">
              <button type="submit" className="btn-pink" disabled={!title.trim() || !datetime}>set</button>
              <button type="button" className="btn-ghost" onClick={close}>cancel</button>
            </div>
          </form>
        ) : (
          <button className="add-trigger" onClick={() => setOpen(true)}>+ set reminder</button>
        )}
      </div>
    </div>
  )
}
