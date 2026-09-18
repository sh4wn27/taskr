import type { Task, Idea, Reminder, JournalEntry, Scholarship, AppStore } from './types'

const KEY = 'taskr-browser-mock'

function load(): AppStore {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { tasks: [], ideas: [], reminders: [], journal: [], scholarships: [] }
}

const store = load()
function persist() {
  localStorage.setItem(KEY, JSON.stringify(store))
}

/** Dev-only fallback so the UI can be previewed in a plain browser tab
 *  (open http://127.0.0.1:5173 while `npm run dev` is running) when the
 *  Electron shell itself won't launch. Never active inside the real app —
 *  the preload script always defines window.api first there. */
export function installBrowserMock() {
  if ((window as unknown as { api?: unknown }).api) return

  const shownListeners = new Set<() => void>()
  ;(window as unknown as { __simulateShow: () => void }).__simulateShow = () =>
    shownListeners.forEach(cb => cb())

  ;(window as unknown as { api: Window['api'] }).api = {
    getTasks: async () => store.tasks,
    addTask: async (t: Task) => { store.tasks = [...store.tasks, t]; persist(); return store.tasks },
    updateTask: async (id: string, u: Partial<Task>) => {
      store.tasks = store.tasks.map(t => t.id === id ? { ...t, ...u } : t); persist(); return store.tasks
    },
    deleteTask: async (id: string) => { store.tasks = store.tasks.filter(t => t.id !== id); persist(); return store.tasks },
    reorderTasks: async (tasks: Task[]) => { store.tasks = tasks; persist(); return store.tasks },

    getIdeas: async () => store.ideas,
    addIdea: async (i: Idea) => { store.ideas = [i, ...store.ideas]; persist(); return store.ideas },
    deleteIdea: async (id: string) => { store.ideas = store.ideas.filter(i => i.id !== id); persist(); return store.ideas },

    getReminders: async () => store.reminders,
    addReminder: async (r: Reminder) => { store.reminders = [...store.reminders, r]; persist(); return store.reminders },
    updateReminder: async (id: string, u: Partial<Reminder>) => {
      store.reminders = store.reminders.map(r => r.id === id ? { ...r, ...u } : r); persist(); return store.reminders
    },
    deleteReminder: async (id: string) => { store.reminders = store.reminders.filter(r => r.id !== id); persist(); return store.reminders },

    getJournal: async () => store.journal,
    saveJournal: async (e: JournalEntry) => {
      const idx = store.journal.findIndex(x => x.date === e.date)
      if (idx >= 0) store.journal[idx] = e; else store.journal.unshift(e)
      persist()
      return store.journal
    },

    getScholarships: async () => store.scholarships,
    addScholarship: async (s: Scholarship) => { store.scholarships = [...store.scholarships, s]; persist(); return store.scholarships },
    updateScholarship: async (id: string, u: Partial<Scholarship>) => {
      store.scholarships = store.scholarships.map(s => s.id === id ? { ...s, ...u } : s); persist(); return store.scholarships
    },
    deleteScholarship: async (id: string) => { store.scholarships = store.scholarships.filter(s => s.id !== id); persist(); return store.scholarships },

    hideWindow: async () => { console.log('[browser mock] hideWindow()') },
    onWindowShown: (cb: () => void) => {
      shownListeners.add(cb)
      return () => shownListeners.delete(cb)
    },
  }
}
