import { Flame } from 'lucide-react'

export default function FriendStreakRow({ friend }: { friend: any }) {
  const profile = friend.profile
  const streak = profile?.current_streak ?? 0
  const maxStreak = Math.max(profile?.longest_streak ?? 1, 30)

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
        {profile?.avatar_initials ?? '??'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-800 font-medium truncate">{profile?.display_name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-brand rounded-full" style={{width: `${Math.round(streak/maxStreak*100)}%`}} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 text-orange-500 flex-shrink-0">
        <Flame size={13} />
        <span className="text-xs font-medium text-gray-600">{streak}d</span>
      </div>
    </div>
  )
}
