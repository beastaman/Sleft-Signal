const { ApifyClient } = require("apify-client")

const client = new ApifyClient({
  token: process.env.APIFY_API_KEY,
})

// Rate limiting and usage tracking
let dailyUsage = 0
const DAILY_LIMIT = 50 // Limit API calls per day
const MAX_LEADS_PER_REQUEST = 5 // Hard limit on leads

async function scrapeBusinessData({ businessName, websiteUrl, industry, location, customGoal }) {
  try {
    // Check daily usage limit
    if (dailyUsage >= DAILY_LIMIT) {
      console.warn(`⚠️ Daily API limit reached (${DAILY_LIMIT}). Returning personalized mock data.`)
      return generatePersonalizedMockData({ businessName, websiteUrl, industry, location, customGoal })
    }

    console.log(`🎯 Generating hyper-personalized leads for: ${businessName}`)
    console.log(`🌐 Website: ${websiteUrl}`)
    console.log(`🏢 Industry: ${industry}`)
    console.log(`📍 Location: ${location}`)
    console.log(`🎯 Custom Goal: ${customGoal || 'Not specified'}`)
    console.log(`📊 Daily API usage: ${dailyUsage}/${DAILY_LIMIT}`)

    // Parse location for better targeting
    const locationData = parseLocation(location)
    
    // Generate personalized search strategies based on all user inputs
    const searchStrategies = generatePersonalizedSearchStrategies({
      businessName,
      websiteUrl,
      industry,
      location: locationData,
      customGoal
    })

    console.log(`🔍 Generated ${searchStrategies.length} personalized search strategies`)

    const allResults = []
    
    // Execute multiple targeted searches for maximum personalization
    for (const strategy of searchStrategies.slice(0, 3)) { // Limit to 3 searches to save quota
      try {
        const input = {
          searchStringsArray: strategy.searchTerms,
          locationQuery: strategy.locationQuery,
          maxCrawledPlacesPerSearch: strategy.maxResults,
          language: "en",
          maximumLeadsEnrichmentRecords: 0,
          maxImages: 1,
          exportPlaceUrls: false,
          exportReviews: false,
          maxReviews: 0,
          onlyDataFromSearchPage: true,
        }

        console.log(`🔍 Executing ${strategy.type} search:`, strategy.searchTerms)
        
        const run = await client.actor("compass/crawler-google-places").call(input, {
          timeout: 90000, // 1.5 minute timeout per search
        })
        
        const { items } = await client.dataset(run.defaultDatasetId).listItems()
        
        // Tag results with search strategy for better processing
        const taggedItems = items.map(item => ({
          ...item,
          searchStrategy: strategy.type,
          relevanceScore: strategy.relevanceWeight
        }))
        
        allResults.push(...taggedItems)
        dailyUsage++
        
        console.log(`✅ ${strategy.type} search found ${items.length} places`)
        
      } catch (error) {
        console.error(`❌ Error in ${strategy.type} search:`, error.message)
      }
    }

    console.log(`📊 Total results collected: ${allResults.length}`)

    // Process and create hyper-personalized leads
    const processedData = processPersonalizedData(allResults, {
      businessName,
      websiteUrl,
      industry,
      location: locationData,
      customGoal
    })

    console.log(`🎯 Generated ${processedData.leads.length} hyper-personalized leads`)
    console.log(`🏢 Analyzed ${processedData.competitors.length} key competitors`)
    
    return processedData

  } catch (error) {
    console.error("❌ Scraping Error:", error)
    dailyUsage++
    return generatePersonalizedMockData({ businessName, websiteUrl, industry, location, customGoal })
  }
}

function parseLocation(location) {
  // Enhanced location parsing to extract city, state, and ZIP
  const locationParts = location.split(',').map(part => part.trim())
  
  let city, state, zipCode, fullLocation
  
  // Check if it's a ZIP code pattern
  const zipMatch = location.match(/\b\d{5}(?:-\d{4})?\b/)
  if (zipMatch) {
    zipCode = zipMatch[0]
  }
  
  // Check for state abbreviations or full state names
  const stateMatch = location.match(/\b[A-Z]{2}\b|\b(?:Alabama|Alaska|Arizona|Arkansas|California|Colorado|Connecticut|Delaware|Florida|Georgia|Hawaii|Idaho|Illinois|Indiana|Iowa|Kansas|Kentucky|Louisiana|Maine|Maryland|Massachusetts|Michigan|Minnesota|Mississippi|Missouri|Montana|Nebraska|Nevada|New Hampshire|New Jersey|New Mexico|New York|North Carolina|North Dakota|Ohio|Oklahoma|Oregon|Pennsylvania|Rhode Island|South Carolina|South Dakota|Tennessee|Texas|Utah|Vermont|Virginia|Washington|West Virginia|Wisconsin|Wyoming)\b/i)
  if (stateMatch) {
    state = stateMatch[0]
  }
  
  // Extract city (usually the first part)
  if (locationParts.length > 0) {
    city = locationParts[0].replace(/\d{5}(?:-\d{4})?/, '').trim()
  }
  
  return {
    original: location,
    city: city || location,
    state: state,
    zipCode: zipCode,
    fullLocation: location,
    isUrban: isUrbanArea(city || location),
    marketSize: estimateMarketSize(location)
  }
}

