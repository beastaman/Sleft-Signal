const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")

// Load environment variables first
dotenv.config()

// Add debugging to check if env vars are loaded
console.log("🔧 Environment check:")
console.log("- NODE_ENV:", process.env.NODE_ENV)
console.log("- PORT:", process.env.PORT)
console.log("- OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY)
console.log("- APIFY_API_KEY exists:", !!process.env.APIFY_API_KEY)

const { generateBrief } = require("./services/briefService")
const { scrapeBusinessData } = require("./services/scraperService")
const { getNewsData } = require("./services/newsService")

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)
app.use(express.json())

// Health check
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasApify: !!process.env.APIFY_API_KEY
  })
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

    console.log(`🚀 Generating brief for: ${businessName}`)

    // Step 1: Scrape business data and competitors
    const businessData = await scrapeBusinessData({
      businessName,
      websiteUrl,
      industry,
      location,
    })

    // Step 2: Get relevant news and trends
    const newsData = await getNewsData(industry, location)

    // Step 3: Generate AI-powered brief
    const brief = await generateBrief({
      businessName,
      websiteUrl,
      industry,
      location,
      customGoal,
      businessData,
      newsData,
    })

    // Step 4: Generate unique ID and store
    const briefId = require("nanoid").nanoid(10)

    // In production, save to database
    // For now, using in-memory storage
    global.briefsStorage = global.briefsStorage || new Map()
    global.briefsStorage.set(briefId, {
      id: briefId,
      businessName,
      content: brief,
      businessData,
      newsData,
      createdAt: new Date().toISOString(),
      metadata: {
        industry,
        location,
        websiteUrl,
        customGoal,
      },
    })

    console.log(`✅ Brief generated successfully for: ${businessName}`)

    res.json({
      success: true,
      briefId,
      message: "Brief generated successfully",
    })
  } catch (error) {
    console.error("❌ Error generating brief:", error)
    res.status(500).json({
      error: "Failed to generate brief",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }
})

// Get brief by ID
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

    res.json({
      success: true,
      brief,
    })
  } catch (error) {
    console.error("❌ Error fetching brief:", error)
    res.status(500).json({
      error: "Failed to fetch brief",
      message: error.message,
    })
  }
})

// Get competitor analysis
app.post("/api/competitors", async (req, res) => {
  try {
    const { industry, location, businessName } = req.body

    const competitors = await scrapeBusinessData({
      businessName,
      industry,
      location,
      competitorAnalysis: true,
    })

    res.json({
      success: true,
      competitors: competitors.competitors || [],
    })
  } catch (error) {
    console.error("❌ Error fetching competitors:", error)
    res.status(500).json({
      error: "Failed to fetch competitors",
      message: error.message,
    })
  }
})

// Get industry news
app.get("/api/news/:industry", async (req, res) => {
  try {
    const { industry } = req.params
    const { location } = req.query

    const news = await getNewsData(industry, location)

    res.json({
      success: true,
      news,
    })
  } catch (error) {
    console.error("❌ Error fetching news:", error)
    res.status(500).json({
      error: "Failed to fetch news",
      message: error.message,
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
})

module.exports = app
