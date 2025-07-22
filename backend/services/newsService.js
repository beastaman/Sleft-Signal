const { ApifyClient } = require("apify-client")

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
})

async function getNewsData(industry, location) {
  try {
    console.log(`📰 Fetching news for industry: ${industry}`)

    // Create sophisticated search queries based on industry and location
    const searchQueries = [
      `${industry} trends 2024`,
      `${industry} business news`,
      `${location} ${industry} market`,
      `${industry} industry analysis`,
      `${industry} growth opportunities`,
    ]

    const newsResults = []

    // Use Google News Scraper for better results
    for (const query of searchQueries.slice(0, 2)) {
      // Limit to 2 queries to avoid rate limits
      try {
        const input = {
          query: query,
          language: "US:en",
          maxItems: 10,
          fetchArticleDetails: true,
          proxyConfiguration: {
            useApifyProxy: true,
          },
        }

        console.log(`📊 Scraping news for query: ${query}`)
        const run = await client.actor("lhotanova/google-news-scraper").call(input)
        const { items } = await client.dataset(run.defaultDatasetId).listItems()

        if (items && items.length > 0) {
          const processedArticles = items.slice(0, 5).map((article) => ({
            title: article.title,
            description: article.description || article.title,
            url: article.loadedUrl || article.link,
            source: article.source,
            sourceUrl: article.sourceUrl,
            published: article.publishedAt,
            image: article.image,
            relevanceScore: calculateRelevance(article, industry),
            category: categorizeNews(article.title, industry),
            sentiment: analyzeSentiment(article.title + " " + (article.description || "")),
            keyInsights: extractKeyInsights(article, industry),
          }))

          newsResults.push(...processedArticles)
        }

        // Break after first successful query to avoid rate limits in demo
        if (newsResults.length > 0) break
      } catch (sourceError) {
        console.warn(`⚠️ Failed to fetch news for query ${query}:`, sourceError.message)
        continue
      }
    }

    // Sort by relevance and date
    newsResults.sort((a, b) => {
      if (a.relevanceScore !== b.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return new Date(b.published) - new Date(a.published)
    })

    // Group by category for better presentation
    const categorizedNews = groupNewsByCategory(newsResults.slice(0, 8))

    console.log(`✅ Found ${newsResults.length} relevant news articles`)
    return {
      articles: newsResults.slice(0, 8),
      categorized: categorizedNews,
      totalFound: newsResults.length,
      lastUpdated: new Date().toISOString(),
    }
  } catch (error) {
    console.error("❌ News Scraping Error:", error)
    return {
      articles: [],
      categorized: {},
      totalFound: 0,
      lastUpdated: new Date().toISOString(),
      error: error.message,
    }
  }
}

function calculateRelevance(article, industry) {
  let score = 0
  const title = (article.title || "").toLowerCase()
  const description = (article.description || "").toLowerCase()
  const industryLower = industry.toLowerCase()

  // Direct industry mention
  if (title.includes(industryLower) || description.includes(industryLower)) {
    score += 15
  }

  // Related keywords based on industry
  const industryKeywords = getIndustryKeywords(industry)
  industryKeywords.forEach((keyword) => {
    if (title.includes(keyword) || description.includes(keyword)) {
      score += 8
    }
  })

  // Business-related keywords
  const businessKeywords = ["business", "market", "growth", "revenue", "customers", "sales", "trends", "innovation"]
  businessKeywords.forEach((keyword) => {
    if (title.includes(keyword) || description.includes(keyword)) {
      score += 3
    }
  })

  // Recency bonus
  const publishedDate = new Date(article.publishedAt || article.published)
  const daysSincePublished = (Date.now() - publishedDate.getTime()) / (1000 * 60 * 60 * 24)
  if (daysSincePublished <= 7) {
    score += 5
  } else if (daysSincePublished <= 30) {
    score += 2
  }

  return score
}

function categorizeNews(title, industry) {
  const titleLower = title.toLowerCase()

  if (
    titleLower.includes("trend") ||
    titleLower.includes("future") ||
    titleLower.includes("2024") ||
    titleLower.includes("2025")
  ) {
    return "Trends & Future"
  } else if (titleLower.includes("market") || titleLower.includes("analysis") || titleLower.includes("report")) {
    return "Market Analysis"
  } else if (titleLower.includes("growth") || titleLower.includes("expansion") || titleLower.includes("opportunity")) {
    return "Growth Opportunities"
  } else if (titleLower.includes("regulation") || titleLower.includes("law") || titleLower.includes("policy")) {
    return "Regulatory Updates"
  } else if (titleLower.includes("technology") || titleLower.includes("innovation") || titleLower.includes("AI")) {
    return "Technology & Innovation"
  } else {
    return "Industry News"
  }
}

function analyzeSentiment(text) {
  const positiveWords = [
    "growth",
    "success",
    "opportunity",
    "increase",
    "profit",
    "expansion",
    "innovation",
    "breakthrough",
  ]
  const negativeWords = ["decline", "loss", "challenge", "decrease", "crisis", "problem", "risk", "concern"]

  const textLower = text.toLowerCase()
  const positiveCount = positiveWords.filter((word) => textLower.includes(word)).length
  const negativeCount = negativeWords.filter((word) => textLower.includes(word)).length

  if (positiveCount > negativeCount) return "positive"
  if (negativeCount > positiveCount) return "negative"
  return "neutral"
}

function extractKeyInsights(article, industry) {
  const insights = []
  const title = (article.title || "").toLowerCase()
  const description = (article.description || "").toLowerCase()
  const fullText = title + " " + description

  // Extract percentage mentions
  const percentageMatch = fullText.match(/(\d+)%/)
  if (percentageMatch) {
    insights.push(`${percentageMatch[1]}% mentioned`)
  }

  // Extract monetary values
  const moneyMatch = fullText.match(/\$(\d+(?:,\d+)*(?:\.\d+)?)\s*(million|billion|trillion)?/i)
  if (moneyMatch) {
    insights.push(`$${moneyMatch[1]}${moneyMatch[2] ? " " + moneyMatch[2] : ""} value`)
  }

  // Extract year mentions
  const yearMatch = fullText.match(/(202[4-9])/g)
  if (yearMatch) {
    insights.push(`${yearMatch[0]} timeline`)
  }

  return insights.slice(0, 3) // Limit to 3 insights
}

function groupNewsByCategory(articles) {
  return articles.reduce((acc, article) => {
    const category = article.category
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(article)
    return acc
  }, {})
}

function getIndustryKeywords(industry) {
  const keywordMap = {
    restaurant: ["food", "dining", "culinary", "chef", "menu", "hospitality", "cuisine", "catering"],
    retail: ["shopping", "store", "merchandise", "consumer", "ecommerce", "sales", "inventory"],
    fitness: ["gym", "workout", "health", "wellness", "exercise", "training", "nutrition"],
    healthcare: ["medical", "health", "patient", "clinic", "doctor", "treatment", "therapy"],
    technology: ["tech", "software", "digital", "innovation", "startup", "AI", "automation"],
    "real estate": ["property", "housing", "mortgage", "investment", "development", "construction"],
    beauty: ["cosmetics", "skincare", "salon", "spa", "beauty", "wellness", "aesthetic"],
    "professional services": ["consulting", "legal", "accounting", "advisory", "professional"],
    manufacturing: ["production", "factory", "industrial", "supply chain", "automation"],
    automotive: ["car", "vehicle", "automotive", "transportation", "mobility"],
  }

  const industryLower = industry.toLowerCase()
  for (const [key, keywords] of Object.entries(keywordMap)) {
    if (industryLower.includes(key)) {
      return keywords
    }
  }

  return ["business", "industry", "market", "commercial"]
}

module.exports = { getNewsData }
