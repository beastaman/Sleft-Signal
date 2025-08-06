"use client"

import { AuthCard } from "@/components/auth/AuthCard"
import { Navbar1 } from "@/components/ui/navbar-1"
import { Footer7 } from "@/components/ui/footer-7"

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <Navbar1 />
      
      {/* Main Auth Content */}
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        
        {/* Auth Card */}
        <AuthCard />
      </div>
      
      {/* Footer */}
      <Footer7 />
    </div>
  )
}