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

async function generateBrief({ businessName, websiteUrl, industry, location, customGoal, networkingKeyword, businessData, newsData, meetupData }) {
  try {
    // Initialize OpenAI when needed (after env vars are loaded)
    const client = initializeOpenAI()
    
    if (!client) {
      console.warn('⚠️ OPENAI_API_KEY not found. Returning enhanced mock brief.')
      return generateEnhancedMockBrief({ businessName, websiteUrl, industry, location, customGoal, networkingKeyword, businessData, newsData, meetupData })
    }

    // Create HYPER-PERSONALIZED system prompt based on actual business data
    const systemPrompt = createHyperPersonalizedSystemPrompt(businessName, industry, location, customGoal, businessData)
    
    // Build comprehensive context from ALL scraped data
    const comprehensiveContext = buildComprehensiveDataContext({
      businessName,
      websiteUrl,
      industry,
      location,
      customGoal,
      networkingKeyword,
      businessData,
      newsData,
      meetupData
    })

    const userPrompt = `STRATEGIC INTELLIGENCE BRIEF REQUEST FOR: ${businessName}

${comprehensiveContext}

CRITICAL ANALYSIS REQUIREMENTS:
1. COMPETITIVE EDGE: Analyze actual competitor data to identify specific gaps, pricing opportunities, and market positioning advantages
2. REVENUE LEVERAGE: Use real market data to calculate specific revenue opportunities, pricing strategies, and growth tactics
3. STRATEGIC CONNECTIONS: Reference actual leads and networking events to create concrete partnership and networking strategies

EXPECTED OUTPUT: Three strategic sections with specific, data-driven recommendations that ${businessName} can implement immediately for measurable business growth in ${location}'s ${industry} market.`

    const completion = await client.chat.completions.create({
      model: "gpt-4o", // Latest GPT-4 model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more factual, data-driven responses
      presence_penalty: 0.2,
      frequency_penalty: 0.1,
      top_p: 0.9
    })

    console.log(`✅ Generated AI brief for ${businessName} using ${businessData?.leads?.length || 0} leads, ${newsData?.articles?.length || 0} articles, ${meetupData?.events?.length || 0} events`)

    return completion.choices[0].message.content

  } catch (error) {
    console.error('❌ Error in generateBrief:', error)
    
    // Return enhanced fallback brief on error
    return generateEnhancedMockBrief({ businessName, websiteUrl, industry, location, customGoal, networkingKeyword, businessData, newsData, meetupData })
  }
}

function createHyperPersonalizedSystemPrompt(businessName, industry, location, customGoal, businessData) {
  const marketData = analyzeMarketCharacteristics(businessData, industry, location)
  const competitorCount = businessData?.competitors?.length || 0
  const leadCount = businessData?.leads?.length || 0
  const avgCompetitorRating = businessData?.marketAnalysis?.averageRating || 0
  
  return `You are "Sleft AI," an elite business intelligence analyst with access to REAL-TIME market data for ${businessName} in ${location}'s ${industry} sector.

MARKET INTELLIGENCE ACCESS:
- Live competitor analysis: ${competitorCount} direct competitors analyzed
- Lead generation data: ${leadCount} qualified prospects identified  
- Market saturation: ${marketData.saturation} (${marketData.description})
- Average competitor rating: ${avgCompetitorRating}/5.0
- Industry trend analysis: Real-time news and market developments
- Networking opportunities: Local business events and partnership prospects

YOUR EXPERTISE PROFILE:
• 15+ years analyzing ${industry} markets across major metropolitan areas
• Specialized in ${location} business ecosystem and economic patterns
• Expert in competitive positioning and market penetration strategies
• Data-driven revenue optimization and growth hacking specialist
• Strategic partnership development and business networking authority

ANALYSIS METHODOLOGY:
1. Cross-reference actual competitor pricing, ratings, and market presence
2. Identify specific revenue gaps and monetization opportunities
3. Calculate precise market positioning advantages using real data
4. Reference actual business contacts and networking events
5. Provide implementable strategies with estimated ROI and timelines

CRITICAL SUCCESS FACTORS FOR ${businessName}:
${customGoal ? `• Primary Objective: ${customGoal}` : '• Primary Objective: Accelerate market growth and competitive positioning'}
• Market Context: ${marketData.opportunity}
• Competitive Landscape: ${getCompetitiveLandscapeContext(businessData)}
• Growth Vector: ${getGrowthVectorContext(businessData, industry)}

OUTPUT REQUIREMENTS:
Generate a strategic brief with three sections: "Your Edge" (competitive advantages), "Your Leverage" (revenue opportunities), and "Your Connections" (networking strategy). Each section must reference specific data points, include measurable metrics, and provide actionable next steps with estimated timelines and ROI.

Write in a confident, data-driven tone that demonstrates deep market understanding and provides genuine business value. Every recommendation must be backed by the provided market intelligence data.`
}

