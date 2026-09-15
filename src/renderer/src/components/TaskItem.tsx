import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { isToday, isTomorrow, isPast, parseISO, format } from 'date-fns'
import type { Task, Category, Priority } from '../lib/types'

const CAT_LABELS: Record<Category, string> = {
  academic: 'school', work: 'work', internship: 'intern',
  'personal-project': 'project', personal: 'personal', health: 'health', other: 'other'
}
const CATS: Category[] = ['work', 'academic', 'internship', 'personal-project', 'personal', 'health', 'other']
const PRIS: Priority[] = ['high', 'medium', 'low']
const PRI_CLR: Record<Priority, string> = { high: '#FF2D78', medium: '#FFD60A', low: '#30D158' }

function fmtDue(s: string) {
  try {
    const d = parseISO(s)
    if (isToday(d)) return { text: 'today', overdue: false }
    if (isTomorrow(d)) return { text: 'tmrw', overdue: false }
    return { text: format(d, 'MMM d'), overdue: isPast(d) }
  } catch { return { text: s, overdue: false } }
}

interface Props {
  task: Task
  onUpdate: (id: string, u: Partial<Task>) => void
  onDelete: (id: string) => void
}

export function TaskItem({ task, onUpdate, onDelete }: Props) {
  const [editTitle, setEditTitle] = useState(false)
  const [titleVal, setTitleVal] = useState(task.title)
  const [pickDate, setPickDate] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  const saveTitle = () => {
    const v = titleVal.trim()
    if (v && v !== task.title) onUpdate(task.id, { title: v })
    else setTitleVal(task.title)
    setEditTitle(false)
  }

  const cycleCategory = () =>
    onUpdate(task.id, { category: CATS[(CATS.indexOf(task.category) + 1) % CATS.length] })

  const cyclePriority = () =>
    onUpdate(task.id, { priority: PRIS[(PRIS.indexOf(task.priority) + 1) % PRIS.length] })

  const due = task.dueDate ? fmtDue(task.dueDate) : null

  return (
    <div ref={setNodeRef} style={style} className={`task-item ${task.completed ? 'is-done' : ''} ${isDragging ? 'is-dragging' : ''}`}>
      <button className="task-check" onClick={() => onUpdate(task.id, { completed: !task.completed })}>
        <span style={{ color: task.completed ? '#FF2D78' : 'rgba(255,255,255,0.2)' }}>
          {task.completed ? '✓' : '○'}
        </span>
      </button>

      <div className="task-body">
        {editTitle ? (
          <input
            autoFocus
            className="task-title-input"
            value={titleVal}
            onChange={e => setTitleVal(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => {
              if (e.key === 'Enter') saveTitle()
              if (e.key === 'Escape') { setTitleVal(task.title); setEditTitle(false) }
            }}
          />
        ) : (
          <span
            className={`task-title ${task.completed ? 'struck' : ''}`}
            onDoubleClick={() => !task.completed && setEditTitle(true)}
          >
            {task.title}
          </span>
        )}

        <div className="task-sub">
          <button className="meta-btn" onClick={cycleCategory}>[{CAT_LABELS[task.category]}]</button>
          {due ? (
            <button className={`meta-btn ${due.overdue ? 'overdue' : ''}`} onClick={() => setPickDate(true)}>
              {due.text}
            </button>
          ) : (
            <button className="meta-btn ghost" onClick={() => setPickDate(true)}>+ date</button>
          )}
          {pickDate && (
            <input
              type="date"
              autoFocus
              className="inline-date-input"
              defaultValue={task.dueDate || ''}
              onChange={e => { onUpdate(task.id, { dueDate: e.target.value || undefined }); setPickDate(false) }}
              onBlur={() => setPickDate(false)}
            />
          )}
        </div>
      </div>

      <div className="task-right">
        <button className="pri-dot" title={task.priority} onClick={cyclePriority}>
          <span style={{ background: PRI_CLR[task.priority] }} />
        </button>
        <div className="task-actions">
          <button className="del-btn" onClick={() => onDelete(task.id)}>×</button>
          <span className="drag-grip" {...attributes} {...listeners}>⠿</span>
        </div>
      </div>
    </div>
  )
}
