const { ApifyClient } = require("apify-client")

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
})

async function scrapeBusinessData({ businessName, websiteUrl, industry, location, competitorAnalysis = false }) {
  console.log(`🔍 Scraping business data for: ${businessName} in ${location}`)

  try {
    console.log("📊 Running Google Maps scraper...")

    // Prepare search query
    const searchQuery = competitorAnalysis 
      ? `${industry} in ${location}` 
      : `${businessName} ${location}`

    const input = {
      searchStringsArray: [searchQuery],
      locationQuery: location,
      maxReviews: 0,
      maxImages: 0,
      exportPlaceUrls: false,
      additionalInfo: false,
      maxCrawledPlacesPerSearch: competitorAnalysis ? 10 : 5,
      language: "en",
      allPlacesNoSearchAction: false,
      maxAutomaticZoomOut: 0,
    }

    const run = await client.actor("compass/crawler-google-places").call(input, {
      timeout: 300, // 5 minutes timeout
    })

    const { items } = await client.dataset(run.defaultDatasetId).listItems()

    if (!items || items.length === 0) {
      console.log("⚠️ No results from Google Maps scraper, using fallback data")
      return generateFallbackData(businessName, industry, location)
    }

    // Process the results
    const results = items.map(place => ({
      title: place.title,
      rating: place.totalScore,
      reviewsCount: place.reviewsCount,
      address: place.address,
      phone: place.phone,
      website: place.website,
      category: place.categoryName,
      location: place.location,
    }))

    console.log(`✅ Found ${results.length} places`)

    return {
      competitors: competitorAnalysis ? results : results.slice(1), // Exclude the business itself for competitor analysis
      marketAnalysis: {
        totalBusinesses: results.length,
        averageRating: results.reduce((sum, place) => sum + (place.rating || 0), 0) / results.length,
        saturation: results.length > 8 ? "High" : results.length > 4 ? "Medium" : "Low",
      },
      businessInfo: !competitorAnalysis ? results[0] : null,
    }

  } catch (error) {
    console.error("❌ Scraping Error:", error)
    
    // Check if it's an API usage error
    if (error.message?.includes('exceed your remaining usage') || 
        error.message?.includes('free trial has expired') ||
        error.statusCode === 402) {
      console.log("💰 Apify free tier exceeded, using fallback data")
      return generateFallbackData(businessName, industry, location)
    }
    
    // For other errors, still return fallback data instead of failing
    console.log("⚠️ Scraping failed, using fallback data")
    return generateFallbackData(businessName, industry, location)
  }
}

function generateFallbackData(businessName, industry, location) {
  // Generate realistic fallback data for demo purposes
  const fallbackCompetitors = [
    {
      title: `Local ${industry} Business A`,
      rating: 4.2,
      reviewsCount: 89,
      address: `123 Main St, ${location}`,
      category: industry,
    },
    {
      title: `${industry} Pro Services`,
      rating: 4.5,
      reviewsCount: 156,
      address: `456 Oak Ave, ${location}`,
      category: industry,
    },
    {
      title: `Premier ${industry} Solutions`,
      rating: 4.1,
      reviewsCount: 67,
      address: `789 Pine Rd, ${location}`,
      category: industry,
    },
  ]

  return {
    competitors: fallbackCompetitors,
    marketAnalysis: {
      totalBusinesses: fallbackCompetitors.length,
      averageRating: 4.3,
      saturation: "Medium",
    },
    businessInfo: {
      title: businessName,
      rating: 4.4,
      reviewsCount: 45,
      address: `${location}`,
      category: industry,
    },
    usingFallbackData: true,
  }
}

module.exports = { scrapeBusinessData }