function buildComprehensiveDataContext({ businessName, websiteUrl, industry, location, customGoal, networkingKeyword, businessData, newsData, meetupData }) {
  const sections = []

  // BUSINESS PROFILE SECTION
  sections.push(`═══════════════════════════════════════════════════════════════════
📊 BUSINESS INTELLIGENCE PROFILE
═══════════════════════════════════════════════════════════════════
Company: ${businessName}
Website: ${websiteUrl}
Industry: ${industry}
Location: ${location}
${customGoal ? `Strategic Goal: ${customGoal}` : 'Strategic Goal: Market expansion and growth optimization'}
${networkingKeyword ? `Networking Focus: ${networkingKeyword}` : 'Networking Focus: Industry-standard business development'}
Analysis Date: ${new Date().toLocaleDateString()}`)

  // MARKET INTELLIGENCE SECTION
  if (businessData) {
    sections.push(buildDetailedMarketContext(businessData, location, industry))
  }

  // COMPETITIVE ANALYSIS SECTION
  if (businessData?.competitors?.length > 0) {
    sections.push(buildDetailedCompetitorContext(businessData, industry, location))
  }

  // LEAD INTELLIGENCE SECTION
  if (businessData?.leads?.length > 0) {
    sections.push(buildDetailedLeadsContext(businessData, industry, location))
  }

  // INDUSTRY INTELLIGENCE SECTION
  if (newsData?.articles?.length > 0) {
    sections.push(buildDetailedNewsContext(newsData, industry, location))
  }

  // NETWORKING OPPORTUNITIES SECTION
  if (meetupData?.events?.length > 0) {
    sections.push(buildDetailedNetworkingContext(meetupData, networkingKeyword, industry, location))
  }

  return sections.join('\n\n')
}

function buildDetailedMarketContext(businessData, location, industry) {
  const marketAnalysis = businessData.marketAnalysis || {}
  const competitorCount = businessData.competitors?.length || 0
  const avgRating = marketAnalysis.averageRating || 0
  const totalReviews = marketAnalysis.totalReviews || 0
  const saturation = marketAnalysis.saturation || "Unknown"
  
  // Calculate market metrics
  const ratingDistribution = calculateRatingDistribution(businessData.competitors || [])
  const priceAnalysis = analyzePriceDistribution(businessData.competitors || [])
  const digitalPresence = analyzeDigitalPresence(businessData.competitors || [])
  
  return `═══════════════════════════════════════════════════════════════════
📈 MARKET INTELLIGENCE ANALYSIS - ${location} ${industry} Sector
═══════════════════════════════════════════════════════════════════
MARKET OVERVIEW:
• Market Saturation: ${saturation} (${getSaturationDescription(saturation)})
• Total Competitors Analyzed: ${competitorCount}
• Market Average Rating: ${avgRating.toFixed(1)}/5.0 stars
• Total Market Reviews: ${totalReviews.toLocaleString()}
• Dominant Service Categories: ${getTopCategories(businessData.competitors || []).join(', ')}

COMPETITIVE METRICS:
• Rating Distribution: ${ratingDistribution.excellent}% excellent (4.5+★), ${ratingDistribution.good}% good (4.0-4.4★), ${ratingDistribution.poor}% poor (<4.0★)
• Price Analysis: ${priceAnalysis.range} | Average: ${priceAnalysis.average}
• Digital Presence: ${digitalPresence.withWebsite}% have websites, ${digitalPresence.withPhone}% list phone numbers
• Review Engagement: Average ${Math.round(totalReviews / competitorCount)} reviews per competitor

MARKET OPPORTUNITY SCORE: ${calculateMarketOpportunity(businessData)}/100
${getMarketOpportunityInsights(businessData, location, industry)}`
}

function buildDetailedCompetitorContext(businessData, industry, location) {
  const competitors = businessData.competitors || []
  const topCompetitors = competitors.slice(0, 5)
  const weakestCompetitors = competitors.filter(c => c.rating < 4.0).slice(0, 3)
  const priceLeaders = competitors.filter(c => c.price && c.price.includes('$$$')).slice(0, 2)
  
  return `═══════════════════════════════════════════════════════════════════
🏆 COMPETITIVE LANDSCAPE ANALYSIS - TOP ${topCompetitors.length} COMPETITORS
═══════════════════════════════════════════════════════════════════
MARKET LEADERS:
${topCompetitors.map((competitor, index) => {
  return `${index + 1}. ${competitor.title}
   ⭐ Rating: ${competitor.rating}/5.0 (${competitor.reviewsCount} reviews)
   📍 Location: ${competitor.address || 'Address not listed'}
   💰 Price Level: ${competitor.price || 'Not specified'}
   🌐 Website: ${competitor.website ? '✅ Active' : '❌ No website'}
   📞 Phone: ${competitor.phone ? '✅ Listed' : '❌ Not listed'}
   📂 Category: ${competitor.category || industry}
   🔍 Google Maps: ${competitor.googleMapsUrl ? '✅ Optimized' : '❌ Basic listing'}`
}).join('\n\n')}

COMPETITIVE GAPS IDENTIFIED:
${analyzeCompetitiveGaps(competitors, industry)}

MARKET POSITIONING OPPORTUNITIES:
${getPositioningOpportunities(competitors, industry, location)}

IMMEDIATE COMPETITIVE ADVANTAGES:
${getImmediateAdvantages(competitors, weakestCompetitors)}`
}

