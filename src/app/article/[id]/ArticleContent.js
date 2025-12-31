'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function ArticleContent({ 
  content, 
  updatedContent, 
  isUpdated 
}) {
  const [showOriginal, setShowOriginal] = useState(false);

  return (
    <>
      {isUpdated && (
        <div className="mb-8">
          <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-gray-900">AI-Enhanced Version Available</p>
                <p className="text-sm text-gray-600">Click the button to toggle between original and enhanced content</p>
              </div>
            </div>
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`px-6 py-2 rounded-lg font-bold whitespace-nowrap transition-all duration-300 ${
                showOriginal 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
              }`}
            >
              {showOriginal ? '📄 Show Enhanced' : '✨ Show Original'}
            </button>
          </div>
        </div>
      )}

      <div className="prose prose-lg max-w-none 
        prose-headings:text-gray-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4
        prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl
        prose-p:text-gray-900 prose-p:leading-relaxed prose-p:mb-6
        prose-strong:text-gray-900 prose-strong:font-bold
        prose-em:text-gray-800 prose-em:italic
        prose-ul:my-6 prose-ul:list-disc prose-ul:pl-8 prose-ul:space-y-2
        prose-ol:my-6 prose-ol:list-decimal prose-ol:pl-8 prose-ol:space-y-2
        prose-li:text-gray-900 prose-li:mb-2
        prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:pl-4 prose-blockquote:py-3 prose-blockquote:my-6
        prose-blockquote:text-gray-900 prose-blockquote:italic
        prose-a:text-blue-600 prose-a:no-underline prose-a:font-semibold hover:prose-a:text-blue-800 hover:prose-a:underline
        prose-code:bg-gray-900 prose-code:text-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
        prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:p-4
        prose-img:rounded-lg prose-img:shadow-md
        text-gray-900">
        <ReactMarkdown>
          {showOriginal ? content : (updatedContent || content)}
        </ReactMarkdown>
      </div>
    </>
  );
}
