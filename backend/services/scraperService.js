const { ApifyClient } = require("apify-client")

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
})

// Rate limiting and usage tracking
let dailyUsage = 0
const DAILY_LIMIT = 50 // Limit API calls per day
const MAX_LEADS_PER_REQUEST = 5 // Hard limit on leads

async function scrapeBusinessData({ businessName, industry, location, competitorAnalysis = true }) {
  try {
    // Check daily usage limit
    if (dailyUsage >= DAILY_LIMIT) {
      console.warn(`⚠️ Daily API limit reached (${DAILY_LIMIT}). Returning cached/mock data.`)
      return generateMockBusinessData({ businessName, industry, location })
    }

    console.log(`🔍 Scraping business intelligence for: ${businessName} in ${location}`)
    console.log(`📊 Daily API usage: ${dailyUsage}/${DAILY_LIMIT}`)

    // Enhanced search strategy for better results
    const searchTerms = generateOptimizedSearchTerms(businessName, industry, location, competitorAnalysis)
    
    const input = {
      searchStringsArray: searchTerms,
      locationQuery: location,
      maxCrawledPlacesPerSearch: competitorAnalysis ? 20 : 8, // Reduced to save API quota
      language: "en",
      maximumLeadsEnrichmentRecords: 0, // Disable expensive enrichment
      maxImages: 1,
      exportPlaceUrls: false,
      exportReviews: false, // Disable to save quota
      maxReviews: 0, // No reviews to save quota
      onlyDataFromSearchPage: true, // Faster processing
    }

    console.log("📊 Running optimized Google Maps scraper...")
    console.log("🔍 Search terms:", searchTerms)
    
    const run = await client.actor("compass/crawler-google-places").call(input, {
      timeout: 120000, // 2 minute timeout
    })
    
    const { items } = await client.dataset(run.defaultDatasetId).listItems()
    dailyUsage++

    console.log(`✅ Found ${items.length} places`)

    // Process and structure the data
    const processedData = processScrapedData(items, businessName, industry, competitorAnalysis)
    
    // Enforce 5-lead limit
    if (processedData.leads.length > MAX_LEADS_PER_REQUEST) {
      processedData.leads = processedData.leads
        .sort((a, b) => b.leadScore - a.leadScore) // Sort by score
        .slice(0, MAX_LEADS_PER_REQUEST) // Take top 5 only
      
      console.log(`🎯 Limited to top ${MAX_LEADS_PER_REQUEST} highest-quality leads`)
    }

    console.log(`📈 Generated ${processedData.leads.length} premium leads`)
    console.log(`🏢 Analyzed ${processedData.competitors.length} key competitors`)
    
    return processedData

  } catch (error) {
    console.error("❌ Scraping Error:", error)
    dailyUsage++ // Count failed attempts
    return generateMockBusinessData({ businessName, industry, location })
  }
}

function generateOptimizedSearchTerms(businessName, industry, location, competitorAnalysis) {
  if (competitorAnalysis) {
    return [
      `${industry} ${location}`,
      `${industry} near ${location}`,
      `best ${industry} ${location}`
    ]
  } else {
    return [
      `${businessName} ${location}`,
      `${businessName} near ${location}`
    ]
  }
}

