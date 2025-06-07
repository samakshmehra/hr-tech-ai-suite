from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from schemas import FeedbackResponse
from dotenv import load_dotenv
import os
import logging

# Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY environment variable is not set")

def analyze_feedback(employee_feedback: str):
    """Analyze employee feedback and return structured sentiment insights."""
    try:
        # Load model & parser
        parser = JsonOutputParser(pydantic_object=FeedbackResponse)
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3
        )
        format_instructions = parser.get_format_instructions()

        # Prompt
        prompt = PromptTemplate.from_template("""
        You are an HR analyst specializing in employee feedback analysis.

        Feedback:
        ---
        {employee_feedback}
        ---

        {format_instructions}
        
        Important:
        - Only return valid JSON
        - No markdown, explanations, or extra text
        """)

        # Run model
        response = llm.invoke(prompt.format(
            employee_feedback=employee_feedback,
            format_instructions=format_instructions
        ))

        # Parse response
        result = parser.parse(response.content)
        return result if isinstance(result, dict) else result.dict()

    except Exception as e:
        logger.error("Error during feedback analysis", exc_info=True)
        raise Exception(f"Feedback analysis failed: {e}")
