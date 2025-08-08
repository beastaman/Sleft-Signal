"use client"

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, Sparkles, CheckCircle, XCircle } from 'lucide-react'
import { useState } from 'react'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('Completing authentication...')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL to extract auth tokens
        const currentUrl = window.location.href
        
        // Check if this is an email confirmation
        const isEmailConfirmation = searchParams.get('type') === 'email'
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        
        if (accessToken && refreshToken) {
          // Set the session with the tokens from URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })
          
          if (error) {
            console.error('Session set error:', error)
            setStatus('error')
            setMessage(isEmailConfirmation ? 'Email confirmation failed.' : 'Authentication failed.')
            
            setTimeout(() => {
              router.push('/auth?error=session_error')
            }, 3000)
            return
          }

          if (data.session?.user) {
            console.log('Auth successful:', data.session.user.email)
            setStatus('success')
            setMessage(isEmailConfirmation ? 'Email confirmed successfully!' : 'Authentication successful!')
            
            // Clear URL parameters and redirect
            setTimeout(() => {
              window.history.replaceState({}, document.title, '/auth/callback')
              router.push('/dashboard')
            }, 1500)
            return
          }
        }

        // Fallback: Try to get existing session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Session get error:', sessionError)
          setStatus('error')
          setMessage('Failed to retrieve authentication session.')
          
          setTimeout(() => {
            router.push('/auth?error=session_retrieval_failed')
          }, 3000)
          return
        }

        if (sessionData.session?.user) {
          console.log('Existing session found:', sessionData.session.user.email)
          setStatus('success')
          setMessage('Authentication successful! Redirecting to dashboard...')
          
          setTimeout(() => {
            router.push('/dashboard')
          }, 1500)
        } else {
          console.log('No session found')
          setStatus('error')
          setMessage('No authentication session found.')
          
          setTimeout(() => {
            router.push('/auth?message=please_sign_in')
          }, 3000)
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        setStatus('error')
        setMessage('An unexpected error occurred.')
        
        setTimeout(() => {
          router.push('/auth?error=unexpected_error')
        }, 3000)
      }
    }

    // Small delay to ensure the component is mounted
    const timer = setTimeout(handleAuthCallback, 100)
    return () => clearTimeout(timer)
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* Logo */}
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
          <Sparkles className="w-10 h-10 text-black" />
        </div>

        {/* Status Icon and Message */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="flex items-center gap-3 justify-center mb-4">
              <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex items-center gap-3 justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center gap-3 justify-center mb-4">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          )}

          <h2 className="text-2xl font-bold text-white mb-2">
            {status === 'loading' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Oops!'}
          </h2>
          
          <p className="text-gray-400 text-lg">{message}</p>
        </div>

        {/* Loading indicator */}
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce mx-1"></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce mx-1" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce mx-1" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}

        {/* Error action */}
        {status === 'error' && (
          <div className="mt-6">
            <button
              onClick={() => router.push('/auth')}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-6 py-3 rounded-lg transition-all"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Success indicator */}
        {status === 'success' && (
          <div className="mt-6">
            <div className="text-sm text-gray-500">
              Taking you to your dashboard...
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-black" />
          </div>
          <Loader2 className="w-8 h-8 text-yellow-500 animate-spin mx-auto" />
          <p className="text-gray-400 mt-4">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}