import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)

  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const next = searchParams.get('next') ?? '/dashboard'

  // Handle errors from Supabase (e.g. expired link)
  if (error) {
    const message = errorDescription ?? error
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(message)}`
    )
  }

  // Exchange code for session (PKCE flow — email confirmation + Google OAuth)
  if (code) {
    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('Exchange error:', exchangeError.message)
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`
      )
    }
    return NextResponse.redirect(`${origin}${next}`)
  }

  // No code — redirect to auth
  return NextResponse.redirect(`${origin}/auth`)
}