function processScrapedData(items, businessName, industry, competitorAnalysis) {
  const processedData = {
    totalPlaces: items.length,
    competitors: [],
    leads: [],
    marketAnalysis: {
      averageRating: 0,
      totalReviews: 0,
      saturation: "Unknown",
      priceRange: "Unknown",
      topCategories: [],
    },
    dataQuality: {
      timestamp: new Date().toISOString(),
      sourceCount: items.length,
      processingMethod: "live_scraping"
    }
  }

  if (items.length === 0) {
    return processedData
  }

  // Filter out the main business if doing competitor analysis
  const relevantItems = competitorAnalysis
    ? items.filter((item) => !item.title?.toLowerCase().includes(businessName.toLowerCase()))
    : items

  // Process competitors (limit to top 10 for performance)
  processedData.competitors = relevantItems
    .filter(item => item.title && item.totalScore > 0)
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    .slice(0, 10)
    .map((item) => ({
      title: item.title,
      address: item.address || "Address not available",
      rating: item.totalScore || 0,
      reviewsCount: item.reviewsCount || 0,
      category: item.categoryName || industry,
      website: item.website || null,
      phone: item.phone || null,
      location: item.location || null,
      priceLevel: item.price || null,
      openingHours: item.openingHours || null,
      imageUrl: item.imageUrl || null,
      placeId: item.placeId || null,
    }))

  // Generate premium leads (TOP 5 ONLY)
  const potentialLeads = relevantItems
    .filter((item) => 
      item.totalScore >= 3.5 && // Good rating threshold
      item.reviewsCount >= 5 && // Minimum reviews for credibility
      item.title && 
      item.title.length > 3
    )
    .map((item) => ({
      businessName: item.title,
      contactPerson: "Business Owner", // Would come from enrichment in paid version
      email: generateBusinessEmail(item),
      phone: item.phone || null,
      website: item.website || null,
      address: item.address || "Address not available",
      rating: item.totalScore || 0,
      reviewsCount: item.reviewsCount || 0,
      category: item.categoryName || industry,
      leadScore: calculateEnhancedLeadScore(item, industry),
      leadType: determineLeadType(item, industry),
      potentialValue: estimatePotentialValue(item, industry),
      contactReason: generateContactReason(item, industry),
      imageUrl: item.imageUrl || null,
      location: item.location || null,
      priority: calculatePriority(item, industry),
      lastUpdated: new Date().toISOString()
    }))
    .sort((a, b) => {
      // Sort by priority first, then lead score
      if (a.priority !== b.priority) return b.priority - a.priority
      return b.leadScore - a.leadScore
    })
    .slice(0, MAX_LEADS_PER_REQUEST) // HARD LIMIT: Only top 5 leads

  processedData.leads = potentialLeads

  // Calculate market analysis
  const validRatings = items.filter((item) => item.totalScore > 0)
  if (validRatings.length > 0) {
    processedData.marketAnalysis.averageRating = (
      validRatings.reduce((sum, item) => sum + item.totalScore, 0) / validRatings.length
    ).toFixed(1)
  }

  processedData.marketAnalysis.totalReviews = items.reduce((sum, item) => sum + (item.reviewsCount || 0), 0)

  // Enhanced market saturation analysis
  processedData.marketAnalysis.saturation = calculateMarketSaturation(items.length, industry)

  // Price range analysis
  const priceRanges = items.filter((item) => item.price).map((item) => item.price)
  if (priceRanges.length > 0) {
    processedData.marketAnalysis.priceRange = getMostCommonPrice(priceRanges)
  }

  // Category analysis
  processedData.marketAnalysis.topCategories = analyzeTopCategories(items)

  return processedData
}

function calculateEnhancedLeadScore(item, industry) {
  let score = 0

  // Rating impact (40% of score)
  if (item.totalScore) {
    score += (item.totalScore / 5) * 40
  }

  // Review count impact (25% of score)
  if (item.reviewsCount) {
    const reviewScore = Math.min((item.reviewsCount / 50) * 25, 25)
    score += reviewScore
  }

  // Digital presence (20% of score)
  if (item.website) score += 15
  if (item.phone) score += 10
  if (item.imageUrl) score += 5

  // Business completeness (15% of score)
  if (item.address) score += 5
  if (item.openingHours && item.openingHours.length > 0) score += 5
  if (item.categoryName) score += 5

  return Math.round(Math.min(score, 100))
}

function calculatePriority(item, industry) {
  let priority = 0
  
  // High priority indicators
  if (item.totalScore >= 4.5) priority += 3
  if (item.reviewsCount >= 50) priority += 2
  if (item.website && item.phone) priority += 2
  if (item.categoryName && item.categoryName.toLowerCase().includes(industry.toLowerCase())) priority += 1
  
  return priority
}

function determineLeadType(item, industry) {
  const category = item.categoryName?.toLowerCase() || ""
  const title = item.title?.toLowerCase() || ""
  const industryLower = industry.toLowerCase()

  // More sophisticated lead type detection
  if (category.includes("supplier") || category.includes("wholesale") || title.includes("supply")) {
    return "Supplier"
  } else if (category.includes("service") && !industryLower.includes("service")) {
    return "Service Provider"
  } else if (category === industryLower || category.includes(industryLower)) {
    return "Strategic Partner"
  } else if (category.includes("consultant") || category.includes("agency")) {
    return "Professional Service"
  } else {
    return "Potential Customer"
  }
}

