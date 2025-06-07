import React, { useState } from 'react';
import ResumeScreening from './components/ResumeScreening';
import SentimentAnalysis from './components/SentimentAnalysis';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'screening' | 'sentiment'>('screening');

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">HR-Tech AI Suite</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <button
                  onClick={() => setActiveTab('screening')}
                  className={`${
                    activeTab === 'screening'
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Resume Screening
                </button>
                <button
                  onClick={() => setActiveTab('sentiment')}
                  className={`${
                    activeTab === 'sentiment'
                      ? 'border-indigo-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-300 hover:border-gray-300'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Sentiment Analysis
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {activeTab === 'screening' ? <ResumeScreening /> : <SentimentAnalysis />}
      </main>
    </div>
  );
};

export default App; 