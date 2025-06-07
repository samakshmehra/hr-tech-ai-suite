import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { screeningApi, ScreeningResponse } from '../services/api';
import { DocumentArrowUpIcon, DocumentTextIcon } from '@heroicons/react/24/outline/index.js';

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
      if (!response || typeof response.overallMatchScore !== 'number' || 
          !Array.isArray(response.matchingSkills) || !Array.isArray(response.missingSkills)) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Description Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 min-h-[200px] max-w-md">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label htmlFor="jobDescription" className="block text-lg font-semibold text-gray-900">
                Job Description
              </label>
              <button
                onClick={loadSampleJD}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                <DocumentTextIcon className="h-4 w-4 mr-2" />
                Load Sample JD
              </button>
            </div>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 min-h-[200px] resize-none"
              placeholder="Paste the job description here..."
              aria-label="Job Description"
            />
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="flex flex-col space-y-6">
          <div
            {...getRootProps()}
            className={`relative bg-white rounded-xl shadow-sm p-8 text-center cursor-pointer transition-all duration-200
              ${isDragActive ? 'border-2 border-indigo-500 bg-indigo-50' : 'border-2 border-dashed border-gray-300 hover:border-indigo-400'}
              ${selectedFile ? 'border-green-500 bg-green-50' : ''}`}
            role="button"
            tabIndex={0}
            aria-label="Upload resume"
          >
            <input {...getInputProps()} aria-label="Upload resume file" />
            <div className="space-y-4">
              <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              {selectedFile ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Selected File</p>
                  <p className="text-sm text-gray-500">{selectedFile.name}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Upload Resume</p>
                  <p className="text-sm text-gray-500">
                    Drag and drop a PDF resume here, or click to select
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!selectedFile || !jobDescription || loading}
            className={`w-full py-3 px-4 rounded-lg text-sm font-semibold text-white shadow-sm transition-all duration-200
              ${!selectedFile || !jobDescription || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            aria-label={loading ? 'Processing resume' : 'Screen resume'}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              'Screen Resume'
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
        </div>

        {/* Screening Results Section - Full Width */}
        {result && (
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900">Screening Results</h3>
            
            {/* Match Score */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm font-medium text-indigo-700">Match Score</p>
              <p className="mt-1 text-3xl font-bold text-indigo-600">
                {result.overallMatchScore.toFixed(1)}%
              </p>
            </div>

            {/* Skills Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Matching Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.matchingSkills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700">Missing Skills</p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills?.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience & Qualification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">Experience Match</p>
                <p className="mt-1 text-sm text-gray-600">
                  {result.experienceMatch}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700">Qualification Match</p>
                <p className="mt-1 text-sm text-gray-600">
                  {result.qualificationMatch}
                </p>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700">Overall Assessment</p>
              <p className="mt-1 text-sm text-gray-600">
                {result.summary}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeScreening; 