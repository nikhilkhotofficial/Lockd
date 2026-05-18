'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Flame, LayoutDashboard, CheckSquare, BarChart2, Users, Trophy, Bell, LogOut } from 'lucide-react'
import { Profile } from '@/types'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/tasks', label: 'Tasks', icon: CheckSquare },
  { href: '/dashboard/progress', label: 'Progress', icon: BarChart2 },
  { href: '/dashboard/friends', label: 'Friends', icon: Users },
  { href: '/dashboard/challenges', label: 'Challenges', icon: Trophy },
  { href: '/dashboard/reminders', label: 'Reminders', icon: Bell },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
  }

  return (
    <aside className="w-52 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      <div className="p-4 border-b border-gray-50 flex items-center gap-2">
        <Flame size={20} className="text-orange-500" />
        <span className="font-semibold text-gray-900">discipline</span>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${active ? 'bg-brand-faint text-brand font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'}`}>
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-50">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
            {profile?.avatar_initials ?? '??'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">{profile?.display_name ?? 'You'}</p>
            <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
          </div>
        </div>
        <button onClick={signOut}
          className="flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  )
}
