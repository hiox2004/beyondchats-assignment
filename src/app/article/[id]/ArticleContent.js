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
        <div className="mb-6">
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            {showOriginal ? '✨ Show Enhanced Version' : '📄 Show Original Version'}
          </button>
        </div>
      )}

      <div className="prose prose-lg max-w-none 
        prose-headings:text-gray-900 prose-headings:font-bold 
        prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 
        prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 
        prose-p:text-gray-900 prose-p:leading-relaxed prose-p:mb-4 
        prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 
        prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 
        prose-li:text-gray-900 prose-li:mb-2 
        prose-strong:text-gray-900 prose-strong:font-bold 
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        text-gray-900">
        <ReactMarkdown>
          {showOriginal ? content : (updatedContent || content)}
        </ReactMarkdown>
      </div>
    </>
  );
}
