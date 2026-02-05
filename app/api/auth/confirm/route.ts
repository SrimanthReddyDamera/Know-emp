import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const code = searchParams.get('code')
  const typeParam = searchParams.get('type') as EmailOtpType | null
  
  // If this is a password recovery flow, force redirect to reset-password page
  // regardless of what the 'next' param says, to ensure user lands on the correct form.
  let next = searchParams.get('next') ?? '/'
  
  if (typeParam === 'recovery') {
    next = '/reset-password'
  } else if (next === '') {
     next = '/'
  }

  if (code && token_hash) {
    // Both code and token_hash present – this is an invalid state.
    // Redirect to login with a clear error message.
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('invalid request: both auth code and token hash provided')}`, request.url));
  }

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      if (typeParam === 'recovery') {
          // If it was a recovery flow (although code flow is usually signup/magiclink, but just in case)
          // we might want ensuring next is reset-password
           next = '/reset-password'
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      let redirectUrl = ""
      if (isLocalEnv) {
        redirectUrl = `${request.nextUrl.origin}${next}`
      } else if (forwardedHost) {
        redirectUrl = `https://${forwardedHost}${next}`
      } else {
        redirectUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}${next}`
      }
      
      return NextResponse.redirect(redirectUrl)
    } else {
      console.error("Auth Confirm: Code exchange failed", error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
    }
  }

  if (token_hash && typeParam) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: typeParam,
      token_hash,
    })

    if (error) {
      console.error("Auth Confirm: Verify OTP failed", error);
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
    }
    
    // Determine redirect base
    const forwardedHost = request.headers.get('x-forwarded-host')
    const isLocalEnv = process.env.NODE_ENV === 'development'
    
    let redirectBase = ""
    if (isLocalEnv) {
       redirectBase = request.nextUrl.origin
    } else if (forwardedHost) {
       redirectBase = `https://${forwardedHost}`
    } else {
       redirectBase = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
    }

    // Force redirection to reset-password if type is recovery
    if (typeParam === 'recovery') {
       console.log("Auth Confirm: Recovery flow detected, redirecting to /reset-password")
       return NextResponse.redirect(`${redirectBase}/reset-password`)
    }

    console.log("Auth Confirm: Success, redirecting to", next);
    return NextResponse.redirect(`${redirectBase}${next}`)
  } else {
    // missing params
  }

  // redirect the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login', request.url))
}
