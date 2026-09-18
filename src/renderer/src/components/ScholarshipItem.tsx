import { useState } from 'react'
import type { Scholarship } from '../lib/types'
import { fmtDue } from '../lib/dueDate'

interface Props {
  scholarship: Scholarship
  onUpdate: (id: string, u: Partial<Scholarship>) => void
  onDelete: (id: string) => void
}

export function ScholarshipItem({ scholarship, onUpdate, onDelete }: Props) {
  const [editName, setEditName] = useState(false)
  const [nameVal, setNameVal] = useState(scholarship.name)
  const [pickDate, setPickDate] = useState(false)
  const [stepText, setStepText] = useState('')

  const saveName = () => {
    const v = nameVal.trim()
    if (v && v !== scholarship.name) onUpdate(scholarship.id, { name: v })
    else setNameVal(scholarship.name)
    setEditName(false)
  }

  const addStep = (e: React.FormEvent) => {
    e.preventDefault()
    const text = stepText.trim()
    if (!text) return
    onUpdate(scholarship.id, {
      checklist: [...scholarship.checklist, { id: crypto.randomUUID(), text, completed: false }]
    })
    setStepText('')
  }

  const toggleStep = (itemId: string) => onUpdate(scholarship.id, {
    checklist: scholarship.checklist.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i)
  })

  const deleteStep = (itemId: string) => onUpdate(scholarship.id, {
    checklist: scholarship.checklist.filter(i => i.id !== itemId)
  })

  const due = fmtDue(scholarship.dueDate)
  const total = scholarship.checklist.length
  const done = scholarship.checklist.filter(i => i.completed).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  const active = scholarship.checklist.filter(i => !i.completed)
  const completed = scholarship.checklist.filter(i => i.completed)

  return (
    <div className="scholarship-card">
      <div className="scholarship-header">
        {editName ? (
          <input
            autoFocus
            className="task-title-input"
            value={nameVal}
            onChange={e => setNameVal(e.target.value)}
            onBlur={saveName}
            onKeyDown={e => {
              if (e.key === 'Enter') saveName()
              if (e.key === 'Escape') { setNameVal(scholarship.name); setEditName(false) }
            }}
          />
        ) : (
          <span className="scholarship-name" onDoubleClick={() => setEditName(true)}>{scholarship.name}</span>
        )}

        {pickDate ? (
          <input
            type="date"
            autoFocus
            className="inline-date-input"
            defaultValue={scholarship.dueDate}
            onChange={e => { if (e.target.value) onUpdate(scholarship.id, { dueDate: e.target.value }); setPickDate(false) }}
            onBlur={() => setPickDate(false)}
          />
        ) : (
          <button className={`meta-btn ${due.overdue ? 'overdue' : ''}`} onClick={() => setPickDate(true)}>
            due {due.text}
          </button>
        )}

        <button className="del-btn" onClick={() => onDelete(scholarship.id)}>×</button>
      </div>

      <div className="progress-row">
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
        <span className="progress-label">{done}/{total} done</span>
      </div>

      <div className="checklist">
        {active.map(item => (
          <div key={item.id} className="checklist-item">
            <button className="task-check" onClick={() => toggleStep(item.id)}>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>○</span>
            </button>
            <span className="checklist-text">{item.text}</span>
            <button className="del-btn" onClick={() => deleteStep(item.id)}>×</button>
          </div>
        ))}

        {completed.length > 0 && (
          <>
            <div className="section-divider">done</div>
            {completed.map(item => (
              <div key={item.id} className="checklist-item">
                <button className="task-check" onClick={() => toggleStep(item.id)}>
                  <span style={{ color: '#FF2D78' }}>✓</span>
                </button>
                <span className="checklist-text struck">{item.text}</span>
                <button className="del-btn" onClick={() => deleteStep(item.id)}>×</button>
              </div>
            ))}
          </>
        )}
      </div>

      <form className="add-step-form" onSubmit={addStep}>
        <input
          className="add-step-input"
          placeholder="+ add step..."
          value={stepText}
          onChange={e => setStepText(e.target.value)}
        />
      </form>
    </div>
  )
}
