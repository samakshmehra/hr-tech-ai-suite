# HR-Tech AI Suite

An AI-powered HR tool that provides resume screening and sentiment analysis capabilities.

## Features

- **Resume Screening**: Upload a resume (PDF) and job description to get AI-powered matching scores, highlighted skills, and recommendations.
- **Sentiment Analysis**: Analyze employee feedback or exit interview comments to understand sentiment and key themes.

## Tech Stack

### Backend
- FastAPI (Python)
- LangChain
- Google Generative AI
- PyPDF2

### Frontend
- React
- TypeScript
- Tailwind CSS
- Axios

## Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with:
   ```
   GOOGLE_API_KEY=your_google_api_key
   ```

5. Start the backend server:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`.

## API Endpoints

### Resume Screening
- **POST** `/screening`
  - Accepts multipart/form-data with:
    - `file`: PDF resume
    - `text`: Job description
  - Returns match score, highlighted skills, and recommendations

### Sentiment Analysis
- **POST** `/sentiment`
  - Accepts JSON with:
    - `text`: Employee feedback
  - Returns sentiment score, key themes, and overall sentiment

## Development

### Backend Structure
```
backend/
├── main.py              # FastAPI application setup
├── screening_logic.py   # Resume screening implementation
├── sentiment_logic.py   # Sentiment analysis implementation
├── schemas.py           # Pydantic models
└── requirements.txt     # Python dependencies
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ResumeScreening.tsx
│   │   └── SentimentAnalysis.tsx
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Environment Variables

### Backend
- `GOOGLE_API_KEY`: Your Google AI API key

### Frontend
- `REACT_APP_API_URL`: Backend API URL (defaults to http://localhost:8000)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request 