# Troubleshooting Guide

Common issues and solutions for the BeyondChats Article Enhancement Platform.

## Setup & Environment Issues

### "Cannot find module 'next'"

**Cause:** Dependencies not installed

**Solution:**
```bash
# Remove old node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### "Error: connect ECONNREFUSED 127.0.0.1:27017"

**Cause:** MongoDB not running or connection string incorrect

**Solution:**
1. **If using local MongoDB:**
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   
   # Linux
   sudo systemctl start mongod
   ```

2. **If using MongoDB Atlas:**
   - Verify `.env.local` has correct `MONGODB_URI`
   - Check IP whitelist in MongoDB Atlas console
   - Ensure username and password are URL-encoded if they contain special characters

3. **Test connection:**
   ```bash
   # Install mongosh if needed
   npm install -g mongosh
   
   # Test connection
   mongosh "mongodb+srv://user:pass@cluster.mongodb.net/beyondchats"
   ```

### "ENOENT: no such file or directory, open '.env.local'"

**Cause:** Environment file not created

**Solution:**
1. Create `.env.local` in project root:
   ```bash
   touch .env.local
   ```

2. Add all required variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/beyondchats
   GOOGLE_API_KEY=your_key_here
   GOOGLE_SEARCH_API_KEY=your_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_id_here
   SERPER_API_KEY=your_key_here
   ```

3. Verify file is in `.gitignore`

### Port 3000 Already in Use

**Cause:** Another process using the port

**Solution:**
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -i :3000
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001

# Open http://localhost:3001
```

## API Key & Authentication Issues

### "Failed to fetch from Google Search API"

**Possible causes:**
1. Invalid API key
2. API not enabled in Google Cloud Console
3. Quota exceeded

**Solutions:**

1. **Verify API key:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Project: beyondchats-assignment
   - APIs & Services → Credentials
   - Copy exact key to `.env.local`

2. **Enable Custom Search API:**
   - Search bar → "Custom Search API"
   - Click result
   - Click "Enable"

3. **Check quota:**
   - APIs & Services → Library
   - Click "Custom Search API"
   - Go to "Quotas" tab
   - Check daily usage

### "Invalid API Key for Google Generative AI"

**Cause:** Gemini API key invalid or not enabled

**Solution:**
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click "Create API Key"
3. Copy key
4. Paste in `.env.local`:
   ```env
   GOOGLE_API_KEY=<your_new_key>
   ```

5. Restart dev server:
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

### "Quota exceeded for quota metric 'Queries' and limit 'USER-100per day'"

**Cause:** Google Custom Search daily limit reached

**Solution:**
1. **Wait 24 hours** for quota to reset

2. **Upgrade API plan:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Custom Search API
   - Pricing: $5 per 1,000 queries after free 100

3. **Optimize search usage:**
   - Reduce number of articles enhanced per run
   - Batch enhancement across multiple days

4. **Alternative:**
   - Use Serper API instead (100/month free)
   - Modify `enhanceArticles.js` to use Serper

## Scraping Issues

### "Timeout waiting for element"

**Cause:** Website taking too long to load articles

**Solution:**
1. **Increase timeout in `scrapeBlogs.js`:**
   ```javascript
   // Line ~50
   await page.waitForSelector('article', { timeout: 60000 });
   // Changed from 30000 to 60000 (60 seconds)
   ```