function buildDetailedLeadsContext(businessData, industry, location) {
  const leads = businessData.leads || []
  const highValueLeads = leads.filter(lead => lead.leadScore >= 80).slice(0, 5)
  const leadsByType = groupLeadsByType(leads)
  const totalPotentialValue = leads.reduce((sum, lead) => sum + (lead.potentialValue || 0), 0)
  const averageLeadScore = leads.reduce((sum, lead) => sum + (lead.leadScore || 0), 0) / leads.length || 0
  
  return `═══════════════════════════════════════════════════════════════════
💼 STRATEGIC PARTNERSHIP INTELLIGENCE - ${leads.length} QUALIFIED PROSPECTS
═══════════════════════════════════════════════════════════════════
LEAD PORTFOLIO ANALYSIS:
• Total Qualified Leads: ${leads.length}
• High-Value Prospects (80+ score): ${highValueLeads.length}
• Average Lead Quality Score: ${averageLeadScore.toFixed(1)}/100
• Total Revenue Potential: $${totalPotentialValue.toLocaleString()}/year
• Lead Type Distribution: ${Object.entries(leadsByType).map(([type, count]) => `${type} (${count})`).join(', ')}

TOP 5 PRIORITY PROSPECTS:
${highValueLeads.map((lead, index) => {
  return `${index + 1}. ${lead.businessName}
   🎯 Lead Type: ${lead.leadType}
   📊 Quality Score: ${lead.leadScore}/100
   💰 Potential Value: $${(lead.potentialValue || 0).toLocaleString()}/year
   ⭐ Rating: ${lead.rating}/5.0 (${lead.reviewsCount} reviews)
   📞 Contact: ${lead.phone || lead.email || 'Contact available'}
   🌐 Website: ${lead.website ? '✅ Available' : '❌ No website'}
   📍 Location: ${lead.address || 'Location not specified'}
   💡 Contact Strategy: ${lead.contactReason || 'Direct outreach recommended'}
   🔥 Priority Level: ${lead.priority || 5}/10`
}).join('\n\n')}

PARTNERSHIP STRATEGY MATRIX:
${generatePartnershipMatrix(leads, industry, location)}`
}

function buildDetailedNewsContext(newsData, industry, location) {
  const articles = newsData.articles || []
  const topArticles = articles.slice(0, 5)
  const categories = newsData.categorized || {}
  const sentimentAnalysis = analyzeSentimentDistribution(articles)
  const sourceAnalysis = analyzeSourceCredibility(articles)
  
  return `═══════════════════════════════════════════════════════════════════
📰 INDUSTRY INTELLIGENCE & MARKET TRENDS
═══════════════════════════════════════════════════════════════════
INTELLIGENCE OVERVIEW:
• Articles Analyzed: ${articles.length}
• Intelligence Sources: ${sourceAnalysis.totalSources}
• Market Sentiment: ${sentimentAnalysis.dominant} (${sentimentAnalysis.positivePercent}% positive)
• Last Updated: ${new Date(newsData.lastUpdated || Date.now()).toLocaleDateString()}
• Category Coverage: ${Object.keys(categories).length} market segments

CRITICAL INDUSTRY DEVELOPMENTS:
${topArticles.map((article, index) => {
  return `${index + 1}. ${article.title}
   📰 Source: ${article.source} (Credibility: ${getSourceCredibilityRating(article.source)})
   📊 Relevance Score: ${article.relevanceScore}/100
   📂 Category: ${article.category}
   😊 Sentiment: ${article.sentiment} ${getSentimentEmoji(article.sentiment)}
   📅 Published: ${new Date(article.published).toLocaleDateString()}
   🔗 URL: ${article.url && !article.isRssLink ? '✅ Direct link' : '⚠️ RSS link'}
   💡 Key Insights: ${(article.keyInsights || []).join(', ') || 'Market development'}
   🎯 Business Impact: ${calculateArticleImpact(article, industry)}`
}).join('\n\n')}

MARKET TREND ANALYSIS:
${generateTrendAnalysis(articles, industry, location)}`
}

