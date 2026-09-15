import { useState, useEffect, useCallback, useRef } from 'react'
import { format, addDays, subDays, parseISO } from 'date-fns'
import type { JournalEntry } from '../lib/types'
import { getDailyPrompt, getRandomPrompt } from '../lib/prompts'

type Mood = 'great' | 'good' | 'okay' | 'meh' | 'low'
const MOODS: Mood[] = ['great', 'good', 'okay', 'meh', 'low']
const MOOD_SYM: Record<Mood, string> = { great: '✦', good: '●', okay: '◐', meh: '○', low: '◻' }

interface Props {
  entries: JournalEntry[]
  onSave: (entry: JournalEntry) => void
}

export function JournalView({ entries, onSave }: Props) {
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<Mood | undefined>()
  const [prompt, setPrompt] = useState(() => getDailyPrompt(today))
  const [words, setWords] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const entry = entries.find(e => e.date === date)
    setContent(entry?.content ?? '')
    setMood(entry?.mood as Mood | undefined)
    setPrompt(entry?.prompt ?? getDailyPrompt(date))
  }, [date, entries])

  useEffect(() => {
    setWords(content.trim() ? content.trim().split(/\s+/).length : 0)
  }, [content])

  const isToday = date === today

  const save = useCallback((text: string, m: Mood | undefined, p: string) => {
    const existing = entries.find(e => e.date === date)
    onSave({
      id: existing?.id ?? crypto.randomUUID(),
      date,
      content: text,
      prompt: p,
      mood: m,
      updatedAt: new Date().toISOString()
    })
  }, [date, entries, onSave])

  const handleChange = (text: string) => {
    setContent(text)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => save(text, mood, prompt), 800)
  }

  const handleMood = (m: Mood) => {
    const next = m === mood ? undefined : m
    setMood(next)
    save(content, next, prompt)
  }

  const handlePromptRefresh = () => {
    const next = getRandomPrompt(prompt)
    setPrompt(next)
    save(content, mood, next)
  }

  const prevDay = () => setDate(subDays(parseISO(date), 1).toISOString().split('T')[0])
  const nextDay = () => { if (!isToday) setDate(addDays(parseISO(date), 1).toISOString().split('T')[0]) }

  const dateLabel = isToday ? 'today' : format(parseISO(date), 'MMM d, yyyy')

  return (
    <div className="section-view journal-view">
      <div className="journal-nav">
        <button className="nav-arrow" onClick={prevDay}>←</button>
        <span className="journal-date">{dateLabel}</span>
        <button className="nav-arrow" onClick={nextDay} disabled={isToday}>→</button>
      </div>

      <div className="journal-prompt">
        <span className="prompt-text">{prompt}</span>
        {isToday && (
          <button className="prompt-refresh" onClick={handlePromptRefresh} title="try another prompt">↻</button>
        )}
      </div>

      <textarea
        className="journal-area"
        placeholder="write freely..."
        value={content}
        onChange={e => handleChange(e.target.value)}
        readOnly={!isToday}
        spellCheck={false}
      />

      <div className="journal-footer">
        <div className="mood-picker">
          {MOODS.map(m => (
            <button
              key={m}
              className={`mood-btn ${mood === m ? 'active' : ''}`}
              onClick={() => isToday && handleMood(m)}
              title={m}
              disabled={!isToday}
            >
              {MOOD_SYM[m]}
            </button>
          ))}
        </div>
        <span className="word-count">{words} words</span>
      </div>
    </div>
  )
}
