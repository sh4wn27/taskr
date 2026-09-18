import { useState } from 'react'
import type { Scholarship } from '../lib/types'
import { ScholarshipItem } from './ScholarshipItem'

interface Props {
  scholarships: Scholarship[]
  onAdd: (s: Scholarship) => void
  onUpdate: (id: string, u: Partial<Scholarship>) => void
  onDelete: (id: string) => void
}

export function ScholarshipsView({ scholarships, onAdd, onUpdate, onDelete }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [dueDate, setDueDate] = useState('')

  const close = () => { setOpen(false); setName(''); setDueDate('') }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !dueDate) return
    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      dueDate,
      checklist: [],
      createdAt: new Date().toISOString()
    })
    close()
  }

  const sorted = [...scholarships].sort((a, b) => a.dueDate.localeCompare(b.dueDate))

  return (
    <div className="section-view">
      <div className="scroll-area">
        {sorted.length === 0 && <div className="empty-msg">no scholarships tracked</div>}
        {sorted.map(s => (
          <ScholarshipItem key={s.id} scholarship={s} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </div>

      <div className="section-footer">
        {open ? (
          <form className="add-form" onSubmit={submit}>
            <input
              autoFocus
              className="add-input"
              placeholder="scholarship name..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && close()}
            />
            <input
              type="date"
              className="add-date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
            <div className="add-actions">
              <button type="submit" className="btn-pink" disabled={!name.trim() || !dueDate}>add</button>
              <button type="button" className="btn-ghost" onClick={close}>cancel</button>
            </div>
          </form>
        ) : (
          <button className="add-trigger" onClick={() => setOpen(true)}>+ add scholarship</button>
        )}
      </div>
    </div>
  )
}
