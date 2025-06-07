from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from schemas import FeedbackResponse
from dotenv import load_dotenv
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise EnvironmentError("GOOGLE_API_KEY environment variable is not set")

def analyze_feedback(employee_feedback: str):
    """
    Analyze employee feedback and return structured sentiment analysis.
    
    Args:
        employee_feedback: String containing the employee's feedback
        
    Returns:
        Dictionary containing:
        - sentiment: "positive", "neutral", or "negative"
        - sentiment_score: float between 0 and 1
        - key_themes: list of strings
        - recommendations: list of strings
    """
    try:
        logger.info(f"Starting sentiment analysis for feedback length: {len(employee_feedback)}")
        
        # Configure Gemini model and JSON parser
        parser = JsonOutputParser(pydantic_object=FeedbackResponse)
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3
        )

        # Create prompt with schema instructions
        prompt = PromptTemplate.from_template("""
        You are an HR analyst specializing in employee feedback analysis.

        Given the following employee feedback:
        {employee_feedback}

        {format_instructions}

        Guidelines:
        1. sentiment should be one of: "positive", "neutral", "negative"
        2. sentiment_score should be a number between 0 and 1
        3. key_themes should be an array of strings identifying main themes in the feedback
        4. recommendations should be an array of strings with specific suggestions
        5. Return ONLY the JSON object, no additional text
        """)

        # Run the model
        logger.info("Running sentiment analysis with Gemini...")
        response = llm.invoke(prompt.format(
            employee_feedback=employee_feedback,
            format_instructions=parser.get_format_instructions()
        ))
        logger.info(f"Raw model response: {response}")

        # Parse the response using JSON parser
        try:
            result = parser.parse(response.content)
            logger.info(f"Parsed result: {result}")
            
            # Ensure sentiment_score is between 0 and 1
            if isinstance(result, dict) and "sentiment_score" in result:
                result["sentiment_score"] = max(0.0, min(1.0, float(result["sentiment_score"])))
            
            logger.info(f"Final result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing model response: {e}")
            raise ValueError(f"Error processing model response: {e}")

    except Exception as e:
        logger.error(f"Error in analyze_feedback: {str(e)}", exc_info=True)
        raise Exception(f"Error analyzing feedback: {str(e)}")