function buildDetailedNetworkingContext(meetupData, networkingKeyword, industry, location) {
  const events = meetupData.events || []
  const upcomingEvents = events.filter(event => new Date(event.date) > new Date()).slice(0, 5)
  const eventsByType = groupEventsByType(events)
  const totalAttendees = events.reduce((sum, event) => sum + (event.maxAttendees || 0), 0)
  const averageNetworkingValue = events.reduce((sum, event) => sum + (event.networkingValue || 0), 0) / events.length || 0
  
  return `═══════════════════════════════════════════════════════════════════
🤝 NETWORKING INTELLIGENCE - ${networkingKeyword || industry} EVENTS
═══════════════════════════════════════════════════════════════════
NETWORKING LANDSCAPE:
• Total Events Found: ${events.length}
• Upcoming Events: ${upcomingEvents.length}
• Keyword Focus: "${networkingKeyword || industry}"
• Event Types: ${Object.entries(eventsByType).map(([type, count]) => `${type} (${count})`).join(', ')}
• Total Networking Potential: ${totalAttendees.toLocaleString()} attendees
• Average Networking Value: ${averageNetworkingValue.toFixed(1)}/10

TOP 5 NETWORKING OPPORTUNITIES:
${upcomingEvents.map((event, index) => {
  return `${index + 1}. ${event.title}
   📅 Date: ${new Date(event.date).toLocaleDateString()} at ${new Date(event.date).toLocaleTimeString()}
   📍 Location: ${event.address || 'Online/Location TBD'}
   👥 Attendees: ${event.actualAttendees || 0}/${event.maxAttendees || 'Unlimited'}
   🏢 Organizer: ${event.organizer || 'Professional Group'}
   💼 Event Type: ${event.type || 'Networking'}
   🎯 Networking Value: ${event.networkingValue || 0}/10
   🔗 Registration: ${event.url && event.url !== '#' ? '✅ Available' : '❌ Contact organizer'}
   💡 Strategic Value: ${event.personalizedReason || 'Professional networking opportunity'}
   ⚡ Action Steps: ${(event.actionableSteps || []).slice(0, 2).join(', ') || 'Register and attend'}`
}).join('\n\n')}

NETWORKING STRATEGY RECOMMENDATIONS:
${generateNetworkingStrategy(events, networkingKeyword, industry, location)}`
}

// ENHANCED HELPER FUNCTIONS

function calculateMarketOpportunity(businessData) {
  let score = 50 // Base score
  
  const competitors = businessData.competitors || []
  const avgRating = businessData.marketAnalysis?.averageRating || 4.0
  const saturation = businessData.marketAnalysis?.saturation || "Medium"
  
  // Market saturation impact
  if (saturation === "Low") score += 30
  else if (saturation === "Medium") score += 10
  else score -= 10
  
  // Average rating impact (opportunity in low-rated markets)
  if (avgRating < 3.5) score += 20
  else if (avgRating < 4.0) score += 10
  
  // Digital presence gap opportunity
  const websiteGap = competitors.filter(c => !c.website).length / competitors.length * 100
  score += Math.min(websiteGap / 2, 20)
  
  return Math.min(Math.max(score, 0), 100)
}

function analyzeCompetitiveGaps(competitors, industry) {
  const gaps = []
  
  const noWebsite = competitors.filter(c => !c.website).length
  const noPhone = competitors.filter(c => !c.phone).length
  const lowRated = competitors.filter(c => c.rating < 4.0).length
  const highPriced = competitors.filter(c => c.price && c.price.includes('$$$$')).length
  
  if (noWebsite > 0) gaps.push(`🌐 ${noWebsite} competitors lack professional websites (${Math.round(noWebsite/competitors.length*100)}% market gap)`)
  if (noPhone > 0) gaps.push(`📞 ${noPhone} competitors missing direct phone contact (${Math.round(noPhone/competitors.length*100)}% accessibility gap)`)
  if (lowRated > 0) gaps.push(`⭐ ${lowRated} competitors rated below 4.0 stars (quality differentiation opportunity)`)
  if (highPriced > 0) gaps.push(`💰 ${highPriced} premium-priced competitors (value positioning opportunity)`)
  
  if (gaps.length === 0) {
    gaps.push("🎯 Highly optimized market - focus on premium differentiation and exceptional service delivery")
  }
  
  return gaps.join('\n• ')
}

function getPositioningOpportunities(competitors, industry, location) {
  const opportunities = []
  
  const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length
  const totalReviews = competitors.reduce((sum, c) => sum + c.reviewsCount, 0)
  const avgReviews = totalReviews / competitors.length
  
  if (avgRating < 4.2) {
    opportunities.push(`🏆 Quality Leadership: Market average of ${avgRating.toFixed(1)}★ allows for premium positioning through superior service`)
  }
  
  if (avgReviews < 50) {
    opportunities.push(`📈 Review Volume Advantage: Low average review count (${Math.round(avgReviews)}) indicates opportunity for social proof dominance`)
  }
  
  const priceGaps = analyzePriceGaps(competitors)
  if (priceGaps.length > 0) {
    opportunities.push(`💰 Pricing Strategy: ${priceGaps.join(', ')}`)
  }
  
  opportunities.push(`📍 Local SEO Dominance: Target "${industry} ${location}" and location-specific keywords for search dominance`)
  
  return opportunities.join('\n• ')
}

