# BeyondChats Article Enhancement Platform

A full-stack web application that scrapes articles from BeyondChats blogs, enhances them using AI, and displays them through a beautiful, responsive interface.

## 🎯 Features

- **Smart Article Scraping**: Automatically scrapes the 5 oldest articles from BeyondChats blogs
  - Detects and prevents duplicate articles
  - Reads articles from bottom to top (oldest first)
  - Saves progress to resume from last position
  
- **AI-Powered Enhancement**: Enhances articles using Google Gemini AI
  - Searches for relevant context using Google Custom Search API
  - Scrapes related articles for deeper understanding
  - Generates enhanced content with proper citations
  - Batch processing (5 articles per run) to respect rate limits
  
- **Beautiful Frontend**: Modern, responsive React interface
  - Original vs Enhanced article toggle
  - Filter articles by enhancement status
  - Professional UI with smooth animations
  - Mobile-friendly design
  - Dark mode optimized typography
  
- **RESTful APIs**: Complete CRUD operations for articles
  - Get all articles with filtering
  - Retrieve single article details
  - Create, update, and delete operations
  - Proper error handling and validation

## 🏗️ Project Structure

```
beyondchats-assignment/
├── src/
│   ├── app/
│   │   ├── page.js              # Homepage with article list
│   │   ├── layout.js            # Root layout
│   │   ├── globals.css          # Global styles and animations
│   │   ├── article/
│   │   │   └── [id]/
│   │   │       ├── page.js      # Article detail page
│   │   │       └── ArticleContent.js  # Article content renderer
│   │   └── api/
│   │       └── articles/
│   │           ├── route.js     # GET all, POST create
│   │           └── [id]/
│   │               └── route.js # GET single, PUT update, DELETE
│   ├── lib/
│   │   └── mongodb.js           # MongoDB connection utility
│   ├── models/
│   │   └── Article.js           # Article schema
│   └── scraper/
│       ├── scrapeBlogs.js       # Web scraper for articles
│       ├── enhanceArticles.js   # AI enhancement script
│       └── resetArticles.js     # Database cleanup utility
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── next.config.mjs              # Next.js configuration
├── jsconfig.json                # JavaScript configuration
├── eslint.config.mjs            # ESLint rules
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS config
├── .env.local                   # Environment variables (create this)
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or Atlas cloud)
- Google Generative AI API key (free tier available)
- Google Custom Search API key and search engine ID
- Serper API key (for search results)

### Installation

1. **Clone and install**:
   ```bash
   cd beyondchats-assignment
   npm install
   ```

2. **Create `.env.local` file** in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beyondchats
   GOOGLE_API_KEY=your_gemini_api_key_here
   GOOGLE_SEARCH_API_KEY=your_search_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
   SERPER_API_KEY=your_serper_api_key_here
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Usage Guide

### 1. Scrape Articles

Scrapes the 5 oldest articles from BeyondChats blogs:

```bash
npm run scrape
```

**What happens:**
- Connects to BeyondChats website using Puppeteer
- Reads articles from last page, bottom to top
- Checks for duplicates before adding to database
- Saves progress to resume from last position
- Creates/updates `scraper-state.json` tracking file

**Run multiple times** to scrape more articles (5 per execution).

### 2. Enhance Articles

Enhances articles using Google Gemini AI and search results:

```bash
npm run enhance
```

**What happens:**
- Finds 5 non-enhanced articles from database
- For each article:
  - Searches for relevant context using Google Custom Search
  - Scrapes the top 2 search results
  - Uses Gemini AI to create enhanced content
  - Adds proper citations and references
  - Marks article as enhanced
- Saves progress to `enhance-state.json`

**Run multiple times** to enhance more articles. Built-in delays prevent rate limiting:
- 2s after Google search
- 2s after Gemini processing
- 3s between articles

### 3. View and Toggle Content

1. Visit homepage to see all articles
2. Click on any article to view details
3. Use the toggle button to switch between original and enhanced versions
4. See references section with source articles for enhanced content

### 4. Filter Articles

On the homepage:
- **All**: Shows all scraped articles
- **Enhanced**: Shows only articles that have been enhanced with AI

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000

# Scraping & Enhancement
npm run scrape          # Scrape 5 oldest articles from BeyondChats
npm run enhance         # Enhance 5 articles using Gemini AI

# Database Management
npm run reset-articles  # Clear all articles from database

# Build & Production
npm run build          # Build for production
npm start              # Start production server
npm run lint           # Run ESLint
```

## 📊 Three-Phase Workflow

### Phase 1: Scraping
- Visits BeyondChats blogs section
- Starts from the last page, reads bottom-to-top
- Extracts article title, content, author, date, and URL
- Stores in MongoDB with `isUpdated: false`
- Prevents duplicates and tracks progress

