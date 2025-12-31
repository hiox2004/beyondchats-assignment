# BeyondChats Article Enhancement Platform

A full-stack web application that scrapes articles from BeyondChats blogs, enhances them using AI, and displays them through a beautiful, responsive interface.

**🚀 [Live Demo](https://beyondchats-assignment-fnaj.vercel.app/)**

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
│       ├── resetArticles.js     # Database cleanup utility
│       └── resetState.js        # State file management
├── public/                       # Static assets
├── package.json                  # Dependencies and scripts
├── next.config.mjs              # Next.js configuration
├── jsconfig.json                # JavaScript configuration
├── eslint.config.mjs            # ESLint rules
├── postcss.config.mjs           # PostCSS configuration
├── tailwind.config.js           # Tailwind CSS config
├── .env.local                   # Environment variables (local only)
├── docs/                        # Documentation folder
│   ├── SETUP.md                 # Setup and installation guide
│   ├── ARCHITECTURE.md          # System design and flow
│   ├── API.md                   # API reference
│   ├── TROUBLESHOOTING.md       # Common issues and solutions
│   └── DEPLOYMENT.md            # Deployment instructions
└── README.md                    # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier)
- Google Generative AI API key
- Google Custom Search API key

### Local Development

1. **Clone and install**:
   ```bash
   git clone https://github.com/hiox2004/beyondchats-assignment.git
   cd beyondchats-assignment
   npm install
   ```

2. **Create `.env.local` file**:
   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/beyondchats
   GOOGLE_API_KEY=your_gemini_api_key
   GOOGLE_SEARCH_API_KEY=your_search_api_key
   GOOGLE_CSE_ID=your_search_engine_id
   ```

3. **Run development server**:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

4. **Scrape and enhance articles**:
   ```bash
   npm run scrape    # Scrape 5 articles
   npm run enhance   # Enhance 5 articles with AI
   ```

5. **View live**:
   - Homepage: [http://localhost:3000](http://localhost:3000)
   - Article details: Click any article card

## 📚 Usage Guide

### 1. Scrape Articles

Scrapes 5 oldest articles from BeyondChats blogs into MongoDB Atlas:

```bash
npm run scrape
```

**What happens:**
- Connects to BeyondChats website using Puppeteer
- Reads articles bottom-to-top (oldest first)
- Checks for duplicates before adding
- Saves progress for resuming next time
- Data syncs to MongoDB Atlas automatically

**Run multiple times** to scrape more articles (5 per run).

### 2. Enhance Articles

Enhances articles using Google Gemini AI with search context:

```bash
npm run enhance
```

**What happens:**
- Finds 5 unenhanced articles
- Searches for relevant context
- Scrapes top 2 results for deeper understanding
- Generates enhanced content with AI
- Adds citations and references
- Data syncs to MongoDB Atlas

**Run multiple times** to enhance all articles.

### 3. View Live

Visit the live deployment:
- **[https://beyondchats-assignment-fnaj.vercel.app/](https://beyondchats-assignment-fnaj.vercel.app/)**

Or locally:
- **[http://localhost:3000](http://localhost:3000)**

### 4. Toggle Content

On any article detail page:
- Click **"Toggle"** button to switch between original and enhanced versions
- See **References** section showing source articles

## 🔧 Available Commands

```bash
# Development & Deployment
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Scraping & Enhancement
npm run scrape           # Scrape 5 oldest articles
npm run enhance          # Enhance 5 articles with AI

# Reset & Maintenance
npm run reset-scraper    # Reset scraper, start from page 1 (keeps articles)
npm run reset-full       # Delete ALL articles + reset states

# Code Quality
npm run lint             # Run ESLint
```

## 📊 Three-Phase Workflow

### Phase 1: Scraping (Local)
- Run `npm run scrape` locally
- Fetches 5 oldest articles from BeyondChats
- Stores in MongoDB Atlas
- Tracks progress in `scraper-state.json`

### Phase 2: Enhancement (Local)
- Run `npm run enhance` locally
- Processes 5 unevaluated articles
- Searches Google for context
- Uses Gemini AI to enhance content
- Stores enhanced version in MongoDB Atlas
- Tracks progress in `enhance-state.json`

### Phase 3: Frontend (Live on Vercel)
- Deployed to [https://beyondchats-assignment-fnaj.vercel.app/](https://beyondchats-assignment-fnaj.vercel.app/)
- Displays all articles from MongoDB Atlas
- Toggle between original and enhanced versions
- Filter by enhancement status
- Mobile-responsive design
- Professional UI with animations

## 🔌 API Endpoints

All endpoints are live at `https://beyondchats-assignment-fnaj.vercel.app/api`

### Get All Articles
```bash
curl https://beyondchats-assignment-fnaj.vercel.app/api/articles
curl https://beyondchats-assignment-fnaj.vercel.app/api/articles?enhanced=true
```

### Get Single Article
```bash
curl https://beyondchats-assignment-fnaj.vercel.app/api/articles/[id]
```

### Create Article
```bash
curl -X POST https://beyondchats-assignment-fnaj.vercel.app/api/articles \
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
curl -X PUT https://beyondchats-assignment-fnaj.vercel.app/api/articles/[id] \
  -H "Content-Type: application/json" \
  -d '{
    "isUpdated": true,
    "updatedContent": "Enhanced content..."
  }'
```

### Delete Article
```bash
curl -X DELETE https://beyondchats-assignment-fnaj.vercel.app/api/articles/[id]
```

## 🛠️ Tech Stack

**Frontend & Deployment:**
- Next.js 16.1.1 - React framework with server components
- React 19 - UI library
- Tailwind CSS 4 - Utility-first CSS framework
- React Markdown - Markdown rendering
- **Vercel** - Hosting & deployment platform

**Backend & Database:**
- Node.js - Runtime environment
- Express.js (via Next.js API routes) - Web framework
- Mongoose 9.0.2 - MongoDB ORM
- **MongoDB Atlas** - Cloud database

**Data & APIs:**
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
- Processing 5 articles ≈ 50,000-100,000 tokens

### Google Custom Search API
- 100 free queries per day
- Built-in 2-second delays prevent quota exhaustion

### MongoDB Atlas (Free Tier)
- 512MB storage (sufficient for this project)
- Unlimited connections
- Auto-scales

## 📖 Documentation

- [SETUP.md](./docs/SETUP.md) - Complete setup and installation guide
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - System design and data flow
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment instructions (already deployed)
- [API.md](./docs/API.md) - Complete API reference with examples
- [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🎨 Key Design Decisions

1. **Batch Processing**: 5 articles per run respects API rate limits

2. **State Tracking**: JSON files allow scripts to resume from last position

3. **Cloud-First**: MongoDB Atlas for scalability and accessibility

4. **Vercel Deployment**: Serverless frontend with automatic scaling

5. **Separation of Concerns**: 
   - Scraping/enhancement run locally (long-running)
   - Frontend served from Vercel (instant load)
   - Database shared via MongoDB Atlas

6. **Professional UI**: Modern design with smooth animations

## 🚀 Deployment Status

✅ **Frontend**: Live on Vercel  
✅ **Database**: MongoDB Atlas  
✅ **APIs**: Operational at `/api/articles`  
✅ **Articles**: Synced from local scraping to cloud database  

**Live Link**: [https://beyondchats-assignment-fnaj.vercel.app/](https://beyondchats-assignment-fnaj.vercel.app/)

## 🐛 Troubleshooting

**Frontend not loading?**
- Visit [https://beyondchats-assignment-fnaj.vercel.app/](https://beyondchats-assignment-fnaj.vercel.app/)
- Check Vercel deployment status

**No articles showing?**
- Run `npm run scrape` locally
- Data syncs to MongoDB Atlas automatically
- Refresh live site

**Scraper not finding articles?**
- BeyondChats website structure may have changed
- Check browser console for selector errors
- Update Puppeteer: `npm install puppeteer@latest`

For more details, see [TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md).

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
