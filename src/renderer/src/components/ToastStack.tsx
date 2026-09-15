import type { ToastItem } from '../lib/useSoftDelete'

interface Props {
  toasts: ToastItem[]
}

export function ToastStack({ toasts }: Props) {
  if (!toasts.length) return null

  return (
    <div className="toast-stack">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <span className="toast-label">{t.label}</span>
          <button className="toast-undo" onClick={t.undo}>undo</button>
        </div>
      ))}
    </div>
  )
}