function estimatePotentialValue(item, industry) {
  // Base value calculation with industry multipliers
  const industryMultipliers = {
    "technology": 3000,
    "healthcare": 2500,
    "professional services": 2000,
    "real estate": 2500,
    "finance": 3000,
    "retail": 1500,
    "restaurant": 1200,
    "fitness": 1000,
    "beauty": 800,
    "automotive": 2000
  }

  const baseValue = industryMultipliers[industry.toLowerCase()] || 1500
  const ratingMultiplier = item.totalScore ? (item.totalScore / 5) + 0.5 : 1
  const reviewMultiplier = item.reviewsCount ? Math.min((item.reviewsCount / 30) + 1, 3) : 1
  const digitalMultiplier = (item.website ? 1.3 : 1) * (item.phone ? 1.2 : 1)

  return Math.round(baseValue * ratingMultiplier * reviewMultiplier * digitalMultiplier)
}

function generateContactReason(item, industry) {
  const leadType = determineLeadType(item, industry)
  const businessName = item.title || "Business"
  
  const reasons = {
    "Supplier": `Explore bulk purchasing opportunities and establish preferred supplier relationship with ${businessName}`,
    "Service Provider": `Discuss strategic service partnerships and potential collaboration opportunities with ${businessName}`,
    "Strategic Partner": `Explore cross-referral opportunities and strategic alliance with ${businessName}`,
    "Professional Service": `Evaluate consulting services and professional expertise from ${businessName}`,
    "Potential Customer": `Introduce your services and explore how you can add value to ${businessName}'s operations`
  }

  return reasons[leadType] || `Explore mutually beneficial business opportunities with ${businessName}`
}

