"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Share2,
  Download,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Users,
  Building2,
  Globe,
  Star,
  MapPin,
  Calendar,
  BarChart3,
  Zap,
  Target,
  ExternalLink,
  Copy,
  CheckCircle2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
    }>
    marketAnalysis: {
      averageRating: string
      totalReviews: number
      saturation: string
    }
  }
  newsData?: Array<{
    title: string
    description: string
    source: string
    published: string
    url?: string
  }>
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
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"brief" | "competitors" | "news">("brief")

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(brief.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Business Brief for ${brief.businessName}`,
          text: "Check out this AI-generated business strategy brief",
          url: window.location.href,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback to copying URL
      await navigator.clipboard.writeText(window.location.href)
      alert("Link copied to clipboard!")
    }
  }

  const formatContent = (content: string) => {
    // Split content by ## headers and format
    const sections = content.split(/(?=##\s)/).filter(Boolean)

    return sections.map((section, index) => {
      const lines = section.trim().split("\n")
      const header = lines[0].replace("##", "").trim()
      const body = lines.slice(1).join("\n").trim()

      return (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: index * 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-yellow-500 mb-4">{header}</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-line">{body}</div>
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

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/")}
              className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Brief Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Strategic Brief for{" "}
            <span className="bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent">
              {brief.businessName}
            </span>
          </h1>

          <div className="flex flex-wrap justify-center gap-4 text-sm mb-8">
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-4 py-2">
              <Building2 className="w-4 h-4 mr-2" />
              {brief.metadata.industry}
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-4 py-2">
              <MapPin className="w-4 h-4 mr-2" />
              {brief.metadata.location}
            </Badge>
            <Badge variant="outline" className="border-gray-700 text-gray-300 px-4 py-2">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(brief.createdAt).toLocaleDateString()}
            </Badge>
            {brief.businessData && (
              <Badge variant="outline" className="border-yellow-500/40 text-yellow-500 px-4 py-2">
                <BarChart3 className="w-4 h-4 mr-2" />
                {brief.businessData.competitors.length} Competitors Analyzed
              </Badge>
            )}
          </div>

          <div className="prose prose-invert max-w-none mb-8">
            {formatContent(brief.content)}
          </div>
        </motion.div>

        {/* Enhanced Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-2 backdrop-blur-sm">
            <button
              onClick={() => setActiveTab("brief")}
              className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "brief"
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50"
              }`}
            >
              <Target className="w-4 h-4" />
              Strategy Brief
            </button>
            {brief.businessData && (
              <button
                onClick={() => setActiveTab("competitors")}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "competitors"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Market Analysis
              </button>
            )}
            {brief.newsData && brief.newsData.length > 0 && (
              <button
                onClick={() => setActiveTab("news")}
                className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${
                  activeTab === "news"
                    ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                }`}
              >
                <Globe className="w-4 h-4" />
                Industry News
              </button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <div className="max-w-5xl mx-auto">
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

            {activeTab === "competitors" && brief.businessData && (
              <motion.div
                key="competitors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-gray-700 backdrop-blur-sm shadow-2xl mb-8">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <BarChart3 className="w-8 h-8 text-yellow-500" />
                      Market Analysis
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                      <div className="text-center p-6 bg-black/30 rounded-2xl border border-gray-700">
                        <div className="text-4xl font-bold text-yellow-500 mb-2">
                          {brief.businessData.marketAnalysis.averageRating}
                        </div>
                        <div className="text-gray-400 font-medium">Average Rating</div>
                        <div className="flex justify-center mt-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(Number.parseFloat(brief.businessData!.marketAnalysis.averageRating))
                                  ? "text-yellow-500 fill-current"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="text-center p-6 bg-black/30 rounded-2xl border border-gray-700">
                        <div className="text-4xl font-bold text-blue-500 mb-2">
                          {brief.businessData.marketAnalysis.totalReviews.toLocaleString()}
                        </div>
                        <div className="text-gray-400 font-medium">Total Reviews</div>
                      </div>

                      <div className="text-center p-6 bg-black/30 rounded-2xl border border-gray-700">
                        <div
                          className={`text-4xl font-bold mb-2 ${getSaturationColor(brief.businessData.marketAnalysis.saturation)}`}
                        >
                          {brief.businessData.marketAnalysis.saturation}
                        </div>
                        <div className="text-gray-400 font-medium">Market Saturation</div>
                      </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-yellow-500" />
                      Top Competitors
                    </h3>

                    <div className="grid gap-6">
                      {brief.businessData.competitors.slice(0, 5).map((competitor, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="border border-gray-700 rounded-2xl p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-yellow-500/30 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-white text-xl mb-2">{competitor.title}</h4>
                              <p className="text-yellow-500 text-sm font-medium mb-1">{competitor.category}</p>
                              <p className="text-gray-400 text-sm flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {competitor.address}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                <span className="text-yellow-500 font-bold text-lg">{competitor.rating}</span>
                              </div>
                              <p className="text-gray-400 text-sm">({competitor.reviewsCount} reviews)</p>
                            </div>
                          </div>

                          {(competitor.website || competitor.phone) && (
                            <div className="flex gap-3 pt-4 border-t border-gray-700">
                              {competitor.website && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Website
                                </Button>
                              )}
                              {competitor.phone && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-600 text-gray-300 hover:text-white bg-transparent"
                                >
                                  <Copy className="w-3 h-3 mr-1" />
                                  {competitor.phone}
                                </Button>
                              )}
                            </div>
                          )}
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
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
                      <Globe className="w-8 h-8 text-blue-500" />
                      Industry News & Trends
                    </h2>

                    <div className="space-y-6">
                      {brief.newsData.map((article, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6, delay: index * 0.1 }}
                          className="border border-gray-700 rounded-2xl p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 hover:border-blue-500/30 transition-all duration-300"
                        >
                          <h3 className="font-bold text-white text-xl mb-3 leading-tight">{article.title}</h3>
                          <p className="text-gray-300 mb-4 leading-relaxed">{article.description}</p>
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
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Read More
                              </Button>
                            )}
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
          <Card className="bg-gradient-to-br from-yellow-500/10 via-yellow-600/10 to-orange-500/10 border-yellow-500/20 backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardContent className="p-12">
              <div className="max-w-3xl mx-auto">
                <h3 className="text-4xl font-bold text-white mb-6">Ready to implement these strategies?</h3>
                <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                  Join our private network of ambitious business owners and get access to exclusive tools, partnerships,
                  and growth opportunities that will accelerate your success.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold px-8 py-4 text-lg">
                    Join the Private Network
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 px-8 py-4 text-lg bg-transparent"
                  >
                    Schedule a Call
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
