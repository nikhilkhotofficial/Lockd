'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Reminder } from '@/types'
import { Bell, Plus, Trash2, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react'

export default function RemindersPage() {
  const supabase = createClient()
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ text: '', time: '08:00' })

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('reminders').select('*').eq('user_id', user.id).order('time')
    setReminders(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function add() {
    if (!form.text.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('reminders').insert({ user_id: user.id, text: form.text, time: form.time })
    setForm(f => ({...f, text: ''}))
    load()
  }

  async function toggle(r: Reminder) {
    await supabase.from('reminders').update({ enabled: !r.enabled }).eq('id', r.id)
    setReminders(p => p.map(x => x.id === r.id ? {...x, enabled: !r.enabled} : x))
  }

  async function del(id: string) {
    await supabase.from('reminders').delete().eq('id', id)
    setReminders(p => p.filter(r => r.id !== id))
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand" /></div>

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Reminders</h1>

      <div className="card bg-blue-50 border-blue-100">
        <div className="flex items-start gap-3">
          <Bell size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Desktop notifications</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Allow browser notifications to receive reminders even when the app is in the background.
            </p>
            <button className="mt-2 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
              onClick={() => Notification?.requestPermission()}>
              Enable notifications
            </button>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Add reminder</h2>
        <div className="flex gap-2">
          <input className="input flex-1" placeholder="e.g. Morning workout..." value={form.text}
            onChange={e => setForm(f => ({...f, text: e.target.value}))}
            onKeyDown={e => e.key === 'Enter' && add()} />
          <input type="time" className="input w-28" value={form.time}
            onChange={e => setForm(f => ({...f, time: e.target.value}))} />
          <button className="btn-primary flex items-center gap-1" onClick={add}><Plus size={14} /></button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Your reminders ({reminders.length})</h2>
        {reminders.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No reminders yet</p>}
        {reminders.map(r => (
          <div key={r.id} className={`flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0 ${!r.enabled ? 'opacity-50' : ''}`}>
            <Bell size={16} className="text-brand flex-shrink-0" />
            <span className="flex-1 text-sm text-gray-800">{r.text}</span>
            <span className="text-sm font-medium text-gray-500">{r.time?.slice(0,5)}</span>
            <button onClick={() => toggle(r)} className="text-gray-400 hover:text-brand transition-colors">
              {r.enabled ? <ToggleRight size={20} className="text-brand" /> : <ToggleLeft size={20} />}
            </button>
            <button onClick={() => del(r.id)} className="text-gray-300 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
