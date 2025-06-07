import axios from 'axios';

console.log("API base URL is:", process.env.REACT_APP_API_BASE_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ScreeningResponse {
  overallMatchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  experienceMatch: string;
  qualificationMatch: string;
  summary: string;
}

export interface SentimentResponse {
  sentiment_score: number;
  key_themes: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  recommendations: string[];
}

export const screeningApi = {
  screenResume: async (file: File, jobDescription: string): Promise<ScreeningResponse> => {
    console.log("API base URL is:", process.env.REACT_APP_API_BASE_URL);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', jobDescription);
    
    const response = await api.post<ScreeningResponse>('/screening', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const sentimentApi = {
  analyzeFeedback: async (text: string): Promise<SentimentResponse> => {
    console.log("API base URL is:", process.env.REACT_APP_API_BASE_URL);
    const response = await api.post<SentimentResponse>('/sentiment', { employee_feedback: text });
    return response.data;
  },
};

export default api; 