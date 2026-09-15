import { useState } from 'react'
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

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'done') return t.completed
    return true
  })

  const remaining = tasks.filter(t => !t.completed).length

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
        <AddTaskForm onAdd={onAdd} taskCount={tasks.length} />
      </div>
    </div>
  )
}
