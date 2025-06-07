from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class FeedbackRequest(BaseModel):
    employee_feedback: str

class FeedbackResponse(BaseModel):
    sentiment_score: float = Field(..., description="A score from 0 to 1 indicating how positive or negative the sentiment is")
    key_themes: List[str] = Field(..., description="List of key themes/topics mentioned in the feedback")
    sentiment: Literal["positive", "neutral", "negative"] = Field(..., description="Overall sentiment classification of the feedback")
    recommendations: List[str] = Field(..., description="Actionable suggestions to improve employee satisfaction or resolve concerns")

class ScreeningResponse(BaseModel):
    overallMatchScore: float = Field(..., description="A score from 0 to 100 indicating how well the resume matches the job description")
    matchingSkills: List[str] = Field(..., description="An array of strings listing skills from the resume that match the job description")
    missingSkills: List[str] = Field(..., description="An array of strings listing key skills from the job description that are missing or not evident in the resume")
    experienceMatch: str = Field(..., description="A brief summary (1-2 sentences) of how the candidate's experience aligns with the job requirements")
    qualificationMatch: str = Field(..., description="A brief summary (1-2 sentences) of how the candidate's qualifications align")
    summary: str = Field(..., description="A concise overall assessment (2-3 sentences)")