function generatePersonalizedSearchStrategies({ businessName, websiteUrl, industry, location, customGoal }) {
  const strategies = []
  
  // Strategy 1: Direct Competitors & Similar Businesses
  strategies.push({
    type: "direct_competitors",
    searchTerms: [
      `${industry} ${location.city}`,
      `${industry} near ${location.fullLocation}`,
      `best ${industry} ${location.city}`,
      ...(location.state ? [`${industry} ${location.state}`] : [])
    ],
    locationQuery: location.fullLocation,
    maxResults: 25,
    relevanceWeight: 0.9,
    description: "Find direct competitors and similar businesses"
  })

  // Strategy 2: Potential Customers/Clients (based on industry synergies)
  const customerIndustries = getTargetCustomerIndustries(industry)
  strategies.push({
    type: "potential_customers",
    searchTerms: customerIndustries.map(targetIndustry => 
      `${targetIndustry} ${location.city}`
    ),
    locationQuery: location.fullLocation,
    maxResults: 20,
    relevanceWeight: 0.8,
    description: "Find potential customers and clients"
  })

  // Strategy 3: Strategic Partners & Suppliers
  const partnerIndustries = getStrategicPartnerIndustries(industry)
  strategies.push({
    type: "strategic_partners",
    searchTerms: partnerIndustries.map(partnerType => 
      `${partnerType} ${location.city}`
    ),
    locationQuery: location.fullLocation,
    maxResults: 15,
    relevanceWeight: 0.7,
    description: "Find strategic partners and suppliers"
  })

  // Strategy 4: Custom Goal-Based Search (if customGoal is provided)
  if (customGoal && customGoal.length > 10) {
    const goalKeywords = extractKeywordsFromGoal(customGoal)
    if (goalKeywords.length > 0) {
      strategies.push({
        type: "custom_goal_based",
        searchTerms: goalKeywords.map(keyword => 
          `${keyword} ${location.city}`
        ),
        locationQuery: location.fullLocation,
        maxResults: 15,
        relevanceWeight: 1.0, // Highest weight for custom goals
        description: "Find businesses aligned with custom goals"
      })
    }
  }

  // Strategy 5: Market Expansion Opportunities
  if (location.isUrban) {
    strategies.push({
      type: "market_expansion",
      searchTerms: [
        `business services ${location.city}`,
        `consulting ${location.city}`,
        `${industry} franchise ${location.city}`,
        `business development ${location.city}`
      ],
      locationQuery: location.fullLocation,
      maxResults: 12,
      relevanceWeight: 0.6,
      description: "Find market expansion opportunities"
    })
  }

  return strategies
}

function getTargetCustomerIndustries(industry) {
  const customerMap = {
    "Restaurant & Food Service": ["catering", "food supplier", "beverage distributor", "restaurant equipment", "food delivery"],
    "Retail & E-commerce": ["wholesale", "dropshipping", "logistics", "payment processing", "inventory management"],
    "Professional Services": ["small business", "startups", "corporate offices", "legal firms", "accounting"],
    "Healthcare & Medical": ["medical equipment", "pharmaceutical", "health insurance", "medical supplies", "wellness"],
    "Fitness & Wellness": ["nutrition", "sports equipment", "athletic wear", "health supplements", "physical therapy"],
    "Beauty & Personal Care": ["cosmetics", "salon equipment", "wellness", "spa supplies", "beauty products"],
    "Real Estate": ["mortgage", "home improvement", "moving services", "interior design", "property management"],
    "Technology & Software": ["IT services", "cloud hosting", "cybersecurity", "software development", "tech support"],
    "Manufacturing": ["industrial equipment", "raw materials", "logistics", "quality control", "automation"],
    "Automotive": ["auto parts", "car dealership", "auto repair", "fleet management", "automotive insurance"],
    "Education & Training": ["educational technology", "learning materials", "student services", "training programs"],
    "Financial Services": ["banking", "investment", "insurance", "financial planning", "business loans"],
    "Legal Services": ["legal technology", "court reporting", "legal research", "compliance", "business consulting"],
    "Marketing & Advertising": ["digital marketing", "print services", "social media", "content creation", "branding"],
    "Construction": ["building materials", "construction equipment", "architecture", "engineering", "project management"]
  }
  
  return customerMap[industry] || ["business services", "consulting", "suppliers"]
}

function getStrategicPartnerIndustries(industry) {
  const partnerMap = {
    "Restaurant & Food Service": ["food distributor", "restaurant technology", "pos systems", "commercial cleaning"],
    "Retail & E-commerce": ["ecommerce platform", "shipping", "marketing agency", "inventory software"],
    "Professional Services": ["business coaching", "marketing services", "office supplies", "communication tools"],
    "Healthcare & Medical": ["medical billing", "healthcare IT", "medical marketing", "compliance consulting"],
    "Fitness & Wellness": ["fitness equipment", "nutrition consulting", "wellness coaching", "sports medicine"],
    "Beauty & Personal Care": ["beauty distributor", "salon software", "marketing agency", "business consulting"],
    "Real Estate": ["mortgage broker", "home inspector", "staging company", "real estate photography"],
    "Technology & Software": ["cloud services", "cybersecurity", "IT consulting", "software integration"],
    "Manufacturing": ["supply chain", "quality assurance", "industrial automation", "logistics"],
    "Automotive": ["automotive distributor", "mechanic tools", "auto insurance", "fleet services"],
    "Education & Training": ["educational software", "learning platforms", "curriculum development"],
    "Financial Services": ["fintech", "regulatory compliance", "financial software", "business consulting"],
    "Legal Services": ["legal software", "document management", "court services", "legal marketing"],
    "Marketing & Advertising": ["creative services", "media buying", "analytics tools", "content platforms"],
    "Construction": ["equipment rental", "safety services", "project management software", "building supplies"]
  }
  
  return partnerMap[industry] || ["business consulting", "professional services", "software solutions"]
}

