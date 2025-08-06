"use client"

import React from 'react';
import { Bell, Search, Settings as SettingsIcon, ChevronDown, Menu, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DashboardHeaderProps {
  onMenuClick?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onMenuClick }) => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  
  const initials = user?.user_metadata?.full_name
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase() || 
    (user?.email ? user.email[0].toUpperCase() : 'U');

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
    toast.success('Signed out successfully');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-lg">
      {/* Mobile layout */}
      <div className="md:hidden flex flex-col space-y-3 px-4 py-3">
        <div className="flex items-center justify-between">
          {onMenuClick && (
            <button 
              className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent">
              Sleft Signals
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-black font-semibold text-xs">{initials}</span>
                </div>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-[280px] bg-gray-900 border-white/10 shadow-xl"
            >
              <DropdownMenuLabel className="text-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">{initials}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user?.user_metadata?.full_name || 'Creator'}</p>
                    <p className="text-white/60 text-xs">{user?.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer px-4 py-2"
                onClick={() => router.push('/dashboard/settings')}
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer px-4 py-2"
                onClick={() => router.push('/dashboard/billing')}
              >
                Billing & Usage
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer px-4 py-2"
                onClick={handleSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h1 className="text-lg font-bold text-white">
          Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator'}!
        </h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <Input
            placeholder="Search briefs, analytics..."
            className="pl-10 h-9 w-full bg-gray-800/50 border-white/10 text-white placeholder:text-white/40 text-sm focus:border-yellow-500/50"
          />
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-yellow-500 bg-clip-text text-transparent">
              Sleft Signals
            </span>
          </div>
          
          <div className="h-8 w-px bg-white/20 mx-2" />
          
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white">
              Welcome back, {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Creator'}!
            </h1>
            <p className="text-white/60 text-sm">
              Ready to generate powerful business insights? Let's dive into your analytics.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
            <Input
              placeholder="Search briefs, analytics..."
              className="pl-10 w-80 bg-gray-800/50 border-white/10 text-white placeholder:text-white/40 focus:border-yellow-500/50 transition-all duration-200"
            />
          </div>

          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative text-white/70 hover:text-white hover:bg-white/10 transition-colors" 
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-xs text-black rounded-full flex items-center justify-center border-2 border-gray-900 animate-pulse font-semibold">
              3
            </span>
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white/70 hover:text-white hover:bg-white/10 transition-colors" 
            aria-label="Settings"
            onClick={() => router.push('/dashboard/settings')}
          >
            <SettingsIcon className="w-5 h-5" />
          </Button>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-black font-semibold text-sm">{initials}</span>
                </div>
                <div className="text-left">
                  <p className="text-white font-medium text-sm">
                    {user?.user_metadata?.full_name || 'Creator'}
                  </p>
                  <p className="text-white/60 text-xs">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-white/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 bg-gray-900 border-white/10 shadow-xl"
            >
              <DropdownMenuLabel className="text-white px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                    <span className="text-black font-semibold">{initials}</span>
                  </div>
                  <div>
                    <p className="font-medium">{user?.user_metadata?.full_name || 'Creator'}</p>
                    <p className="text-white/60 text-xs">{user?.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem 
                className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer px-4 py-2"
                onClick={() => router.push('/dashboard/settings')}
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer px-4 py-2"
                onClick={() => router.push('/dashboard/billing')}
              >
                Billing & Usage
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-white/80 hover:text-white hover:bg-white/10 cursor-pointer px-4 py-2"
                onClick={() => router.push('/dashboard/api-keys')}
              >
                API Keys
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer px-4 py-2"
                onClick={handleSignOut}
              >
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;