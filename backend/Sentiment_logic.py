from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import os
import logging
import json
import re

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
        
        # Configure Gemini model
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=GOOGLE_API_KEY,
            temperature=0.3
        )

        # Create prompt
        prompt = PromptTemplate.from_template("""
        You are an HR analyst specializing in employee feedback analysis.

        Given the following employee feedback:
        {employee_feedback}

        Analyze the feedback and provide a detailed evaluation in the following JSON format:
        {{
            "sentiment": "positive" or "neutral" or "negative",
            "sentiment_score": <number between 0 and 1>,
            "key_themes": [
                "<theme 1>",
                "<theme 2>",
                ...
            ],
            "recommendations": [
                "<recommendation 1>",
                "<recommendation 2>",
                ...
            ]
        }}

        Guidelines:
        1. sentiment should be one of: "positive", "neutral", "negative"
        2. sentiment_score should be a number between 0 and 1
        3. key_themes should be an array of strings identifying main themes in the feedback
        4. recommendations should be an array of strings with specific suggestions
        5. Return ONLY the JSON object, no additional text
        """)

        # Run the model
        logger.info("Running sentiment analysis with Gemini...")
        response = llm.invoke(prompt.format(employee_feedback=employee_feedback))
        logger.info(f"Raw model response: {response}")

        # Parse the response
        try:
            # Find JSON in the response
            json_match = re.search(r'\{.*\}', response.content, re.DOTALL)
            if not json_match:
                raise ValueError("No JSON object found in response")
            
            json_str = json_match.group()
            result = json.loads(json_str)
            
            logger.info(f"Parsed result: {result}")
            
            # Validate result structure
            if not isinstance(result, dict):
                raise ValueError("Invalid result format: expected dictionary")
            
            required_fields = ["sentiment", "sentiment_score", "key_themes", "recommendations"]
            for field in required_fields:
                if field not in result:
                    raise ValueError(f"Missing required field: {field}")
            
            # Validate and format sentiment
            valid_sentiments = ["positive", "neutral", "negative"]
            if result["sentiment"].lower() not in valid_sentiments:
                raise ValueError(f"Invalid sentiment value: {result['sentiment']}")
            result["sentiment"] = result["sentiment"].lower()
            
            # Validate and format sentiment score
            if not isinstance(result["sentiment_score"], (int, float)):
                raise ValueError("Invalid sentiment_score: must be a number")
            result["sentiment_score"] = max(0.0, min(1.0, float(result["sentiment_score"])))
            
            # Validate and format arrays
            if not isinstance(result["key_themes"], list):
                raise ValueError("Invalid key_themes: must be an array")
            if not isinstance(result["recommendations"], list):
                raise ValueError("Invalid recommendations: must be an array")
            
            # Ensure arrays contain strings
            result["key_themes"] = [str(theme) for theme in result["key_themes"]]
            result["recommendations"] = [str(rec) for rec in result["recommendations"]]

            logger.info(f"Final result: {result}")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse JSON from response: {e}")
            raise ValueError(f"Invalid JSON in response: {e}")
        except Exception as e:
            logger.error(f"Error processing model response: {e}")
            raise ValueError(f"Error processing model response: {e}")

    except Exception as e:
        logger.error(f"Error in analyze_feedback: {str(e)}", exc_info=True)
        raise Exception(f"Error analyzing feedback: {str(e)}")