function extractKeywordsFromGoal(customGoal) {
  const goalText = customGoal.toLowerCase()
  const keywords = []
  
  // Business growth keywords
  if (goalText.includes("expand") || goalText.includes("growth") || goalText.includes("scale")) {
    keywords.push("business expansion", "growth consulting", "scaling services")
  }
  
  // Partnership keywords
  if (goalText.includes("partner") || goalText.includes("collaborate") || goalText.includes("alliance")) {
    keywords.push("business partnership", "strategic alliance", "collaboration")
  }
  
  // Customer acquisition keywords
  if (goalText.includes("customer") || goalText.includes("client") || goalText.includes("sales")) {
    keywords.push("customer acquisition", "sales leads", "business development")
  }
  
  // Technology/Digital keywords
  if (goalText.includes("digital") || goalText.includes("online") || goalText.includes("technology")) {
    keywords.push("digital transformation", "technology solutions", "online services")
  }
  
  // Marketing keywords
  if (goalText.includes("marketing") || goalText.includes("brand") || goalText.includes("visibility")) {
    keywords.push("marketing services", "brand development", "business promotion")
  }
  
  // Efficiency/Optimization keywords
  if (goalText.includes("efficient") || goalText.includes("optimize") || goalText.includes("streamline")) {
    keywords.push("business optimization", "efficiency consulting", "process improvement")
  }
  
  return keywords
}

function processPersonalizedData(allResults, userProfile) {
  const { businessName, websiteUrl, industry, location, customGoal } = userProfile
  
  // Remove duplicates and filter out the user's own business
  const uniqueResults = removeDuplicates(allResults, businessName)
  
  const processedData = {
    totalPlaces: uniqueResults.length,
    competitors: [],
    leads: [],
    marketAnalysis: {
      averageRating: 0,
      totalReviews: 0,
      saturation: "Unknown",
      priceRange: "Unknown",
      topCategories: [],
      personalizedInsights: generatePersonalizedInsights(uniqueResults, userProfile)
    },
    dataQuality: {
      timestamp: new Date().toISOString(),
      sourceCount: uniqueResults.length,
      processingMethod: "hyper_personalized_scraping",
      userProfile: {
        industry,
        location: location.fullLocation,
        hasCustomGoal: !!customGoal
      }
    }
  }

  // Process competitors (similar businesses in same industry)
  processedData.competitors = uniqueResults
    .filter(item => 
      item.searchStrategy === "direct_competitors" && 
      item.title && 
      item.totalScore > 0
    )
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    .slice(0, 8)
    .map(item => ({
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
      competitorType: "Direct Competitor"
    }))

  // Generate hyper-personalized leads
  const potentialLeads = uniqueResults
    .filter(item => 
      item.totalScore >= 3.0 && // Lowered threshold for more opportunities
      item.title && 
      item.title.length > 3 &&
      !isDirectCompetitor(item, industry)
    )
    .map(item => {
      const leadScore = calculateHyperPersonalizedLeadScore(item, userProfile)
      const leadType = determinePersonalizedLeadType(item, userProfile)
      const personalizationScore = calculatePersonalizationScore(item, userProfile)
      
      return {
        businessName: item.title,
        contactPerson: generateContactPerson(item, leadType),
        email: generateBusinessEmail(item),
        phone: item.phone || null,
        website: item.website || null,
        address: item.address || "Address not available",
        rating: item.totalScore || 0,
        reviewsCount: item.reviewsCount || 0,
        category: item.categoryName || industry,
        leadScore,
        leadType,
        potentialValue: estimatePersonalizedValue(item, userProfile),
        contactReason: generatePersonalizedContactReason(item, userProfile),
        personalizationScore,
        matchReason: generateMatchReason(item, userProfile),
        actionableSteps: generateActionableSteps(item, userProfile),
        imageUrl: item.imageUrl || null,
        location: item.location || null,
        priority: calculatePersonalizedPriority(item, userProfile),
        searchStrategy: item.searchStrategy || "general",
        lastUpdated: new Date().toISOString()
      }
    })
    .sort((a, b) => {
      // Primary sort: Personalization score
      if (a.personalizationScore !== b.personalizationScore) {
        return b.personalizationScore - a.personalizationScore
      }
      // Secondary sort: Lead score
      if (a.leadScore !== b.leadScore) {
        return b.leadScore - a.leadScore
      }
      // Tertiary sort: Priority
      return b.priority - a.priority
    })
    .slice(0, MAX_LEADS_PER_REQUEST)

  processedData.leads = potentialLeads

  // Enhanced market analysis
  const validRatings = uniqueResults.filter(item => item.totalScore > 0)
  if (validRatings.length > 0) {
    processedData.marketAnalysis.averageRating = (
      validRatings.reduce((sum, item) => sum + item.totalScore, 0) / validRatings.length
    ).toFixed(1)
  }

  processedData.marketAnalysis.totalReviews = uniqueResults.reduce((sum, item) => sum + (item.reviewsCount || 0), 0)
  processedData.marketAnalysis.saturation = calculatePersonalizedSaturation(uniqueResults, userProfile)
  processedData.marketAnalysis.topCategories = analyzePersonalizedCategories(uniqueResults, userProfile)

  return processedData
}

