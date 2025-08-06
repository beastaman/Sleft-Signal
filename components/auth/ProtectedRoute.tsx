"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { motion } from 'framer-motion'
import { Sparkles, Shield } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/generate', '/briefs', '/settings', '/profile']

  useEffect(() => {
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    )

    if (!loading) {
      if (isProtectedRoute && !user) {
        // Store the intended destination
        sessionStorage.setItem('redirectAfterAuth', pathname)
        router.push('/auth')
        return
      }
      
      if (user && isProtectedRoute) {
        setIsAuthorized(true)
      } else if (!isProtectedRoute) {
        setIsAuthorized(true)
      }
    }
  }, [user, loading, router, pathname])

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        <div className="relative z-10 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full mx-auto mb-8"
          />
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent">
              Sleft Signals
            </h1>
          </div>
          
          <p className="text-gray-400 text-lg">Securing your access...</p>
        </div>
      </div>
    )
  }

  // Unauthorized access screen
  if (!isAuthorized && !loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent" />
        
        <div className="relative z-10 text-center max-w-md mx-auto px-6">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-8">
            You need to be signed in to access this page. Please authenticate to continue.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/auth')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-3 rounded-xl"
          >
            Sign In
          </motion.button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}