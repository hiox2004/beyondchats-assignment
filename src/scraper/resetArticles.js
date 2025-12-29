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

async function resetArticles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/beyondchats');
    console.log('Connected to MongoDB\n');

    const result = await Article.updateMany(
      {},
      {
        $set: { isUpdated: false },
        $unset: { updatedContent: "", references: "" }
      }
    );

    console.log(`✅ Reset ${result.modifiedCount} articles`);
    console.log('All articles are now ready for enhancement again!\n');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

resetArticles();
