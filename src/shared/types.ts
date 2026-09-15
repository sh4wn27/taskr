export type Category =
  | 'academic'
  | 'work'
  | 'internship'
  | 'personal-project'
  | 'personal'
  | 'health'
  | 'other'

export type Priority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  category: Category
  priority: Priority
  dueDate?: string
  completed: boolean
  createdAt: string
  order: number
}

export interface Idea {
  id: string
  text: string
  createdAt: string
}

export interface Reminder {
  id: string
  title: string
  datetime: string // ISO
  completed: boolean
  createdAt: string
}

export interface JournalEntry {
  id: string
  date: string // YYYY-MM-DD
  content: string
  prompt?: string
  mood?: 'great' | 'good' | 'okay' | 'meh' | 'low'
  updatedAt: string
}

export interface AppStore {
  tasks: Task[]
  ideas: Idea[]
  reminders: Reminder[]
  journal: JournalEntry[]
}
