import axios from 'axios';

const API = process.env.REACT_APP_API_BASE_URL!;
console.log("Calling API at:", API);

const api = axios.create({
  baseURL: API,
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
    const response = await api.post<SentimentResponse>('/sentiment', { employee_feedback: text });
    return response.data;
  },
};

export default api; 