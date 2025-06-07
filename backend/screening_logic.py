from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
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

        # 2. Configure Gemini model
        logger.info("Configuring Gemini model...")
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.1
        )

        # 3. Create prompt
        prompt = PromptTemplate.from_template("""
        You are an expert HR screening assistant. Analyze the resume against the job description and provide a detailed evaluation.

        Job Description:
        {job_description}

        Resume:
        {resume}

        Provide your evaluation in the following JSON format:
        {{
            "match_score": <number between 0 and 1>,
            "highlighted_skills": [
                "<skill 1>",
                "<skill 2>",
                ...
            ],
            "recommendations": [
                "<recommendation 1>",
                "<recommendation 2>",
                ...
            ]
        }}

        Guidelines:
        1. match_score should be a number between 0 and 1
        2. highlighted_skills should be an array of strings containing skills found in the resume that match the job description
        3. recommendations should be an array of strings containing specific suggestions for improvement
        4. Return ONLY the JSON object, no additional text
        """)

        # 4. Run the model
        logger.info("Running analysis with Gemini...")
        response = llm.invoke(prompt.format(resume=resume, job_description=job_description))
        logger.info(f"Raw model response: {response}")

        # 5. Parse the response
        try:
            # Extract JSON from the response
            import json
            import re
            
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
            
            if "match_score" not in result or not isinstance(result["match_score"], (int, float)):
                raise ValueError("Invalid result format: missing or invalid match_score")
            
            if "highlighted_skills" not in result or not isinstance(result["highlighted_skills"], list):
                raise ValueError("Invalid result format: missing or invalid highlighted_skills")
            
            if "recommendations" not in result or not isinstance(result["recommendations"], list):
                raise ValueError("Invalid result format: missing or invalid recommendations")

            # Ensure match_score is between 0 and 1
            result["match_score"] = max(0.0, min(1.0, float(result["match_score"])))
            
            # Ensure arrays contain strings
            result["highlighted_skills"] = [str(skill) for skill in result["highlighted_skills"]]
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
        logger.error(f"Error in process_resume: {str(e)}", exc_info=True)
        raise Exception(f"Error processing resume: {str(e)}")