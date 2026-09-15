import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import type { DragEndEvent } from '@dnd-kit/core'
import type { Task } from '../lib/types'
import { TaskItem } from './TaskItem'

interface Props {
  tasks: Task[]
  onUpdate: (id: string, u: Partial<Task>) => void
  onDelete: (id: string) => void
  onReorder: (tasks: Task[]) => void
}

export function TaskList({ tasks, onUpdate, onDelete, onReorder }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const oldIdx = tasks.findIndex(t => t.id === active.id)
    const newIdx = tasks.findIndex(t => t.id === over.id)
    onReorder(arrayMove(tasks, oldIdx, newIdx).map((t, i) => ({ ...t, order: i })))
  }

  if (!tasks.length) return <div className="empty-msg">nothing here</div>

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        {tasks.map(task => (
          <TaskItem key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
