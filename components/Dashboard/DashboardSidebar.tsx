"use client"

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Search, 
  Building2, 
  BarChart3, 
  Target,
  Zap, 
  Users,
  Settings,
  LogOut,
  Crown,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  Calendar,
  FileText,
  Network,
  Newspaper,
  CreditCard,
  Bell,
  Sparkles,
  MessageCircle,
  Globe,
  TrendingDown,
  DollarSign,
  Shield,
  Briefcase,
  LucideIcon
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from 'sonner';

interface DashboardSidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// Define interfaces for menu items
interface SubMenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
}

interface MenuItem {
  name: string;
  icon: LucideIcon;
  path: string;
  description: string;
  isPremium?: boolean;
  badge?: string;
  subItems?: SubMenuItem[];
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  
  // Determine if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const menuItems: MenuItem[] = [
    { 
      name: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard',
      description: 'Your command center'
    },
    { 
      name: 'Strategy Briefs', 
      icon: Briefcase, 
      path: '/dashboard/briefs',
      description: 'AI-powered business insights',
      badge: 'New'
    },
    { 
      name: 'Lead Generation', 
      icon: Target, 
      path: '/lead-generation',
      isPremium: true,
      description: 'Discover qualified leads',
      subItems: [
        { name: 'Lead Scanner', icon: Search, path: '/lead-generation/scanner' },
        { name: 'Industry Analysis', icon: TrendingUp, path: '/lead-generation/analysis' },
        { name: 'Lead Scoring', icon: BarChart3, path: '/lead-generation/scoring' },
        { name: 'Market Intelligence', icon: Eye, path: '/lead-generation/intelligence' },
        { name: 'Lead Calendar', icon: Calendar, path: '/lead-generation/calendar' },
        { name: 'Reports', icon: FileText, path: '/lead-generation/reports' }
      ]
    },
    { 
      name: 'Business Network', 
      icon: Network, 
      path: '/network', 
      isPremium: true,
      description: 'Connect with local businesses',
      subItems: [
        { name: 'Discover Businesses', icon: Building2, path: '/network/discover' },
        { name: 'My Connections', icon: Users, path: '/network/connections' },
        { name: 'Messages', icon: MessageCircle, path: '/network/messages' },
        { name: 'Networking Events', icon: Calendar, path: '/network/events' }
      ]
    },
    { 
      name: 'Market Intelligence', 
      icon: BarChart3, 
      path: '/market-intelligence', 
      isPremium: true,
      description: 'Industry trends & insights',
      subItems: [
        { name: 'Industry News', icon: Newspaper, path: '/market-intelligence/news' },
        { name: 'Competitor Analysis', icon: Eye, path: '/market-intelligence/competitors' },
        { name: 'Market Trends', icon: TrendingUp, path: '/market-intelligence/trends' },
        { name: 'Growth Opportunities', icon: Zap, path: '/market-intelligence/opportunities' }
      ]
    },
    { 
      name: 'AI Content Generator', 
      icon: Zap, 
      path: '/ai-content', 
      isPremium: true,
      description: 'Generate marketing content'
    },
    { 
      name: 'Business Analytics', 
      icon: TrendingUp, 
      path: '/analytics',
      description: 'Performance metrics',
      subItems: [
        { name: 'Growth Metrics', icon: TrendingUp, path: '/analytics/growth' },
        { name: 'Lead Performance', icon: Target, path: '/analytics/leads' },
        { name: 'Network Stats', icon: Network, path: '/analytics/network' },
        { name: 'ROI Analysis', icon: DollarSign, path: '/analytics/roi' }
      ]
    },
    { 
      name: 'Financial Services', 
      icon: CreditCard, 
      path: '/financial-services',
      description: 'Payment & tax solutions',
      subItems: [
        { name: 'Sleft Payments', icon: CreditCard, path: '/financial-services/payments' },
        { name: 'FICA Tax Credit', icon: DollarSign, path: '/financial-services/tax-credit' },
        { name: 'Airwallex Integration', icon: Globe, path: '/financial-services/international' },
        { name: 'Transaction History', icon: FileText, path: '/financial-services/history' }
      ]
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  const handleSubmenuToggle = (itemName: string) => {
    setOpenSubmenu(openSubmenu === itemName ? null : itemName);
  };

  const isActiveRoute = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  // Close sidebar when clicking a link on mobile
  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm md:hidden z-[55]"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
        ${isOpen ? 'w-[280px] md:w-64' : 'w-0 md:w-16'} 
        fixed 
        transition-all duration-300
        flex flex-col h-screen
        top-0 left-0 z-[60]
        bg-gray-900/95 backdrop-blur-xl border-r border-white/10
        overflow-hidden
      `}>
        {/* Header with Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 group" onClick={handleLinkClick}>
            <div className="relative">
              <motion.div
                className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.05 }}
              >
                <Sparkles className="w-5 h-5 text-black" />
              </motion.div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
            </div>
            {isOpen && (
              <div className="flex flex-col">
                <span className="text-white font-bold text-lg tracking-tight">Sleft Signals</span>
                <span className="text-white/60 text-xs">AI Business Intelligence</span>
              </div>
            )}
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white md:block hidden"
          >
            {isOpen ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white md:hidden"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="p-3 space-y-1">
            {menuItems.map((item) => {
              const isActive = isActiveRoute(item.path);
              const hasSubmenu = item.subItems && item.subItems.length > 0;
              const isSubmenuOpen = openSubmenu === item.name;

              return (
                <div key={item.name}>
                  <Collapsible open={isSubmenuOpen} onOpenChange={() => hasSubmenu && handleSubmenuToggle(item.name)}>
                    <div className="relative group">
                      {hasSubmenu ? (
                        <CollapsibleTrigger asChild>
                          <motion.div
                            className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                              isActive 
                                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' 
                                : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                            whileHover={{ x: 1 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-md ${isActive ? 'bg-yellow-500/20' : 'bg-white/5'} flex items-center justify-center`}>
                                <item.icon className="w-4 h-4" />
                              </div>
                              {isOpen && (
                                <span className="font-medium text-sm">{item.name}</span>
                              )}
                            </div>
                            {isOpen && (
                              <div className="flex items-center gap-2">
                                {item.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                                {item.badge && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                    {item.badge}
                                  </span>
                                )}
                                <motion.div
                                  animate={{ rotate: isSubmenuOpen ? 90 : 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <PanelLeftClose className="w-3 h-3" />
                                </motion.div>
                              </div>
                            )}
                          </motion.div>
                        </CollapsibleTrigger>
                      ) : (
                        <Link href={item.path} onClick={handleLinkClick}>
                          <motion.div
                            className={`flex items-center ${isOpen ? 'justify-between' : 'justify-center'} px-3 py-2.5 rounded-lg transition-all duration-200 ${
                              isActive 
                                ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' 
                                : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                            whileHover={{ x: 1 }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-md ${isActive ? 'bg-yellow-500/20' : 'bg-white/5'}`}>
                                <item.icon className="w-4 h-4" />
                              </div>
                              {isOpen && (
                                <span className="font-medium text-sm">{item.name}</span>
                              )}
                            </div>
                            {isOpen && (
                              <div className="flex items-center gap-2">
                                {item.isPremium && <Crown className="w-3 h-3 text-amber-400" />}
                                {item.badge && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </motion.div>
                        </Link>
                      )}

                      {/* Tooltip for collapsed state */}
                      {!isOpen && (
                        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                          {item.description && (
                            <div className="text-gray-400 text-xs">{item.description}</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Submenu */}
                    {hasSubmenu && isOpen && (
                      <CollapsibleContent className="space-y-1 mt-1">
                        <AnimatePresence>
                          {isSubmenuOpen && item.subItems?.map((subItem) => {
                            const isSubActive = pathname === subItem.path;
                            return (
                              <motion.div
                                key={subItem.name}
                                initial={{ opacity: 0, x: -10, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: -10, height: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Link href={subItem.path} onClick={handleLinkClick}>
                                  <div className={`flex items-center gap-3 px-6 py-2 rounded-md transition-all duration-200 ${
                                    isSubActive 
                                      ? 'bg-yellow-500/15 text-yellow-500 border-l-2 border-yellow-500' 
                                      : 'text-white/60 hover:text-white hover:bg-white/5'
                                  }`}>
                                    <subItem.icon className="w-3.5 h-3.5" />
                                    <span className="text-sm">{subItem.name}</span>
                                  </div>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                </div>
              );
            })}

            {/* Upgrade Card */}
            {isOpen && (
              <motion.div
                className="mt-6 p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-amber-400 font-semibold text-sm">Upgrade to Pro</span>
                </div>
                <p className="text-white/60 text-xs mb-3">Unlock advanced business intelligence and premium networking features</p>
                <button 
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black text-sm font-bold py-2 px-3 rounded-lg transition-all"
                  onClick={() => router.push('/pricing')}
                >
                  <Plus className="w-3 h-3 inline mr-1" />
                  Upgrade Now
                </button>
              </motion.div>
            )}
          </nav>
        </ScrollArea>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/10 space-y-1">
          <Link href="/dashboard/settings" className="group block" onClick={handleLinkClick}>
            <motion.div
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                pathname === '/dashboard/settings' 
                  ? 'bg-yellow-500/20 text-yellow-500' 
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ x: 1 }}
            >
              <div className={`p-1.5 rounded-md ${pathname === '/dashboard/settings' ? 'bg-yellow-500/20' : 'bg-white/5 group-hover:bg-white/10'}`}>
                <Settings className="w-4 h-4" />
              </div>
              {isOpen && <span className="font-medium text-sm">Settings</span>}
            </motion.div>
          </Link>
          
          <motion.button
            onClick={handleSignOut}
            className="w-full group"
            whileHover={{ x: 1 }}
          >
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/70 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200">
              <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-red-500/20">
                <LogOut className="w-4 h-4" />
              </div>
              {isOpen && <span className="font-medium text-sm">Sign Out</span>}
            </div>
          </motion.button>

          {/* User Info */}
          {user && isOpen && (
            <motion.div
              className="mt-3 p-3 bg-white/5 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center">
                  <span className="text-black font-semibold text-sm">
                    {(user?.user_metadata?.full_name || user?.email || 'U')[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    {user?.user_metadata?.full_name || 'Business Owner'}
                  </p>
                  <p className="text-white/60 text-xs truncate">{user?.email}</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;