function generatePartnershipMatrix(leads, industry, location) {
  const strategies = []
  
  const supplierLeads = leads.filter(l => l.leadType === 'Supplier')
  const customerLeads = leads.filter(l => l.leadType === 'Potential Customer')
  const partnerLeads = leads.filter(l => l.leadType === 'Strategic Partner' || l.leadType === 'Strategic Alliance')
  
  if (partnerLeads.length > 0) {
    strategies.push(`🤝 Strategic Alliances (${partnerLeads.length} opportunities): Focus on cross-referral agreements and joint marketing initiatives`)
  }
  
  if (customerLeads.length > 0) {
    strategies.push(`🎯 Direct Sales Pipeline (${customerLeads.length} prospects): Immediate revenue opportunities through targeted outreach`)
  }
  
  if (supplierLeads.length > 0) {
    strategies.push(`⚡ Supply Chain Optimization (${supplierLeads.length} suppliers): Negotiate volume discounts and preferred partnerships`)
  }
  
  const highValueCount = leads.filter(l => l.potentialValue > 10000).length
  if (highValueCount > 0) {
    strategies.push(`💎 High-Value Focus: ${highValueCount} prospects with $10K+ annual potential - prioritize white-glove approach`)
  }
  
  return strategies.join('\n• ')
}

function generateTrendAnalysis(articles, industry, location) {
  const trends = []
  
  const categories = {}
  articles.forEach(article => {
    categories[article.category] = (categories[article.category] || 0) + 1
  })
  
  const topCategories = Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
  
  trends.push(`📊 Trending Topics: ${topCategories.map(([cat, count]) => `${cat} (${count} articles)`).join(', ')}`)
  
  const recentArticles = articles.filter(a => {
    const articleDate = new Date(a.published)
    const daysDiff = (Date.now() - articleDate.getTime()) / (1000 * 60 * 60 * 24)
    return daysDiff <= 7
  })
  
  if (recentArticles.length > 0) {
    trends.push(`🚀 Recent Developments: ${recentArticles.length} breaking developments in past week`)
  }
  
  const positiveArticles = articles.filter(a => a.sentiment === 'positive')
  if (positiveArticles.length > articles.length * 0.6) {
    trends.push(`📈 Market Optimism: ${Math.round(positiveArticles.length/articles.length*100)}% positive sentiment indicates growth market`)
  }
  
  return trends.join('\n• ')
}

function generateNetworkingStrategy(events, networkingKeyword, industry, location) {
  const strategies = []
  
  const upcomingCount = events.filter(e => new Date(e.date) > new Date()).length
  const onlineCount = events.filter(e => e.type === 'ONLINE').length
  const inPersonCount = events.filter(e => e.type === 'IN_PERSON').length
  
  if (upcomingCount > 0) {
    strategies.push(`⚡ Immediate Action: ${upcomingCount} upcoming events in next 30 days - register for top 3 highest-value events`)
  }
  
  if (onlineCount > 0 && inPersonCount > 0) {
    strategies.push(`🌐 Hybrid Approach: Balance ${onlineCount} online events (broader reach) with ${inPersonCount} in-person events (deeper connections)`)
  }
  
  const highValueEvents = events.filter(e => e.networkingValue >= 7)
  if (highValueEvents.length > 0) {
    strategies.push(`🎯 Quality Focus: ${highValueEvents.length} high-value networking events (7+ rating) - prioritize these for maximum ROI`)
  }
  
  strategies.push(`📅 Monthly Goal: Attend 2-3 networking events per month, follow up with 5-10 new connections weekly`)
  strategies.push(`💼 Preparation Strategy: Develop 30-second elevator pitch specific to ${networkingKeyword || industry} networking context`)
  
  return strategies.join('\n• ')
}

// Additional helper functions for enhanced analysis
function calculateRatingDistribution(competitors) {
  const total = competitors.length || 1
  const excellent = competitors.filter(c => c.rating >= 4.5).length
  const good = competitors.filter(c => c.rating >= 4.0 && c.rating < 4.5).length
  const poor = competitors.filter(c => c.rating < 4.0).length
  
  return {
    excellent: Math.round(excellent / total * 100),
    good: Math.round(good / total * 100),
    poor: Math.round(poor / total * 100)
  }
}

function analyzePriceDistribution(competitors) {
  const pricesWithData = competitors.filter(c => c.price)
  if (pricesWithData.length === 0) return { range: "Price data not available", average: "Unknown" }
  
  const priceMap = { '$': 1, '$$': 2, '$$$': 3, '$$$$': 4 }
  const prices = pricesWithData.map(c => priceMap[c.price] || 2)
  const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const priceLabels = ['', '$', '$$', '$$$', '$$$$']
  
  return {
    range: `${priceLabels[Math.min(...prices)]} - ${priceLabels[Math.max(...prices)]}`,
    average: priceLabels[Math.round(avgPrice)] || '$$'
  }
}

function analyzeDigitalPresence(competitors) {
  const total = competitors.length || 1
  const withWebsite = competitors.filter(c => c.website && c.website !== '#').length
  const withPhone = competitors.filter(c => c.phone).length
  
  return {
    withWebsite: Math.round(withWebsite / total * 100),
    withPhone: Math.round(withPhone / total * 100)
  }
}

function getTopCategories(competitors) {
  const categories = {}
  competitors.forEach(c => {
    if (c.category) categories[c.category] = (categories[c.category] || 0) + 1
  })
  return Object.entries(categories)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat)
}

function getSaturationDescription(saturation) {
  switch (saturation?.toLowerCase()) {
    case 'low': return 'Excellent entry opportunity with minimal competition'
    case 'medium': return 'Balanced market with strategic positioning required'
    case 'high': return 'Competitive market demanding differentiation strategy'
    default: return 'Market dynamics under analysis'
  }
}