2. **Check BeyondChats website:**
   - Visit [beyondchats.com/blogs](https://beyondchats.com/blogs) manually
   - Verify website is accessible
   - Check if layout changed

3. **Restart script:**
   ```bash
   npm run scrape
   ```

### "No articles found - selector may have changed"

**Cause:** Website HTML structure changed

**Solution:**
1. **Open browser DevTools:**
   - Visit [beyondchats.com/blogs](https://beyondchats.com/blogs)
   - Right-click → Inspect Element
   - Find article container selector

2. **Update selector in `scrapeBlogs.js`:**
   ```javascript
   // Find this line (approximately line 70)
   const articles = await page.$$eval('article', ...);
   
   // If needed, change 'article' to new selector
   // Example: const articles = await page.$$eval('.blog-post', ...);
   ```

3. **Test and rerun:**
   ```bash
   npm run scrape
   ```

### "Duplicate article detected - skipping"

**This is normal behavior.** The scraper is designed to detect and skip duplicates. This means:
- Article already in database
- Script successfully prevented double-insertion
- If this persists, articles may not be loading correctly

**To reset and try again:**
```bash
npm run reset-articles
npm run scrape
```

### Scraper Running But Not Saving Articles

**Possible causes:**
1. Database connection failed
2. Articles already in database
3. Selectors not matching

**Debug steps:**
1. **Check MongoDB connection:**
   ```bash
   mongosh "your_mongodb_uri"
   use beyondchats
   db.articles.countDocuments()
   ```

2. **Check scraper output for errors:**
   - Look for error messages in terminal
   - Note any selector warnings

3. **Reset and retry:**
   ```bash
   npm run reset-articles
   npm run scrape
   ```

## Enhancement Issues

### "Enhance script not finding articles to enhance"

**Cause:** No unenhanced articles in database

**Solution:**
1. **Scrape articles first:**
   ```bash
   npm run scrape
   npm run enhance
   ```

2. **Check database:**
   ```bash
   mongosh
   use beyondchats
   db.articles.find({ isUpdated: false }).count()
   ```

3. **If count is 0:**
   - Articles were already enhanced
   - Or scraper hasn't run
   - Try: `npm run reset-articles && npm run scrape && npm run enhance`

### "Rate limit error from Google API"

**Cause:** Too many API requests in short time

**Solution:**
1. **Wait before retrying:**
   - Gemini: 15 requests/minute limit
   - Current delays prevent this usually
   - If error persists, wait 30 minutes

2. **Increase delays in `enhanceArticles.js`:**
   ```javascript
   // Line ~150
   await new Promise(resolve => setTimeout(resolve, 3000)); // 3 seconds
   // Change to 5000 (5 seconds)
   ```

### "Enhanced content not appearing on frontend"

**Cause:** Database update didn't save properly

**Solution:**
1. **Check database:**
   ```bash
   mongosh
   use beyondchats
   db.articles.findOne({ isUpdated: true })
   ```

2. **If empty:**
   - Run enhancement again
   - Check error messages in terminal

3. **If data exists but frontend blank:**
   - Restart dev server: `npm run dev`
   - Clear browser cache (Ctrl+Shift+Delete)
   - Reload page

### Gemini AI Returning Empty or Error Responses

**Possible causes:**
1. Token quota exhausted
2. Model parameter invalid
3. Prompt too long

**Solutions:**
1. **Check quota:**
   - [Google AI Studio](https://aistudio.google.com/app/apikey)
   - View usage statistics
   - Quota resets daily at midnight PST

2. **Verify model name:**
   ```javascript
   // In enhanceArticles.js, verify:
   const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
   ```

3. **If still failing:**
   - Wait until next day for quota reset
   - Or use alternative: `gemini-1.5-flash` (requires v1 API)

## Frontend Issues

### Homepage Shows No Articles

**Cause:** Articles not scraped or database connection failed

**Solution:**
1. **Verify MongoDB connection:**
   - Check `.env.local` has `MONGODB_URI`
   - Restart dev server

2. **Scrape articles:**
   ```bash
   npm run scrape
   ```

3. **Refresh homepage:**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)

### Article Detail Page Shows 404

**Cause:** Article ID doesn't exist in database

**Solution:**
1. **Check database:**
   ```bash
   mongosh
   use beyondchats
   db.articles.findById(ObjectId("your_id_here"))
   ```

2. **Go back to homepage:**
   - Click on article card from homepage
   - Verify IDs match

3. **Rescrape if needed:**
   ```bash
   npm run reset-articles
   npm run scrape
   ```

### Toggle Button Not Working

**Cause:** JavaScript not executing or state not updating

**Solution:**
1. **Check browser console for errors:**
   - F12 → Console tab
   - Look for red error messages

2. **Restart dev server:**
   ```bash
   npm run dev
   ```

3. **Clear cache:**
   - Ctrl+Shift+Delete
   - Clear cache from beginning of time
   - Reload page

### Styling Looks Broken

**Cause:** Tailwind CSS not loading or purging incorrectly

**Solution:**
1. **Rebuild dev server:**
   ```bash
   npm run dev
   ```

2. **Clear CSS cache:**
   - Delete `.next` folder
   ```bash
   rm -rf .next
   npm run dev
   ```

3. **Check `tailwind.config.js`:**
   - Verify content paths are correct
   - Restart dev server

### Performance is Slow

**Possible causes:**
1. Large number of articles
2. Network requests slow
3. Dev server not optimized

**Solutions:**
1. **Use production build:**
   ```bash
   npm run build
   npm start
   ```

2. **Check Network tab in DevTools:**
   - F12 → Network tab
   - Reload page
   - Look for slow requests

3. **Filter articles on homepage:**
   - Use "Enhanced" filter
   - Reduces number of articles rendered

## Database Issues

### MongoDB Connection Pool Timeout

**Cause:** Too many connections or long wait times

**Solution:**
```javascript
// In src/lib/mongodb.js, check connection options
mongoose.connect(process.env.MONGODB_URI, {
  maxPoolSize: 10,
  minPoolSize: 2,
})
```

### "E11000 duplicate key error"

**Cause:** Article with same URL already exists

**Solution:**
1. This shouldn't happen with current scraper logic
2. If it does, verify duplicate detection working
3. Check article `url` field for uniqueness

## Build & Deployment Issues

### "npm run build" fails

**Cause:** Code errors preventing build

**Solution:**
1. **Check error messages:**
   - Scroll to top of error output
   - First error is usually root cause

2. **Common fixes:**
   - Missing imports
   - Syntax errors
   - Type errors in TypeScript

3. **Run lint to find issues:**
   ```bash
   npm run lint
   ```

### Build succeeds but app crashes on start

**Cause:** Runtime error in production

**Solution:**
1. **Check `.env` variables:**
   - Ensure all required vars set
   - No missing API keys

2. **Check logs:**
   - On Vercel: Deployments → Logs
   - On local: Run `npm start` and check output

3. **Reduce features:**
   - Disable scraping/enhancement temporarily
   - Focus on frontend serving articles

## Getting Help

### Debug Information to Collect

When seeking help, provide:
1. **Error message** (full text)
2. **Command you ran** that caused error
3. **Output** from running command
4. **Environment:** OS, Node version
5. **Steps to reproduce** the issue

### Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Google Generative AI Documentation](https://ai.google.dev)
- [Mongoose Documentation](https://mongoosejs.com)

### Contact

For issues specific to this project setup, review:
- [SETUP.md](./SETUP.md) - Installation and configuration
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design
- Main [README.md](../README.md) - Overview and usage