function calculateHyperPersonalizedLeadScore(item, userProfile) {
  let score = 0
  const { industry, location, customGoal } = userProfile

  // Base rating score (30%)
  if (item.totalScore) {
    score += (item.totalScore / 5) * 30
  }

  // Review credibility (20%)
  if (item.reviewsCount) {
    const reviewScore = Math.min((item.reviewsCount / 50) * 20, 20)
    score += reviewScore
  }

  // Digital presence (15%)
  if (item.website) score += 10
  if (item.phone) score += 5

  // Location relevance (15%)
  if (item.address && item.address.toLowerCase().includes(location.city.toLowerCase())) {
    score += 15
  } else if (item.address && location.state && item.address.toLowerCase().includes(location.state.toLowerCase())) {
    score += 10
  } else {
    score += 5 // Still some points for being in general area
  }

  // Industry synergy (10%)
  if (item.categoryName) {
    const categoryLower = item.categoryName.toLowerCase()
    const industryLower = industry.toLowerCase()
    
    if (categoryLower.includes(industryLower) || industryLower.includes(categoryLower)) {
      score += 5 // Complementary, not competing
    } else if (isComplementaryIndustry(categoryLower, industryLower)) {
      score += 10 // Perfect synergy
    }
  }

  // Custom goal alignment (10%)
  if (customGoal && item.title && item.categoryName) {
    const goalKeywords = extractKeywordsFromGoal(customGoal)
    const itemText = `${item.title} ${item.categoryName}`.toLowerCase()
    
    let goalAlignment = 0
    goalKeywords.forEach(keyword => {
      if (itemText.includes(keyword.toLowerCase())) {
        goalAlignment += 2
      }
    })
    score += Math.min(goalAlignment, 10)
  }

  return Math.round(Math.min(score, 100))
}

function determinePersonalizedLeadType(item, userProfile) {
  const { industry, customGoal } = userProfile
  const category = item.categoryName?.toLowerCase() || ""
  const title = item.title?.toLowerCase() || ""
  const industryLower = industry.toLowerCase()

  // Custom goal-based lead type
  if (customGoal) {
    const goalLower = customGoal.toLowerCase()
    if (goalLower.includes("partner") && !category.includes(industryLower)) {
      return "Strategic Partner"
    }
    if (goalLower.includes("supplier") || goalLower.includes("vendor")) {
      return "Preferred Supplier"
    }
    if (goalLower.includes("client") || goalLower.includes("customer")) {
      return "Target Customer"
    }
  }

  // Industry-specific lead types
  if (category.includes("supplier") || category.includes("wholesale") || title.includes("supply")) {
    return "Supply Chain Partner"
  }
  
  if (category.includes("consulting") || category.includes("advisor") || category.includes("coach")) {
    return "Business Advisor"
  }
  
  if (category.includes("marketing") || category.includes("advertising") || category.includes("digital")) {
    return "Marketing Partner"
  }
  
  if (category.includes("technology") || category.includes("software") || category.includes("IT")) {
    return "Technology Partner"
  }
  
  if (isComplementaryIndustry(category, industryLower)) {
    return "Strategic Alliance"
  }
  
  if (category === industryLower || category.includes(industryLower)) {
    return "Industry Peer"
  }
  
  return "Business Opportunity"
}

function generatePersonalizedContactReason(item, userProfile) {
  const { businessName, industry, customGoal } = userProfile
  const targetBusiness = item.title || "Business"
  const leadType = determinePersonalizedLeadType(item, userProfile)
  
  const personalizedReasons = {
    "Strategic Partner": `Explore mutually beneficial partnership opportunities between ${businessName} and ${targetBusiness}, leveraging our combined expertise in ${industry}`,
    "Preferred Supplier": `Evaluate ${targetBusiness} as a preferred supplier for ${businessName}, focusing on quality, reliability, and long-term partnership benefits`,
    "Target Customer": `Introduce ${businessName}'s ${industry} solutions to ${targetBusiness} and demonstrate how we can address their specific business challenges`,
    "Supply Chain Partner": `Discuss supply chain optimization opportunities and establish a strategic supplier relationship with ${targetBusiness}`,
    "Business Advisor": `Explore consulting services from ${targetBusiness} to enhance ${businessName}'s operations and growth strategy`,
    "Marketing Partner": `Investigate cross-promotional opportunities and marketing collaboration between ${businessName} and ${targetBusiness}`,
    "Technology Partner": `Assess technology solutions from ${targetBusiness} that could streamline ${businessName}'s operations and improve efficiency`,
    "Strategic Alliance": `Propose a strategic alliance between ${businessName} and ${targetBusiness} for mutual referrals and market expansion`,
    "Industry Peer": `Connect with ${targetBusiness} for industry insights, best practices sharing, and potential collaboration opportunities`,
    "Business Opportunity": `Explore how ${businessName} and ${targetBusiness} can create value together through strategic business collaboration`
  }

  let reason = personalizedReasons[leadType] || personalizedReasons["Business Opportunity"]

  // Add custom goal context if available
  if (customGoal && customGoal.length > 10) {
    reason += `. This aligns with your goal: "${customGoal.substring(0, 100)}${customGoal.length > 100 ? '...' : ''}"`
  }

  return reason
}