function analyzeMarketCharacteristics(businessData, industry, location) {
  const competitors = businessData?.competitors || []
  const saturation = businessData?.marketAnalysis?.saturation || "Unknown"
  const avgRating = businessData?.marketAnalysis?.averageRating || 0
  
  let opportunity = "Standard growth opportunity"
  let description = "Market analysis in progress"
  
  if (saturation === "Low" && competitors.length < 10) {
    opportunity = "Blue ocean market with first-mover advantage potential"
    description = "Low competition creates exceptional growth opportunity"
  } else if (avgRating < 4.0) {
    opportunity = "Quality gap market with premium positioning potential"
    description = "Below-average service quality creates differentiation opportunity"
  } else if (competitors.length > 20) {
    opportunity = "Saturated market requiring unique value proposition"
    description = "High competition demands strategic differentiation"
  }
  
  return { saturation, opportunity, description }
}

function getCompetitiveLandscapeContext(businessData) {
  const competitors = businessData?.competitors || []
  if (competitors.length === 0) return "Limited competitive data available"
  
  const avgRating = competitors.reduce((sum, c) => sum + c.rating, 0) / competitors.length
  const topRated = Math.max(...competitors.map(c => c.rating))
  const digitalGap = competitors.filter(c => !c.website).length
  
  return `${competitors.length} active competitors, avg ${avgRating.toFixed(1)}★ rating, ${digitalGap} lack digital presence`
}

function getGrowthVectorContext(businessData, industry) {
  const leads = businessData?.leads || []
  const totalValue = leads.reduce((sum, l) => sum + (l.potentialValue || 0), 0)
  
  if (totalValue > 100000) return "High-value partnership ecosystem identified"
  if (leads.length > 10) return "Strong lead generation potential"
  return "Standard growth trajectory"
}

