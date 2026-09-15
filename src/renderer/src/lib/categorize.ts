import type { Category } from './types'

const KEYWORDS: Record<Exclude<Category, 'other'>, string[]> = {
  academic: [
    'exam', 'assignment', 'homework', 'lecture', 'study', 'class', 'course',
    'professor', 'essay', 'thesis', 'midterm', 'final', 'grade', 'gpa',
    'semester', 'university', 'college', 'school', 'lab', 'quiz', 'textbook',
    'reading', 'paper', 'research paper', 'problem set', 'pset'
  ],
  internship: [
    'intern', 'internship', 'standup', 'sprint', 'jira', 'ticket', 'pr',
    'pull request', 'code review', 'mentor', 'manager', 'onboarding',
    'okr', 'kpi', 'team meeting', 'figma', 'linear'
  ],
  work: [
    'meeting', 'client', 'deadline', 'report', 'presentation', 'email',
    'slack', 'zoom', 'call', 'deliverable', 'stakeholder', 'budget',
    'invoice', 'contract', 'proposal', 'hire', 'interview', 'office',
    'colleague', 'boss', 'salary', 'work', 'job'
  ],
  'personal-project': [
    'side project', 'build', 'deploy', 'launch', 'prototype', 'portfolio',
    'github', 'api', 'app', 'website', 'mvp', 'startup', 'product',
    'feature', 'bug fix', 'refactor', 'implement', 'develop', 'ship',
    'clone', 'repo', 'open source'
  ],
  personal: [
    'grocery', 'groceries', 'doctor', 'dentist', 'haircut', 'family',
    'friend', 'birthday', 'anniversary', 'vacation', 'travel', 'rent',
    'bill', 'appointment', 'call mom', 'call dad', 'date', 'party',
    'shopping', 'clean', 'laundry', 'cook', 'meal', 'taxes', 'bank'
  ],
  health: [
    'gym', 'workout', 'exercise', 'run', 'jog', 'swim', 'yoga', 'meditate',
    'medication', 'prescription', 'therapy', 'mental health', 'sleep',
    'diet', 'nutrition', 'vitamins', 'supplements', 'stretch', 'physio',
    'dentist', 'checkup', 'walk', 'cycling', 'lifting'
  ]
}

export function autoCategory(text: string): Category {
  const lower = text.toLowerCase()
  const scores: Record<Category, number> = {
    academic: 0, work: 0, internship: 0, 'personal-project': 0,
    personal: 0, health: 0, other: 0
  }

  for (const [cat, keywords] of Object.entries(KEYWORDS) as [Category, string[]][]) {
    for (const kw of keywords) {
      if (lower.includes(kw)) scores[cat] += kw.split(' ').length
    }
  }

  const best = (Object.entries(scores) as [Category, number][])
    .sort(([, a], [, b]) => b - a)[0]

  return best[1] > 0 ? best[0] : 'other'
}