function generateMatchReason(item, userProfile) {
  const { industry, location, customGoal } = userProfile
  const reasons = []

  // Location match
  if (item.address && item.address.toLowerCase().includes(location.city.toLowerCase())) {
    reasons.push(`Located in ${location.city}`)
  }

  // Industry synergy
  if (item.categoryName && isComplementaryIndustry(item.categoryName.toLowerCase(), industry.toLowerCase())) {
    reasons.push(`Complementary to ${industry}`)
  }

  // Rating excellence
  if (item.totalScore >= 4.5) {
    reasons.push("Excellent reputation (4.5+ stars)")
  }

  // Digital presence
  if (item.website && item.phone) {
    reasons.push("Strong digital presence")
  }

  // Custom goal alignment
  if (customGoal && item.title && item.categoryName) {
    const goalKeywords = extractKeywordsFromGoal(customGoal)
    const itemText = `${item.title} ${item.categoryName}`.toLowerCase()
    const matchingKeywords = goalKeywords.filter(keyword => 
      itemText.includes(keyword.toLowerCase())
    )
    if (matchingKeywords.length > 0) {
      reasons.push("Aligns with your business goals")
    }
  }

  return reasons.length > 0 ? reasons.join(" • ") : "Quality business opportunity"
}

function generateActionableSteps(item, userProfile) {
  const { businessName } = userProfile
  const leadType = determinePersonalizedLeadType(item, userProfile)
  const targetBusiness = item.title || "Business"
  
  const steps = []

  // Research step
  if (item.website) {
    steps.push(`Research ${targetBusiness}'s services and recent developments on their website`)
  } else {
    steps.push(`Research ${targetBusiness} online to understand their business model and services`)
  }

  // Contact preparation
  if (item.phone) {
    steps.push(`Prepare a brief introduction of ${businessName} and call ${item.phone}`)
  }
  if (generateBusinessEmail(item)) {
    steps.push(`Send a personalized email introduction to ${generateBusinessEmail(item)}`)
  }

  // Meeting proposal
  if (leadType.includes("Partner")) {
    steps.push(`Propose a brief meeting to discuss partnership opportunities`)
  } else {
    steps.push(`Schedule a consultation to explore collaboration possibilities`)
  }

  // Follow-up
  steps.push(`Follow up within 48 hours with specific value propositions`)

  return steps.slice(0, 3) // Limit to 3 actionable steps
}

function calculatePersonalizationScore(item, userProfile) {
  let score = 0
  const { industry, location, customGoal } = userProfile

  // Location relevance (25 points)
  if (item.address) {
    if (item.address.toLowerCase().includes(location.city.toLowerCase())) {
      score += 25
    } else if (location.state && item.address.toLowerCase().includes(location.state.toLowerCase())) {
      score += 15
    } else {
      score += 5
    }
  }

  // Industry synergy (25 points)
  if (item.categoryName) {
    const categoryLower = item.categoryName.toLowerCase()
    const industryLower = industry.toLowerCase()
    
    if (isComplementaryIndustry(categoryLower, industryLower)) {
      score += 25
    } else if (categoryLower.includes(industryLower) || industryLower.includes(categoryLower)) {
      score += 15
    } else {
      score += 5
    }
  }

  // Custom goal alignment (25 points)
  if (customGoal && item.title && item.categoryName) {
    const goalKeywords = extractKeywordsFromGoal(customGoal)
    const itemText = `${item.title} ${item.categoryName}`.toLowerCase()
    
    let goalMatches = 0
    goalKeywords.forEach(keyword => {
      if (itemText.includes(keyword.toLowerCase())) {
        goalMatches += 5
      }
    })
    score += Math.min(goalMatches, 25)
  }

  // Quality indicators (25 points)
  if (item.totalScore >= 4.5) score += 10
  if (item.reviewsCount >= 20) score += 5
  if (item.website) score += 5
  if (item.phone) score += 5

  return Math.round(Math.min(score, 100))
}

function calculatePersonalizedPriority(item, userProfile) {
  let priority = 0
  const personalizationScore = calculatePersonalizationScore(item, userProfile)
  
  // Personalization is the primary factor
  if (personalizationScore >= 80) priority += 5
  else if (personalizationScore >= 60) priority += 4
  else if (personalizationScore >= 40) priority += 3
  else priority += 2

  // Quality indicators
  if (item.totalScore >= 4.5) priority += 2
  if (item.reviewsCount >= 50) priority += 1
  if (item.website && item.phone) priority += 1

  return Math.min(priority, 10)
}

// Helper functions
function removeDuplicates(results, businessName) {
  const seen = new Set()
  const businessNameLower = businessName.toLowerCase()
  
  return results.filter(item => {
    if (!item.title) return false
    
    const titleLower = item.title.toLowerCase()
    
    // Filter out user's own business
    if (titleLower.includes(businessNameLower) || businessNameLower.includes(titleLower)) {
      return false
    }
    
    // Remove duplicates based on title and address
    const key = `${titleLower}-${item.address || ''}`.replace(/\s+/g, '')
    if (seen.has(key)) {
      return false
    }
    seen.add(key)
    
    return true
  })
}

function isDirectCompetitor(item, userIndustry) {
  if (!item.categoryName) return false
  
  const categoryLower = item.categoryName.toLowerCase()
  const industryLower = userIndustry.toLowerCase()
  
  // Exact match indicates direct competition
  return categoryLower === industryLower || 
         (categoryLower.includes(industryLower) && industryLower.includes(categoryLower))
}

