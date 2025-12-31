# Deployment Guide

This guide explains how this project is deployed and how to deploy your own instance.

**Current Deployment Status:**
- ✅ **Frontend**: Vercel - [https://beyondchats-assignment-fnaj.vercel.app/](https://beyondchats-assignment-fnaj.vercel.app/)
- ✅ **Database**: MongoDB Atlas
- ✅ **APIs**: Live at `/api/articles`

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Local Development                         │
├─────────────────────────────────────────────────────────────┤
│ npm run scrape   →  MongoDB Atlas  ←  npm run enhance      │
│ (Long-running)                        (Long-running)       │
└─────────────────┬───────────────────────────────────────────┘
                  │
          (Data syncs automatically)
                  │
     ┌────────────▼────────────┐
     │   MongoDB Atlas Cloud   │
     │   (Shared Database)     │
     └────────────┬────────────┘
                  │
     (Frontend fetches data)
                  │
     ┌────────────▼────────────┐
     │     Vercel Platform     │
     │  (Next.js Frontend)     │
     │   https://... (Live)    │
     └────────────────────────┘
```

## 🚀 Deployment Strategy

### Why This Architecture?

1. **Scraping/Enhancement on Local Machine**
   - Long-running tasks (10+ minutes per batch)
   - Vercel serverless has 10-second timeout
   - Better resource usage
   - Controlled execution

2. **Frontend on Vercel**
   - Instant global deployment
   - Automatic scaling
   - Built-in CI/CD
   - Free tier available
   - API routes work automatically

3. **Database on MongoDB Atlas**
   - Accessible from anywhere (cloud-hosted)
   - Free tier with 512MB storage
   - Automatic backups
   - Scales as needed
   - Shared between local and frontend

## 📋 Current Deployment (Already Done)

### Frontend - Vercel

**Live URL**: [https://beyondchats-assignment-fnaj.vercel.app/](https://beyondchats-assignment-fnaj.vercel.app/)

**What's deployed:**
- Next.js frontend code
- All pages and API routes
- Static assets and images
- API endpoints at `/api/articles`

**Database connection:**
- Reads from MongoDB Atlas via `MONGODB_URI` environment variable
- Displays articles scraped locally

### Database - MongoDB Atlas

**Collection**: `beyondchats` database, `articles` collection

**What's there:**
- All scraped articles from `npm run scrape`
- Enhanced content from `npm run enhance`
- Automatically updated when you run scripts locally

## 🛠️ How to Deploy Your Own Instance

### Step 1: Prepare Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/hiox2004/beyondchats-assignment.git
   cd beyondchats-assignment
   npm install
   ```

2. **Create MongoDB Atlas account:**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster
   - Get connection string
   - Add IP whitelist (allow anywhere: 0.0.0.0/0)

3. **Get API keys:**
   - Google Generative AI: [aistudio.google.com](https://aistudio.google.com/app/apikey)
   - Google Custom Search: [Google Cloud Console](https://console.cloud.google.com)

4. **Create `.env.local`:**
   ```env
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/beyondchats
   GOOGLE_API_KEY=your_gemini_key
   GOOGLE_SEARCH_API_KEY=your_search_key
   GOOGLE_CSE_ID=your_search_engine_id
   ```

5. **Test locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000
   ```

### Step 2: Deploy Frontend to Vercel

1. **Create Vercel Account:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up (free)
   - Link your GitHub account

2. **Deploy Project:**
   - Click "New Project"
   - Select your GitHub repository
   - Click "Import"

3. **Add Environment Variables:**
   - In Vercel dashboard: Settings → Environment Variables
   - Add same variables as `.env.local`:
     ```
     MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/beyondchats
     GOOGLE_API_KEY=your_gemini_key
     GOOGLE_SEARCH_API_KEY=your_search_key
     GOOGLE_CSE_ID=your_search_engine_id
     ```
   - Click "Save"

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Get your live URL (e.g., `https://your-project.vercel.app`)

### Step 3: Run Scraper & Enhancer (Locally)

**Important:** Scraping and enhancement must run on your local machine, not on Vercel.

1. **Scrape articles:**
   ```bash
   npm run scrape
   ```
   - Scrapes 5 articles
   - Saves to MongoDB Atlas
   - Syncs automatically to live frontend

2. **Enhance articles:**
   ```bash
   npm run enhance
   ```
   - Enhances 5 articles with AI
   - Saves to MongoDB Atlas
   - Visible on live frontend immediately

3. **Repeat as needed:**
   ```bash
   npm run scrape  # Get more articles
   npm run enhance # Enhance more articles
   ```

### Step 4: Verify Live Deployment

1. **Visit your live URL** (provided by Vercel)
2. **Check homepage** - Should show articles you scraped
3. **Click article** - View details and toggle original/enhanced
4. **Test filter** - Switch between All/Enhanced

## 📱 Adding Custom Domain (Optional)

1. **In Vercel Dashboard:**
   - Go to Project Settings
   - Domain section
   - Add your domain
   - Follow DNS setup instructions

2. **Your custom URL:**
   - `https://your-domain.com`

## 🔄 Continuous Updates

After initial deployment:

1. **Add more articles:**
   ```bash
   npm run scrape
   # Automatically syncs to MongoDB Atlas
   # Visible on live site instantly
   ```

2. **Enhance articles:**
   ```bash
   npm run enhance
   # Automatically syncs to MongoDB Atlas
   # Updated on live site instantly
   ```

3. **Update code:**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   # Vercel auto-deploys on push
   ```

## 🔐 Environment Variables Reference

**Required for both local and Vercel:**

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `MONGODB_URI` | MongoDB Atlas connection | [Atlas Console](https://www.mongodb.com/cloud/atlas) |
| `GOOGLE_API_KEY` | Gemini API key | [AI Studio](https://aistudio.google.com/app/apikey) |
| `GOOGLE_SEARCH_API_KEY` | Google Search API | [Cloud Console](https://console.cloud.google.com) |
| `GOOGLE_CSE_ID` | Custom Search Engine ID | [Programmable Search](https://programmablesearchengine.google.com) |

**⚠️ Security Notes:**
- Never commit `.env.local` to git
- Add to `.gitignore` (already done)
- Regenerate keys if accidentally exposed
- Use project-specific API keys for production

## 🚨 Common Deployment Issues

### "API Key not valid" Error

**On Vercel:**
1. Go to project Settings
2. Environment Variables
3. Verify all keys are correct
4. Redeploy (Settings → Deployments → Redeploy)

### Frontend shows blank or no articles

**Causes:**
1. Database not connected - check `MONGODB_URI`
2. Articles not scraped yet - run `npm run scrape` locally
3. Cache issue - hard refresh browser (Ctrl+Shift+Del)

**Fix:**
1. Run `npm run scrape` locally
2. Hard refresh live site
3. Check MongoDB Atlas console for data

### Scraper timeout on local

**Issue:** "Timeout waiting for element"

**Fix:**
- Run on faster internet
- Or increase timeout in `src/scraper/scrapeBlogs.js`:
  ```javascript
  await page.waitForSelector('article', { timeout: 60000 });
  ```

### MongoDB Atlas connection fails

**Check:**
1. IP whitelist in Atlas (should be 0.0.0.0/0)
2. Username and password are correct
3. Connection string format is exact
4. Database name exists (default: `beyondchats`)

## 📊 Monitoring Deployment

### Check Live Site Status
- Visit [https://your-url.vercel.app/](https://your-url.vercel.app/)
- Should load in < 2 seconds
- Check browser console (F12) for errors

### Monitor Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Select your cluster
3. Go to "Collections" to see articles
4. Check "Metrics" for usage

### View Vercel Logs
1. Vercel Dashboard → Deployments
2. Click latest deployment
3. Go to "Logs" tab
4. View real-time logs

## 🚀 Scaling & Optimization

### For Production:

1. **Custom Domain:**
   - Add in Vercel settings
   - Professional appearance
   - Better for sharing

2. **Upgrade Tiers:**
   - Vercel Pro: $20/month
   - MongoDB Advanced: $9+/month
   - Google API quotas: $5+ per 1000 queries

3. **Caching:**
   - Add Redis for caching
   - Reduce database queries
   - Faster response times

4. **CDN:**
   - Vercel includes global CDN
   - Automatic image optimization
   - Fast content delivery

## 📝 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB whitelist includes 0.0.0.0/0
- [ ] API keys obtained (Gemini, Search, CSE)
- [ ] `.env.local` created locally
- [ ] `npm run dev` works locally
- [ ] GitHub repository created and pushed
- [ ] Vercel account created
- [ ] Project imported in Vercel
- [ ] Environment variables added to Vercel
- [ ] Initial deployment successful
- [ ] Live URL accessible
- [ ] `npm run scrape` executed locally
- [ ] Articles visible on live site
- [ ] `npm run enhance` executed (optional)
- [ ] Enhanced content visible on live site

## 📞 Troubleshooting

For more detailed troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).

**Quick help:**
- Frontend issue? Check Vercel logs
- Database issue? Check MongoDB Atlas metrics
- Script issue? Check terminal output when running locally
- API issue? Check `/api/articles` endpoint directly
