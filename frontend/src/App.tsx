import React, { useState } from 'react';
import ResumeScreening from './components/ResumeScreening';
import SentimentAnalysis from './components/SentimentAnalysis';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline/index.js';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'screening' | 'sentiment'>('screening');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Resume Screening', id: 'screening' },
    { name: 'Sentiment Analysis', id: 'sentiment' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
          <div className="flex h-16 items-center justify-between px-4">
            <h1 className="text-xl font-bold text-gray-900">HR-Tech AI Suite</h1>
            <button
              type="button"
              className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id as 'screening' | 'sentiment');
                    setSidebarOpen(false);
                  }}
                  className={`${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold text-gray-900">HR-Tech AI Suite</h1>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as 'screening' | 'sentiment')}
                  className={`${
                    activeTab === item.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium`}
                >
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white shadow">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {activeTab === 'screening' ? <ResumeScreening /> : <SentimentAnalysis />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App; 