function isComplementaryIndustry(category, industry) {
  const complementaryMap = {
    "restaurant": ["food supplier", "beverage", "catering", "equipment", "pos"],
    "retail": ["wholesale", "supplier", "logistics", "payment", "inventory"],
    "healthcare": ["medical", "pharmaceutical", "wellness", "insurance"],
    "fitness": ["nutrition", "wellness", "sports", "equipment"],
    "beauty": ["cosmetics", "wellness", "fashion", "supplies"],
    "real estate": ["mortgage", "insurance", "moving", "home improvement"],
    "technology": ["software", "IT", "cloud", "cybersecurity"],
    "professional": ["consulting", "legal", "accounting", "marketing"]
  }
  
  for (const [key, complements] of Object.entries(complementaryMap)) {
    if (industry.includes(key)) {
      return complements.some(complement => category.includes(complement))
    }
  }
  
  return false
}

function isUrbanArea(location) {
  const urbanKeywords = ["city", "metro", "downtown", "urban", "chicago", "new york", "los angeles", "houston", "phoenix", "philadelphia", "san antonio", "san diego", "dallas", "san jose", "austin", "jacksonville", "fort worth", "columbus", "charlotte", "san francisco", "indianapolis", "seattle", "denver", "washington", "boston", "el paso", "detroit", "nashville", "portland", "memphis", "oklahoma city", "las vegas", "louisville", "baltimore", "milwaukee", "albuquerque", "tucson", "fresno", "sacramento", "mesa", "kansas city", "atlanta", "long beach", "colorado springs", "raleigh", "miami", "virginia beach", "omaha", "oakland", "minneapolis", "tulsa", "tampa", "arlington", "new orleans"]
  
  return urbanKeywords.some(keyword => location.toLowerCase().includes(keyword))
}

function estimateMarketSize(location) {
  if (isUrbanArea(location)) return "Large"
  
  // Check for medium-sized cities or states
  const mediumMarkets = ["suburb", "county", "township", "region"]
  if (mediumMarkets.some(keyword => location.toLowerCase().includes(keyword))) {
    return "Medium"
  }
  
  return "Small"
}

function generateContactPerson(item, leadType) {
  const personTitles = {
    "Strategic Partner": "Partnership Director",
    "Preferred Supplier": "Sales Manager",
    "Target Customer": "Business Owner",
    "Supply Chain Partner": "Procurement Manager",
    "Business Advisor": "Principal Consultant",
    "Marketing Partner": "Marketing Director",
    "Technology Partner": "Solutions Architect",
    "Strategic Alliance": "Business Development Manager",
    "Industry Peer": "Operations Manager",
    "Business Opportunity": "General Manager"
  }
  
  return personTitles[leadType] || "Business Owner"
}

