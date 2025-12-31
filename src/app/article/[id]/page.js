import { notFound } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Article from '@/models/Article';
import ArticleContent from './ArticleContent';

async function getArticle(id) {
  try {
    await connectDB();
    const article = await Article.findById(id).lean();

    if (!article) return null;

    return {
      ...article,
      _id: article._id.toString(),
      createdAt: article.createdAt.toISOString(),
      updatedAt: article.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

export default async function ArticlePage({ params }) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition-colors"
          >
            <span className="text-xl">←</span> Back to Articles
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100">
          {/* Header */}
          <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          
          <div className="p-8 md:p-12">
            {/* Status Badge */}
            {article.isUpdated && (
              <div className="mb-6 inline-block">
                <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-sm font-bold px-4 py-2 rounded-full animate-pulse">
                  ✨ AI ENHANCED VERSION
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {article.title}
            </h1>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-4 pb-8 border-b-2 border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span className="text-gray-700 font-semibold">{article.author}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">📅</span>
                <time className="text-gray-700">
                  {new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </time>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-2">
                <span className="text-lg">📚</span>
                <span className="text-gray-700 text-sm">
                  {Math.ceil(article.content.split(' ').length / 200)} min read
                </span>
              </div>
            </div>

            {/* Article Content */}
            <div className="py-8">
              <ArticleContent
                content={article.content}
                updatedContent={article.updatedContent}
                isUpdated={article.isUpdated}
              />
            </div>

            {/* References Section */}
            {article.references && article.references.length > 0 && (
              <div className="mt-12 pt-8 border-t-2 border-slate-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>📖</span> References & Sources
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {article.references.map((ref, index) => (
                    <a
                      key={index}
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:border-blue-400 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl font-bold text-blue-600 min-w-8">{index + 1}.</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-blue-600 group-hover:text-blue-800 font-semibold line-clamp-2 group-hover:underline transition-colors">
                            {ref.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{ref.url}</p>
                        </div>
                        <span className="text-lg group-hover:translate-x-1 transition-transform">↗</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Original Article Link */}
            <div className="mt-8 pt-8 border-t-2 border-slate-200">
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              >
                <span>🔗</span> Visit Original Article
                <span>↗</span>
              </a>
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}