function generateBusinessEmail(item) {
  if (!item.website) return null
  
  try {
    const domain = item.website.replace(/https?:\/\//, "").replace(/\/$/, "").split('/')[0]
    const commonPrefixes = ["info", "contact", "hello", "business"]
    return `${commonPrefixes[Math.floor(Math.random() * commonPrefixes.length)]}@${domain}`
  } catch {
    return null
  }
}

function calculateMarketSaturation(itemCount, industry) {
  // Industry-specific saturation thresholds
  const saturationThresholds = {
    "restaurant": { high: 25, medium: 15 },
    "retail": { high: 30, medium: 18 },
    "fitness": { high: 12, medium: 8 },
    "beauty": { high: 20, medium: 12 },
    "healthcare": { high: 15, medium: 10 },
    "default": { high: 20, medium: 12 }
  }

  const thresholds = saturationThresholds[industry.toLowerCase()] || saturationThresholds.default

  if (itemCount >= thresholds.high) return "High"
  if (itemCount >= thresholds.medium) return "Medium"
  return "Low"
}

function getMostCommonPrice(priceRanges) {
  const priceCounts = priceRanges.reduce((acc, price) => {
    acc[price] = (acc[price] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(priceCounts)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || "$$"
}

function analyzeTopCategories(items) {
  const categories = items
    .map((item) => item.categoryName)
    .filter(Boolean)
    
  const categoryCount = categories.reduce((acc, cat) => {
    acc[cat] = (acc[cat] || 0) + 1
    return acc
  }, {})
  
  return Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }))
}

function generateMockBusinessData({ businessName, industry, location }) {
  console.log("🎭 Generating mock business intelligence data...")
  
  const mockCompetitors = [
    {
      title: `Premium ${industry} Solutions`,
      address: `123 Main St, ${location}`,
      rating: 4.5,
      reviewsCount: 89,
      category: industry,
      website: "https://premiumsolutions.com",
      phone: "(555) 123-4567",
      location: null,
      priceLevel: "$$$",
      openingHours: null,
      imageUrl: null,
      placeId: "mock_place_1"
    },
    {
      title: `Elite ${industry} Services`,
      address: `456 Business Ave, ${location}`,
      rating: 4.2,
      reviewsCount: 124,
      category: industry,
      website: "https://eliteservices.com",
      phone: "(555) 234-5678",
      location: null,
      priceLevel: "$$",
      openingHours: null,
      imageUrl: null,
      placeId: "mock_place_2"
    }
  ]

  const mockLeads = [
    {
      businessName: `Strategic ${industry} Partner`,
      contactPerson: "Business Owner",
      email: "info@strategicpartner.com",
      phone: "(555) 345-6789",
      website: "https://strategicpartner.com",
      address: `789 Commerce St, ${location}`,
      rating: 4.6,
      reviewsCount: 156,
      category: industry,
      leadScore: 92,
      leadType: "Strategic Partner",
      potentialValue: 25000,
      contactReason: `Explore cross-referral opportunities and strategic alliance opportunities`,
      imageUrl: null,
      location: null,
      priority: 5,
      lastUpdated: new Date().toISOString()
    },
    {
      businessName: `Quality ${industry} Supplier`,
      contactPerson: "Sales Manager",
      email: "sales@qualitysupplier.com",
      phone: "(555) 456-7890",
      website: "https://qualitysupplier.com",
      address: `321 Supply Chain Dr, ${location}`,
      rating: 4.3,
      reviewsCount: 78,
      category: "Supplier",
      leadScore: 87,
      leadType: "Supplier",
      potentialValue: 18000,
      contactReason: "Explore bulk purchasing opportunities and establish preferred supplier relationship",
      imageUrl: null,
      location: null,
      priority: 4,
      lastUpdated: new Date().toISOString()
    },
    {
      businessName: `Professional ${industry} Consultant`,
      contactPerson: "Lead Consultant",
      email: "contact@profconsultant.com", 
      phone: "(555) 567-8901",
      website: "https://profconsultant.com",
      address: `654 Consulting Way, ${location}`,
      rating: 4.7,
      reviewsCount: 93,
      category: "Professional Services",
      leadScore: 95,
      leadType: "Professional Service",
      potentialValue: 32000,
      contactReason: "Evaluate consulting services and professional expertise for business optimization",
      imageUrl: null,
      location: null,
      priority: 5,
      lastUpdated: new Date().toISOString()
    },
    {
      businessName: `Growth-Focused ${industry} Client`,
      contactPerson: "Operations Manager",
      email: "ops@growthfocused.com",
      phone: "(555) 678-9012",
      website: "https://growthfocused.com",
      address: `987 Expansion Blvd, ${location}`,
      rating: 4.1,
      reviewsCount: 67,
      category: industry,
      leadScore: 83,
      leadType: "Potential Customer",
      potentialValue: 22000,
      contactReason: "Introduce your services and explore how you can add value to their operations",
      imageUrl: null,
      location: null,
      priority: 3,
      lastUpdated: new Date().toISOString()
    },
    {
      businessName: `Innovative ${industry} Collaborator`,
      contactPerson: "Partnership Director",
      email: "partnerships@innovative.com",
      phone: "(555) 789-0123",
      website: "https://innovative.com",
      address: `147 Innovation Park, ${location}`,
      rating: 4.4,
      reviewsCount: 112,
      category: industry,
      leadScore: 89,
      leadType: "Strategic Partner",
      potentialValue: 28000,
      contactReason: "Discuss strategic service partnerships and potential collaboration opportunities",
      imageUrl: null,
      location: null,
      priority: 4,
      lastUpdated: new Date().toISOString()
    }
  ]

  return {
    totalPlaces: 15,
    competitors: mockCompetitors,
    leads: mockLeads, // Exactly 5 leads as required
    marketAnalysis: {
      averageRating: "4.3",
      totalReviews: 1250,
      saturation: "Medium",
      priceRange: "$$",
      topCategories: [
        { category: industry, count: 8 },
        { category: "Professional Services", count: 4 },
        { category: "Consulting", count: 3 }
      ]
    },
    dataQuality: {
      timestamp: new Date().toISOString(),
      sourceCount: 15,
      processingMethod: "mock_data"
    }
  }
}

// Reset daily usage counter (would typically be handled by a cron job)
function resetDailyUsage() {
  dailyUsage = 0
  console.log("🔄 Daily API usage counter reset")
}

module.exports = {
  scrapeBusinessData,
  resetDailyUsage
}
