'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Profile } from '@/types'
import { UserPlus, Check, X, Loader2, Flame } from 'lucide-react'

type FriendRow = { id: string; status: string; profile: Profile; direction: 'sent' | 'received' }

export default function FriendsPage() {
  const supabase = createClient()
  const [friends, setFriends] = useState<FriendRow[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [{ data: sent }, { data: received }] = await Promise.all([
      supabase.from('friends').select('id, status, profile:profiles!friends_receiver_id_fkey(*)').eq('requester_id', user.id),
      supabase.from('friends').select('id, status, profile:profiles!friends_requester_id_fkey(*)').eq('receiver_id', user.id)
    ])

    const rows: FriendRow[] = [
      ...(sent ?? []).map((f: any) => ({ ...f, direction: 'sent' as const })),
      ...(received ?? []).map((f: any) => ({ ...f, direction: 'received' as const }))
    ]
    setFriends(rows)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function sendInvite() {
    if (!email.trim()) return
    setSending(true); setMsg('')
    const { data: target } = await supabase.from('profiles').select('id').eq('email', email.trim()).single()
    if (!target) { setMsg('No user found with that email.'); setSending(false); return }
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('friends').insert({ requester_id: user.id, receiver_id: target.id })
    if (error) setMsg(error.message)
    else { setMsg('Invite sent!'); setEmail(''); load() }
    setSending(false)
  }

  async function respond(id: string, status: 'accepted' | 'rejected') {
    await supabase.from('friends').update({ status }).eq('id', id)
    load()
  }

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-brand" /></div>

  const accepted = friends.filter(f => f.status === 'accepted')
  const pending = friends.filter(f => f.status === 'pending')

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Friends</h1>

      <div className="card space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Invite by email</h2>
        <div className="flex gap-2">
          <input className="input flex-1" type="email" placeholder="friend@email.com"
            value={email} onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendInvite()} />
          <button className="btn-primary flex items-center gap-1" onClick={sendInvite} disabled={sending}>
            {sending ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />} Invite
          </button>
        </div>
        {msg && <p className={`text-sm ${msg.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>}
      </div>

      {pending.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Pending requests</h2>
          {pending.map(f => (
            <div key={f.id} className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                {f.profile?.avatar_initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{f.profile?.display_name}</p>
                <p className="text-xs text-gray-400">{f.profile?.email}</p>
              </div>
              {f.direction === 'received' ? (
                <div className="flex gap-2">
                  <button onClick={() => respond(f.id, 'accepted')}
                    className="w-8 h-8 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center">
                    <Check size={14} />
                  </button>
                  <button onClick={() => respond(f.id, 'rejected')}
                    className="w-8 h-8 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center">
                    <X size={14} />
                  </button>
                </div>
              ) : <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">Sent</span>}
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Connected ({accepted.length})
        </h2>
        {accepted.length === 0 && <p className="text-sm text-gray-400 py-4 text-center">No friends yet. Invite someone!</p>}
        {accepted.map(f => (
          <div key={f.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
              {f.profile?.avatar_initials}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{f.profile?.display_name}</p>
              <p className="text-xs text-gray-400">{f.profile?.email}</p>
            </div>
            <div className="flex items-center gap-1 text-orange-500">
              <Flame size={14} />
              <span className="text-xs font-medium text-gray-600">{f.profile?.current_streak ?? 0}d streak</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
