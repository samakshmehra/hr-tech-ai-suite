from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import os
from typing import Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_resume(resume_path: str, job_description: str) -> Dict[str, Any]:
    """
    Process a resume against a job description and return evaluation results.
    
    Args:
        resume_path: Path to the uploaded PDF resume
        job_description: Job description text
        
    Returns:
        Dictionary containing evaluation results with the following structure:
        {
            "match_score": float,  # Score from 0 to 1
            "highlighted_skills": List[str],  # List of matching skills
            "recommendations": List[str]  # List of recommendations
        }
    """
    try:
        logger.info(f"Starting resume processing for file: {resume_path}")
        logger.info(f"Job description length: {len(job_description)} characters")

        # 1. Load resume
        logger.info("Attempting to load PDF file...")
        if not os.path.exists(resume_path):
            raise FileNotFoundError(f"Resume file not found at path: {resume_path}")
            
        loader = PyPDFLoader(resume_path)
        docs = loader.load()
        resume = docs[0].page_content
        logger.info(f"Successfully loaded PDF. Content length: {len(resume)} characters")

        # 2. Configure Gemini model and JSON parser
        logger.info("Configuring Gemini model and JSON parser...")
        schema = {
            "type": "object",
            "properties": {
                "match_score": {
                    "type": "number",
                    "description": "Score from 0 to 1 indicating how well the resume matches the job description"
                },
                "highlighted_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of matching skills found in the resume"
                },
                "recommendations": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of specific suggestions for improvement"
                }
            },
            "required": ["match_score", "highlighted_skills", "recommendations"]
        }
        
        parser = JsonOutputParser(schema=schema)
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.1
        )

        # 3. Create prompt with schema instructions
        prompt = PromptTemplate.from_template("""
        You are an expert HR screening assistant. Analyze the resume against the job description and provide a detailed evaluation.

        Job Description:
        {job_description}

        Resume:
        {resume}

        {format_instructions}

        Guidelines:
        1. match_score should be a number between 0 and 1
        2. highlighted_skills should be an array of strings containing skills found in the resume that match the job description
        3. recommendations should be an array of strings containing specific suggestions for improvement
        4. Return ONLY the JSON object, no additional text
        """)

        # 4. Run the model
        logger.info("Running analysis with Gemini...")
        response = llm.invoke(prompt.format(
            resume=resume, 
            job_description=job_description,
            format_instructions=parser.get_format_instructions()
        ))
        logger.info(f"Raw model response: {response}")

        # 5. Parse the response using JSON parser
        try:
            result = parser.parse(response.content)
            logger.info(f"Parsed result: {result}")
            
            # Ensure match_score is between 0 and 1
            result["match_score"] = max(0.0, min(1.0, float(result["match_score"])))
            
            logger.info(f"Final result: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Error processing model response: {e}")
            raise ValueError(f"Error processing model response: {e}")

    except Exception as e:
        logger.error(f"Error in process_resume: {str(e)}", exc_info=True)
        raise Exception(f"Error processing resume: {str(e)}")