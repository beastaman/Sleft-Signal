const OpenAI = require("openai")

// Don't initialize OpenAI immediately - wait for environment variables
let openai = null

const initializeOpenAI = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

async function generateBrief({ businessName, websiteUrl, industry, location, customGoal, businessData, newsData }) {
  try {
    // Initialize OpenAI when needed (after env vars are loaded)
    const client = initializeOpenAI()
    
    if (!client) {
      console.warn('⚠️ OPENAI_API_KEY not found. Returning enhanced mock brief.')
      return generateEnhancedMockBrief({ businessName, websiteUrl, industry, location, customGoal, businessData, newsData })
    }

    // Create hyper-personalized system prompt
    const systemPrompt = `You are "Sleft," the world's most elite AI business strategist with 20+ years of consulting experience for Fortune 500 companies. You specialize in turning market intelligence into explosive business growth.

Your expertise includes:
- Competitive landscape analysis and positioning strategy
- Market opportunity identification and monetization
- Strategic partnership development and networking
- Data-driven growth hacking and revenue optimization

CRITICAL INSTRUCTIONS:
1. Analyze the provided market intelligence data with surgical precision
2. Identify specific, actionable opportunities that can generate immediate ROI
3. Reference actual competitor data, market metrics, and industry trends in your analysis
4. Provide concrete next steps with estimated timelines and potential revenue impact
5. Write in a confident, results-oriented tone that demonstrates deep market understanding
6. Format your response exactly as specified below

FORMAT YOUR RESPONSE EXACTLY AS:

## 1. Your Edge
[Analyze the specific competitive advantages this business has based on market position, competitor gaps, and local market dynamics. Reference specific data points from competitor analysis, market saturation levels, and pricing opportunities. Be precise about what sets them apart and why customers should choose them over competitors. Include specific metrics and actionable positioning strategies.]

## 2. Your Leverage  
[Identify concrete monetization opportunities based on industry trends, competitor weaknesses, and market gaps. Reference specific news trends, pricing strategies, and growth vectors. Include tactical implementation steps with estimated revenue potential and timelines. Focus on high-impact, low-effort opportunities that can be implemented within 90 days.]

## 3. Your Connections
[Suggest specific partnership opportunities and strategic relationships based on lead analysis and market ecosystem. Reference actual business types, potential collaboration models, and networking strategies. Include tactical approaches for outreach, relationship building, and mutual value creation. Provide templates and conversation starters.]

**Ready to 10x your business? Join our exclusive network of elite entrepreneurs →**`

    // Build comprehensive context from market intelligence
    const marketContext = buildMarketContext(businessData, location, industry)
    const newsContext = buildNewsContext(newsData, industry)
    const competitorContext = buildCompetitorContext(businessData, industry)
    const leadsContext = buildLeadsContext(businessData, industry)

    const userPrompt = `CLIENT PROFILE:
Business: ${businessName}
Website: ${websiteUrl}
Industry: ${industry}
Location: ${location}
${customGoal ? `Strategic Objective: ${customGoal}` : 'Strategic Objective: Accelerate growth and market dominance'}

${marketContext}
${competitorContext}
${leadsContext}
${newsContext}

MISSION: Generate a hyper-personalized strategic brief that leverages this comprehensive market intelligence to provide specific, actionable insights for immediate implementation and explosive growth.`

    const completion = await client.chat.completions.create({
      model: "gpt-4o", // Use the latest GPT-4 model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    return completion.choices[0].message.content

  } catch (error) {
    console.error('❌ Error in generateBrief:', error)
    
    // Return enhanced fallback brief on error
    return generateEnhancedMockBrief({ businessName, websiteUrl, industry, location, customGoal, businessData, newsData })
  }
}

function buildMarketContext(businessData, location, industry) {
  if (!businessData) return ""
  
  return `
MARKET INTELLIGENCE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Market Overview:
- Total competitors analyzed: ${businessData.competitors?.length || 0}
- Market saturation: ${businessData.marketAnalysis?.saturation || "Unknown"} (${getSaturationInsight(businessData.marketAnalysis?.saturation)})
- Average competitor rating: ${businessData.marketAnalysis?.averageRating || "N/A"}/5.0
- Total market reviews: ${businessData.marketAnalysis?.totalReviews?.toLocaleString() || 0}
- Dominant price range: ${businessData.marketAnalysis?.priceRange || "Not available"}

🎯 Market Positioning Opportunity:
${getMarketPositioningInsight(businessData.marketAnalysis, industry, location)}

📈 Revenue Potential:
${getRevenuePotential(businessData, industry)}
`}

function buildCompetitorContext(businessData, industry) {
  if (!businessData?.competitors?.length) return ""
  
  const topCompetitors = businessData.competitors.slice(0, 3)
  const weakestCompetitor = businessData.competitors.sort((a, b) => a.rating - b.rating)[0]
  const strongestCompetitor = businessData.competitors.sort((a, b) => b.rating - a.rating)[0]
  
  return `
COMPETITIVE LANDSCAPE ANALYSIS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏆 Market Leaders:
${topCompetitors.map((c, i) => 
  `${i + 1}. ${c.title} - ${c.rating}⭐ (${c.reviewsCount} reviews) - ${c.category}
     Location: ${c.address}
     ${c.website ? `Website: ${c.website}` : 'No website presence'}
     ${c.phone ? `Phone: ${c.phone}` : 'No phone listed'}`
).join('\n\n')}

💡 Competitive Gap Analysis:
- Strongest competitor: ${strongestCompetitor?.title} (${strongestCompetitor?.rating}⭐)
- Weakest opportunity: ${weakestCompetitor?.title} (${weakestCompetitor?.rating}⭐)
- Average review count: ${Math.round(businessData.competitors.reduce((sum, c) => sum + c.reviewsCount, 0) / businessData.competitors.length)}

🎯 Differentiation Opportunities:
${getCompetitorWeaknesses(businessData.competitors)}
`}

function buildLeadsContext(businessData, industry) {
  if (!businessData?.leads?.length) return ""
  
  const leadsByType = businessData.leads.reduce((acc, lead) => {
    acc[lead.leadType] = (acc[lead.leadType] || 0) + 1
    return acc
  }, {})
  
  const highValueLeads = businessData.leads.filter(lead => lead.leadScore >= 80)
  const totalPotentialValue = businessData.leads.reduce((sum, lead) => sum + lead.potentialValue, 0)
  
  return `
HIGH-VALUE PARTNERSHIP OPPORTUNITIES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💼 Lead Portfolio:
- Total qualified leads: ${businessData.leads.length}
- High-quality leads (80+ score): ${highValueLeads.length}
- Total potential value: $${totalPotentialValue.toLocaleString()}
- Lead distribution: ${Object.entries(leadsByType).map(([type, count]) => `${type} (${count})`).join(', ')}

🎯 Priority Connections:
${businessData.leads.slice(0, 3).map((lead, i) => 
  `${i + 1}. ${lead.businessName} (${lead.leadType})
     Score: ${lead.leadScore}/100 | Value: $${lead.potentialValue.toLocaleString()}
     Contact: ${lead.phone || lead.email || 'Available'}
     Strategy: ${lead.contactReason}`
).join('\n\n')}

💡 Partnership Strategies:
${getPartnershipStrategies(businessData.leads, industry)}
`}

function buildNewsContext(newsData, industry) {
  if (!newsData?.articles?.length) return ""
  
  const trendingTopics = newsData.articles.slice(0, 4)
  const sentimentAnalysis = newsData.articles.reduce((acc, article) => {
    acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
    return acc
  }, {})
  
  return `
INDUSTRY INTELLIGENCE & TRENDS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 Market Sentiment: ${getSentimentInsight(sentimentAnalysis)}
📅 Intelligence Updated: ${new Date(newsData.lastUpdated).toLocaleDateString()}
🔍 Articles Analyzed: ${newsData.totalFound}

🚀 Key Industry Developments:
${trendingTopics.map((article, i) => 
  `${i + 1}. ${article.title}
     Source: ${article.source} | Relevance: ${article.relevanceScore}/100
     Category: ${article.category} | Sentiment: ${article.sentiment}
     Key Insights: ${article.keyInsights.join(', ') || 'Market development'}
     Impact: ${getArticleImpact(article, industry)}`
).join('\n\n')}

📊 Trending Categories:
${Object.entries(newsData.categorized || {})
  .slice(0, 3)
  .map(([cat, articles]) => `- ${cat}: ${articles.length} articles`)
  .join('\n')}
`}

function generateEnhancedMockBrief({ businessName, websiteUrl, industry, location, customGoal, businessData, newsData }) {
  const marketSaturation = businessData?.marketAnalysis?.saturation || "Unknown"
  const competitorCount = businessData?.competitors?.length || 0
  const leadCount = businessData?.leads?.length || 0
  const avgRating = businessData?.marketAnalysis?.averageRating || "4.2"
  
  return `## 1. Your Edge

Your ${businessName} is positioned in a ${marketSaturation.toLowerCase()} saturation market with ${competitorCount} analyzed competitors averaging ${avgRating} stars. This presents a **clear differentiation opportunity**.

**Competitive Advantages Identified:**
• **Local Market Gap**: Analysis reveals ${competitorCount < 10 ? 'limited' : 'saturated'} competition in ${location}, creating ${competitorCount < 10 ? 'blue ocean' : 'optimization'} opportunities
• **Digital Presence Advantage**: ${websiteUrl ? 'Your established web presence' : 'Building a strong web presence'} positions you ahead of ${Math.round(competitorCount * 0.3)} competitors lacking online visibility
• **Service Quality Positioning**: Market average rating of ${avgRating}/5.0 indicates room for premium positioning through exceptional service delivery
• **Industry Specialization**: ${industry} sector in ${location} shows ${marketSaturation === 'Low' ? 'growth potential' : 'consolidation opportunities'} for market leaders

**Immediate Positioning Strategy**: Position as the premium ${industry.toLowerCase()} solution in ${location} by leveraging superior customer experience and digital-first approach.

## 2. Your Leverage

**High-Impact Revenue Opportunities:**

💰 **Premium Service Tier** (90-day implementation)
- Target: Capture top 20% of market willing to pay 30-50% premium
- Revenue Potential: $${Math.round((businessData?.leads?.reduce((sum, lead) => sum + lead.potentialValue, 0) || 50000) * 0.15).toLocaleString()}/quarter
- Strategy: Develop white-glove service package targeting high-value customers

📈 **Strategic Partnerships** (60-day setup)
- Identified ${leadCount} qualified partnership opportunities
- Revenue Potential: $${Math.round((businessData?.leads?.reduce((sum, lead) => sum + lead.potentialValue, 0) || 50000) * 0.25).toLocaleString()}/year through referrals
- Focus: B2B partnerships with complementary service providers

🎯 **Market Expansion** (120-day rollout)
- Opportunity: ${marketSaturation === 'Low' ? 'Rapid market capture' : 'Premium segment penetration'}
- Revenue Potential: ${marketSaturation === 'Low' ? '3x growth' : '40% premium pricing'} within 6 months
- Strategy: ${customGoal || 'Geographic expansion and service diversification'}

**Next Steps**: Implement premium tier pricing, establish top 3 strategic partnerships, and launch targeted marketing campaign within 30 days.

## 3. Your Connections

**Strategic Partnership Roadmap:**

🤝 **Tier 1 Priority Partners** (Contact within 7 days)
${businessData?.leads?.slice(0, 2).map(lead => 
  `• ${lead.businessName} (${lead.leadType})
  Opportunity: ${lead.contactReason}
  Value: $${lead.potentialValue.toLocaleString()}/year potential
  Contact Strategy: ${lead.phone ? 'Direct call' : 'LinkedIn/Email outreach'}`
).join('\n') || '• Local business networks and industry associations\n• Complementary service providers in your area'}

🌐 **Community Integration**
- Join ${location} Business Association and ${industry} professional groups
- Establish presence at local networking events and industry meetups
- Develop referral relationships with non-competing businesses serving your target market

📞 **Outreach Templates**:
"Hi [Name], I noticed [specific observation about their business]. I run ${businessName}, a ${industry.toLowerCase()} business in ${location}. I believe there's a mutually beneficial partnership opportunity between us. Would you be open to a 15-minute conversation this week?"

**Implementation Timeline**: 
- Week 1: Contact top 3 prospects
- Week 2-3: Schedule partnership meetings
- Week 4: Finalize agreements and launch collaborations

**Ready to 10x your business? Join our exclusive network of elite entrepreneurs →**`
}

// Helper functions
function getSaturationInsight(saturation) {
  switch(saturation?.toLowerCase()) {
    case 'low': return 'Excellent growth opportunity with minimal competition'
    case 'medium': return 'Balanced market with differentiation opportunities'
    case 'high': return 'Competitive market requiring strategic positioning'
    default: return 'Market analysis pending'
  }
}

function getMarketPositioningInsight(marketAnalysis, industry, location) {
  if (!marketAnalysis) return `Premium positioning opportunity in ${industry} sector`
  
  const saturation = marketAnalysis.saturation?.toLowerCase()
  const avgRating = parseFloat(marketAnalysis.averageRating) || 4.0
  
  if (saturation === 'low') {
    return `🎯 Blue Ocean Opportunity: Low competition in ${location} allows for rapid market capture and premium positioning`
  } else if (avgRating < 4.0) {
    return `🎯 Quality Gap Opportunity: Below-average market ratings (${avgRating}/5.0) create differentiation through superior service`
  } else {
    return `🎯 Premium Positioning: Saturated market requires unique value proposition and exceptional customer experience`
  }
}

function getRevenuePotential(businessData, industry) {
  const baseRevenue = businessData?.leads?.reduce((sum, lead) => sum + lead.potentialValue, 0) || 100000
  return `Estimated market opportunity: $${Math.round(baseRevenue * 1.5).toLocaleString()}/year based on lead analysis and market penetration models`
}

function getCompetitorWeaknesses(competitors) {
  const weaknesses = []
  
  const noWebsite = competitors.filter(c => !c.website).length
  const noPhone = competitors.filter(c => !c.phone).length
  const lowRating = competitors.filter(c => c.rating < 4.0).length
  
  if (noWebsite > 0) weaknesses.push(`${noWebsite} competitors lack professional websites`)
  if (noPhone > 0) weaknesses.push(`${noPhone} competitors missing phone contact`)
  if (lowRating > 0) weaknesses.push(`${lowRating} competitors have below 4.0★ ratings`)
  
  return weaknesses.length > 0 ? weaknesses.join('\n- ') : 'Market is well-optimized, focus on premium differentiation'
}

function getPartnershipStrategies(leads, industry) {
  const strategies = [
    "Cross-referral agreements with complementary businesses",
    "Joint marketing campaigns to expand reach",
    "Package deal collaborations for comprehensive solutions"
  ]
  
  const supplierCount = leads.filter(l => l.leadType === 'Supplier').length
  const customerCount = leads.filter(l => l.leadType === 'Potential Customer').length
  
  if (supplierCount > 0) strategies.push(`Negotiate volume discounts with ${supplierCount} identified suppliers`)
  if (customerCount > 0) strategies.push(`Direct sales approach to ${customerCount} qualified prospects`)
  
  return strategies.join('\n- ')
}

function getSentimentInsight(sentimentAnalysis) {
  const total = Object.values(sentimentAnalysis).reduce((sum, count) => sum + count, 0)
  const positive = sentimentAnalysis.positive || 0
  const negative = sentimentAnalysis.negative || 0
  
  if (positive > negative) return `Positive (${Math.round(positive/total*100)}% positive sentiment indicates growth market)`
  if (negative > positive) return `Cautious (${Math.round(negative/total*100)}% negative sentiment suggests market challenges)`
  return `Neutral (balanced sentiment indicates stable market conditions)`
}

function getArticleImpact(article, industry) {
  const impacts = [
    "Market expansion opportunity",
    "Regulatory compliance required", 
    "Technology adoption advantage",
    "Customer behavior shift",
    "Competitive landscape change"
  ]
  return impacts[Math.floor(Math.random() * impacts.length)]
}

module.exports = { generateBrief }
