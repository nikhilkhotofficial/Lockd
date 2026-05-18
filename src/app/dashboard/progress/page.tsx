import { createClient } from '@/lib/supabase/server'
import { format, eachDayOfInterval, startOfYear, endOfYear, parseISO } from 'date-fns'
import StatCard from '@/components/StatCard'
import { Flame, CheckSquare, Calendar, Target } from 'lucide-react'

export default async function ProgressPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const year = new Date().getFullYear()
  const yearStart = startOfYear(new Date())
  const yearEnd = endOfYear(new Date())

  const { data: tasks } = await supabase.from('tasks').select('due_date, done')
    .eq('user_id', user.id).gte('due_date', format(yearStart, 'yyyy-MM-dd'))

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const days = eachDayOfInterval({ start: yearStart, end: yearEnd })
  const completionByDay: Record<string, { done: number; total: number }> = {}

  tasks?.forEach(t => {
    const k = t.due_date
    if (!completionByDay[k]) completionByDay[k] = { done: 0, total: 0 }
    completionByDay[k].total++
    if (t.done) completionByDay[k].done++
  })

  function getLevel(dateStr: string): 0 | 1 | 2 | 3 {
    const d = completionByDay[dateStr]
    if (!d || d.total === 0) return 0
    const pct = d.done / d.total
    if (pct === 0) return 0
    if (pct < 0.5) return 1
    if (pct < 1) return 2
    return 3
  }

  const months = Array.from({ length: 12 }, (_, i) => {
    const m = new Date(year, i, 1)
    return {
      name: format(m, 'MMM'),
      days: days.filter(d => d.getMonth() === i)
    }
  })

  const colors = ['bg-gray-100', 'bg-brand-light', 'bg-brand', 'bg-brand-dark']
  const totalDone = tasks?.filter(t => t.done).length ?? 0
  const totalTasks = tasks?.length ?? 0
  const activeDays = Object.values(completionByDay).filter(d => d.done > 0).length

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-semibold">Your year — {year}</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={<Flame size={18} className="text-orange-500" />}
          label="Current streak" value={`${profile?.current_streak ?? 0}d`} />
        <StatCard icon={<Target size={18} className="text-purple-500" />}
          label="Best streak" value={`${profile?.longest_streak ?? 0}d`} />
        <StatCard icon={<Calendar size={18} className="text-brand" />}
          label="Active days" value={activeDays} />
        <StatCard icon={<CheckSquare size={18} className="text-blue-500" />}
          label="Tasks done" value={`${totalDone}/${totalTasks}`} />
      </div>

      <div className="card">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Completion map</h2>
        <div className="space-y-1 overflow-x-auto">
          {months.map(m => (
            <div key={m.name} className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 w-7 flex-shrink-0">{m.name}</span>
              <div className="flex gap-0.5 flex-wrap">
                {m.days.map(d => {
                  const ds = format(d, 'yyyy-MM-dd')
                  const lvl = getLevel(ds)
                  const isFuture = d > new Date()
                  return (
                    <div key={ds} title={`${format(d, 'MMM d')}${completionByDay[ds] ? ` — ${completionByDay[ds].done}/${completionByDay[ds].total} done` : ''}`}
                      className={`w-3 h-3 rounded-sm flex-shrink-0 ${isFuture ? 'bg-gray-50 border border-gray-100' : colors[lvl]}`} />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-50">
          <span className="text-xs text-gray-400">Less</span>
          {colors.map((c, i) => <div key={i} className={`w-3 h-3 rounded-sm ${c} ${i===0?'border border-gray-100':''}`} />)}
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>
    </div>
  )
}
