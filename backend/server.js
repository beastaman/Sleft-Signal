require('dotenv').config()

// Debug: Check if environment variables are loaded
console.log('🔍 Environment Check:')
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Found' : '❌ Missing')
console.log('PORT:', process.env.PORT || 3001)
console.log('NODE_ENV:', process.env.NODE_ENV || 'development')

const express = require("express")
const cors = require("cors")
const { generateBrief } = require("./services/briefService")
const { scrapeBusinessData } = require("./services/scraperService")
const { getNewsData } = require("./services/newsService")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? [process.env.FRONTEND_URL, "https://sleft-signals-mvp.vercel.app"]
        : "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// Health check
app.get("/", (req, res) => {
  res.json({
    status: "Sleft Signals API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    features: ["AI Strategy Briefs", "Lead Generation", "Market Analysis", "Industry Intelligence"],
  })
})

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// Main generation endpoint
app.post("/api/generate", async (req, res) => {
  try {
    const { businessName, websiteUrl, industry, location, customGoal } = req.body

    // Validate required fields
    if (!businessName || !websiteUrl || !industry || !location) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["businessName", "websiteUrl", "industry", "location"],
      })
    }

    console.log(`🚀 Generating comprehensive brief for: ${businessName}`)

    // Step 1: Scrape business data and competitors with lead generation
    console.log("📊 Phase 1: Market Intelligence & Lead Generation")
    const businessData = await scrapeBusinessData({
      businessName,
      websiteUrl,
      industry,
      location,
      competitorAnalysis: true,
    })

    // Step 2: Get relevant news and industry intelligence
    console.log("📰 Phase 2: Industry Intelligence Gathering")
    const newsData = await getNewsData(industry, location)

    // Step 3: Generate AI-powered strategic brief
    console.log("🧠 Phase 3: AI Strategy Brief Generation")
    const brief = await generateBrief({
      businessName,
      websiteUrl,
      industry,
      location,
      customGoal,
      businessData,
      newsData,
    })

    // Step 4: Generate unique ID and store enhanced data
    const briefId = require("nanoid").nanoid(10)

    // Enhanced data structure for storage
    const enhancedBriefData = {
      id: briefId,
      businessName,
      content: brief,
      businessData: {
        ...businessData,
        dataQuality: {
          competitorsFound: businessData.competitors?.length || 0,
          leadsGenerated: businessData.leads?.length || 0,
          marketCoverage: businessData.totalPlaces || 0,
          analysisDepth: "comprehensive",
        },
      },
      newsData: {
        ...newsData,
        analysisMetrics: {
          totalArticles: newsData.articles?.length || 0,
          categoriesFound: Object.keys(newsData.categorized || {}).length,
          averageRelevance: newsData.articles?.length
            ? Math.round(
                newsData.articles.reduce((sum, article) => sum + article.relevanceScore, 0) / newsData.articles.length,
              )
            : 0,
        },
      },
      createdAt: new Date().toISOString(),
      metadata: {
        industry,
        location,
        websiteUrl,
        customGoal,
        processingTime: Date.now(),
        version: "2.0",
        features: ["market-analysis", "lead-generation", "industry-intelligence", "ai-insights"],
      },
    }

    // Store in enhanced format
    global.briefsStorage = global.briefsStorage || new Map()
    global.briefsStorage.set(briefId, enhancedBriefData)

    console.log(`✅ Comprehensive brief generated successfully for: ${businessName}`)
    console.log(`📈 Generated ${businessData.leads?.length || 0} high-quality leads`)
    console.log(`📰 Analyzed ${newsData.articles?.length || 0} industry articles`)

    res.json({
      success: true,
      briefId,
      message: "Comprehensive strategic brief generated successfully",
      summary: {
        competitorsAnalyzed: businessData.competitors?.length || 0,
        leadsGenerated: businessData.leads?.length || 0,
        newsArticles: newsData.articles?.length || 0,
        marketSaturation: businessData.marketAnalysis?.saturation || "Unknown",
      },
    })
  } catch (error) {
    console.error("❌ Error generating comprehensive brief:", error)
    res.status(500).json({
      error: "Failed to generate brief",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Get brief by ID with enhanced data
app.get("/api/briefs/:id", (req, res) => {
  try {
    const { id } = req.params
    const briefsStorage = global.briefsStorage || new Map()
    const brief = briefsStorage.get(id)

    if (!brief) {
      return res.status(404).json({
        error: "Brief not found",
        message: "The requested brief does not exist or has expired",
      })
    }

    // Add real-time metrics
    const enhancedBrief = {
      ...brief,
      analytics: {
        viewCount: 1, // In production, this would be tracked
        lastViewed: new Date().toISOString(),
        dataFreshness: Math.floor((Date.now() - new Date(brief.createdAt).getTime()) / (1000 * 60 * 60)), // hours
      },
    }

    res.json({
      success: true,
      brief: enhancedBrief,
    })
  } catch (error) {
    console.error("❌ Error fetching brief:", error)
    res.status(500).json({
      error: "Failed to fetch brief",
      message: error.message,
    })
  }
})

// Get high-quality leads endpoint
app.post("/api/leads", async (req, res) => {
  try {
    const { industry, location, businessName, leadType } = req.body

    const businessData = await scrapeBusinessData({
      businessName: businessName || "Business",
      industry,
      location,
      competitorAnalysis: true,
    })

    const filteredLeads =
      leadType && leadType !== "all"
        ? businessData.leads?.filter((lead) => lead.leadType === leadType) || []
        : businessData.leads || []

    res.json({
      success: true,
      leads: filteredLeads,
      summary: {
        totalLeads: filteredLeads.length,
        averageScore: filteredLeads.length
          ? Math.round(filteredLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / filteredLeads.length)
          : 0,
        totalPotentialValue: filteredLeads.reduce((sum, lead) => sum + lead.potentialValue, 0),
      },
    })
  } catch (error) {
    console.error("❌ Error fetching leads:", error)
    res.status(500).json({
      error: "Failed to fetch leads",
      message: error.message,
    })
  }
})

// Get industry intelligence endpoint
app.get("/api/intelligence/:industry", async (req, res) => {
  try {
    const { industry } = req.params
    const { location, category } = req.query

    const newsData = await getNewsData(industry, location)

    const filteredNews =
      category && category !== "all" ? newsData.categorized?.[category] || [] : newsData.articles || []

    res.json({
      success: true,
      intelligence: {
        articles: filteredNews,
        categories: Object.keys(newsData.categorized || {}),
        summary: {
          totalArticles: filteredNews.length,
          averageRelevance: filteredNews.length
            ? Math.round(filteredNews.reduce((sum, article) => sum + article.relevanceScore, 0) / filteredNews.length)
            : 0,
          sentimentDistribution: {
            positive: filteredNews.filter((a) => a.sentiment === "positive").length,
            neutral: filteredNews.filter((a) => a.sentiment === "neutral").length,
            negative: filteredNews.filter((a) => a.sentiment === "negative").length,
          },
        },
      },
    })
  } catch (error) {
    console.error("❌ Error fetching intelligence:", error)
    res.status(500).json({
      error: "Failed to fetch intelligence",
      message: error.message,
    })
  }
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err)
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
  })
})

// 404 handler - FIXED: Remove the problematic wildcard route
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `The route ${req.originalUrl} does not exist`,
    availableEndpoints: [
      "GET /",
      "GET /health", 
      "POST /api/generate",
      "GET /api/briefs/:id",
      "POST /api/leads",
      "GET /api/intelligence/:industry",
    ],
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Sleft Signals API Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
  console.log(`🌐 CORS enabled for: ${process.env.FRONTEND_URL || "http://localhost:3000"}`)
  console.log(`✨ Features: AI Strategy Briefs | Lead Generation | Market Analysis | Industry Intelligence`)
})

module.exports = app
