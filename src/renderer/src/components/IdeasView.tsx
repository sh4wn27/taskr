import { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import type { Idea } from '../lib/types'

interface Props {
  ideas: Idea[]
  onAdd: (idea: Idea) => void
  onDelete: (id: string) => void
}

export function IdeasView({ ideas, onAdd, onDelete }: Props) {
  const [text, setText] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => { ref.current?.focus() }, [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd({ id: crypto.randomUUID(), text: trimmed, createdAt: new Date().toISOString() })
    setText('')
  }

  return (
    <div className="section-view">
      <form className="idea-form" onSubmit={submit}>
        <input
          ref={ref}
          className="idea-input"
          placeholder="jot something down..."
          value={text}
          onChange={e => setText(e.target.value)}
          maxLength={400}
        />
        <button type="submit" className="idea-submit">↵</button>
      </form>

      <div className="scroll-area">
        {ideas.length === 0 && <div className="empty-msg">nothing yet — start typing</div>}
        {ideas.map(idea => (
          <div key={idea.id} className="idea-item">
            <span className="idea-text">{idea.text}</span>
            <div className="idea-meta">
              <span className="idea-time">{format(new Date(idea.createdAt), 'MMM d, h:mm a')}</span>
              <button className="del-btn" onClick={() => onDelete(idea.id)}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
