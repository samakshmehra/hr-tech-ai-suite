import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ScreeningResponse {
  match_score: number;
  highlighted_skills: string[];
  recommendations: string[];
}

export interface SentimentResponse {
  sentiment_score: number;
  key_themes: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
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
    const response = await api.post<SentimentResponse>('/sentiment', { text });
    return response.data;
  },
};

export default api; 