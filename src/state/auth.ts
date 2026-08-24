import { useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, AUTH_CONFIGURED } from '../lib/supabase'

export type Profile = {
  username: string
  name: string
  initials: string
}

export function profileOf(user: User | null | undefined): Profile | null {
  if (!user) return null
  const meta = user.user_metadata ?? {}
  const rawName =
    (meta.name as string) || (meta.display_name as string) || user.email?.split('@')[0] || 'User'
  const username = (meta.username as string) || user.email?.split('@')[0] || 'user'
  const name = rawName.trim() || username
  const initials =
    name
      .split(/\s+/)
      .map((p) => p[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  return { username, name, initials }
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const profile = profileOf(session?.user ?? null)
  return { session, user: session?.user ?? null, profile, loading, configured: AUTH_CONFIGURED }
}

export async function signOut() {
  if (!supabase) return
  await supabase.auth.signOut()
}
