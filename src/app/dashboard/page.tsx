import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import TaskItem from '@/components/TaskItem'
import StatCard from '@/components/StatCard'
import FriendStreakRow from '@/components/FriendStreakRow'
import { Flame, CheckSquare, Trophy, Users } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = format(new Date(), 'yyyy-MM-dd')

  const [{ data: tasks }, { data: profile }, { data: friends }, { data: challenges }] =
    await Promise.all([
      supabase.from('tasks').select('*').eq('user_id', user.id).eq('due_date', today).order('due_time'),
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('friends')
        .select('*, profile:profiles!friends_receiver_id_fkey(*)')
        .eq('requester_id', user.id).eq('status', 'accepted').limit(4),
      supabase.from('challenges')
        .select('*').or(`creator_id.eq.${user.id},opponent_id.eq.${user.id}`)
        .eq('status', 'active')
    ])

  const doneTasks = tasks?.filter(t => t.done).length ?? 0
  const totalTasks = tasks?.length ?? 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Good morning, {profile?.display_name?.split(' ')[0] ?? 'there'} 👋
          </h1>
          <p className="text-sm text-gray-500">{format(new Date(), 'EEEE, MMMM d')}</p>
        </div>
        <Link href="/dashboard/tasks" className="btn-primary">+ Add task</Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Flame size={18} className="text-orange-500" />}
          label="Streak" value={`${profile?.current_streak ?? 0}d`} />
        <StatCard icon={<CheckSquare size={18} className="text-brand" />}
          label="Today" value={`${doneTasks}/${totalTasks}`} />
        <StatCard icon={<Trophy size={18} className="text-amber-500" />}
          label="Challenges" value={challenges?.length ?? 0} />
        <StatCard icon={<Users size={18} className="text-blue-500" />}
          label="Friends" value={friends?.length ?? 0} />
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Today's tasks</h2>
          <Link href="/dashboard/tasks" className="text-xs text-brand hover:underline">See all</Link>
        </div>
        {tasks && tasks.length > 0
          ? tasks.map(t => <TaskItem key={t.id} task={t} />)
          : <p className="text-sm text-gray-400 py-4 text-center">No tasks today. <Link href="/dashboard/tasks" className="text-brand hover:underline">Add one</Link></p>
        }
      </div>

      {friends && friends.length > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Friends' streaks</h2>
          {friends.map(f => <FriendStreakRow key={f.id} friend={f} />)}
        </div>
      )}
    </div>
  )
}
