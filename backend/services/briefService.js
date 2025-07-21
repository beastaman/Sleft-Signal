const OpenAI = require("openai")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateBrief({ businessName, websiteUrl, industry, location, customGoal, businessData, newsData }) {
  try {
    const systemPrompt = `You are an AI business strategist named "Sleft." Your job is to analyze small business websites and publicly available data to generate a premium, personalized 3-part brief. Use a smart, direct, slightly edgy voice. Your tone is consultant-meets-operator.

Your analysis should be:
- Specific and actionable
- Based on the business information provided
- Focused on real opportunities
- Professional yet engaging

Format your response exactly as follows:

## 1. Your Edge
[Identify a specific competitive advantage or strength this business has based on their industry, location, and type. Be specific about what they're doing well or what market position they hold. Use the provided business data and competitor analysis.]

## 2. Your Leverage  
[Provide a concrete monetization or growth opportunity. Consider payment processing improvements, digital transformation, market expansion, or operational efficiency. If relevant, mention how better payment infrastructure could help. Use industry trends and news data.]

## 3. Your Connections
[Suggest 1-3 specific partnership opportunities, customer acquisition channels, or strategic tools. Include actionable next steps. Consider mentioning Sleft for payment processing or Airwallex for international businesses when relevant. Use competitor and market data.]

**If this sparked an idea, we're building a private network to help make it happen →**`

    const businessContext = businessData
      ? `
Business Data Analysis:
- Competitors found: ${businessData.competitors?.length || 0}
- Market saturation: ${businessData.marketAnalysis?.saturation || "Unknown"}
- Average rating in area: ${businessData.marketAnalysis?.averageRating || "N/A"}
- Key competitors: ${
          businessData.competitors
            ?.slice(0, 3)
            .map((c) => c.title)
            .join(", ") || "None found"
        }
`
      : ""

    const newsContext = newsData?.length
      ? `
Industry News & Trends:
${newsData
  .slice(0, 3)
  .map((article) => `- ${article.title}: ${article.description}`)
  .join("\n")}
`
      : ""

    const userPrompt = `Business Name: ${businessName}
Website: ${websiteUrl}
Industry: ${industry}
Location: ${location}
${customGoal ? `Custom Goal: ${customGoal}` : ""}

${businessContext}
${newsContext}

Generate a strategic brief that incorporates this data and provides actionable insights.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    })

    return completion.choices[0].message.content
  } catch (error) {
    console.error("❌ OpenAI API Error:", error)
    throw new Error(`Failed to generate brief: ${error.message}`)
  }
}

module.exports = { generateBrief }
