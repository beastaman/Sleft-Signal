const { ApifyClient } = require("apify-client")

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
})

async function scrapeBusinessData({ businessName, industry, location, competitorAnalysis = false }) {
  try {
    console.log(`🔍 Scraping business data for: ${businessName} in ${location}`)

    // Prepare search terms for competitor analysis
    const searchTerms = competitorAnalysis
      ? [industry, `${industry} ${location}`, `${industry} near me`]
      : [businessName, `${businessName} ${location}`]

    const input = {
      searchStringsArray: searchTerms,
      locationQuery: location,
      maxCrawledPlacesPerSearch: competitorAnalysis ? 25 : 5,
      language: "en",
      maximumLeadsEnrichmentRecords: 0,
      maxImages: 1,
      exportPlaceUrls: false,
      exportReviews: false,
    }

    console.log("📊 Running Google Maps scraper...")
    const run = await client.actor("compass/crawler-google-places").call(input)
    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    console.log(`✅ Found ${items.length} places`)

    // Process the results
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
    }

    if (items.length > 0) {
      // Filter out the main business if doing competitor analysis
      const competitors = competitorAnalysis
        ? items.filter((item) => !item.title.toLowerCase().includes(businessName.toLowerCase()))
        : items

      // Process competitors
      processedData.competitors = competitors.slice(0, 10).map((item) => ({
        title: item.title,
        address: item.address,
        rating: item.totalScore,
        reviewsCount: item.reviewsCount,
        category: item.categoryName,
        website: item.website,
        phone: item.phone,
        location: item.location,
        priceLevel: item.price,
        openingHours: item.openingHours,
        imageUrl: item.imageUrl,
        placeId: item.placeId,
      }))

      // Generate high-quality leads (potential partners/customers)
      processedData.leads = competitors
        .filter((item) => item.totalScore >= 4.0 && item.reviewsCount >= 10)
        .slice(0, 5)
        .map((item) => ({
          businessName: item.title,
          contactPerson: "Business Owner", // In real implementation, this would come from enrichment
          email: item.website ? `info@${item.website.replace(/https?:\/\//, "").split("/")[0]}` : null,
          phone: item.phone,
          website: item.website,
          address: item.address,
          rating: item.totalScore,
          reviewsCount: item.reviewsCount,
          category: item.categoryName,
          leadScore: calculateLeadScore(item),
          leadType: determineLeadType(item, industry),
          potentialValue: estimatePotentialValue(item),
          contactReason: generateContactReason(item, industry),
          imageUrl: item.imageUrl,
          location: item.location,
        }))

      // Calculate market analysis
      const validRatings = items.filter((item) => item.totalScore > 0)
      if (validRatings.length > 0) {
        processedData.marketAnalysis.averageRating = (
          validRatings.reduce((sum, item) => sum + item.totalScore, 0) / validRatings.length
        ).toFixed(1)
      }

      processedData.marketAnalysis.totalReviews = items.reduce((sum, item) => sum + (item.reviewsCount || 0), 0)

      // Determine market saturation
      if (items.length > 15) {
        processedData.marketAnalysis.saturation = "High"
      } else if (items.length > 8) {
        processedData.marketAnalysis.saturation = "Medium"
      } else {
        processedData.marketAnalysis.saturation = "Low"
      }

      // Analyze price ranges
      const priceRanges = items.filter((item) => item.price).map((item) => item.price)
      if (priceRanges.length > 0) {
        const mostCommonPrice = priceRanges.reduce((a, b, i, arr) =>
          arr.filter((v) => v === a).length >= arr.filter((v) => v === b).length ? a : b,
        )
        processedData.marketAnalysis.priceRange = mostCommonPrice
      }

      // Top categories
      const categories = items.map((item) => item.categoryName).filter(Boolean)
      const categoryCount = categories.reduce((acc, cat) => {
        acc[cat] = (acc[cat] || 0) + 1
        return acc
      }, {})
      processedData.marketAnalysis.topCategories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }))
    }

    return processedData
  } catch (error) {
    console.error("❌ Scraping Error:", error)
    return {
      totalPlaces: 0,
      competitors: [],
      leads: [],
      marketAnalysis: {
        averageRating: 0,
        totalReviews: 0,
        saturation: "Unknown",
        priceRange: "Unknown",
        topCategories: [],
      },
      error: error.message,
    }
  }
}

function calculateLeadScore(item) {
  let score = 0

  // Rating contribution (0-40 points)
  if (item.totalScore) {
    score += (item.totalScore / 5) * 40
  }

  // Review count contribution (0-30 points)
  if (item.reviewsCount) {
    score += Math.min((item.reviewsCount / 100) * 30, 30)
  }

  // Website presence (0-20 points)
  if (item.website) {
    score += 20
  }

  // Phone availability (0-10 points)
  if (item.phone) {
    score += 10
  }

  return Math.round(score)
}

function determineLeadType(item, industry) {
  const category = item.categoryName?.toLowerCase() || ""
  const industryLower = industry.toLowerCase()

  if (category.includes("supplier") || category.includes("wholesale")) {
    return "Supplier"
  } else if (category.includes("service") && !industryLower.includes("service")) {
    return "Service Provider"
  } else if (category === industryLower) {
    return "Potential Partner"
  } else {
    return "Potential Customer"
  }
}

function estimatePotentialValue(item) {
  const baseValue = 1000
  const ratingMultiplier = item.totalScore ? item.totalScore / 5 : 0.5
  const reviewMultiplier = item.reviewsCount ? Math.min(item.reviewsCount / 50, 2) : 0.5

  return Math.round(baseValue * ratingMultiplier * reviewMultiplier)
}

function generateContactReason(item, industry) {
  const leadType = determineLeadType(item, industry)
  const reasons = {
    Supplier: "Explore bulk purchasing opportunities and establish supplier relationship",
    "Service Provider": "Discuss potential service partnerships and collaboration opportunities",
    "Potential Partner": "Explore strategic partnership and cross-referral opportunities",
    "Potential Customer": "Introduce your services and explore business opportunities",
  }

  return reasons[leadType] || "Explore potential business opportunities"
}

module.exports = {
  scrapeBusinessData,
}
