# Complete Setup Guide

This guide walks you through setting up the BeyondChats Article Enhancement Platform from scratch.

**Note:** This project is already deployed! See [Live Demo](https://beyondchats-assignment-fnaj.vercel.app/) and follow this guide only if you want to run it locally for development.

## Prerequisites

Before starting, ensure you have:
- **Node.js** 18.0.0 or higher ([Download](https://nodejs.org))
- **npm** (comes with Node.js)
- **MongoDB Atlas** account (cloud database - free tier)
- **Vercel** account (for frontend deployment - optional, already deployed)
- Three API keys (detailed below)

## Step 1: Project Setup

### Clone the Repository
```bash
git clone https://github.com/hiox2004/beyondchats-assignment.git
cd beyondchats-assignment
```

### Install Dependencies
```bash
npm install
```

This installs all required packages from `package.json`:
- Next.js, React, and Tailwind CSS for frontend
- Mongoose for database ORM
- Puppeteer for web scraping
- Google Generative AI SDK for AI features
- Axios and Cheerio for HTTP and HTML parsing

## Step 2: Set Up MongoDB Atlas

MongoDB Atlas is the cloud database used by this project (required for any deployment).

### Setup Instructions

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up with email or Google account

2. **Create Cluster**
   - Click "Create a Deployment"
   - Choose "Free" tier
   - Select your region
   - Create cluster

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Save username and password securely

4. **Get Connection String**
   - In Cluster overview, click "Connect"
   - Choose "Drivers" connection method
   - Copy connection string
   - Replace `<username>` and `<password>` with your credentials
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/test?retryWrites=true&w=majority`

5. **Whitelist IP Address**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0) for development
   - For production, add specific IPs

## Step 3: Get API Keys

### 1. Google Generative AI (Gemini) API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key (save securely)

**Quota Information:**
- Free tier: 1,000,000 tokens/day
- Rate limit: 15 requests/minute
- Model used: `gemini-2.0-flash-exp`

### 2. Google Custom Search API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project:
   - Click project dropdown
   - Click "New Project"
   - Name it "beyondchats-assignment"
   - Click "Create"

3. Enable Custom Search API:
   - In search bar, search "Custom Search API"
   - Click the result
   - Click "Enable"

4. Create API Key:
   - Go to "Credentials" in left sidebar
   - Click "Create Credentials" → "API Key"
   - Copy the key

**Get Search Engine ID:**
1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com)
2. Click "Create"
3. Enter search sites (or leave default)
4. Click "Create"
5. Click the search engine name
6. Go to "Setup" → "Basics"
7. Copy the "Search Engine ID"

**Quota:**
- Free tier: 100 queries/day
- Costs: $5 per 1000 queries after free tier

## Step 4: Create Environment Variables

1. **Create `.env.local` file** in project root:
   ```bash
   touch .env.local
   ```

2. **Add environment variables**:
   ```env
   # MongoDB Atlas
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/beyondchats
   
   # Google APIs
   GOOGLE_API_KEY=your_gemini_api_key_here
   GOOGLE_SEARCH_API_KEY=your_search_api_key_here
   GOOGLE_CSE_ID=your_search_engine_id_here
   ```

3. **Verify file is in `.gitignore`**:
   - Open `.gitignore`
   - Ensure `.env.local` is listed
   - This prevents accidental key commits

## Step 5: Start the Application

### Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Verify Setup
1. Homepage should load without errors
2. Initially, no articles will be displayed
3. Proceed to Step 6 to scrape articles

## Step 6: Scrape Articles

Run the scraper to fetch articles from BeyondChats blogs:

```bash
npm run scrape
```

**What to expect:**
- Script connects to BeyondChats website
- Scrapes 5 oldest articles
- Saves to MongoDB
- Creates `scraper-state.json` in project root
- Output shows article titles and success messages

**Run multiple times** to scrape more articles (5 per run).

## Step 7: Enhance Articles

Once you have scraped articles, enhance them with AI:

```bash
npm run enhance
```

**What to expect:**
- Finds 5 unevaluated articles
- Searches for context on each topic
- Uses Gemini AI to create enhanced content
- Adds citations from search results
- Creates `enhance-state.json` to track progress
- Output shows enhancement progress

**Tip:** Built-in delays prevent API rate limiting. You can run this multiple times to enhance all articles.

## Step 8: View and Interact

1. Return to [http://localhost:3000](http://localhost:3000)
2. You should see scraped articles
3. Click on any article to view details
4. Use the toggle button to switch between original and enhanced versions
5. Use filter buttons to show only enhanced articles

## Troubleshooting Setup Issues

### "Cannot connect to MongoDB"
- Verify `MONGODB_URI` is correct
- If using Atlas, check IP whitelist includes your IP
- Test connection with MongoDB Compass

### "API Key Invalid"
- Copy entire key from source
- Ensure no extra spaces or characters
- Verify key hasn't reached usage limits
- Check API is enabled in Google Cloud Console

### "Module not found" error
- Run `npm install` again
- Delete `node_modules` folder and package-lock.json
- Run `npm install` fresh

### Port 3000 already in use
- Kill the process on port 3000
- Or start dev server on different port:
  ```bash
  npm run dev -- -p 3001
  ```

### Scraper fails with timeout
- Increase timeout in `src/scraper/scrapeBlogs.js` (line ~50)
- Change `timeout: 30000` to `timeout: 60000`
- Slower internet connections may need higher timeouts

## Development Configuration

### Tailwind CSS
- Configured in `tailwind.config.js`
- Uses Tailwind 4 with custom theme
- Global styles in `src/app/globals.css`

### ESLint
- Configuration in `eslint.config.mjs`
- Run `npm run lint` to check code quality

### Next.js
- Server components enabled by default
- Image optimization enabled
- Turbopack for faster builds

### MongoDB/Mongoose
- Connection in `src/lib/mongodb.js`
- Auto-creates database and collections
- Schema defined in `src/models/Article.js`

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production
- Use same `.env.local` or set environment variables
- On hosting platform (Vercel, Heroku, etc.):
  1. Add all variables from `.env.local`
  2. Use MongoDB Atlas (not local)
  3. Deploy and test

### Performance Considerations
- Next.js automatically optimizes builds
- Images are lazy-loaded and optimized
- CSS is purged to remove unused styles

## Maintenance

### Reset Database
To clear all articles and start fresh:
```bash
npm run reset-articles
```

### Update Dependencies
```bash
npm update
```

### Monitor Rate Limits
- Gemini: 1M tokens/day (check Google AI Studio)
- Custom Search: 100/day free (check Google Cloud Console)
- Monitor usage to avoid unexpected costs

## Next Steps

- Read [Architecture Guide](./ARCHITECTURE.md) for system design
- Check [Troubleshooting Guide](./TROUBLESHOOTING.md) for common issues
- Review main [README.md](../README.md) for usage guide
