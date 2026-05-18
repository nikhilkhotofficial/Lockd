'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Challenge, Profile } from '@/types'
import { Trophy, Plus, Loader2, Flame, CheckCircle } from 'lucide-react'

export default function ChallengesPage() {
  const supabase = createClient()
  const [challenges, setChallenges] = useState<any[]>([])
  const [friends, setFriends] = useState<Profile[]>([])
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', duration_days: '30', opponent_id: '' })

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)

    const [{ data: ch }, { data: fr }] = await Promise.all([
      supabase.from('challenges').select('*, creator:profiles!challenges_creator_id_fkey(*), opponent:profiles!challenges_opponent_id_fkey(*)')
        .or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`).order('created_at', { ascending: false }),
      supabase.from('friends')
        .select('profile:profiles!friends_receiver_id_fkey(*)').eq('requester_id', user.id).eq('status', 'accepted')
    ])

    setChallenges(ch ?? [])
    setFriends((fr ?? []).map((f: any) => f.profile).filter(Boolean))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function createChallenge() {
    if (!form.name || !form.opponent_id) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('challenges').insert({
      name: form.name, creator_id: user.id, opponent_id: form.opponent_id,
      duration_days: parseInt(form.duration_days), status: 'active',
      started_at: new Date().toISOString().slice(0, 10)
    })
    setShowForm(false)
    setForm({ name: '', duration_days: '30', opponent_id: '' })
    load()
  }

  async function logProgress(id: string, field: 'creator_progress' | 'opponent_progress', current: number) {
    await supabase.from('challenges').update({ [field]: current + 1 }).eq('id', id)
    load()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand" /></div>

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Streak challenges</h1>
        <button className="btn-primary flex items-center gap-1" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> New challenge
        </button>
      </div>

      {showForm && (
        <div className="card space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Start a challenge</h2>
          <div>
            <label className="label">Challenge name</label>
            <input className="input" placeholder="e.g. Read every day for 30 days"
              value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Duration</label>
              <select className="input" value={form.duration_days}
                onChange={e => setForm(f => ({...f, duration_days: e.target.value}))}>
                {['7','14','21','30','60','100'].map(d => <option key={d} value={d}>{d} days</option>)}
              </select>
            </div>
            <div>
              <label className="label">Challenge friend</label>
              <select className="input" value={form.opponent_id}
                onChange={e => setForm(f => ({...f, opponent_id: e.target.value}))}>
                <option value="">Select friend...</option>
                {friends.map(f => <option key={f.id} value={f.id}>{f.display_name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn-primary" onClick={createChallenge}>Start challenge</button>
          </div>
        </div>
      )}

      {challenges.length === 0 && !showForm && (
        <div className="card text-center py-10">
          <Trophy size={32} className="text-amber-400 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">No challenges yet</p>
          <p className="text-sm text-gray-400">Challenge a friend to a streak battle</p>
        </div>
      )}

      {challenges.map(c => {
        const isCreator = c.creator_id === userId
        const myProgress = isCreator ? c.creator_progress : c.opponent_progress
        const theirProgress = isCreator ? c.opponent_progress : c.creator_progress
        const them = isCreator ? c.opponent : c.creator
        const myPct = Math.round(myProgress / c.duration_days * 100)
        const theirPct = Math.round(theirProgress / c.duration_days * 100)
        const leading = myProgress >= theirProgress
        const done = myProgress >= c.duration_days

        return (
          <div key={c.id} className="card space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.duration_days}-day challenge</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${done ? 'bg-blue-50 text-blue-600' : leading ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                {done ? 'Complete' : leading ? 'You lead' : 'Behind'}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium flex items-center gap-1"><Flame size={12} className="text-orange-400" /> You</span>
                  <span className="text-gray-500">{myProgress}/{c.duration_days} days</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-all" style={{width:`${myPct}%`}} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 font-medium flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-pink-100 text-pink-600 text-[9px] flex items-center justify-center font-medium">{them?.avatar_initials?.slice(0,1)}</span>
                    {them?.display_name?.split(' ')[0]}
                  </span>
                  <span className="text-gray-500">{theirProgress}/{c.duration_days} days</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-400 rounded-full transition-all" style={{width:`${theirPct}%`}} />
                </div>
              </div>
            </div>

            {!done && (
              <button onClick={() => logProgress(c.id, isCreator ? 'creator_progress' : 'opponent_progress', myProgress)}
                className="btn-secondary w-full flex items-center justify-center gap-2 text-brand border-brand/30">
                <CheckCircle size={14} /> Log today's progress
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