### Phase 2: Enhancement
- Retrieves unenhanced articles from database
- Performs Google search for topic context
- Scrapes relevant search results
- Uses Gemini AI to create enriched content
- Adds citations and references to original articles
- Marks article with `isUpdated: true` and stores enhanced content

### Phase 3: Frontend Display
- Homepage lists all articles with filter options
- Click any article to see detail page
- Toggle between original and enhanced versions
- View enhancement status, author, date, and read time
- See references section with source articles

## 🔌 API Endpoints

### Get All Articles
```bash
curl http://localhost:3000/api/articles
```

Query parameters:
- `enhanced=true` - Only enhanced articles
- `enhanced=false` - Only original articles

### Get Single Article
```bash
curl http://localhost:3000/api/articles/[id]
```

### Create Article
```bash
curl -X POST http://localhost:3000/api/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Article Title",
    "content": "Article content...",
    "author": "Author Name",
    "date": "2024-01-15",
    "url": "https://example.com"
  }'
```

### Update Article
```bash
curl -X PUT http://localhost:3000/api/articles/[id] \
  -H "Content-Type: application/json" \
  -d '{
    "updatedContent": "Enhanced content...",
    "isUpdated": true,
    "references": ["ref1", "ref2"]
  }'
```

### Delete Article
```bash
curl -X DELETE http://localhost:3000/api/articles/[id]
```

## 📝 Database Schema

### Article Model

```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  author: String,
  date: Date,
  url: String,
  isUpdated: Boolean,
  updatedContent: String,
  references: [String],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🛠️ Tech Stack

**Frontend:**
- Next.js 16.1.1 - React framework with server components
- React 19 - UI library
- Tailwind CSS 4 - Utility-first CSS framework
- React Markdown - Markdown rendering

**Backend:**
- Node.js - Runtime environment
- Express.js (via Next.js API routes) - Web framework
- Mongoose 9.0.2 - MongoDB ODM

**Data & APIs:**
- MongoDB - NoSQL database
- Google Generative AI SDK - Gemini AI integration
- Puppeteer - Web scraping
- Axios - HTTP client
- Cheerio - HTML parsing

**Development:**
- ESLint - Code quality
- PostCSS - CSS processing
- Turbopack - Build optimization

## ⚠️ Rate Limits & Quotas

### Google Gemini API (Free Tier)
- 1,000,000 tokens per day
- 15 requests per minute
- Processing 5 articles uses approximately 50,000-100,000 tokens
- Strategy: Batch processing with strategic delays

### Google Custom Search API
- 100 free queries per day (then $5 per 1000 queries)
- 2-second delay between searches in enhancement script

### Current Delays in Scripts
- After Google search: 2 seconds
- After Gemini generation: 2 seconds
- Between articles: 3 seconds total

## 🔒 Environment Variables

Create a `.env.local` file with:

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `MONGODB_URI` | MongoDB connection string | [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) |
| `GOOGLE_API_KEY` | Google Generative AI API key | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GOOGLE_SEARCH_API_KEY` | Google Custom Search API key | [Google Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_SEARCH_ENGINE_ID` | Custom search engine ID | [Programmable Search Engine](https://programmablesearchengine.google.com) |
| `SERPER_API_KEY` | Serper search API key | [Serper.dev](https://serper.dev) |

## 📖 Additional Documentation

- [Setup Guide](./docs/SETUP.md) - Detailed environment setup
- [Architecture](./docs/ARCHITECTURE.md) - System design and flow
- [Troubleshooting](./docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🎨 Key Design Decisions

1. **Batch Processing**: Processing 5 articles per run respects API rate limits and prevents quota exhaustion

2. **State Tracking**: JSON files (`scraper-state.json`, `enhance-state.json`) allow scripts to resume from last position

3. **Duplicate Prevention**: MongoDB queries check for existing URLs before adding articles

4. **Bottom-to-Top Scraping**: Reads articles from last page backwards to find oldest content first

5. **AI Enhancement**: Uses Google search + content scraping to provide context for more relevant enhancements

6. **Professional UI**: Modern design with smooth animations and responsive layout

## 🐛 Troubleshooting

**Getting "API key not valid" error?**
- Verify all API keys in `.env.local` are correct
- Check that Gemini API is enabled in Google Cloud console

**Database connection fails?**
- Confirm MongoDB URI in `.env.local`
- Check IP whitelist on MongoDB Atlas
- Verify username and password are correct

**Scraper not finding articles?**
- BeyondChats website structure may have changed
- Check browser console for selector errors
- Update Puppeteer to latest version

For more details, see [Troubleshooting Guide](./docs/TROUBLESHOOTING.md).

## 📄 License

This project is built as part of the BeyondChats assignment.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
