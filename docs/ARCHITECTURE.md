# System Architecture

This document explains the system design, data flow, and component interactions in the BeyondChats Article Enhancement Platform.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       BeyondChats Website                    │
└────────────────┬────────────────────────────────────────────┘
                 │ (Web Scraping)
                 ▼
        ┌────────────────────┐
        │  Puppeteer Scraper │
        │  (scrapeBlogs.js)  │
        └────────┬───────────┘
                 │
          (Duplicate Check)
                 │
                 ▼
        ┌────────────────────┐
        │    MongoDB Atlas   │
        │   (Article Store)  │
        └─────┬──────────────┘
              │
        ┌─────┴──────────────────────────┐
        │                                │
        ▼                                ▼
  ┌──────────────┐           ┌──────────────────────┐
  │  Frontend    │           │ Enhancement Script   │
  │  (Next.js)   │           │ (enhanceArticles.js) │
  └──────────────┘           └──────┬───────────────┘
                                    │
                        ┌───────────┼───────────┐
                        │           │           │
                        ▼           ▼           ▼
                    ┌────────┐  ┌──────────┐  ┌─────────┐
                    │ Google │  │ Gemini   │  │ Cheerio │
                    │ Search │  │   AI     │  │ Parser  │
                    └────────┘  └──────────┘  └─────────┘
```

## Phase 1: Article Scraping

### Purpose
Extract articles from BeyondChats blogs and store them in MongoDB.

### Data Flow

```
BeyondChats Website
        ↓
  1. Navigate to blogs page
  2. Go to last page
  3. Extract articles (bottom to top)
  4. Check for duplicates
  5. Save to MongoDB
  6. Update scraper-state.json
