'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function ArticlePage() {
  const params = useParams();
  const [article, setArticle] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/articles/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setArticle(data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Article not found</h1>
          <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
        </div>
      </div>
    );
  }

  const displayContent = showOriginal ? article.content : (article.updatedContent || article.content);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="text-blue-600 hover:underline">← Back to Articles</Link>
        </div>
      </header>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-lg p-8">
          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{article.title}</h1>
          
          {/* Meta */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b border-gray-200">
            <span>By {article.author}</span>
            <span>•</span>
            <span>{article.date}</span>
            {article.isUpdated && (
              <>
                <span>•</span>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                  ✨ AI Enhanced
                </span>
              </>
            )}
          </div>

          {/* Toggle Button */}
          {article.isUpdated && (
            <div className="mb-6">
              <button
                onClick={() => setShowOriginal(!showOriginal)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {showOriginal ? 'Show Enhanced Version' : 'Show Original Version'}
              </button>
            </div>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
              {displayContent}
            </div>
          </div>

          {/* References */}
          {!showOriginal && article.references && article.references.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">References</h3>
              <ul className="space-y-2">
                {article.references.map((ref, idx) => (
                  <li key={idx} className="text-blue-600 hover:underline">
                    <a href={ref.url} target="_blank" rel="noopener noreferrer">
                      {idx + 1}. {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Source Link */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a 
              href={article.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View original article →
            </a>
          </div>
        </article>
      </main>
    </div>
  );
}
