import React, { useState } from 'react';
import { sentimentApi, SentimentResponse } from '../services/api';

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
    } catch (err) {
      setError('Failed to analyze feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadSampleFeedback = () => {
    setFeedback(`I've been working here for 2 years and overall it's been a great experience. The team is supportive and the work is challenging. However, I sometimes feel that the work-life balance could be improved, especially during project deadlines. The company culture is positive and there are good opportunities for growth.`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Employee Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          rows={8}
          placeholder="Enter employee feedback or exit interview comments..."
        />
        <button
          onClick={loadSampleFeedback}
          className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Load Sample Feedback
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!feedback.trim() || loading}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
          ${!feedback.trim() || loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
          }`}
      >
        {loading ? 'Analyzing...' : 'Analyze Feedback'}
      </button>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {result && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Analysis Results
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Sentiment Score</p>
              <p className="mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                {(result.sentiment_score * 100).toFixed(1)}%
              </p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                Overall sentiment: {result.sentiment}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Key Themes</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {result.key_themes.map((theme, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                  >
                    {theme}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SentimentAnalysis; 