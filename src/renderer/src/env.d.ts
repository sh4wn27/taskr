/// <reference types="vite/client" />

declare global {
  interface Window {
    api: {
      getTasks: () => Promise<import('../../shared/types').Task[]>
      addTask: (t: import('../../shared/types').Task) => Promise<import('../../shared/types').Task[]>
      updateTask: (id: string, u: Partial<import('../../shared/types').Task>) => Promise<import('../../shared/types').Task[]>
      deleteTask: (id: string) => Promise<import('../../shared/types').Task[]>
      reorderTasks: (tasks: import('../../shared/types').Task[]) => Promise<import('../../shared/types').Task[]>

      getIdeas: () => Promise<import('../../shared/types').Idea[]>
      addIdea: (i: import('../../shared/types').Idea) => Promise<import('../../shared/types').Idea[]>
      deleteIdea: (id: string) => Promise<import('../../shared/types').Idea[]>

      getReminders: () => Promise<import('../../shared/types').Reminder[]>
      addReminder: (r: import('../../shared/types').Reminder) => Promise<import('../../shared/types').Reminder[]>
      updateReminder: (id: string, u: Partial<import('../../shared/types').Reminder>) => Promise<import('../../shared/types').Reminder[]>
      deleteReminder: (id: string) => Promise<import('../../shared/types').Reminder[]>

      getJournal: () => Promise<import('../../shared/types').JournalEntry[]>
      saveJournal: (e: import('../../shared/types').JournalEntry) => Promise<import('../../shared/types').JournalEntry[]>

      hideWindow: () => Promise<void>
      onWindowShown: (cb: () => void) => () => void
    }
  }
}

export {}
