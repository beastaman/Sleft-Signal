"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export const AuthCard: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const router = useRouter()

  // For 3D card effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10])
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            }
          }
        })

        if (error) throw error

        if (data.user) {
          toast.success('Account created successfully! Please check your email for verification.')
          setIsSignUp(false)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        if (data.user) {
          toast.success('Welcome back!')
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during authentication')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error
    } catch (error: any) {
      toast.error(error.message || 'An error occurred with Google authentication')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-sm relative z-10"
      style={{ perspective: 1500 }}
    >
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ z: 10 }}
      >
        <div className="relative group">
          {/* Card glow effect */}
          <motion.div 
            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
            animate={{
              boxShadow: [
                "0 0 10px 2px rgba(251,191,36,0.1)",
                "0 0 15px 5px rgba(251,191,36,0.2)",
                "0 0 10px 2px rgba(251,191,36,0.1)"
              ],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut", 
              repeatType: "mirror" 
            }}
          />

          {/* Glass card background */}
          <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 shadow-2xl overflow-hidden">
            <AnimatePresence mode="wait">
              {!isSignUp ? (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Logo and header */}
                  <div className="text-center space-y-1">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", duration: 0.8 }}
                      className="mx-auto w-12 h-12 rounded-full border border-yellow-500/20 flex items-center justify-center relative overflow-hidden bg-yellow-500/10"
                    >
                      <span className="text-xl font-bold text-yellow-500">S</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-50" />
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
                    >
                      Welcome Back
                    </motion.h1>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/60 text-sm"
                    >
                      Sign in to continue to Sleft Signals
                    </motion.p>
                  </div>

                  {/* Login form */}
                  <form onSubmit={handleAuth} className="space-y-4">
                    {/* Email input */}
                    <motion.div 
                      className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center">
                        <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "email" ? 'text-yellow-500' : 'text-white/40'
                        }`} />
                        
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedInput("email")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-gray-800/60 border-yellow-500/20 focus:border-yellow-500/50 text-white placeholder:text-white/40 h-11 pl-10 pr-3 focus:bg-gray-800/80"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Password input */}
                    <motion.div 
                      className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center">
                        <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "password" ? 'text-yellow-500' : 'text-white/40'
                        }`} />
                        
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-gray-800/60 border-yellow-500/20 focus:border-yellow-500/50 text-white placeholder:text-white/40 h-11 pl-10 pr-10 focus:bg-gray-800/80"
                          required
                        />
                        
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3 text-white/40 hover:text-yellow-500 transition-colors duration-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Sign in button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black h-11 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            Sign In
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </Button>

                    {/* Divider */}
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="mx-3 text-sm text-white/40">or</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* Social buttons */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleAuth}
                      className="w-full bg-gray-800/60 border-yellow-500/20 text-white hover:bg-gray-800/80 hover:border-yellow-500/40"
                    >
                      <span className="text-sm">Continue with Google</span>
                    </Button>

                    {/* Sign up link */}
                    <p className="text-center text-sm text-white/60">
                      Don't have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(true)}
                        className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                      >
                        Sign up
                      </button>
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {/* Logo and header */}
                  <div className="text-center space-y-1">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", duration: 0.8 }}
                      className="mx-auto w-12 h-12 rounded-full border border-yellow-500/20 flex items-center justify-center relative overflow-hidden bg-yellow-500/10"
                    >
                      <span className="text-xl font-bold text-yellow-500">S</span>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-50" />
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl font-bold bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent"
                    >
                      Create Account
                    </motion.h1>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/60 text-sm"
                    >
                      Join Sleft Signals and start growing
                    </motion.p>
                  </div>

                  {/* Signup form */}
                  <form onSubmit={handleAuth} className="space-y-4">
                    {/* Full name input */}
                    <motion.div 
                      className={`relative ${focusedInput === "fullName" ? 'z-10' : ''}`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center">
                        <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "fullName" ? 'text-yellow-500' : 'text-white/40'
                        }`} />
                        
                        <Input
                          type="text"
                          placeholder="Full name"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          onFocus={() => setFocusedInput("fullName")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-gray-800/60 border-yellow-500/20 focus:border-yellow-500/50 text-white placeholder:text-white/40 h-11 pl-10 pr-3 focus:bg-gray-800/80"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Email input */}
                    <motion.div 
                      className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center">
                        <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "email" ? 'text-yellow-500' : 'text-white/40'
                        }`} />
                        
                        <Input
                          type="email"
                          placeholder="Email address"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onFocus={() => setFocusedInput("email")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-gray-800/60 border-yellow-500/20 focus:border-yellow-500/50 text-white placeholder:text-white/40 h-11 pl-10 pr-3 focus:bg-gray-800/80"
                          required
                        />
                      </div>
                    </motion.div>

                    {/* Password input */}
                    <motion.div 
                      className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                      whileFocus={{ scale: 1.02 }}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="relative flex items-center">
                        <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${
                          focusedInput === "password" ? 'text-yellow-500' : 'text-white/40'
                        }`} />
                        
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onFocus={() => setFocusedInput("password")}
                          onBlur={() => setFocusedInput(null)}
                          className="w-full bg-gray-800/60 border-yellow-500/20 focus:border-yellow-500/50 text-white placeholder:text-white/40 h-11 pl-10 pr-10 focus:bg-gray-800/80"
                          required
                        />
                        
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)} 
                          className="absolute right-3 text-white/40 hover:text-yellow-500 transition-colors duration-300"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </motion.div>

                    {/* Sign up button */}
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black h-11 relative overflow-hidden group"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isLoading ? (
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </span>
                    </Button>

                    {/* Divider */}
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-white/10"></div>
                      <span className="mx-3 text-sm text-white/40">or</span>
                      <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {/* Social buttons */}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleAuth}
                      className="w-full bg-gray-800/60 border-yellow-500/20 text-white hover:bg-gray-800/80 hover:border-yellow-500/40"
                    >
                      <span className="text-sm">Continue with Google</span>
                    </Button>

                    {/* Sign in link */}
                    <p className="text-center text-sm text-white/60">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => setIsSignUp(false)}
                        className="text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                      >
                        Sign in
                      </button>
                    </p>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}