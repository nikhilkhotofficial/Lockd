import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorCode = searchParams.get('error_code')

  // Handle errors (e.g. expired OTP link)
  if (error || errorCode) {
    const errorDescription = searchParams.get('error_description') ?? 'Authentication failed'
    return NextResponse.redirect(
      `${origin}/auth?error=${encodeURIComponent(errorDescription)}`
    )
  }

  if (code) {
    const supabase = createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      return NextResponse.redirect(
        `${origin}/auth?error=${encodeURIComponent(exchangeError.message)}`
      )
    }
  }

  return NextResponse.redirect(`${origin}/dashboard`)
}