from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from screening_logic import process_resume
from Sentiment_logic import analyze_feedback
from schemas import FeedbackRequest, FeedbackResponse
import os
from pathlib import Path
import uvicorn
from dotenv import load_dotenv
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI(title="HR-Tech AI Suite")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory if it doesn't exist
UPLOADS_DIR = Path("uploads")
UPLOADS_DIR.mkdir(exist_ok=True)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    logger.info(f"Request started: {request.method} {request.url}")
    
    try:
        response = await call_next(request)
        process_time = time.time() - start_time
        logger.info(f"Request completed: {request.method} {request.url} - Status: {response.status_code} - Time: {process_time:.2f}s")
        return response
    except Exception as e:
        logger.error(f"Request failed: {request.method} {request.url} - Error: {str(e)}")
        raise

@app.post("/screening")
async def screen_resume(
    file: UploadFile = File(...),
    text: str = Form(...)
):
    """
    Process a resume against a job description
    """
    logger.info(f"Received screening request for file: {file.filename}")
    logger.info(f"Job description length: {len(text)} characters")
    
    if not file.filename.lower().endswith('.pdf'):
        logger.error(f"Invalid file type: {file.filename}")
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    try:
        # Save the uploaded file
        file_path = UPLOADS_DIR / file.filename
        logger.info(f"Saving file to: {file_path}")
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        logger.info(f"File saved successfully. Size: {len(content)} bytes")
        
        # Process the resume
        logger.info("Starting resume processing...")
        result = process_resume(str(file_path), text)
        logger.info(f"Resume processing completed. Result: {result}")
        
        # Clean up the uploaded file
        os.remove(file_path)
        logger.info("Temporary file removed")
        
        return result
    except Exception as e:
        logger.error(f"Error in screen_resume: {str(e)}", exc_info=True)
        # Clean up the file if it exists
        if 'file_path' in locals() and file_path.exists():
            os.remove(file_path)
            logger.info("Cleaned up temporary file after error")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sentiment", response_model=FeedbackResponse)
async def analyze_sentiment(request: FeedbackRequest):
    """
    Analyze employee feedback for sentiment and themes
    """
    try:
        logger.info(f"Starting sentiment analysis for feedback length: {len(request.employee_feedback)}")
        result = analyze_feedback(request.employee_feedback)
        logger.info(f"Sentiment analysis completed. Result: {result}")
        return result
    except Exception as e:
        logger.error(f"Error in analyze_sentiment: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
