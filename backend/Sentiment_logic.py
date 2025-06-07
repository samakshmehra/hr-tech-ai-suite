from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from pathlib import Path
import os

# 1. JSON Schema for structured output
json_schema = {
    "title": "EmployeeSentimentAnalysis",
    "description": "Analyze employee feedback and predict attrition risk and engagement strategies.",
    "type": "object",
    "properties": {
        "sentiment": {
            "type": "string",
            "description": "Overall sentiment of the feedback",
            "enum": ["Positive", "Neutral", "Negative"]
        },
        "attrition_risk": {
            "type": "string",
            "description": "Risk of employee leaving the company",
            "enum": ["High", "Medium", "Low"]
        },
        "issues_detected": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Key issues or pain points mentioned in feedback"
        },
        "engagement_recommendations": {
            "type": "array",
            "items": {"type": "string"},
            "description": "Personalized strategies to improve engagement"
        }
    },
    "required": ["sentiment", "attrition_risk", "issues_detected", "engagement_recommendations"]
}

# Load environment variables from the backend directory so GOOGLE_API_KEY is available
dotenv_path = Path(__file__).resolve().parent / ".env"
load_dotenv(dotenv_path)

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY environment variable is not set")

# 2. Configure Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-1.5-flash",
    google_api_key=GOOGLE_API_KEY,
    temperature=0.3
)

structured_llm = llm.with_structured_output(json_schema)

# 3. Prompt Template
prompt = PromptTemplate.from_template("""
You are an HR analyst.

Given the following employee feedback:
{employee_feedback}

Analyze it and return a structured JSON response with:
- Overall sentiment (Positive/Neutral/Negative)
- Attrition risk (High/Medium/Low)
- Key issues
- Engagement recommendations
""")

chain = prompt | structured_llm

def analyze_feedback(employee_feedback: str):
    """
    Analyze employee feedback and return structured sentiment analysis.
    """
    return chain.invoke({"employee_feedback": employee_feedback})
