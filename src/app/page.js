'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredArticles = filter === 'enhanced' 
    ? articles.filter(a => a.isUpdated)
    : articles;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 bg-white rounded-full"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Loading articles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="animate-fadeInUp">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                BeyondChats
              </h1>
              <p className="mt-2 text-gray-600 text-lg">AI-Enhanced Blog Articles</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                }`}
              >
                All ({articles.length})
              </button>
              <button
                onClick={() => setFilter('enhanced')}
                className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  filter === 'enhanced'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                }`}
              >
                ✨ Enhanced ({articles.filter(a => a.isUpdated).length})
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <Link href={`/article/${article._id}`} key={article._id}>
                <div 
                  className="h-full bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden hover:-translate-y-1 group cursor-pointer border border-slate-100"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Card Header with Gradient */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  
                  <div className="p-6">
                    {/* Status Badge */}
                    {article.isUpdated && (
                      <div className="mb-3 inline-block">
                        <span className="bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
                          ✨ AI ENHANCED
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {article.title}
                    </h2>

                    {/* Preview */}
                    <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
                      {article.content.substring(0, 150)}...
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span className="font-medium">By {article.author}</span>
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        Read Article
                        <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📄</div>
            <p className="text-gray-500 text-xl">No articles found</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">BeyondChats</h3>
              <p className="text-gray-600 text-sm">AI-powered blog article enhancement</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Features</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>AI Content Enhancement</li>
                <li>SEO Optimization</li>
                <li>Reference Citations</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Tech Stack</h3>
              <ul className="text-gray-600 text-sm space-y-1">
                <li>Next.js & React</li>
                <li>Gemini AI</li>
                <li>MongoDB</li>
              </ul>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-200">
            <p className="text-center text-gray-600 text-sm">
              © 2025 BeyondChats Assignment | Full Stack Development
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
