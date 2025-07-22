const OpenAI = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateBrief({ businessName, websiteUrl, industry, location, customGoal, businessData, newsData }) {
  try {
    const systemPrompt = `You are "Sleft," an elite AI business strategist with deep expertise in competitive analysis and growth acceleration. Your job is to analyze business data and generate premium, personalized 3-part strategic briefs that reveal actionable insights.

Your analysis should be:
- Hyper-specific and data-driven based on the provided business intelligence
- Focused on immediate, high-impact opportunities
- Written in a confident, direct tone that demonstrates deep market understanding
- Backed by concrete evidence from the scraped data and news trends

Format your response exactly as follows:

## 1. Your Edge
[Identify the specific competitive advantage this business has based on their market position, competitor analysis, and industry data. Reference specific data points from the market analysis, competitor ratings, and local market saturation. Be precise about what sets them apart.]

## 2. Your Leverage  
[Provide concrete monetization and growth opportunities based on the industry news trends, market gaps identified in competitor analysis, and pricing opportunities. Reference specific trends from the news data and competitor weaknesses. Include actionable next steps with estimated impact.]

## 3. Your Connections
[Suggest specific partnership opportunities and strategic relationships based on the lead data and competitor analysis. Reference actual businesses or types of connections that make sense for their market. Include tactical approaches for outreach and relationship building.]

**Ready to accelerate your growth? Join our private network of elite business owners →**`

    const businessContext = businessData
      ? `
MARKET INTELLIGENCE ANALYSIS:
- Total competitors analyzed: ${businessData.competitors?.length || 0}
- Market saturation level: ${businessData.marketAnalysis?.saturation || "Unknown"}
- Average competitor rating: ${businessData.marketAnalysis?.averageRating || "N/A"}
- Total market reviews: ${businessData.marketAnalysis?.totalReviews || 0}
- Price range analysis: ${businessData.marketAnalysis?.priceRange || "Not available"}

TOP COMPETITORS:
${
  businessData.competitors
    ?.slice(0, 3)
    .map((c, i) => `${i + 1}. ${c.title} - ${c.rating}★ (${c.reviewsCount} reviews) - ${c.category}`)
    .join("\n") || "None found"
}

HIGH-QUALITY LEADS IDENTIFIED:
${
  businessData.leads
    ?.slice(0, 3)
    .map(
      (lead, i) =>
        `${i + 1}. ${lead.businessName} (${lead.leadType}) - Score: ${lead.leadScore}/100 - Potential Value: $${lead.potentialValue.toLocaleString()}`,
    )
    .join("\n") || "No leads generated"
}
`
      : ""

    const newsContext = newsData?.articles?.length
      ? `
INDUSTRY INTELLIGENCE & TRENDS:
- Total relevant articles analyzed: ${newsData.totalFound}
- Last updated: ${new Date(newsData.lastUpdated).toLocaleDateString()}

KEY INDUSTRY DEVELOPMENTS:
${newsData.articles
  .slice(0, 4)
  .map(
    (article, i) => `${i + 1}. ${article.title} (${article.source}) - Relevance: ${article.relevanceScore}/100
   Category: ${article.category} | Sentiment: ${article.sentiment}
   Key Insights: ${article.keyInsights.join(", ") || "Market development"}`,
  )
  .join("\n\n")}

TRENDING CATEGORIES:
${Object.keys(newsData.categorized || {})
  .slice(0, 3)
  .map((cat) => `- ${cat}: ${newsData.categorized[cat].length} articles`)
  .join("\n")}
`
      : ""

    const userPrompt = `BUSINESS PROFILE:
Name: ${businessName}
Website: ${websiteUrl}
Industry: ${industry}
Location: ${location}
${customGoal ? `Strategic Goal: ${customGoal}` : ""}

${businessContext}
${newsContext}

Generate a strategic brief that leverages this comprehensive market intelligence to provide specific, actionable insights for immediate implementation.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error("❌ OpenAI API Error:", error)
    throw new Error(`Failed to generate brief: ${error.message}`)
  }
}

module.exports = { generateBrief }
