"use client"

import DashboardLayout from "@/components/Dashboard/DashboardLayout"
import { useAuth } from "@/context/AuthContext"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from 'framer-motion'
import { 
  Plus,
  Building2,
  Calendar,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Newspaper,
  Star,
  Clock
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import DashboardStats from "@/components/Dashboard/DashboardStats"

export default function DashboardPage() {
  const { user } = useAuth()
  const [briefs, setBriefs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchBriefs = async () => {
      if (user) {
        const { data: userBriefs } = await supabase
          .from('user_briefs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(6)
        
        setBriefs(userBriefs || [])
      }
      setLoading(false)
    }

    fetchBriefs()
  }, [user])

  const handleGenerateBrief = () => {
    router.push('/generate')
  }

  const quickActions = [
    {
      title: "Generate Strategy Brief",
      description: "Create a comprehensive business analysis",
      icon: <Target className="w-6 h-6" />,
      color: "from-yellow-500 to-yellow-600",
      action: () => router.push('/generate')
    },
    {
      title: "Market Research",
      description: "Analyze your competitive landscape",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-blue-500 to-blue-600",
      action: () => router.push('/market-research')
    },
    {
      title: "Network Builder",
      description: "Find strategic business connections",
      icon: <Users className="w-6 h-6" />,
      color: "from-green-500 to-green-600",
      action: () => router.push('/network')
    },
    {
      title: "Industry News",
      description: "Stay updated with latest trends",
      icon: <Newspaper className="w-6 h-6" />,
      color: "from-purple-500 to-purple-600",
      action: () => router.push('/news')
    }
  ];

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-600/10 to-orange-500/10 border border-yellow-500/20 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-500" />
              <h1 className="text-3xl font-bold text-white">
                Welcome to Your Command Center
              </h1>
            </div>
            <p className="text-gray-300 text-lg mb-6">
              Your AI-powered business intelligence platform is ready to help you dominate your market.
            </p>
            <Button 
              onClick={handleGenerateBrief}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-4 text-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Generate New Brief
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <DashboardStats briefsCount={briefs.length} />

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
            >
              <Card 
                className="bg-gray-900/50 border-gray-800 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer group"
                onClick={action.action}
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-white`}>
                    {action.icon}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{action.title}</h3>
                  <p className="text-gray-400 text-sm">{action.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Briefs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Building2 className="w-6 h-6 text-yellow-500" />
              Recent Strategy Briefs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
              </div>
            ) : briefs.length > 0 ? (
              <div className="grid gap-6">
                {briefs.map((brief, index) => (
                  <motion.div
                    key={brief.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="border border-gray-700 rounded-2xl p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-yellow-500/30 transition-all duration-300 cursor-pointer group"
                    onClick={() => router.push(`/briefs/${brief.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-white text-xl mb-2 group-hover:text-yellow-400 transition-colors">
                          {brief.business_name}
                        </h3>
                        <div className="flex items-center gap-4 mb-3">
                          {brief.metadata?.industry && (
                            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">
                              {brief.metadata.industry}
                            </span>
                          )}
                          {brief.metadata?.location && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm border border-green-500/30">
                              {brief.metadata.location}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {brief.content?.slice(0, 150)}...
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 ml-4">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(brief.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                      <div className="flex items-center gap-4">
                        {brief.business_data?.leads && (
                          <div className="flex items-center gap-1 text-green-400">
                            <Users className="w-4 h-4" />
                            <span className="text-sm">{brief.business_data.leads.length} leads</span>
                          </div>
                        )}
                        {brief.business_data?.competitors && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <Building2 className="w-4 h-4" />
                            <span className="text-sm">{brief.business_data.competitors.length} competitors</span>
                          </div>
                        )}
                        {brief.news_data?.articles && (
                          <div className="flex items-center gap-1 text-purple-400">
                            <Newspaper className="w-4 h-4" />
                            <span className="text-sm">{brief.news_data.articles.length} articles</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                        >
                          View Brief
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-gray-600" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">No briefs yet</h3>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                  Generate your first strategy brief to unlock powerful business insights and growth opportunities.
                </p>
                <Button 
                  onClick={handleGenerateBrief}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-4"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Generate First Brief
                  <Sparkles className="w-5 h-5 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  )
}