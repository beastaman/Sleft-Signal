"use client"

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  Target,
  Zap,
  Building2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  gradient: string;
  index: number;
}

const StatsCard = ({ title, value, change, changeType, icon, gradient, index }: StatsCardProps) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive': return 'text-green-400';
      case 'negative': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive': return <ArrowUp className="w-3 h-3" />;
      case 'negative': return <ArrowDown className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/30 transition-all duration-300 group overflow-hidden relative">
        <div className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
        <CardContent className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${gradient} bg-opacity-20 border border-white/10`}>
              {icon}
            </div>
            <div className={`flex items-center gap-1 text-sm ${getChangeColor()}`}>
              {getChangeIcon()}
              <span>{change}</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-white mb-1">{value}</p>
            <p className="text-gray-400 text-sm">{title}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface DashboardStatsProps {
  briefsCount: number;
}

const DashboardStats = ({ briefsCount }: DashboardStatsProps) => {
  const stats = [
    {
      title: "Strategy Briefs",
      value: briefsCount.toString(),
      change: "+12%",
      changeType: 'positive' as const,
      icon: <BarChart3 className="w-6 h-6 text-yellow-500" />,
      gradient: "bg-gradient-to-br from-yellow-500 to-yellow-600"
    },
    {
      title: "Network Connections",
      value: "24",
      change: "+8%",
      changeType: 'positive' as const,
      icon: <Users className="w-6 h-6 text-blue-500" />,
      gradient: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Growth Score",
      value: "92%",
      change: "+15%",
      changeType: 'positive' as const,
      icon: <TrendingUp className="w-6 h-6 text-green-500" />,
      gradient: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      title: "Market Opportunities",
      value: "18",
      change: "+22%",
      changeType: 'positive' as const,
      icon: <Target className="w-6 h-6 text-purple-500" />,
      gradient: "bg-gradient-to-br from-purple-500 to-purple-600"
    },
    {
      title: "AI Insights",
      value: "156",
      change: "+31%",
      changeType: 'positive' as const,
      icon: <Zap className="w-6 h-6 text-orange-500" />,
      gradient: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      title: "Competitor Analysis",
      value: "8",
      change: "New",
      changeType: 'neutral' as const,
      icon: <Building2 className="w-6 h-6 text-indigo-500" />,
      gradient: "bg-gradient-to-br from-indigo-500 to-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatsCard key={stat.title} {...stat} index={index} />
      ))}
    </div>
  );
};

export default DashboardStats;