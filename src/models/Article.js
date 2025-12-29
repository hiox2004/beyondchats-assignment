import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  author: String,
  date: String,
  url: String,
  isUpdated: {
    type: Boolean,
    default: false
  },
  updatedContent: String,
  references: [{
    title: String,
    url: String
  }]
}, {
  timestamps: true
});

export default mongoose.models.Article || mongoose.model('Article', articleSchema);
