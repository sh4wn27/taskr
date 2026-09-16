import { useState, useEffect } from 'react'
import type { Task } from '../lib/types'
import { TaskList } from './TaskList'
import { AddTaskForm } from './AddTaskForm'

interface Props {
  tasks: Task[]
  onAdd: (task: Task) => void
  onUpdate: (id: string, u: Partial<Task>) => void
  onDelete: (id: string) => void
  onReorder: (tasks: Task[]) => void
}

type Filter = 'active' | 'all' | 'done'

export function TasksView({ tasks, onAdd, onUpdate, onDelete, onReorder }: Props) {
  const [filter, setFilter] = useState<Filter>('active')
  const [formOpen, setFormOpen] = useState(false)

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'done') return t.completed
    return true
  })

  const remaining = tasks.filter(t => !t.completed).length

  // Enter opens the add-task form and starts writing; ignored while already
  // typing somewhere (e.g. editing a task title) so it doesn't steal that Enter.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      if (e.key === 'Enter' && !inInput && !formOpen) setFormOpen(true)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [formOpen])

  return (
    <div className="section-view">
      <div className="filter-bar">
        {(['active', 'all', 'done'] as Filter[]).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-btn ${filter === f ? 'active' : ''}`}>
            {f}
          </button>
        ))}
        <span className="filter-count">{remaining} remaining</span>
      </div>
      <div className="scroll-area">
        <TaskList tasks={filtered} onUpdate={onUpdate} onDelete={onDelete} onReorder={onReorder} />
      </div>
      <div className="section-footer">
        <AddTaskForm onAdd={onAdd} taskCount={tasks.length} open={formOpen} onOpenChange={setFormOpen} />
      </div>
    </div>
  )
}
