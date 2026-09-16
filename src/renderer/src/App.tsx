import { useState, useEffect, useCallback, useRef } from 'react'
import type { Task, Idea, Reminder, JournalEntry } from './lib/types'
import { Hub } from './components/Hub'
import { TasksView } from './components/TasksView'
import { IdeasView } from './components/IdeasView'
import { RemindersView } from './components/RemindersView'
import { JournalView } from './components/JournalView'
import { ToastStack } from './components/ToastStack'
import { useSoftDelete } from './lib/useSoftDelete'

type View = 'hub' | 'tasks' | 'ideas' | 'reminders' | 'journal'

export default function App() {
  const [view, setView] = useState<View>('hub')
  const [tasks, setTasks] = useState<Task[]>([])
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const windowRef = useRef<HTMLDivElement>(null)
  const { toasts, softDelete } = useSoftDelete()

  useEffect(() => {
    Promise.all([
      window.api.getTasks(),
      window.api.getIdeas(),
      window.api.getReminders(),
      window.api.getJournal()
    ]).then(([t, i, r, j]) => {
      setTasks(t.sort((a, b) => a.order - b.order))
      setIdeas(i)
      setReminders(r)
      setJournal(j)
      setLoaded(true)
    })
  }, [])

  // Replay the window's pop-in animation every time it's shown (tray click
  // or global shortcut) — done via direct DOM class toggling, not React
  // state, so it doesn't touch (and can't reset) any section's local state.
  useEffect(() => {
    return window.api.onWindowShown(() => {
      const el = windowRef.current
      if (!el) return
      el.classList.remove('pop-in')
      void el.offsetWidth
      el.classList.add('pop-in')
    })
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement
      if (e.key === 'Escape' && !inInput) {
        if (view !== 'hub') setView('hub')
        else window.api.hideWindow()
        return
      }
      if (view === 'hub' && !inInput) {
        if (e.key === '1') setView('tasks')
        else if (e.key === '2') setView('ideas')
        else if (e.key === '3') setView('reminders')
        else if (e.key === '4') setView('journal')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [view])

  // Task handlers
  const addTask = useCallback(async (task: Task) => setTasks(await window.api.addTask(task)), [])
  const updateTask = useCallback(async (id: string, u: Partial<Task>) =>
    setTasks((await window.api.updateTask(id, u)).sort((a, b) => a.order - b.order)), [])
  const deleteTask = useCallback((id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return
    setTasks(prev => prev.filter(t => t.id !== id))
    softDelete(id, `deleted "${task.title}"`,
      () => setTasks(prev => [...prev, task].sort((a, b) => a.order - b.order)),
      () => { window.api.deleteTask(id).then(setTasks) }
    )
  }, [tasks, softDelete])
  const reorderTasks = useCallback(async (reordered: Task[]) => setTasks(await window.api.reorderTasks(reordered)), [])

  // Idea handlers
  const addIdea = useCallback(async (idea: Idea) => setIdeas(await window.api.addIdea(idea)), [])
  const deleteIdea = useCallback((id: string) => {
    const idx = ideas.findIndex(i => i.id === id)
    if (idx === -1) return
    const idea = ideas[idx]
    const label = idea.text.length > 36 ? `${idea.text.slice(0, 36)}…` : idea.text
    setIdeas(prev => prev.filter(i => i.id !== id))
    softDelete(id, `deleted "${label}"`,
      () => setIdeas(prev => { const next = [...prev]; next.splice(idx, 0, idea); return next }),
      () => { window.api.deleteIdea(id).then(setIdeas) }
    )
  }, [ideas, softDelete])

  // Reminder handlers
  const addReminder = useCallback(async (r: Reminder) => setReminders(await window.api.addReminder(r)), [])
  const updateReminder = useCallback(async (id: string, u: Partial<Reminder>) =>
    setReminders(await window.api.updateReminder(id, u)), [])
  const deleteReminder = useCallback((id: string) => {
    const reminder = reminders.find(r => r.id === id)
    if (!reminder) return
    setReminders(prev => prev.filter(r => r.id !== id))
    softDelete(id, `deleted "${reminder.title}"`,
      () => setReminders(prev => [...prev, reminder]),
      () => { window.api.deleteReminder(id).then(setReminders) }
    )
  }, [reminders, softDelete])

  // Journal handlers
  const saveJournal = useCallback(async (entry: JournalEntry) => setJournal(await window.api.saveJournal(entry)), [])

  const today = new Date().toISOString().split('T')[0]
  const activeTasks = tasks.filter(t => !t.completed).length
  const upcomingReminders = reminders.filter(r => !r.completed && new Date(r.datetime) > new Date()).length
  const hasJournalToday = journal.some(e => e.date === today)

  return (
    <div className="app-root">
      <div className="glass-window" ref={windowRef}>
        <header className="win-header">
          {view !== 'hub' ? (
            <button className="back-btn" onClick={() => setView('hub')}>←</button>
          ) : (
            <span className="win-logo">TASKR</span>
          )}
          <span className="win-section">{view !== 'hub' ? view : ''}</span>
          <button className="esc-btn" onClick={() => window.api.hideWindow()}>esc</button>
        </header>

        <div className={`view-area ${loaded ? 'is-loaded' : ''}`}>
          {view === 'hub' && (
            <Hub
              onNavigate={v => setView(v as View)}
              activeTasks={activeTasks}
              ideaCount={ideas.length}
              upcomingReminders={upcomingReminders}
              hasJournalToday={hasJournalToday}
            />
          )}
          {view === 'tasks' && (
            <TasksView tasks={tasks} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTask} onReorder={reorderTasks} />
          )}
          {view === 'ideas' && (
            <IdeasView ideas={ideas} onAdd={addIdea} onDelete={deleteIdea} />
          )}
          {view === 'reminders' && (
            <RemindersView reminders={reminders} onAdd={addReminder} onUpdate={updateReminder} onDelete={deleteReminder} />
          )}
          {view === 'journal' && (
            <JournalView entries={journal} onSave={saveJournal} />
          )}
        </div>

        <ToastStack toasts={toasts} />
      </div>
    </div>
  )
}
