'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Task } from '@/types'
import { format } from 'date-fns'
import { Plus, Trash2, Check, Loader2 } from 'lucide-react'

export default function TasksPage() {
  const supabase = createClient()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', due_date: format(new Date(),'yyyy-MM-dd'), due_time:'09:00', repeat:'none' })

  async function loadTasks() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('tasks').select('*')
      .eq('user_id', user.id).order('due_date').order('due_time')
    setTasks(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadTasks() }, [])

  async function addTask() {
    if (!form.name.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('tasks').insert({
      user_id: user.id, name: form.name, due_date: form.due_date,
      due_time: form.due_time, repeat: form.repeat
    }).select().single()
    if (data) { setTasks(p => [...p, data]); setForm(f => ({...f, name:''})); setShowForm(false) }
  }

  async function toggleTask(task: Task) {
    const done = !task.done
    await supabase.from('tasks').update({ done, completed_at: done ? new Date().toISOString() : null }).eq('id', task.id)
    setTasks(p => p.map(t => t.id === task.id ? {...t, done} : t))
  }

  async function deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    setTasks(p => p.filter(t => t.id !== id))
  }

  const grouped = tasks.reduce<Record<string, Task[]>>((acc, t) => {
    const key = t.due_date; if (!acc[key]) acc[key] = []; acc[key].push(t); return acc
  }, {})

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand" /></div>

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My tasks</h1>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add task
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <input className="input" placeholder="Task name..." value={form.name}
            onChange={e => setForm(f => ({...f, name: e.target.value}))}
            onKeyDown={e => e.key === 'Enter' && addTask()} />
          <div className="grid grid-cols-2 gap-2">
            <div><label className="label">Date</label>
              <input type="date" className="input" value={form.due_date}
                onChange={e => setForm(f => ({...f, due_date: e.target.value}))} /></div>
            <div><label className="label">Time</label>
              <input type="time" className="input" value={form.due_time}
                onChange={e => setForm(f => ({...f, due_time: e.target.value}))} /></div>
          </div>
          <div><label className="label">Repeat</label>
            <select className="input" value={form.repeat}
              onChange={e => setForm(f => ({...f, repeat: e.target.value}))}>
              <option value="none">No repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={addTask}>Save task</button>
          </div>
        </div>
      )}

      {Object.keys(grouped).sort().map(date => (
        <div key={date}>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
            {format(new Date(date + 'T00:00:00'), 'EEE, MMM d')}
          </p>
          <div className="card space-y-1 p-2">
            {grouped[date].map(t => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 group">
                <button onClick={() => toggleTask(t)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.done ? 'bg-brand border-brand text-white' : 'border-gray-300 hover:border-brand'}`}>
                  {t.done && <Check size={10} strokeWidth={3} />}
                </button>
                <span className={`flex-1 text-sm ${t.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>{t.name}</span>
                {t.repeat !== 'none' && (
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t.repeat}</span>
                )}
                <span className="text-xs text-gray-400">{t.due_time?.slice(0,5)}</span>
                <button onClick={() => deleteTask(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      {tasks.length === 0 && !showForm && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg mb-2">No tasks yet</p>
          <p className="text-sm">Add your first task to start building your streak</p>
        </div>
      )}
    </div>
  )
}
