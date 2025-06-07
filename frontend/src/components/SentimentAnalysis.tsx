import React, { useState } from 'react';
import { sentimentApi, SentimentResponse } from '../services/api';
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline/index.js';

const SentimentAnalysis: React.FC = () => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SentimentResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const response = await sentimentApi.analyzeFeedback(feedback);
      setResult(response);
    } catch (err: any) {
      console.error('Error details:', err);
      let errorMessage = 'Failed to analyze feedback. Please try again.';
      
      if (err.response?.data?.detail) {
        errorMessage = typeof err.response.data.detail === 'string' 
          ? err.response.data.detail 
          : JSON.stringify(err.response.data.detail);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleFeedback = () => {
    setFeedback(`I've been working here for 2 years and overall it's been a great experience. The team is supportive and the work is challenging. However, I sometimes feel that the work-life balance could be improved, especially during project deadlines. The company culture is positive and there are good opportunities for growth.`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Employee Feedback Analysis</h2>
          <button
            onClick={loadSampleFeedback}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
            Load Sample Feedback
          </button>
        </div>

        <div className="space-y-4">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
            Enter Feedback
          </label>
          <textarea
            id="feedback"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[200px] resize-none"
            placeholder="Enter employee feedback or exit interview comments..."
            aria-label="Employee feedback"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!feedback.trim() || loading}
          className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white shadow-sm transition-all duration-200
            ${!feedback.trim() || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
          aria-label={loading ? 'Analyzing feedback' : 'Analyze feedback'}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze Feedback'
          )}
        </button>

        {error && (
          <div className="rounded-lg bg-red-50 p-4" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Analysis Results</h3>
            
            {/* Sentiment Score */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm font-medium text-indigo-700">Sentiment Score</p>
              <p className="mt-1 text-3xl font-bold text-indigo-600">
                {(result.sentiment_score * 100).toFixed(1)}%
              </p>
              <p className="mt-1 text-sm text-indigo-700">
                Overall sentiment: {result.sentiment}
              </p>
            </div>

            {/* Key Themes */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Key Themes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.key_themes.map((theme, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Recommendations</p>
              <ul className="mt-3 space-y-2">
                {result.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-500 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalysis; 