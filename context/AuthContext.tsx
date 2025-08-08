"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { useRouter, usePathname } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Skip auth setup if environment variables are missing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables are missing')
      setLoading(false)
      return
    }

    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        setLoading(false)
        
        // Handle redirect after successful auth
        if (user && pathname !== '/dashboard' && !pathname.startsWith('/dashboard/')) {
          const redirectPath = sessionStorage.getItem('redirectAfterAuth')
          if (redirectPath) {
            sessionStorage.removeItem('redirectAfterAuth')
            router.push(redirectPath)
          } else {
            router.push('/dashboard')
          }
        }
      } catch (error) {
        console.error('Auth error:', error)
        setLoading(false)
      }
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        
        setUser(session?.user ?? null)
        setLoading(false)
        
        // Handle successful sign in
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, redirecting to dashboard')
          
          const redirectPath = sessionStorage.getItem('redirectAfterAuth')
          if (redirectPath) {
            sessionStorage.removeItem('redirectAfterAuth')
            router.push(redirectPath)
          } else {
            router.push('/dashboard')
          }
        }
        
        // Handle sign out
        if (event === 'SIGNED_OUT') {
          console.log('User signed out, redirecting to home')
          router.push('/')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, pathname])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      sessionStorage.removeItem('redirectAfterAuth')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}