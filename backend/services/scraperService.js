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
      console.warn(`⚠️ Daily API limit reached (${DAILY_LIMIT}). Returning basic data structure.`)
      return generateBasicDataStructure({ businessName, websiteUrl, industry, location, customGoal })
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
    return generateBasicDataStructure({ businessName, websiteUrl, industry, location, customGoal })
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
      processingMethod: "real_time_scraping",
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
      website: cleanAndValidateWebsiteUrl(item.website),
      phone: item.phone || item.phoneUnformatted || null,
      location: item.location || null,
      priceLevel: item.price || null,
      openingHours: item.openingHours || null,
      imageUrl: item.imageUrl || null,
      placeId: item.placeId || null,
      googleMapsUrl: item.url || generateGoogleMapsUrl(item),
      competitorType: "Direct Competitor",
      neighborhood: item.neighborhood || null,
      additionalInfo: item.additionalInfo || null
    }))

  // Generate hyper-personalized leads WITHOUT potentialValue
  const potentialLeads = uniqueResults
    .filter(item => 
      item.totalScore >= 3.0 &&
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
        phone: item.phone || item.phoneUnformatted || null,
        website: cleanAndValidateWebsiteUrl(item.website),
        address: item.address || "Address not available",
        rating: item.totalScore || 0,
        reviewsCount: item.reviewsCount || 0,
        category: item.categoryName || industry,
        leadScore,
        leadType,
        contactReason: generatePersonalizedContactReason(item, userProfile),
        personalizationScore,
        matchReason: generateMatchReason(item, userProfile),
        actionableSteps: generateActionableSteps(item, userProfile),
        imageUrl: item.imageUrl || null,
        location: item.location || null,
        priority: calculatePersonalizedPriority(item, userProfile),
        searchStrategy: item.searchStrategy || "general",
        lastUpdated: new Date().toISOString(),
        placeId: item.placeId || null,
        googleMapsUrl: item.url || generateGoogleMapsUrl(item),
        priceLevel: item.price || null,
        openingHours: item.openingHours || null,
        additionalInfo: item.additionalInfo || null,
        neighborhood: item.neighborhood || null,
        city: item.city || null,
        state: item.state || null,
        postalCode: item.postalCode || null
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

  // Research step with proper website URL
  if (item.website && cleanAndValidateWebsiteUrl(item.website)) {
    steps.push(`Research ${targetBusiness}'s services and recent developments on their website`)
  } else {
    steps.push(`Research ${targetBusiness} online to understand their business model and services`)
  }

  // Contact preparation with actual phone number
  if (item.phone || item.phoneUnformatted) {
    const phone = item.phone || item.phoneUnformatted
    steps.push(`Prepare a brief introduction of ${businessName} and call ${phone}`)
  }
  
  // Email contact with generated email
  const email = generateBusinessEmail(item)
  if (email) {
    steps.push(`Send a personalized email introduction to ${email}`)
  }

  // Google Maps research
  if (item.placeId || item.url) {
    steps.push(`View their Google Maps profile for reviews and additional insights`)
  }

  // Meeting proposal based on lead type
  if (leadType.includes("Partner")) {
    steps.push(`Propose a brief meeting to discuss partnership opportunities`)
  } else {
    steps.push(`Schedule a consultation to explore collaboration possibilities`)
  }

  // Follow-up
  steps.push(`Follow up within 48 hours with specific value propositions`)

  return steps.slice(0, 4) // Limit to 4 actionable steps
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

function cleanAndValidateWebsiteUrl(url) {
  if (!url || url === "#" || url === "") {
    return null
  }
  
  // Clean the URL
  url = url.trim()
  
  // Remove any Google redirect URLs
  if (url.includes('google.com/url?')) {
    try {
      const urlParams = new URLSearchParams(url.split('?')[1])
      const actualUrl = urlParams.get('url') || urlParams.get('q')
      if (actualUrl) {
        url = decodeURIComponent(actualUrl)
      }
    } catch (e) {
      console.warn('Failed to extract URL from Google redirect:', e)
    }
  }
  
  // Ensure URL has protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url
  }
  
  // Validate URL format
  try {
    const validUrl = new URL(url)
    // Additional validation - ensure it's not a Google Maps URL masquerading as website
    if (validUrl.hostname.includes('google.com') && validUrl.pathname.includes('/maps')) {
      return null
    }
    return validUrl.toString()
  } catch {
    return null
  }
}

function generateGoogleMapsUrl(item) {
  if (item.placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${item.placeId}`
  }
  if (item.title && item.address) {
    const query = encodeURIComponent(`${item.title} ${item.address}`)
    return `https://www.google.com/maps/search/${query}`
  }
  return null
}

function generateBusinessEmail(item) {
  if (!item.website) return null
  
  try {
    const cleanWebsite = cleanAndValidateWebsiteUrl(item.website)
    if (!cleanWebsite) return null
    
    const domain = new URL(cleanWebsite).hostname.replace('www.', '')
    const emailPrefixes = ["info", "contact", "hello", "business", "sales", "partnerships"]
    const randomPrefix = emailPrefixes[Math.floor(Math.random() * emailPrefixes.length)]
    return `${randomPrefix}@${domain}`
  } catch {
    return null
  }
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

// BASIC DATA STRUCTURE WHEN QUOTA IS REACHED OR ERROR OCCURS
function generateBasicDataStructure({ businessName, websiteUrl, industry, location, customGoal }) {
  console.log("📊 Generating basic data structure (no API quota used)")
  
  const locationData = parseLocation(location)
  
  return {
    totalPlaces: 0,
    competitors: [],
    leads: [],
    marketAnalysis: {
      averageRating: "0",
      totalReviews: 0,
      saturation: "Unknown",
      priceRange: "Unknown",
      topCategories: [],
      personalizedInsights: {
        marketOpportunity: `Market analysis for ${industry} business in ${locationData.city} is pending data collection`,
        competitiveLandscape: `The local market analysis for ${industry} requires additional data`,
        topRecommendation: "Focus on building strategic partnerships and networking in your local market",
        actionableAdvice: `Connect with local businesses in ${locationData.city} to explore collaboration opportunities`
      }
    },
    dataQuality: {
      timestamp: new Date().toISOString(),
      sourceCount: 0,
      processingMethod: "basic_structure_only",
      userProfile: {
        businessName,
        industry,
        location: locationData.fullLocation,
        hasCustomGoal: !!customGoal,
        note: "Limited data due to quota restrictions"
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
