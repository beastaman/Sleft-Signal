# Sleft Signals Backend

## Setup Instructions

### 1. Install Dependencies
\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Environment Variables
Copy `.env.example` to `.env` and fill in your API keys:

\`\`\`env
OPENAI_API_KEY=your_openai_api_key_here
APIFY_API_KEY=your_apify_api_key_here
\`\`\`

### 3. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

The server will start on `http://localhost:3001`

## API Endpoints

### POST /api/generate
Generate a business strategy brief

**Request Body:**
\`\`\`json
{
  "businessName": "Example Business",
  "websiteUrl": "https://example.com",
  "industry": "Restaurant",
  "location": "New York, NY",
  "customGoal": "Optional custom goal"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "briefId": "abc123",
  "message": "Brief generated successfully"
}
\`\`\`

### GET /api/briefs/:id
Get a generated brief by ID

**Response:**
\`\`\`json
{
  "success": true,
  "brief": {
    "id": "abc123",
    "businessName": "Example Business",
    "content": "Generated brief content...",
    "businessData": { ... },
    "newsData": [ ... ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
\`\`\`

### POST /api/competitors
Get competitor analysis

### GET /api/news/:industry
Get industry-specific news

## Features

- ✅ OpenAI GPT-4 integration for brief generation
- ✅ Apify Google Maps scraper for competitor analysis
- ✅ Apify News scraper for industry trends
- ✅ Comprehensive error handling
- ✅ CORS configuration for frontend integration
- 🔄 Coming Soon: Partnership scraper
- 🔄 Coming Soon: E-commerce analysis
- 🔄 Coming Soon: Database persistence

## Architecture

\`\`\`
backend/
├── server.js              # Main Express server
├── services/
│   ├── briefService.js     # OpenAI integration
│   ├── scraperService.js   # Apify scrapers
│   └── newsService.js      # News data processing
├── package.json
└── .env.example
\`\`\`

## Deployment

### Render.com
1. Connect your GitHub repository
2. Set environment variables in Render dashboard
3. Deploy with build command: `npm install`
4. Start command: `npm start`

### Railway
1. Connect repository
2. Add environment variables
3. Deploy automatically

## Error Handling

The backend includes comprehensive error handling:
- API rate limiting protection
- Graceful fallbacks when scrapers fail
- Detailed error logging
- User-friendly error messages
