#!/usr/bin/env node

/**
 * Reset State Files Utility
 * Resets scraper/enhancer states or clears entire database
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '../../', '.env.local') });

const SCRAPER_STATE_FILE = path.join(__dirname, 'scraper-state.json');
const ENHANCER_STATE_FILE = path.join(__dirname, 'enhance-state.json');

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

const command = process.argv[2];

function resetScraperState() {
  try {
    if (fs.existsSync(SCRAPER_STATE_FILE)) {
      fs.unlinkSync(SCRAPER_STATE_FILE);
      console.log('✅ Scraper state reset - will start from page 1 on next run');
    } else {
      console.log('ℹ️  Scraper state file not found (already clean)');
    }
  } catch (error) {
    console.error('❌ Error resetting scraper state:', error.message);
    process.exit(1);
  }
}

async function deleteAllArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondchats');
    
    const result = await Article.deleteMany({});
    
    // Also reset state files
    if (fs.existsSync(SCRAPER_STATE_FILE)) {
      fs.unlinkSync(SCRAPER_STATE_FILE);
    }
    if (fs.existsSync(ENHANCER_STATE_FILE)) {
      fs.unlinkSync(ENHANCER_STATE_FILE);
    }
    
    console.log(`✅ Deleted ${result.deletedCount} articles from MongoDB`);
    console.log('✅ Reset all state files');
    console.log('🗑️  Complete database wipe - ready to start completely fresh!\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

// Handle commands
switch (command) {
  case 'scraper':
    resetScraperState();
    break;
  case 'db':
    deleteAllArticles();
    break;
  default:
    console.log(`
🔄 Reset Utility

Usage:
  npm run reset-scraper    - Reset scraper state (start from page 1)
  npm run reset-full       - Delete ALL articles + reset states

Examples:
  npm run reset-scraper    # Start scraping from page 1
  npm run reset-full       # Complete fresh start
    `);
    break;
}