function generateBusinessEmail(item) {
  if (!item.website) return null
  
  try {
    const domain = item.website.replace(/https?:\/\//, "").replace(/\/$/, "").split('/')[0]
    const emailPrefixes = ["info", "contact", "hello", "business", "sales", "partnerships"]
    const randomPrefix = emailPrefixes[Math.floor(Math.random() * emailPrefixes.length)]
    return `${randomPrefix}@${domain}`
  } catch {
    return null
  }
}

function estimatePersonalizedValue(item, userProfile) {
  const { industry } = userProfile
  
  // Industry-specific base values
  const industryMultipliers = {
    "restaurant & food service": 2500,
    "retail & e-commerce": 3500,
    "professional services": 4500,
    "healthcare & medical": 5500,
    "fitness & wellness": 2000,
    "beauty & personal care": 2200,
    "real estate": 6000,
    "technology & software": 7500,
    "manufacturing": 8000,
    "automotive": 4000,
    "education & training": 3000,
    "financial services": 9000,
    "legal services": 7000,
    "marketing & advertising": 4500,
    "construction": 5000
  }

  const baseValue = industryMultipliers[industry.toLowerCase()] || 3000
  
  // Personalization multipliers
  const personalizationScore = calculatePersonalizationScore(item, userProfile)
  const personalizationMultiplier = 1 + (personalizationScore / 100)
  
  // Quality multipliers
  const ratingMultiplier = item.totalScore ? (item.totalScore / 5) + 0.3 : 1
  const reviewMultiplier = item.reviewsCount ? Math.min((item.reviewsCount / 50) + 1, 2.5) : 1
  const digitalMultiplier = (item.website ? 1.4 : 1) * (item.phone ? 1.3 : 1)

  const finalValue = baseValue * personalizationMultiplier * ratingMultiplier * reviewMultiplier * digitalMultiplier

  return Math.round(finalValue)
}

function generatePersonalizedInsights(results, userProfile) {
  const { industry, location } = userProfile
  
  return {
    marketOpportunity: `Based on your ${industry} business in ${location.city}, we found ${results.length} relevant business opportunities`,
    competitiveLandscape: `The local market shows ${calculatePersonalizedSaturation(results, userProfile).toLowerCase()} saturation for your industry`,
    topRecommendation: "Focus on strategic partnerships and supplier relationships for maximum growth potential",
    actionableAdvice: `Consider reaching out to top-rated businesses in complementary industries to build your network in ${location.city}`
  }
}

function calculatePersonalizedSaturation(results, userProfile) {
  const { industry } = userProfile
  
  const directCompetitors = results.filter(item => 
    item.categoryName && 
    item.categoryName.toLowerCase().includes(industry.toLowerCase())
  ).length
  
  if (directCompetitors >= 15) return "High"
  if (directCompetitors >= 8) return "Medium"
  return "Low"
}

function analyzePersonalizedCategories(results, userProfile) {
  const categories = results
    .map(item => item.categoryName)
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

function generatePersonalizedMockData({ businessName, websiteUrl, industry, location, customGoal }) {
  console.log("🎭 Generating hyper-personalized mock business data...")
  
  const locationData = parseLocation(location)
  
  // Create personalized mock leads based on user inputs
  const personalizedLeads = [
    {
      businessName: `${locationData.city} ${industry} Alliance`,
      contactPerson: "Partnership Director",
      email: `partnerships@${locationData.city.toLowerCase().replace(/\s+/g, '')}alliance.com`,
      phone: "(555) 123-4567",
      website: `https://${locationData.city.toLowerCase().replace(/\s+/g, '')}alliance.com`,
      address: `123 Business Park Dr, ${locationData.city}, ${locationData.state || 'State'}`,
      rating: 4.7,
      reviewsCount: 89,
      category: "Strategic Partnership",
      leadScore: 95,
      leadType: "Strategic Alliance",
      potentialValue: estimatePersonalizedValue({ totalScore: 4.7, reviewsCount: 89, website: true, phone: true }, { industry }),
      contactReason: `Explore strategic alliance opportunities between ${businessName} and ${locationData.city} ${industry} Alliance, focusing on mutual referrals and market expansion in ${locationData.city}`,
      personalizationScore: 92,
      matchReason: `Located in ${locationData.city} • Complementary to ${industry} • Excellent reputation (4.7 stars) • Strong partnership focus`,
      actionableSteps: [
        `Research their partnership programs and recent collaborations`,
        `Prepare a partnership proposal highlighting ${businessName}'s unique value`,
        `Schedule a partnership discussion meeting within the next week`
      ],
      imageUrl: null,
      location: null,
      priority: 9,
      searchStrategy: "strategic_partners",
      lastUpdated: new Date().toISOString()
    },
    {
      businessName: `Premium ${industry} Solutions ${locationData.city}`,
      contactPerson: "Business Development Manager",
      email: `bd@premium${industry.toLowerCase().replace(/\s+/g, '')}solutions.com`,
      phone: "(555) 234-5678",
      website: `https://premium${industry.toLowerCase().replace(/\s+/g, '')}solutions.com`,
      address: `456 Innovation Blvd, ${locationData.city}, ${locationData.state || 'State'}`,
      rating: 4.5,
      reviewsCount: 124,
      category: "Supplier",
      leadScore: 91,
      leadType: "Preferred Supplier",
      potentialValue: estimatePersonalizedValue({ totalScore: 4.5, reviewsCount: 124, website: true, phone: true }, { industry }),
      contactReason: `Evaluate Premium ${industry} Solutions as a preferred supplier for ${businessName}, focusing on quality products and competitive pricing in the ${locationData.city} market`,
      personalizationScore: 88,
      matchReason: `Located in ${locationData.city} • Specialized in ${industry} • Strong digital presence • High customer satisfaction`,
      actionableSteps: [
        `Review their product catalog and pricing structure`,
        `Contact ${generateBusinessEmail({ website: `https://premium${industry.toLowerCase().replace(/\s+/g, '')}solutions.com` })} for supplier inquiry`,
        `Request samples and negotiate volume pricing for ${businessName}`
      ],
      imageUrl: null,
      location: null,
      priority: 8,
      searchStrategy: "potential_customers",
      lastUpdated: new Date().toISOString()
    },
    {
      businessName: customGoal ? `${locationData.city} Growth Consulting` : `Elite ${industry} Network`,
      contactPerson: customGoal ? "Growth Strategy Consultant" : "Network Coordinator",
      email: customGoal ? `growth@${locationData.city.toLowerCase().replace(/\s+/g, '')}consulting.com` : `network@elite${industry.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: "(555) 345-6789",
      website: customGoal ? `https://${locationData.city.toLowerCase().replace(/\s+/g, '')}consulting.com` : `https://elite${industry.toLowerCase().replace(/\s+/g, '')}.com`,
      address: `789 Success Street, ${locationData.city}, ${locationData.state || 'State'}`,
      rating: 4.8,
      reviewsCount: 67,
      category: customGoal ? "Business Consulting" : industry,
      leadScore: 93,
      leadType: customGoal ? "Business Advisor" : "Industry Peer",
      potentialValue: estimatePersonalizedValue({ totalScore: 4.8, reviewsCount: 67, website: true, phone: true }, { industry }),
      contactReason: customGoal ? 
        `Explore consulting services from ${locationData.city} Growth Consulting to help ${businessName} achieve your goal: "${customGoal.substring(0, 50)}..."` :
        `Connect with Elite ${industry} Network for industry insights and networking opportunities in ${locationData.city}`,
      personalizationScore: customGoal ? 95 : 85,
      matchReason: customGoal ? 
        `Located in ${locationData.city} • Aligns with your business goals • Excellent reputation (4.8 stars)` :
        `Located in ${locationData.city} • Industry expertise in ${industry} • Excellent reputation (4.8 stars)`,
      actionableSteps: customGoal ? [
        `Research their consulting approach and success stories`,
        `Schedule a consultation to discuss your specific goals`,
        `Prepare detailed information about ${businessName}'s current challenges`
      ] : [
        `Join their network and attend upcoming events`,
        `Connect with other ${industry} professionals through their platform`,
        `Share ${businessName}'s expertise to build relationships`
      ],
      imageUrl: null,
      location: null,
      priority: customGoal ? 10 : 7,
      searchStrategy: customGoal ? "custom_goal_based" : "direct_competitors",
      lastUpdated: new Date().toISOString()
    },
    {
      businessName: `${locationData.city} Business Technology Hub`,
      contactPerson: "Solutions Architect",
      email: `solutions@${locationData.city.toLowerCase().replace(/\s+/g, '')}techub.com`,
      phone: "(555) 456-7890",
      website: `https://${locationData.city.toLowerCase().replace(/\s+/g, '')}techub.com`,
      address: `321 Tech Park Way, ${locationData.city}, ${locationData.state || 'State'}`,
      rating: 4.6,
      reviewsCount: 98,
      category: "Technology Services",
      leadScore: 89,
      leadType: "Technology Partner",
      potentialValue: estimatePersonalizedValue({ totalScore: 4.6, reviewsCount: 98, website: true, phone: true }, { industry }),
      contactReason: `Assess technology solutions from ${locationData.city} Business Technology Hub that could streamline ${businessName}'s operations and improve efficiency in the ${industry} sector`,
      personalizationScore: 86,
      matchReason: `Located in ${locationData.city} • Technology solutions for ${industry} • Strong digital presence • Proven track record`,
      actionableSteps: [
        `Review their technology offerings relevant to ${industry}`,
        `Schedule a technology assessment for ${businessName}`,
        `Discuss automation and efficiency improvements specific to your business`
      ],
      imageUrl: null,
      location: null,
      priority: 8,
      searchStrategy: "strategic_partners",
      lastUpdated: new Date().toISOString()
    },
    {
      businessName: `${locationData.city} Marketing Collective`,
      contactPerson: "Marketing Director",
      email: `director@${locationData.city.toLowerCase().replace(/\s+/g, '')}marketing.com`,
      phone: "(555) 567-8901",
      website: `https://${locationData.city.toLowerCase().replace(/\s+/g, '')}marketing.com`,
      address: `654 Creative Ave, ${locationData.city}, ${locationData.state || 'State'}`,
      rating: 4.4,
      reviewsCount: 156,
      category: "Marketing Services",
      leadScore: 87,
      leadType: "Marketing Partner",
      potentialValue: estimatePersonalizedValue({ totalScore: 4.4, reviewsCount: 156, website: true, phone: true }, { industry }),
      contactReason: `Investigate cross-promotional opportunities and marketing collaboration between ${businessName} and ${locationData.city} Marketing Collective to expand reach in the ${locationData.city} ${industry} market`,
      personalizationScore: 84,
      matchReason: `Located in ${locationData.city} • Specialized in local business marketing • Strong client base • Collaborative approach`,
      actionableSteps: [
        `Review their portfolio of ${industry} marketing campaigns`,
        `Discuss joint marketing initiatives and cross-promotion opportunities`,
        `Explore co-branded content and event collaboration possibilities`
      ],
      imageUrl: null,
      location: null,
      priority: 7,
      searchStrategy: "market_expansion",
      lastUpdated: new Date().toISOString()
    }
  ]

  return {
    totalPlaces: 25,
    competitors: [
      {
        title: `Top ${industry} Competitor ${locationData.city}`,
        address: `888 Market St, ${locationData.city}, ${locationData.state || 'State'}`,
        rating: 4.3,
        reviewsCount: 245,
        category: industry,
        website: `https://top${industry.toLowerCase().replace(/\s+/g, '')}competitor.com`,
        phone: "(555) 888-9999",
        location: null,
        priceLevel: "$$$",
        openingHours: null,
        imageUrl: null,
        placeId: "mock_competitor_1",
        competitorType: "Direct Competitor"
      },
      {
        title: `Leading ${industry} Solutions ${locationData.city}`,
        address: `999 Commerce Dr, ${locationData.city}, ${locationData.state || 'State'}`,
        rating: 4.1,
        reviewsCount: 189,
        category: industry,
        website: `https://leading${industry.toLowerCase().replace(/\s+/g, '')}solutions.com`,
        phone: "(555) 999-0000",
        location: null,
        priceLevel: "$$",
        openingHours: null,
        imageUrl: null,
        placeId: "mock_competitor_2",
        competitorType: "Direct Competitor"
      }
    ],
    leads: personalizedLeads,
    marketAnalysis: {
      averageRating: "4.5",
      totalReviews: 1890,
      saturation: calculatePersonalizedSaturation([], { industry }),
      priceRange: "$$",
      topCategories: [
        { category: industry, count: 12 },
        { category: "Business Services", count: 8 },
        { category: "Professional Services", count: 5 },
        { category: "Technology", count: 4 },
        { category: "Marketing", count: 3 }
      ],
      personalizedInsights: {
        marketOpportunity: `Based on your ${industry} business in ${locationData.city}, we identified 25 high-potential business opportunities`,
        competitiveLandscape: `The ${locationData.city} market shows medium saturation for ${industry} with strong partnership opportunities`,
        topRecommendation: customGoal ? 
          "Focus on goal-aligned partnerships and consulting services for accelerated growth" :
          "Prioritize strategic alliances and technology partnerships for competitive advantage",
        actionableAdvice: `Leverage ${locationData.city}'s business ecosystem by building relationships with complementary service providers and potential strategic partners`
      }
    },
    dataQuality: {
      timestamp: new Date().toISOString(),
      sourceCount: 25,
      processingMethod: "hyper_personalized_mock_data",
      userProfile: {
        businessName,
        industry,
        location: locationData.fullLocation,
        hasCustomGoal: !!customGoal,
        personalizationLevel: "Maximum"
      }
    }
  }
}

// Reset daily usage counter
function resetDailyUsage() {
  dailyUsage = 0
  console.log("🔄 Daily API usage counter reset")
}

module.exports = {
  scrapeBusinessData,
  resetDailyUsage
}
