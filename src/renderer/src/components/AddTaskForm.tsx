import { useState, useRef, useEffect } from 'react'
import type { Task, Category } from '../lib/types'
import { autoCategory } from '../lib/categorize'

const PRIORITIES = ['high', 'medium', 'low'] as const

interface Props {
  onAdd: (task: Task) => void
  taskCount: number
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddTaskForm({ onAdd, taskCount, open, onOpenChange }: Props) {
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [category, setCategory] = useState<Category | ''>('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) ref.current?.focus() }, [open])

  const close = () => { onOpenChange(false); setTitle(''); setDueDate(''); setPriority('medium'); setCategory('') }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({
      id: crypto.randomUUID(),
      title: title.trim(),
      category: (category || autoCategory(title)) as Category,
      priority,
      dueDate: dueDate || undefined,
      completed: false,
      createdAt: new Date().toISOString(),
      order: taskCount
    })
    close()
  }

  if (!open) return (
    <button className="add-trigger" onClick={() => onOpenChange(true)}>+ add task</button>
  )

  return (
    <form className="add-form" onSubmit={submit}>
      <input
        ref={ref}
        className="add-input"
        placeholder="task title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => e.key === 'Escape' && close()}
        maxLength={120}
      />
      {title.length > 0 && (
        <div className="add-row">
          <input type="date" className="add-date" value={dueDate} onChange={e => setDueDate(e.target.value)} />
          <div className="pri-picker">
            {PRIORITIES.map(p => (
              <button
                key={p}
                type="button"
                className={`pri-btn p-${p} ${priority === p ? 'sel' : ''}`}
                onClick={() => setPriority(p)}
              >
                {p[0]}
              </button>
            ))}
          </div>
          <select className="cat-select" value={category} onChange={e => setCategory(e.target.value as Category)}>
            <option value="">auto</option>
            <option value="academic">school</option>
            <option value="work">work</option>
            <option value="internship">intern</option>
            <option value="personal-project">project</option>
            <option value="personal">personal</option>
            <option value="health">health</option>
            <option value="other">other</option>
          </select>
        </div>
      )}
      <div className="add-actions">
        <button type="submit" className="btn-pink" disabled={!title.trim()}>add</button>
        <button type="button" className="btn-ghost" onClick={close}>cancel</button>
      </div>
    </form>
  )
}
