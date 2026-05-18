'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task } from '@/types'
import { Check } from 'lucide-react'

export default function TaskItem({ task: initialTask }: { task: Task }) {
  const [task, setTask] = useState(initialTask)
  const supabase = createClient()

  async function toggle() {
    const done = !task.done
    await supabase.from('tasks').update({ done, completed_at: done ? new Date().toISOString() : null }).eq('id', task.id)
    setTask(t => ({...t, done}))
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <button onClick={toggle}
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${task.done ? 'bg-brand border-brand text-white' : 'border-gray-300 hover:border-brand'}`}>
        {task.done && <Check size={10} strokeWidth={3} />}
      </button>
      <span className={`flex-1 text-sm ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{task.name}</span>
      <span className="text-xs text-gray-400">{task.due_time?.slice(0, 5)}</span>
    </div>
  )
}
