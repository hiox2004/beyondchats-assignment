const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const SCRAPER_STATE_FILE = path.join(__dirname, 'scraper-state.json');

// Load last scraped page from tracking file
function loadScraperState() {
  try {
    if (fs.existsSync(SCRAPER_STATE_FILE)) {
      const data = fs.readFileSync(SCRAPER_STATE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('No previous scraper state found, starting fresh');
  }
  return { lastScrapedPage: null };
}

// Save scraper state to tracking file
function saveScraperState(state) {
  try {
    fs.writeFileSync(SCRAPER_STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Failed to save scraper state:', error.message);
  }
}

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  date: String,
  url: String,
  isUpdated: { type: Boolean, default: false },
  updatedContent: String,
  references: [{ title: String, url: String }]
}, { timestamps: true });

const Article = mongoose.models.Article || mongoose.model('Article', articleSchema);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapeBlogs() {
  console.log('Starting scraper...');
  
  // Connect to MongoDB FIRST before scraping
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondchats';
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
  
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

  try {
    console.log('Navigating to BeyondChats blogs...');
    await page.goto('https://beyondchats.com/blogs/', { 
      waitUntil: 'networkidle2',
      timeout: 60000 
    });

    await wait(3000);

    const lastPageNum = await page.evaluate(() => {
      const pageLinks = Array.from(document.querySelectorAll('.page-numbers'));
      const numbers = pageLinks
        .map(link => parseInt(link.textContent.trim()))
        .filter(num => !isNaN(num));
      return numbers.length > 0 ? Math.max(...numbers) : 1;
    });

    console.log(`Total pages found: ${lastPageNum}`);
    
    // Load saved scraper state to continue from where we left off
    const state = loadScraperState();
    let currentPage = state.lastPageWithNewArticles || lastPageNum;
    
    if (state.lastPageWithNewArticles) {
      console.log(`Resuming from page ${currentPage} (last page with new articles: page ${state.lastPageWithNewArticles})\n`);
    } else {
      console.log(`Starting fresh from page ${currentPage}\n`);
    }
    
    // Collect articles until we have 5 new (non-duplicate) ones
    let articleLinks = [];
    let newArticlesCount = 0;
    let lastPageWithNewArticles = currentPage; // Track the page where we find new articles

    while (newArticlesCount < 5 && currentPage > 0) {
      console.log(`Scraping page ${currentPage}...`);
      
      const pageUrl = currentPage === 1 
        ? 'https://beyondchats.com/blogs/' 
        : `https://beyondchats.com/blogs/page/${currentPage}/`;
      
      await page.goto(pageUrl, { waitUntil: 'networkidle2' });
      await wait(2000);

      const pageLinks = await page.evaluate(() => {
        const links = [];
        const articles = Array.from(document.querySelectorAll('article')).reverse(); // Read bottom to top
        
        articles.forEach(article => {
          const titleLink = article.querySelector('h2 a, h3 a, .entry-title a');
          if (titleLink) {
            links.push({
              title: titleLink.textContent.trim(),
              url: titleLink.href
            });
          }
        });
        
        return links;
      });

      console.log(`Found ${pageLinks.length} articles on page ${currentPage}`);

      // Check each article on this page for duplicates
      let newOnThisPage = 0;
      for (const link of pageLinks) {
        const existing = await Article.findOne({ url: link.url });
        if (!existing) {
          articleLinks.push(link);
          newArticlesCount++;
          newOnThisPage++;
          lastPageWithNewArticles = currentPage; // Update the page where we found new articles
          console.log(`  ✓ New article: ${link.title}`);
          
          if (newArticlesCount === 5) break; // Stop when we have 5 new ones
        } else {
          console.log(`  ⊘ Already exists: ${link.title}`);
        }
      }

      // Only move to previous page if this page had no new articles
      if (newOnThisPage === 0) {
        console.log(`No new articles on page ${currentPage}, moving to previous page`);
      }
      
      currentPage--;
    }

    console.log(`\nCollected ${articleLinks.length} new articles total`);
    
    const articles = [];

    for (const link of articleLinks) {
      console.log(`Fetching: ${link.title}...`);
      
      await page.goto(link.url, { waitUntil: 'networkidle2' });
      await wait(2000);

      const articleData = await page.evaluate(() => {
        const contentEl = document.querySelector('.entry-content, article, .post-content, main');
        const dateEl = document.querySelector('.entry-date, time, .published');
        const authorEl = document.querySelector('.author-name, .entry-author, .author');
        
        return {
          content: contentEl ? contentEl.innerText.trim().substring(0, 2000) : 'No content',
          date: dateEl ? dateEl.textContent.trim() : new Date().toISOString(),
          author: authorEl ? authorEl.textContent.trim() : 'BeyondChats Team'
        };
      });

      articles.push({
        title: link.title,
        url: link.url,
        ...articleData
      });
    }

    console.log(`\n✓ Successfully scraped ${articles.length} articles:`);
    articles.forEach((a, i) => console.log(`  ${i + 1}. ${a.title}`));

    let saved = 0;
    let skipped = 0;

    for (const articleData of articles) {
      const existing = await Article.findOne({ url: articleData.url });
      if (!existing) {
        await Article.create(articleData);
        console.log(`✓ Saved: ${articleData.title}`);
        saved++;
      } else {
        console.log(`⊘ Already exists: ${articleData.title}`);
        skipped++;
      }
    }

    console.log(`\n✅ Scraping completed! Saved: ${saved}, Skipped: ${skipped}`);

    // Save the last page where we found new articles
    if (lastPageWithNewArticles > 0) {
      saveScraperState({ lastPageWithNewArticles });
      console.log(`✅ Saved progress: Last page with new articles was page ${lastPageWithNewArticles}`);
      console.log(`   Next run will start from page ${lastPageWithNewArticles}`);
    }

  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    await mongoose.disconnect();
    console.log('Browser and DB connection closed');
  }
}

scrapeBlogs();