// Enhanced mock brief generation with networking data
function generateEnhancedMockBrief({ businessName, websiteUrl, industry, location, customGoal, networkingKeyword, businessData, newsData, meetupData }) {
  const marketSaturation = businessData?.marketAnalysis?.saturation || "Medium"
  const competitorCount = businessData?.competitors?.length || 8
  const leadCount = businessData?.leads?.length || 12
  const eventCount = meetupData?.events?.length || 5
  const avgRating = businessData?.marketAnalysis?.averageRating || 4.2
  
  return `## 1. Your Edge

**Market Intelligence Analysis for ${businessName}:**

Based on comprehensive analysis of ${competitorCount} competitors in ${location}'s ${industry} market, you have **significant competitive advantages** in a ${marketSaturation.toLowerCase()} saturation environment.

**🎯 Competitive Positioning Advantages:**
• **Digital Presence Gap**: ${Math.round(competitorCount * 0.4)} competitors lack professional websites, creating immediate online visibility advantage
• **Service Quality Opportunity**: Market average of ${avgRating}/5.0 indicates room for premium positioning through exceptional service delivery
• **Local SEO Dominance**: Target "${industry} in ${location}" keywords where competition averages only ${Math.round(avgRating * 20)}% search optimization
• **Review Generation Strategy**: Average competitor has only ${Math.round(competitorCount * 15)} reviews - aggressive review acquisition creates social proof advantage

**📊 Market Positioning Strategy:**
${customGoal ? `Your stated goal of "${customGoal}" aligns perfectly with` : 'Focus on'} capturing the premium segment (top 20% willing to pay 30-50% more) by positioning as the ${industry.toLowerCase()} solution that delivers measurable results.

**⚡ Immediate Implementation (Next 14 days):**
1. Launch targeted local SEO campaign for "${industry} ${location}" keywords
2. Implement review generation system to capture 5+ reviews weekly
3. Develop premium service tier targeting quality-focused customers

## 2. Your Leverage

**Revenue Optimization Opportunities (Based on ${leadCount} Qualified Prospects):**

**💰 Strategic Partnership Revenue**: $${Math.round((leadCount * 8500) * 1.2).toLocaleString()}/year
- ${Math.round(leadCount * 0.3)} high-value partnerships identified for cross-referral agreements
- Estimated 15-25 qualified referrals monthly from strategic alliances
- Average referral value: $${Math.round(8500 * 1.3).toLocaleString()} annually per partnership

**📈 Premium Service Tier** (90-day implementation):
- Market analysis shows ${Math.round(competitorCount * 0.15)} competitors offer premium services
- Revenue Potential: $${Math.round((avgRating * 50000) * 0.8).toLocaleString()}/quarter
- Target: Top 20% of market segment willing to pay 40-60% premium for guaranteed results

**🤝 Networking Revenue Pipeline** (${networkingKeyword ? `${networkingKeyword} events` : 'Industry networking'}):
- ${eventCount} upcoming networking events identified in ${location}
- Estimated networking ROI: $${Math.round(eventCount * 3500).toLocaleString()}/month from event-generated leads
- Strategic focus: ${networkingKeyword || industry} networking for direct business development

**🎯 Market Expansion Vector**:
${marketSaturation === 'Low' ? 
  `Blue ocean market opportunity - potential for 300% growth within 12 months through aggressive market capture` : 
  `Premium market positioning - 40-60% revenue increase through value-based pricing and service differentiation`}

**Implementation Roadmap:**
- **Days 1-30**: Establish 3 strategic partnerships, launch premium tier
- **Days 31-60**: Scale networking activities, optimize referral systems  
- **Days 61-90**: Expand service offerings, implement growth automation

## 3. Your Connections

**Strategic Networking & Partnership Intelligence:**

**🔥 Priority Partnership Targets (Contact within 7 days):**
${businessData?.leads?.slice(0, 3).map((lead, i) => 
  `${i + 1}. **${lead.businessName}** (${lead.leadType})
   • Quality Score: ${lead.leadScore}/100 | Revenue Potential: $${(lead.potentialValue || 5000).toLocaleString()}/year
   • Contact Method: ${lead.phone ? `Direct call ${lead.phone}` : 'LinkedIn/Email outreach'}
   • Value Proposition: ${lead.contactReason || 'Mutual referral partnership opportunity'}
   • Next Step: ${lead.actionableSteps?.[0] || 'Schedule 15-minute intro call this week'}`
).join('\n\n') || 
`1. **${location} Business Alliance** (Strategic Partnership)
   • Quality Score: 85/100 | Revenue Potential: $15,000/year
   • Contact Method: Direct outreach to partnership director
   • Value Proposition: Cross-referral agreement for ${industry} services
   • Next Step: Schedule partnership discussion meeting

2. **Local ${industry} Suppliers** (Supply Chain Optimization)
   • Quality Score: 78/100 | Revenue Potential: $8,500/year savings
   • Contact Method: Direct supplier negotiations
   • Value Proposition: Volume discount partnerships
   • Next Step: Request quotes and partnership terms`}

**🌐 High-Value Networking Events** (${networkingKeyword || industry} focus):
${meetupData?.events?.slice(0, 3).map((event, i) => 
  `${i + 1}. **${event.title}**
   • Date: ${new Date(event.date).toLocaleDateString()} at ${new Date(event.date).toLocaleTimeString()}
   • Networking Value: ${event.networkingValue || 7}/10 | Attendees: ${event.actualAttendees || 25}/${event.maxAttendees || 50}
   • Strategic Value: ${event.personalizedReason || 'Professional networking and partnership development'}
   • Registration: ${event.url && event.url !== '#' ? '✅ Available' : '❌ Contact organizer'}
   • ROI Target: 3-5 qualified connections per event`
).join('\n\n') || 
`1. **${location} ${industry} Networking Summit**
   • Date: Next Thursday 6:00 PM | Networking Value: 8/10 | Attendees: 40/60
   • Strategic Value: Meet potential partners and high-value prospects
   • Registration: Available online | ROI Target: 5+ qualified connections

2. **${networkingKeyword || 'Business'} Professionals Meetup**
   • Date: Next Tuesday 7:00 PM | Networking Value: 7/10 | Attendees: 30/50
   • Strategic Value: Direct customer acquisition and referral partnerships
   • Registration: RSVP required | ROI Target: 2-3 immediate prospects`}

**📞 Outreach Script Templates:**
*Partnership Outreach*: "Hi [Name], I noticed [specific observation about their business]. I run ${businessName}, ${industry.toLowerCase()} in ${location}. I believe there's a mutually beneficial partnership opportunity - would you be open to a brief 15-minute conversation this week?"

*Networking Follow-up*: "Great meeting you at [Event]. As discussed, I think there's real synergy between our businesses. I'd love to explore how we can refer clients to each other - are you free for coffee this week?"

**📈 Networking ROI Targets:**
- **Weekly Goal**: 3-5 new strategic connections
- **Monthly Target**: 2 confirmed partnership agreements
- **Quarterly Objective**: $${Math.round((leadCount * 2500) + (eventCount * 1500)).toLocaleString()} additional revenue from networking activities

**Ready to 10x your business? Join our exclusive network of elite entrepreneurs →**`
}

// Export additional helper functions
function groupLeadsByType(leads) {
  return leads.reduce((acc, lead) => {
    acc[lead.leadType] = (acc[lead.leadType] || 0) + 1
    return acc
  }, {})
}

function groupEventsByType(events) {
  return events.reduce((acc, event) => {
    acc[event.type || 'Networking'] = (acc[event.type || 'Networking'] || 0) + 1
    return acc
  }, {})
}

function analyzeSentimentDistribution(articles) {
  const sentiments = articles.reduce((acc, article) => {
    acc[article.sentiment] = (acc[article.sentiment] || 0) + 1
    return acc
  }, {})
  
  const total = articles.length
  const positive = sentiments.positive || 0
  const negative = sentiments.negative || 0
  const neutral = sentiments.neutral || 0
  
  let dominant = 'neutral'
  if (positive > negative && positive > neutral) dominant = 'positive'
  else if (negative > positive && negative > neutral) dominant = 'negative'
  
  return {
    dominant,
    positivePercent: Math.round(positive / total * 100),
    negativePercent: Math.round(negative / total * 100),
    neutralPercent: Math.round(neutral / total * 100)
  }
}

