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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Back to Articles
        </Link>

        <article className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {article.title}
          </h1>

          <div className="flex items-center text-gray-600 mb-6 space-x-4">
            <span>By {article.author}</span>
            <span>•</span>
            <time>{new Date(article.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</time>
            {article.isUpdated && (
              <>
                <span>•</span>
                <span className="text-purple-600 font-semibold">✨ AI Enhanced</span>
              </>
            )}
          </div>

          <ArticleContent
            content={article.content}
            updatedContent={article.updatedContent}
            isUpdated={article.isUpdated}
          />


          {article.references && article.references.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">References</h2>
              <ul className="space-y-2">
                {article.references.map((ref, index) => (
                  <li key={index}>
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {index + 1}. {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              View original article →
            </a>
          </div>
        </article>
      </div>
    </div>
  );
}
