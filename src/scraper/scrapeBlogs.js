const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

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
    
    // Collect article links from last few pages until we have 5
    const allArticleLinks = [];
    let currentPage = lastPageNum;

    while (allArticleLinks.length < 5 && currentPage > 0) {
      console.log(`Scraping page ${currentPage}...`);
      
      const pageUrl = currentPage === 1 
        ? 'https://beyondchats.com/blogs/' 
        : `https://beyondchats.com/blogs/page/${currentPage}/`;
      
      await page.goto(pageUrl, { waitUntil: 'networkidle2' });
      await wait(2000);

      const pageLinks = await page.evaluate(() => {
        const links = [];
        const articles = document.querySelectorAll('article');
        
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
      allArticleLinks.push(...pageLinks);
      currentPage--;
    }

    // Take only the first 5 (oldest articles)
    const articleLinks = allArticleLinks.slice(0, 5);
    console.log(`\nCollected ${articleLinks.length} oldest articles total`);
    
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

    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondchats';
    await mongoose.connect(MONGODB_URI);
    console.log('\nConnected to MongoDB');

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