function analyzeSourceCredibility(articles) {
  const sources = [...new Set(articles.map(a => a.source))]
  const credibleSources = sources.filter(source => 
    source.toLowerCase().includes('reuters') || 
    source.toLowerCase().includes('bloomberg') ||
    source.toLowerCase().includes('wall street') ||
    source.toLowerCase().includes('times')
  )
  
  return {
    totalSources: sources.length,
    credibleSources: credibleSources.length,
    credibilityScore: Math.round(credibleSources.length / sources.length * 100)
  }
}

function getSourceCredibilityRating(source) {
  const highCredibility = ['reuters', 'bloomberg', 'wall street journal', 'financial times', 'associated press']
  const mediumCredibility = ['cnn', 'bbc', 'nytimes', 'washington post', 'forbes']
  
  const sourceLower = source.toLowerCase()
  
  if (highCredibility.some(cred => sourceLower.includes(cred))) return 'High'
  if (mediumCredibility.some(cred => sourceLower.includes(cred))) return 'Medium'
  return 'Standard'
}

function getSentimentEmoji(sentiment) {
  switch (sentiment?.toLowerCase()) {
    case 'positive': return '📈'
    case 'negative': return '📉'
    case 'neutral': return '➡️'
    default: return '📊'
  }
}

function calculateArticleImpact(article, industry) {
  const impacts = [
    `${industry} market expansion opportunity`,
    `Regulatory changes affecting ${industry} sector`,
    `Technology disruption in ${industry} space`,
    `Consumer behavior shift impacting ${industry}`,
    `Competitive landscape evolution in ${industry}`
  ]
  
  const keywords = article.title.toLowerCase()
  if (keywords.includes('growth') || keywords.includes('expansion')) return impacts[0]
  if (keywords.includes('regulation') || keywords.includes('law')) return impacts[1]
  if (keywords.includes('technology') || keywords.includes('ai') || keywords.includes('digital')) return impacts[2]
  if (keywords.includes('consumer') || keywords.includes('customer')) return impacts[3]
  
  return impacts[4]
}

function analyzePriceGaps(competitors) {
  const priceData = competitors.filter(c => c.price)
  if (priceData.length < 3) return ['Pricing data limited - conduct competitor price research']
  
  const priceMap = { '$': 'Budget', '$$': 'Mid-range', '$$$': 'Premium', '$$$$': 'Luxury' }
  const priceCounts = priceData.reduce((acc, c) => {
    acc[priceMap[c.price]] = (acc[priceMap[c.price]] || 0) + 1
    return acc
  }, {})
  
  const gaps = []
  if (!priceCounts.Budget) gaps.push('Budget segment underserved')
  if (!priceCounts.Premium) gaps.push('Premium positioning available')
  if (!priceCounts.Luxury) gaps.push('Luxury tier opportunity')
  
  return gaps.length > 0 ? gaps : ['Market well-covered across price segments']
}

function getImmediateAdvantages(competitors, weakestCompetitors) {
  const advantages = []
  
  if (weakestCompetitors.length > 0) {
    advantages.push(`🎯 Quality Advantage: ${weakestCompetitors.length} competitors rated below 4.0★ create immediate differentiation opportunity`)
  }
  
  const noWebsiteCount = competitors.filter(c => !c.website || c.website === '#').length
  if (noWebsiteCount > 0) {
    advantages.push(`🌐 Digital Advantage: ${noWebsiteCount} competitors lack professional websites`)
  }
  
  const lowReviewCount = competitors.filter(c => c.reviewsCount < 20).length
  if (lowReviewCount > 0) {
    advantages.push(`⭐ Social Proof Gap: ${lowReviewCount} competitors have insufficient reviews (<20)`)
  }
  
  advantages.push(`📱 Modern Marketing: Implement digital-first strategy while competitors rely on traditional methods`)
  
  return advantages.join('\n• ')
}

function getMarketOpportunityInsights(businessData, location, industry) {
  const score = calculateMarketOpportunity(businessData)
  const insights = []
  
  if (score >= 80) {
    insights.push(`🚀 EXCEPTIONAL OPPORTUNITY: ${location}'s ${industry} market shows blue ocean characteristics`)
    insights.push(`💡 Strategy: Aggressive market capture through premium positioning and digital dominance`)
  } else if (score >= 60) {
    insights.push(`📈 STRONG OPPORTUNITY: Multiple competitive gaps identified in ${industry} sector`)
    insights.push(`💡 Strategy: Strategic differentiation through service quality and customer experience`)
  } else {
    insights.push(`🎯 COMPETITIVE MARKET: ${industry} in ${location} requires strategic positioning`)
    insights.push(`💡 Strategy: Focus on niche specialization and premium service delivery`)
  }
  
  insights.push(`🔍 Recommended Focus: Capitalize on digital presence gaps and service quality opportunities`)
  
  return insights.join('\n')
}

module.exports = { generateBrief }
