import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai

router = APIRouter()

class ChatPart(BaseModel):
    text: str

class ChatMessage(BaseModel):
    role: str
    parts: List[ChatPart]

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    user_context: Optional[dict] = None

@router.post("/")
async def chat_endpoint(request: ChatRequest):
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("ERROR: GEMINI_API_KEY is missing")
            raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured on server")

        genai.configure(api_key=api_key)
        
        # Setup model
        model = genai.GenerativeModel(
            model_name="gemini-flash-latest",
        )

        # Prepare messages in Gemini format
        messages = []
        
        # Add system instruction
        system_instruction = f"""You are VoteX, a professional election assistant for India.
        User Context: Age {request.user_context.get('age') if request.user_context else 'Unknown'}, 
        Location {request.user_context.get('location') if request.user_context else 'Unknown'}.
        Registration: {request.user_context.get('registrationStatus') if request.user_context else 'Unknown'}.
        """
        
        # Convert history
        for m in request.history:
            messages.append({
                "role": "user" if m.role == "user" else "model",
                "parts": [{"text": p.text} for p in m.parts]
            })

        # Add current message
        messages.append({
            "role": "user",
            "parts": [{"text": f"{system_instruction}\n\nUser Question: {request.message}"}]
        })

        print(f"Generating content with message count: {len(messages)}")
        response = model.generate_content(messages)
        
        if not response.text:
             print("ERROR: Gemini returned empty response")
             return {"text": "I'm sorry, I couldn't generate a response. Please try again."}

        return {"text": response.text}

    except Exception as e:
        print(f"GEMINI ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")
