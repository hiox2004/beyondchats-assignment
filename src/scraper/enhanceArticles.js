const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to search Google using Custom Search API
async function searchGoogle(query) {
  try {
    console.log(`  Searching Google for: "${query}"`);
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}`;
    
    const response = await axios.get(url);
    const results = [];
    
    const items = response.data.items || [];
    for (const item of items.slice(0, 2)) {
      if (item.link && 
          !item.link.includes('youtube.com') && 
          !item.link.includes('facebook.com')) {
        results.push({
          title: item.title,
          url: item.link
        });
      }
      
      if (results.length === 2) break;
    }

    console.log(`  Found ${results.length} relevant links`);
    return results;
    
  } catch (error) {
    console.error(`  Google search failed: ${error.message}`);
    return [];
  }
}

// Function to scrape article content using Puppeteer with better stealth
async function scrapeArticleContent(url, browser) {
  const page = await browser.newPage();
  
  try {
    console.log(`  Fetching content from: ${url}`);
    
    // Better user agent and headers
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    });
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await wait(3000);

    const content = await page.evaluate(() => {
      // Remove unwanted elements
      const unwanted = document.querySelectorAll('script, style, nav, header, footer, iframe, .advertisement, .ad, .sidebar, aside, .menu');
      unwanted.forEach(el => el.remove());
      
      // Try multiple selectors for main content
      const selectors = [
        'article', 
        'main', 
        '[role="main"]',
        '.post-content', 
        '.entry-content',
        '.article-content',
        '.content',
        '#content',
        '.post',
        'body'
      ];
      
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.innerText || element.textContent || '';
          const cleaned = text.trim().replace(/\s+/g, ' ');
          if (cleaned.length > 300) {
            return cleaned.substring(0, 2000);
          }
        }
      }
      
      // Fallback: get all paragraph text
      const paragraphs = Array.from(document.querySelectorAll('p'));
      const allText = paragraphs.map(p => p.innerText).join(' ').trim();
      return allText.substring(0, 2000) || 'No content found';
    });

    console.log(`  Scraped ${content.length} characters`);
    await page.close();
    return content;
    
  } catch (error) {
    console.error(`  Failed to scrape: ${error.message}`);
    await page.close();
    return '';
  }
}

// Function to call Gemini API
async function enhanceArticleWithGemini(originalArticle, referenceArticles) {
  try {
    console.log(`  Calling Gemini AI to enhance article...`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `You are an expert content writer. Rewrite the following article to improve its quality, SEO, and readability while maintaining factual accuracy.

ORIGINAL ARTICLE:
Title: ${originalArticle.title}
Content: ${originalArticle.content}

REFERENCE ARTICLES (for style and formatting inspiration):
1. ${referenceArticles[0]?.content || 'No reference'}
2. ${referenceArticles[1]?.content || 'No reference'}

Instructions:
- Improve the writing quality and flow
- Make it more engaging and professional
- Maintain the core message and facts
- Use a similar tone and structure as the reference articles
- Keep it around 500-800 words
- Write in a blog-friendly format

Write the enhanced article now:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedContent = response.text();
    
    console.log(`  ✓ Article enhanced successfully (${enhancedContent.length} characters)`);
    return enhancedContent;
    
  } catch (error) {
    console.error(`  Gemini API failed: ${error.message}`);
    return originalArticle.content;
  }
}

// Main enhancement process
async function enhanceArticles() {
  console.log('Starting Article Enhancement Process...\n');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondchats');
    console.log('Connected to MongoDB\n');

    // Get all articles that haven't been updated
    const articles = await Article.find({ isUpdated: false });
    console.log(`Found ${articles.length} articles to enhance\n`);

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      console.log(`\n[${i + 1}/${articles.length}] Processing: ${article.title}`);
      console.log('='.repeat(60));

      // Step 1: Search Google
      const googleResults = await searchGoogle(article.title);
      await wait(3000);

      if (googleResults.length === 0) {
        console.log('  ⚠ No Google results found, skipping...');
        continue;
      }

      // Step 2: Scrape reference articles with retry
      const referenceArticles = [];
      for (const result of googleResults) {
        let content = await scrapeArticleContent(result.url, browser);
        
        // If first attempt fails, try one more time
        if (!content || content.length < 100) {
          console.log(`  Retrying...`);
          await wait(3000);
          content = await scrapeArticleContent(result.url, browser);
        }
        
        if (content && content.length > 100) {
          referenceArticles.push({
            title: result.title,
            url: result.url,
            content: content
          });
        }
        await wait(3000);
      }

      // If we got at least 1 reference, continue (don't need both)
      if (referenceArticles.length === 0) {
        console.log('  ⚠ Could not scrape any reference articles, skipping...');
        continue;
      }

      // Step 3: Enhance with Gemini
      const enhancedContent = await enhanceArticleWithGemini(article, referenceArticles);
      await wait(2000);

      // Step 4: Add citations
      const citationsText = '\n\n---\n**References:**\n' +
        referenceArticles.map((ref, idx) => 
          `${idx + 1}. [${ref.title}](${ref.url})`
        ).join('\n');

      const finalContent = enhancedContent + citationsText;

      // Step 5: Update article in database
      console.log(`  Updating article in database...`);
      await Article.findByIdAndUpdate(article._id, {
        updatedContent: finalContent,
        isUpdated: true,
        references: referenceArticles.map(ref => ({
          title: ref.title,
          url: ref.url
        }))
      });

      console.log(`  ✅ Article enhanced and saved!`);
      await wait(5000); // Delay between articles
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All articles enhanced successfully!');

  } catch (error) {
    console.error('❌ Enhancement failed:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
    await mongoose.disconnect();
    console.log('Process completed');
  }
}

enhanceArticles();
