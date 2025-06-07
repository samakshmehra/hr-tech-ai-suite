from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
from pathlib import Path
import os
from typing import Dict, Any

def process_resume(resume_path: str, job_description: str) -> Dict[str, Any]:
    """
    Process a resume against a job description and return evaluation results.
    
    Args:
        resume_path: Path to the uploaded PDF resume
        job_description: Job description text
        
    Returns:
        Dictionary containing evaluation results
    """
    try:
        # 1. Load resume
        loader = PyPDFLoader(resume_path)
        docs = loader.load()
        resume = docs[0].page_content

        # 2. Create JSON Schema for structured output
        json_schema = {
            "title": "ResumeScreening",
            "description": "Evaluate a resume for a software engineer job.",
            "type": "object",
            "properties": {
                "match_score": {
                    "type": "number",
                    "description": "Score from 0 to 1 based on match quality"
                },
                "highlighted_skills": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Skills found in the resume that match the JD"
                },
                "recommendations": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Recommendations for improvement"
                }
            },
            "required": ["match_score", "highlighted_skills", "recommendations"]
        }

        # Load environment variables from the backend directory so GOOGLE_API_KEY is available
        dotenv_path = Path(__file__).resolve().parent / ".env"
        load_dotenv(dotenv_path)
        google_api_key = os.getenv("GOOGLE_API_KEY")
        if not google_api_key:
            raise EnvironmentError("GOOGLE_API_KEY environment variable is not set")

        # 3. Configure Gemini model
        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=google_api_key,
            temperature=0.1
        )

        # 4. Apply JSON schema
        structured_llm = llm.with_structured_output(json_schema)

        # 5. Create prompt
        prompt = PromptTemplate.from_template("""
        You are an expert HR screening assistant.

        Given the following Job Description:
        {job_description}

        And the following Resume:
        {resume}

        Evaluate the resume and return only a structured JSON matching the schema provided.
        Focus on identifying matching skills and providing constructive recommendations.
        """)

        # 6. Chain prompt + LLM
        chain = prompt | structured_llm

        # 7. Run the chain
        result = chain.invoke({
            "resume": resume,
            "job_description": job_description
        })

        return result

    except Exception as e:
        raise Exception(f"Error processing resume: {str(e)}")