```

### Implementation Details

**File:** `src/scraper/scrapeBlogs.js`

**Key Functions:**

1. **`loadScraperState()`**
   - Reads `scraper-state.json` from disk
   - Returns last page number that had new articles
   - Allows script to resume from checkpoint

2. **`saveScraperState()`**
   - Writes state to `scraper-state.json`
   - Persists progress between runs

3. **Main Scraping Loop**
   ```
   FOR each page (starting from last known page):
     EXTRACT articles from page
     REVERSE article order (bottom-to-top reading)
     FOR each article:
       CHECK if URL already in database
       IF NOT EXISTS:
         SAVE article to MongoDB
         INCREMENT count
       IF count reaches 5:
         BREAK and save state
   ```

### State Management

**scraper-state.json**
```json
{
  "lastPageWithNewArticles": 2
}
```

- Tracks last page that contained new articles
- Allows resuming scraping from next page
- Updated after each successful run

### Article Schema

```javascript
{
  title: String,      // Article title
  content: String,    // Full HTML content
  author: String,     // Author name
  date: Date,         // Publication date
  url: String,        // Unique identifier (checked for duplicates)
  isUpdated: false,   // Initially false, set true when enhanced
  updatedContent: null,
  references: [],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Duplicate Detection

```
FOR each article to save:
  QUERY: db.Article.findOne({ url: article.url })
  IF found:
    SKIP this article
  ELSE:
    SAVE to database
```

## Phase 2: Article Enhancement

### Purpose
Use AI and search context to create enriched versions of articles.

### Data Flow

```
MongoDB (Unenhanced Articles)
        ↓
  1. Retrieve 5 articles where isUpdated = false
  2. For each article:
     a. Google Custom Search for related topics
     b. Scrape top 2 results with Cheerio
     c. Pass article + context to Gemini AI
     d. Get enhanced content with citations
     e. Save enhanced content back to MongoDB
     f. Update isUpdated = true
  3. Save progress to enhance-state.json
```

### Implementation Details

**File:** `src/scraper/enhanceArticles.js`

**Key Functions:**

1. **`loadEnhanceState()` / `saveEnhanceState()`**
   - Tracks last enhanced article ID
   - Allows resuming from checkpoint

2. **`enhanceArticle(article)`**
   - Main enhancement function
   - Orchestrates search → scrape → AI → save flow

3. **Search and Context Gathering**
   ```
   SEARCH Google: article.title + keywords
   EXTRACT top 2 results
   FOR each result:
     SCRAPE content with Cheerio
     CLEAN and summarize text
     WAIT 2 seconds (rate limiting)
   PASS to Gemini AI with context
   ```

4. **AI Enhancement**
   ```
   PROMPT to Gemini:
     - Original article content
     - Search result summaries
     - Instruction to enhance and cite sources
   
   RESPONSE:
     - Enhanced content
     - Markdown formatted
     - Includes [Source](url) citations
   ```

5. **Database Update**
   ```
   UPDATE article:
     SET isUpdated = true
     SET updatedContent = enhanced_text
     SET references = cited_urls
     UPDATE updatedAt timestamp
   ```

### State Management

**enhance-state.json**
```json
{
  "lastEnhancedArticleId": "507f1f77bcf86cd799439011"
}
```

### Rate Limiting Strategy

**Delays Built Into Enhancement Script:**
- 2 seconds after Google search
- 2 seconds after Gemini generation
- 3 seconds total between articles

**Rationale:**
- Google Custom Search: 100/day free tier
- Gemini API: 15 requests/minute limit
- Processing 5 articles ≈ 1 minute
- Safe margin to avoid quota exhaustion

## Phase 3: Frontend Presentation

### Purpose
Display articles with original/enhanced toggle and filtering.

### Page Structure

```
┌──────────────────────────────────────┐
│         Homepage (/page.js)          │
├──────────────────────────────────────┤
│  Filter Buttons: All | Enhanced      │
├──────────────────────────────────────┤
│ Article Card 1   │ Article Card 2    │
│ Article Card 3   │ Article Card 4    │
│ Article Card 5   │ ...               │
└──────────────────────────────────────┘
         ↓ (click)
┌──────────────────────────────────────┐
│  Article Detail (/article/[id])      │
├──────────────────────────────────────┤
│  Title                               │
│  Status Badges: Original | Enhanced  │
│  [Toggle] Original ←→ Enhanced       │
│                                      │
│  Article Content Display             │
│  (ArticleContent.js renders)         │
│                                      │
│  References Section (if enhanced)    │
│  - Source article 1                  │
│  - Source article 2                  │
└──────────────────────────────────────┘
```

### Component Hierarchy

```
layout.js (Root)
├── globals.css (Global styles)
├── page.js (Homepage)
│   ├── Filter buttons
│   └── Article grid
│       └── Article cards (links)
└── article/[id]/page.js (Detail)
    ├── Navigation header
    ├── Status badges
    ├── Toggle button
    └── ArticleContent.js
        ├── Original content
        └── Enhanced content
```

### Data Fetching

**Homepage (`/page.js`)**
```javascript
// Server-side fetch
const articles = await Article.find(query)
// Query includes filter:
//   - All: {}
//   - Enhanced only: { isUpdated: true }
```

**Detail Page (`/article/[id]/page.js`)**
```javascript
// Server-side fetch
const article = await Article.findById(id)
// Returns full article with original + enhanced content
```

### Interactive Features

1. **Filter Buttons**
   - State: `filter` (all/enhanced)
   - Updates URL: `?filter=enhanced`
   - Client-side state in `page.js`

2. **Original/Enhanced Toggle**
   - State: `showOriginal` boolean
   - Location: `ArticleContent.js`
   - Controlled render of appropriate version

3. **Content Rendering**
   - Using React Markdown
   - Custom prose styling (Tailwind)
   - Dark text color for readability

## API Layer

### REST Endpoints

```
GET    /api/articles              # List all articles
GET    /api/articles?enhanced=true # List enhanced only
GET    /api/articles/[id]         # Get single article
POST   /api/articles              # Create article
PUT    /api/articles/[id]         # Update article
DELETE /api/articles/[id]         # Delete article
```

### Implementation

**File:** `src/app/api/articles/route.js` and `[id]/route.js`

**Request/Response Format**

```javascript
// POST /api/articles
{
  title: "Article Title",
  content: "Article content...",
  author: "Author name",
  date: "2024-01-15",
  url: "https://example.com"
}

// Response (201)
{
  _id: "507f...",
  title: "Article Title",
  content: "Article content...",
  author: "Author name",
  date: "2024-01-15T00:00:00Z",
  url: "https://example.com",
  isUpdated: false,
  updatedContent: null,
  references: [],
  createdAt: "2024-01-20T...",
  updatedAt: "2024-01-20T..."
}
```

## Database Layer

### MongoDB Collections

**articles**
- Stores all article data
- Indexes on: `url` (unique), `isUpdated`, `date`
- Used by API, homepage, detail pages

### Connection Management

**File:** `src/lib/mongodb.js`

```javascript
// Global MongoDB connection
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null 
  }
}
```

**Features:**
- Caches connection globally (Next.js best practice)
- Handles both server and serverless environments
- Auto-creates database on connection

## Technology Integration

### Puppeteer (Web Scraping)
- Uses headless browser to render JavaScript
- Waits for articles to load dynamically
- Extracts via CSS selectors
- Timeout handling for slow connections

### Cheerio (HTML Parsing)
- Lightweight jQuery-like API
- Parses search result pages
- Extracts text content efficiently

### Google Custom Search
- Searches for topic-related articles
- Top 2 results passed to AI
- Rate limited to prevent quota overrun

### Gemini AI (Enhancement)
- Model: `gemini-2.0-flash-exp`
- Free tier: 1M tokens/day
- Temperature: 0.7 (balanced creativity)
- Prompt-engineered for conciseness

### MongoDB Mongoose
- Schema validation
- Query helpers
- Automatic timestamps
- Connection pooling

## Performance Considerations

### Scraping Performance
- Puppeteer: ~30 seconds per page
- Database: ~100ms per insert
- Total per run: ~5 minutes for 5 articles

### Enhancement Performance
- Google Search: ~2 seconds per query
- Content Scraping: ~5 seconds per article
- Gemini AI: ~10 seconds per generation
- Total per run: ~10-15 minutes for 5 articles

### Frontend Performance
- Server-side rendering (Next.js)
- CSS minification and purging
- Image lazy loading
- Optimized bundle size

## Error Handling

### Scraping Errors
- Timeout handling: Retry with longer timeout
- Selector not found: Log and continue
- Duplicate detection: Silently skip

### Enhancement Errors
- API timeout: Retry with exponential backoff
- Rate limit (429): Built-in delays prevent
- Invalid response: Log and skip article

### Frontend Errors
- 404 for non-existent articles
- Graceful fallback for missing content
- Error boundaries for component crashes

## Security Considerations

- API keys in `.env.local` (not committed)
- MongoDB connection strings secured
- CORS handling via Next.js API routes
- Input validation on API endpoints
- No sensitive data in frontend code

## Scalability

### Current Architecture
- Single MongoDB instance
- Synchronous scraping
- Linear enhancement processing

### Future Improvements
- Queue system (Bull, BullMQ)
- Parallel enhancement (multiple workers)
- Caching layer (Redis)
- CDN for static content
- Database sharding for large datasets
