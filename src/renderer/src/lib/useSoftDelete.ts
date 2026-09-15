import { useCallback, useRef, useState } from 'react'

export interface ToastItem {
  id: string
  label: string
  undo: () => void
}

const UNDO_MS = 5000

/** Optimistic "soft delete": item leaves the UI immediately, a toast offers
 *  undo for a few seconds, and the real (persisted) delete only happens if
 *  the toast expires without being undone. */
export function useSoftDelete() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const softDelete = useCallback((id: string, label: string, restore: () => void, commit: () => void) => {
    const existing = timers.current.get(id)
    if (existing) clearTimeout(existing)

    const timer = setTimeout(() => {
      timers.current.delete(id)
      setToasts(ts => ts.filter(t => t.id !== id))
      commit()
    }, UNDO_MS)
    timers.current.set(id, timer)

    setToasts(ts => [
      ...ts.filter(t => t.id !== id),
      {
        id,
        label,
        undo: () => {
          const t = timers.current.get(id)
          if (t) clearTimeout(t)
          timers.current.delete(id)
          setToasts(ts2 => ts2.filter(x => x.id !== id))
          restore()
        }
      }
    ])
  }, [])

  return { toasts, softDelete }
}
