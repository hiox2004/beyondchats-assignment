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

async function deleteAllArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondchats');
    console.log('🔗 Connected to MongoDB\n');

    const result = await Article.deleteMany({});

    console.log(`✅ Deleted ${result.deletedCount} articles from database`);
    console.log('🗑️  Database is now clean - ready to scrape fresh!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

deleteAllArticles();
