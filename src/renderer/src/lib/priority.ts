import type { Priority } from './types'

export const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 }
export const PRI_CLR: Record<Priority, string> = { high: '#FF2D78', medium: '#FFD60A', low: '#30D158' }
