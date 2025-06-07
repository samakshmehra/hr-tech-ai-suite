from pydantic import BaseModel
from typing import List, Optional, Literal

class ResumeInfo(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    skills: List[str]
    experience: List[str]
    education: List[str]
    summary: Optional[str] = None

class EvaluationResult(BaseModel):
    match_percentage: float
    strengths: List[str]
    weaknesses: List[str]
    recommendations: List[str]

class FeedbackRequest(BaseModel):
    employee_feedback: str

class FeedbackResponse(BaseModel):
    sentiment_score: float
    key_themes: List[str]
    sentiment: Literal["positive", "neutral", "negative"]
    recommendations: List[str]

class ScreeningResponse(BaseModel):
    match_score: float
    highlighted_skills: List[str]
    recommendations: List[str]
