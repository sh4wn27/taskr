import { contextBridge, ipcRenderer } from 'electron'
import type { Task, Idea, Reminder, JournalEntry } from '../shared/types'

contextBridge.exposeInMainWorld('api', {
  // Tasks
  getTasks: (): Promise<Task[]> => ipcRenderer.invoke('tasks:get'),
  addTask: (task: Task): Promise<Task[]> => ipcRenderer.invoke('tasks:add', task),
  updateTask: (id: string, u: Partial<Task>): Promise<Task[]> => ipcRenderer.invoke('tasks:update', id, u),
  deleteTask: (id: string): Promise<Task[]> => ipcRenderer.invoke('tasks:delete', id),
  reorderTasks: (tasks: Task[]): Promise<Task[]> => ipcRenderer.invoke('tasks:reorder', tasks),

  // Ideas
  getIdeas: (): Promise<Idea[]> => ipcRenderer.invoke('ideas:get'),
  addIdea: (idea: Idea): Promise<Idea[]> => ipcRenderer.invoke('ideas:add', idea),
  deleteIdea: (id: string): Promise<Idea[]> => ipcRenderer.invoke('ideas:delete', id),

  // Reminders
  getReminders: (): Promise<Reminder[]> => ipcRenderer.invoke('reminders:get'),
  addReminder: (r: Reminder): Promise<Reminder[]> => ipcRenderer.invoke('reminders:add', r),
  updateReminder: (id: string, u: Partial<Reminder>): Promise<Reminder[]> => ipcRenderer.invoke('reminders:update', id, u),
  deleteReminder: (id: string): Promise<Reminder[]> => ipcRenderer.invoke('reminders:delete', id),

  // Journal
  getJournal: (): Promise<JournalEntry[]> => ipcRenderer.invoke('journal:get'),
  saveJournal: (entry: JournalEntry): Promise<JournalEntry[]> => ipcRenderer.invoke('journal:save', entry),

  // Window
  hideWindow: (): Promise<void> => ipcRenderer.invoke('window:hide'),
  onWindowShown: (cb: () => void): (() => void) => {
    const listener = () => cb()
    ipcRenderer.on('window:shown', listener)
    return () => ipcRenderer.removeListener('window:shown', listener)
  },
})
