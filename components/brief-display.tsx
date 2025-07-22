"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Share2,
  Download,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  Star,
  MapPin,
  Calendar,
  BarChart3,
  Zap,
  Target,
  ExternalLink,
  CheckCircle2,
  Phone,
  Mail,
  Eye,
  Filter,
  CheckCircle,
  Newspaper,
  Lightbulb,
  Rocket,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Minus,
} from "lucide-react"
import { useState } from "react"
import Image from "next/image"

interface Lead {
  businessName: string
  contactPerson: string
  email: string | null
  phone: string | null
  website: string | null
  address: string
  rating: number
  reviewsCount: number
  category: string
  leadScore: number
  leadType: string
  potentialValue: number
  contactReason: string
  imageUrl?: string
  location?: { lat: number; lng: number }
}

interface NewsArticle {
  title: string
  description: string
  url: string
  source: string
  sourceUrl: string
  published: string
  image?: string
  relevanceScore: number
  category: string
  sentiment: string
  keyInsights: string[]
}

interface Brief {
  id: string
  businessName: string
  content: string
  createdAt: string
  businessData?: {
    competitors: Array<{
      title: string
      rating: number
      reviewsCount: number
      category: string
      address: string
      website?: string
      phone?: string
      imageUrl?: string
      priceLevel?: string
      openingHours?: any[]
    }>
    leads: Lead[]
    marketAnalysis: {
      averageRating: string
      totalReviews: number
      saturation: string
      priceRange: string
      topCategories: Array<{ category: string; count: number }>
    }
  }
  newsData?: {
    articles: NewsArticle[]
    categorized: Record<string, NewsArticle[]>
    totalFound: number
    lastUpdated: string
  }
  metadata: {
    industry: string
    location: string
    websiteUrl: string
  }
}

interface BriefDisplayProps {
  brief: Brief
}

