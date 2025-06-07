from langchain_community.document_loaders import PyPDFLoader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
import os
import logging
from typing import Dict, Any
from schemas import ScreeningResponse

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_resume(resume_path: str, job_description: str) -> Dict[str, Any]:
    """
    Analyze a resume against a job description and return a structured evaluation.
    """
    if not os.path.exists(resume_path):
        raise FileNotFoundError(f"Resume not found at: {resume_path}")
    
    try:
        # Load resume
        loader = PyPDFLoader(resume_path)
        resume = loader.load()[0].page_content

        # Setup model and parser
        parser = JsonOutputParser(pydantic_object=ScreeningResponse)
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=os.getenv("GOOGLE_API_KEY"),
            temperature=0.1
        )
        format_instructions = parser.get_format_instructions()

        # Prompt template
        prompt = PromptTemplate.from_template("""
        You are an expert HR assistant specializing in resume screening.

        Job Description:
        ---
        {job_description}
        ---

        Resume:
        ---
        {resume}
        ---

        {format_instructions}

        CRITICAL RULES:
        1. overallMatchScore MUST be a number (not a string)
        2. Return ONLY the JSON object
        3. No markdown formatting
        4. No explanatory text
        5. Proper JSON syntax
        """)

        # Get model response
        response = llm.invoke(prompt.format(
            resume=resume,
            job_description=job_description,
            format_instructions=format_instructions
        ))

        content = response.content.strip().removeprefix("```json").removesuffix("```").strip()

        # Parse structured result
        result = parser.parse(content)
        result_dict = result if isinstance(result, dict) else result.dict()

        # Clamp score between 0-100
        score = float(result_dict.get("overallMatchScore", 0))
        result_dict["overallMatchScore"] = max(0.0, min(100.0, score))

        return result_dict

    except Exception as e:
        logger.error("Failed to process resume", exc_info=True)
        raise Exception(f"Resume processing failed: {str(e)}")
