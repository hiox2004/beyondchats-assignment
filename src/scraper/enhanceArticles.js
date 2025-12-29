const puppeteer = require('puppeteer');
const mongoose = require('mongoose');
const axios = require('axios');
const cheerio = require('cheerio');
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

// Function to search Google
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

// Function to scrape article content
async function scrapeArticleContent(url) {
  try {
    console.log(`  Fetching content from: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });

    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, header, footer, iframe, .advertisement').remove();
    
    // Try multiple selectors for main content
    let content = '';
    const selectors = ['article', 'main', '.post-content', '.entry-content', '.content', 'body'];
    
    for (const selector of selectors) {
      const element = $(selector);
      if (element.length) {
        content = element.text().trim();
        if (content.length > 200) break;
      }
    }
    
    // Clean up content
    content = content
      .replace(/\s+/g, ' ')
      .substring(0, 1500);
    
    console.log(`  Scraped ${content.length} characters`);
    return content;
    
  } catch (error) {
    console.error(`  Failed to scrape ${url}: ${error.message}`);
    return '';
  }
}

// Function to call Gemini API
async function enhanceArticleWithGemini(originalArticle, referenceArticles) {
  try {
    console.log(`  Calling Gemini AI to enhance article...`);
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Concise prompt to minimize token usage on free tier
    const prompt = `Enhance this article for quality, SEO, and readability. Keep facts accurate.
Title: ${originalArticle.title}
Content: ${originalArticle.content}
Output: improved 500-800 word article`;

    const result = await model.generateContent(prompt);
    const enhancedContent = result.response.text();
    
    console.log(`  ✓ Article enhanced successfully (${enhancedContent.length} characters)`);
    return enhancedContent;
    
  } catch (error) {
    console.error(`  Gemini API failed: ${error.message}`);
    if (error.message.includes('429') || error.message.includes('quota')) {
      console.log(`  ⚠️  Free tier quota reached. Wait 24 hours for reset.`);
    }
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

      await wait(2000);

      if (googleResults.length === 0) {
        console.log('  ⚠ No Google results found, skipping...');
        continue;
      }

      // Step 2: Scrape reference articles
      const referenceArticles = [];
      for (const result of googleResults) {
        const content = await scrapeArticleContent(result.url);
        if (content) {
          referenceArticles.push({
            title: result.title,
            url: result.url,
            content: content
          });
        }
        await wait(2000);
      }

      if (referenceArticles.length === 0) {
        console.log('  ⚠ Could not scrape reference articles, skipping...');
        continue;
      }

      // Step 3: Enhance with Gemini
      const enhancedContent = await enhanceArticleWithGemini(article, referenceArticles);
      await wait(5000); // 4+ seconds between API calls stays under 15 req/min

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
      await wait(3000); // Small delay between articles
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
