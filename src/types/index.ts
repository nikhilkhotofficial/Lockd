export type Task = {
  id: string
  user_id: string
  name: string
  due_date: string
  due_time: string
  repeat: 'none' | 'daily' | 'weekly'
  done: boolean
  completed_at: string | null
  created_at: string
}

export type Friend = {
  id: string
  requester_id: string
  receiver_id: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  profile?: Profile
}

export type Profile = {
  id: string
  email: string
  display_name: string
  avatar_initials: string
  current_streak: number
  longest_streak: number
  created_at: string
}

export type Challenge = {
  id: string
  name: string
  creator_id: string
  opponent_id: string
  duration_days: number
  creator_progress: number
  opponent_progress: number
  status: 'pending' | 'active' | 'completed'
  started_at: string
  created_at: string
  creator?: Profile
  opponent?: Profile
}

export type Reminder = {
  id: string
  user_id: string
  text: string
  time: string
  enabled: boolean
  created_at: string
}