export default function BriefDisplay({ brief }: BriefDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"brief" | "leads" | "competitors" | "news">("brief")
  const [selectedLeadType, setSelectedLeadType] = useState<string>("all")
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>("all")

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy URL:", error)
    }
  }

  const formatContent = (content: string) => {
    const sections = content.split("## ")
    return sections
      .filter((section) => section.trim())
      .map((section, index) => {
        const lines = section.split("\n")
        const title = lines[0]
        const body = lines.slice(1).join("\n").trim()

        const getSectionData = (title: string) => {
          if (title.includes("Edge"))
            return {
              icon: <TrendingUp className="w-10 h-10 text-yellow-500" />,
              gradient: "from-yellow-500/20 via-yellow-400/10 to-orange-500/20",
              border: "border-yellow-500/30",
              bgPattern: "bg-[radial-gradient(circle_at_20%_50%,rgba(251,191,36,0.1),transparent_50%)]",
            }
          if (title.includes("Leverage"))
            return {
              icon: <Zap className="w-10 h-10 text-blue-500" />,
              gradient: "from-blue-500/20 via-blue-400/10 to-purple-500/20",
              border: "border-blue-500/30",
              bgPattern: "bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]",
            }
          if (title.includes("Connections"))
            return {
              icon: <Users className="w-10 h-10 text-green-500" />,
              gradient: "from-green-500/20 via-green-400/10 to-emerald-500/20",
              border: "border-green-500/30",
              bgPattern: "bg-[radial-gradient(circle_at_50%_80%,rgba(34,197,94,0.1),transparent_50%)]",
            }
          return {
            icon: <Star className="w-10 h-10 text-yellow-500" />,
            gradient: "from-yellow-500/20 to-yellow-600/20",
            border: "border-yellow-500/30",
            bgPattern: "bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1),transparent_50%)]",
          }
        }

        const sectionData = getSectionData(title)

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: index * 0.2 }}
            className="mb-12"
          >
            <Card
              className={`bg-gradient-to-br ${sectionData.gradient} border-2 ${sectionData.border} backdrop-blur-sm shadow-2xl overflow-hidden relative ${sectionData.bgPattern}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-black/5 via-transparent to-black/10" />
              <CardContent className="p-10 relative z-10">
                <div className="flex items-start gap-6 mb-8">
                  <div className="w-20 h-20 bg-black/20 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
                    {sectionData.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-4xl font-bold text-white mb-3">{title}</h2>
                    <div className="w-20 h-1.5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-transparent rounded-full" />
                  </div>
                </div>
                <div className="prose prose-invert prose-lg max-w-none">
                  <p className="text-gray-100 leading-relaxed text-xl whitespace-pre-line font-medium tracking-wide">
                    {body}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })
  }

  const getSaturationColor = (saturation: string) => {
    switch (saturation.toLowerCase()) {
      case "high":
        return "text-red-400"
      case "medium":
        return "text-yellow-400"
      case "low":
        return "text-green-400"
      default:
        return "text-gray-400"
    }
  }

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400 bg-green-500/20 border-green-500/30"
    if (score >= 60) return "text-yellow-400 bg-yellow-500/20 border-yellow-500/30"
    return "text-red-400 bg-red-500/20 border-red-500/30"
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return <ThumbsUp className="w-4 h-4 text-green-500" />
      case "negative":
        return <ThumbsDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const filteredLeads =
    brief.businessData?.leads?.filter((lead) => selectedLeadType === "all" || lead.leadType === selectedLeadType) || []

  const filteredNews =
    selectedNewsCategory === "all"
      ? brief.newsData?.articles || []
      : brief.newsData?.categorized?.[selectedNewsCategory] || []

  const leadTypes = [...new Set(brief.businessData?.leads?.map((lead) => lead.leadType) || [])]
  const newsCategories = Object.keys(brief.newsData?.categorized || {})

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-transparent to-blue-500/5" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-green-500/5 rounded-full blur-2xl animate-pulse delay-2000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-full px-8 py-4 mb-8 backdrop-blur-sm">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span className="text-yellow-500 font-bold text-lg">AI-Powered Strategy Brief</span>
            <Badge variant="outline" className="border-yellow-500/40 text-yellow-400 bg-yellow-500/10">
              Premium
            </Badge>
          </div>

          <h1 className="text-6xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-white via-yellow-100 to-yellow-500 bg-clip-text text-transparent leading-tight">
            {brief.businessName}
          </h1>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-6 py-3 text-base">
              <Building2 className="w-5 h-5 mr-2" />
              {brief.metadata.industry}
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-6 py-3 text-base">
              <MapPin className="w-5 h-5 mr-2" />
              {brief.metadata.location}
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-6 py-3 text-base">
              <Calendar className="w-5 h-5 mr-2" />
              {new Date(brief.createdAt).toLocaleDateString()}
            </Badge>
            {brief.businessData && (
              <Badge variant="outline" className="border-yellow-500/40 text-yellow-500 px-6 py-3 text-base">
                <BarChart3 className="w-5 h-5 mr-2" />
                {brief.businessData.competitors.length} Competitors Analyzed
              </Badge>
            )}
            {brief.businessData?.leads && (
              <Badge variant="outline" className="border-green-500/40 text-green-500 px-6 py-3 text-base">
                <Users className="w-5 h-5 mr-2" />
                {brief.businessData.leads.length} High-Quality Leads
              </Badge>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={handleShare}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800 bg-transparent px-8 py-4 text-lg"
            >
              {copied ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <Share2 className="w-5 h-5 mr-2" />}
              {copied ? "Copied!" : "Share Brief"}
            </Button>
            <Button
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800 bg-transparent px-8 py-4 text-lg"
            >
              <Download className="w-5 h-5 mr-2" />
              Export PDF
            </Button>
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-3 backdrop-blur-sm">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("brief")}
                className={`px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                  activeTab === "brief"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Target className="w-5 h-5" />
                Strategy Brief
              </button>
              {brief.businessData?.leads && brief.businessData.leads.length > 0 && (
                <button
                  onClick={() => setActiveTab("leads")}
                  className={`px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                    activeTab === "leads"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Users className="w-5 h-5" />
                  High-Quality Leads
                  <Badge className="bg-green-500 text-white text-xs">{brief.businessData.leads.length}</Badge>
                </button>
              )}
              {brief.businessData && (
                <button
                  onClick={() => setActiveTab("competitors")}
                  className={`px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                    activeTab === "competitors"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                  Market Analysis
                </button>
              )}
              {brief.newsData && brief.newsData.articles.length > 0 && (
                <button
                  onClick={() => setActiveTab("news")}
                  className={`px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 flex items-center gap-3 ${
                    activeTab === "news"
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  <Newspaper className="w-5 h-5" />
                  Industry Intelligence
                  <Badge className="bg-blue-500 text-white text-xs">{brief.newsData.articles.length}</Badge>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "brief" && (
              <motion.div
                key="brief"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                {formatContent(brief.content)}
              </motion.div>
            )}

            {activeTab === "leads" && brief.businessData?.leads && (
              <motion.div
                key="leads"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl mb-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                          <Users className="w-8 h-8 text-green-500" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold text-white">High-Quality Business Leads</CardTitle>
                          <p className="text-gray-400 text-lg">
                            Potential partners, customers, and strategic connections
                          </p>
                        </div>
                      </div>
                      {leadTypes.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-400" />
                          <select
                            value={selectedLeadType}
                            onChange={(e) => setSelectedLeadType(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="all">All Types</option>
                            {leadTypes.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-8">
                      {filteredLeads.map((lead, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="border border-gray-700 rounded-3xl p-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-green-500/30 transition-all duration-300 group"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-6 flex-1">
                              {lead.imageUrl && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-600">
                                  <Image
                                    src={lead.imageUrl || "/placeholder.svg"}
                                    alt={lead.businessName}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-bold text-white text-2xl">{lead.businessName}</h4>
                                  <Badge
                                    className={`px-3 py-1 text-sm font-semibold border ${getLeadScoreColor(lead.leadScore)}`}
                                  >
                                    {lead.leadScore}/100
                                  </Badge>
                                </div>
                                <div className="flex items-center gap-4 mb-3">
                                  <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">
                                    {lead.leadType}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className="border-purple-500/40 text-purple-400 bg-purple-500/10"
                                  >
                                    {lead.category}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                    <span className="text-yellow-500 font-bold">{lead.rating}</span>
                                    <span className="text-gray-400 text-sm">({lead.reviewsCount} reviews)</span>
                                  </div>
                                </div>
                                <p className="text-gray-400 text-sm mb-4 flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {lead.address}
                                </p>
                                <p className="text-gray-300 leading-relaxed mb-4">{lead.contactReason}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-green-500 mb-2">
                                ${lead.potentialValue.toLocaleString()}
                              </div>
                              <p className="text-gray-400 text-sm">Potential Value</p>
                            </div>
                          </div>

                          <Separator className="my-6 bg-gray-700" />

                          <div className="flex justify-between items-center">
                            <div className="flex gap-4">
                              {lead.phone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <Phone className="w-4 h-4 mr-2" />
                                  {lead.phone}
                                </Button>
                              )}
                              {lead.email && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <Mail className="w-4 h-4 mr-2" />
                                  Contact
                                </Button>
                              )}
                              {lead.website && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Website
                                </Button>
                              )}
                            </div>
                            <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                              Connect Now
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "competitors" && brief.businessData && (
              <motion.div
                key="competitors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl mb-8">
                  <CardContent className="p-10">
                    <div className="flex items-center gap-4 mb-12">
                      <div className="w-16 h-16 bg-yellow-500/20 rounded-2xl flex items-center justify-center">
                        <BarChart3 className="w-8 h-8 text-yellow-500" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-bold text-white">Market Intelligence Dashboard</h2>
                        <p className="text-gray-400 text-lg">Comprehensive analysis of your competitive landscape</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                      <div className="text-center p-8 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-3xl border border-yellow-500/30">
                        <div className="text-5xl font-bold text-yellow-500 mb-3">
                          {brief.businessData.marketAnalysis.averageRating}
                        </div>
                        <div className="text-gray-300 font-medium mb-3">Average Rating</div>
                        <div className="flex justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(Number.parseFloat(brief.businessData!.marketAnalysis.averageRating))
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center p-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl border border-blue-500/30">
                        <div className="text-5xl font-bold text-blue-500 mb-3">
                          {brief.businessData.marketAnalysis.totalReviews.toLocaleString()}
                        </div>
                        <div className="text-gray-300 font-medium">Total Reviews</div>
                      </div>

                      <div className="text-center p-8 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-3xl border border-green-500/30">
                        <div
                          className={`text-5xl font-bold mb-3 ${getSaturationColor(brief.businessData.marketAnalysis.saturation)}`}
                        >
                          {brief.businessData.marketAnalysis.saturation}
                        </div>
                        <div className="text-gray-300 font-medium">Market Saturation</div>
                      </div>

                      <div className="text-center p-8 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-3xl border border-purple-500/30">
                        <div className="text-5xl font-bold text-purple-500 mb-3">
                          {brief.businessData.marketAnalysis.priceRange || "$$"}
                        </div>
                        <div className="text-gray-300 font-medium">Price Range</div>
                      </div>
                    </div>

                    <h3 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <Building2 className="w-8 h-8 text-yellow-500" />
                      Top Competitors Analysis
                    </h3>

                    <div className="grid gap-8">
                      {brief.businessData.competitors.slice(0, 5).map((competitor, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="border border-gray-700 rounded-3xl p-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-yellow-500/30 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-6">
                            <div className="flex items-start gap-6 flex-1">
                              {competitor.imageUrl && (
                                <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-600">
                                  <Image
                                    src={competitor.imageUrl || "/placeholder.svg"}
                                    alt={competitor.title}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-white text-2xl mb-2">{competitor.title}</h4>
                                <div className="flex items-center gap-4 mb-3">
                                  <Badge
                                    variant="outline"
                                    className="border-yellow-500/40 text-yellow-500 bg-yellow-500/10"
                                  >
                                    {competitor.category}
                                  </Badge>
                                  {competitor.priceLevel && (
                                    <Badge
                                      variant="outline"
                                      className="border-green-500/40 text-green-400 bg-green-500/10"
                                    >
                                      {competitor.priceLevel}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-gray-400 text-sm flex items-center gap-2 mb-4">
                                  <MapPin className="w-4 h-4" />
                                  {competitor.address}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-6 h-6 text-yellow-500 fill-current" />
                                <span className="text-yellow-500 font-bold text-2xl">{competitor.rating}</span>
                              </div>
                              <p className="text-gray-400 text-sm">({competitor.reviewsCount} reviews)</p>
                            </div>
                          </div>

                          <div className="flex gap-3 pt-6 border-t border-gray-700">
                            {competitor.website && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Website
                              </Button>
                            )}
                            {competitor.phone && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                              >
                                <Phone className="w-4 h-4 mr-2" />
                                {competitor.phone}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Analyze
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "news" && brief.newsData && (
              <motion.div
                key="news"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-blue-500" />
                        </div>
                        <div>
                          <CardTitle className="text-3xl font-bold text-white">Industry Intelligence Feed</CardTitle>
                          <p className="text-gray-400 text-lg">Latest trends, insights, and market developments</p>
                        </div>
                      </div>
                      {newsCategories.length > 1 && (
                        <div className="flex items-center gap-2">
                          <Filter className="w-4 h-4 text-gray-400" />
                          <select
                            value={selectedNewsCategory}
                            onChange={(e) => setSelectedNewsCategory(e.target.value)}
                            className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                          >
                            <option value="all">All Categories</option>
                            {newsCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      {filteredNews.map((article, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="border border-gray-700 rounded-3xl p-8 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-blue-500/30 transition-all duration-300 group"
                        >
                          <div className="flex gap-6">
                            {article.image && (
                              <div className="w-32 h-32 rounded-2xl overflow-hidden border border-gray-600 flex-shrink-0">
                                <Image
                                  src={article.image || "/placeholder.svg"}
                                  alt={article.title}
                                  width={128}
                                  height={128}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">
                                    {article.category}
                                  </Badge>
                                  <div className="flex items-center gap-1">
                                    {getSentimentIcon(article.sentiment)}
                                    <span className="text-sm text-gray-400 capitalize">{article.sentiment}</span>
                                  </div>
                                  <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                                    Score: {article.relevanceScore}
                                  </Badge>
                                </div>
                              </div>

                              <h3 className="font-bold text-white text-xl mb-4 leading-tight group-hover:text-blue-400 transition-colors">
                                {article.title}
                              </h3>

                              <p className="text-gray-300 mb-4 leading-relaxed">{article.description}</p>

                              {article.keyInsights.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {article.keyInsights.map((insight, i) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="border-purple-500/40 text-purple-400 bg-purple-500/10"
                                    >
                                      <Lightbulb className="w-3 h-3 mr-1" />
                                      {insight}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-medium">
                                    {article.source}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {new Date(article.published).toLocaleDateString()}
                                  </span>
                                </div>
                                {article.url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Read Full Article
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Enhanced CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="text-center mt-20"
        >
          <Card className="bg-gradient-to-br from-yellow-500/10 via-yellow-600/10 to-orange-500/10 border-yellow-500/20 backdrop-blur-sm shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,191,36,0.1),transparent_70%)]" />
            <CardContent className="p-16 relative z-10">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <Rocket className="w-12 h-12 text-yellow-500" />
                  <h3 className="text-5xl font-bold text-white">Ready to Dominate Your Market?</h3>
                </div>
                <p className="text-gray-300 mb-12 text-xl leading-relaxed">
                  Join our exclusive network of ambitious business owners and get access to premium tools, strategic
                  partnerships, and growth opportunities that will accelerate your success beyond imagination.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-12 py-6 text-xl">
                    <Shield className="w-6 h-6 mr-3" />
                    Join Elite Network
                    <ArrowRight className="w-6 h-6 ml-3" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 px-12 py-6 text-xl bg-transparent"
                  >
                    <Calendar className="w-6 h-6 mr-3" />
                    Book Strategy Call
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-8 mt-12 text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Premium Support</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Exclusive Tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Strategic Partnerships</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
