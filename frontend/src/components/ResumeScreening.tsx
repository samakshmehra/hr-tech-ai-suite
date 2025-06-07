import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { screeningApi, ScreeningResponse } from '../services/api';

const ResumeScreening: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScreeningResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please upload a PDF file');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false
  });

  const handleSubmit = async () => {
    if (!selectedFile || !jobDescription) return;

    setLoading(true);
    setError(null);
    try {
      const response = await screeningApi.screenResume(selectedFile, jobDescription);
      if (!response || typeof response.match_score !== 'number' || !Array.isArray(response.highlighted_skills) || !Array.isArray(response.recommendations)) {
        throw new Error('Invalid response format from server');
      }
      setResult(response);
    } catch (err: any) {
      console.error('Error details:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to process resume. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleJD = () => {
    setJobDescription(`We are looking for a Software Engineer with:
- 3+ years of experience in Python and modern web frameworks
- Strong knowledge of React and TypeScript
- Experience with cloud platforms (AWS/GCP)
- Excellent problem-solving skills
- Bachelor's degree in Computer Science or related field`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Job Description
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            rows={10}
            placeholder="Paste the job description here..."
          />
          <button
            onClick={loadSampleJD}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Load Sample JD
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}
            ${selectedFile ? 'border-green-500' : ''}
            dark:border-gray-600 dark:hover:border-gray-500`}
        >
          <input {...getInputProps()} />
          {selectedFile ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Selected: {selectedFile.name}
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Drag and drop a PDF resume here, or click to select
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!selectedFile || !jobDescription || loading}
          className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white
            ${!selectedFile || !jobDescription || loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
        >
          {loading ? 'Processing...' : 'Screen Resume'}
        </button>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {result && (
          <div className="mt-4 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Screening Results
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Match Score</p>
                <p className="mt-1 text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                  {(result.match_score * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Highlighted Skills</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.highlighted_skills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recommendations</p>
                <ul className="mt-2 list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                  {result.recommendations?.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScreening; 