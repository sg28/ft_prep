from typing import List, Dict, AsyncGenerator
from openai import AsyncOpenAI
from app.config import settings
from app.utils.logger import setup_logger

logger = setup_logger(__name__)


class LLMService:
    """Service for LLM interactions using OpenAI API."""
    
    def __init__(self):
        """Initialize LLM service."""
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.llm_model
        logger.info(f"LLM service initialized with model: {self.model}")
    
    async def generate_response(
        self,
        message: str,
        context: str = "",
        system_prompt: str = None
    ) -> str:
        """
        Generate a response using the LLM.
        
        Args:
            message: User message
            context: Retrieved context from RAG
            system_prompt: Optional system prompt override
            
        Returns:
            Generated response text
        """
        if system_prompt is None:
            system_prompt = self._get_default_system_prompt()
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        if context:
            messages.append({
                "role": "system",
                "content": f"Use the following context to answer the user's question:\n\n{context}"
            })
        
        messages.append({"role": "user", "content": message})
        
        try:
            logger.info(f"Generating response for message: {message[:50]}...")
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=settings.max_tokens,
                temperature=settings.temperature
            )
            
            result = response.choices[0].message.content
            logger.info(f"Generated response: {result[:100]}...")
            return result
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            raise
    
    async def stream_response(
        self,
        message: str,
        context: str = "",
        system_prompt: str = None
    ) -> AsyncGenerator[str, None]:
        """
        Stream a response using the LLM.
        
        Args:
            message: User message
            context: Retrieved context from RAG
            system_prompt: Optional system prompt override
            
        Yields:
            Response chunks
        """
        if system_prompt is None:
            system_prompt = self._get_default_system_prompt()
        
        messages = [
            {"role": "system", "content": system_prompt}
        ]
        
        if context:
            messages.append({
                "role": "system",
                "content": f"Use the following context to answer the user's question:\n\n{context}"
            })
        
        messages.append({"role": "user", "content": message})
        
        try:
            logger.info(f"Streaming response for message: {message[:50]}...")
            stream = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=settings.max_tokens,
                temperature=settings.temperature,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"Error streaming response: {str(e)}")
            raise
    
    async def detect_intent(self, message: str) -> Dict:
        """
        Detect the intent of a user message.
        
        Args:
            message: User message
            
        Returns:
            Dictionary with intent, confidence, and entities
        """
        import json
        import re
        
        intent_prompt = """Analyze the following user message and determine the intent.

Possible intents:
- query_templates: User wants to know what projects/templates are available to create
- create_project: User wants to create a new project
- query_form: User wants information about forms
- query_org: User wants organizational information
- query_project: User wants project-related information
- query_policy: User wants to know about policies
- submit_request: User wants to submit a request
- check_status: User wants to check status of something
- general_question: General question
- other: None of the above

Look for phrases like:
- "what projects can I create"
- "what templates are available"
- "show me available templates"
- "list project types"
- "what can I build"
- "create a project"
- "make a new project"

You MUST respond with valid JSON only. Do not include any text before or after the JSON.

Example response:
{"intent": "query_templates", "confidence": 0.9, "entities": {"search_term": "java"}}

User message: {message}"""
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an intent classification system. You MUST respond with valid JSON only, no additional text."},
                    {"role": "user", "content": intent_prompt.format(message=message)}
                ],
                temperature=0.1,
                max_tokens=150,
                response_format={"type": "json_object"}
            )
            
            # Get the response content
            content = response.choices[0].message.content.strip()
            logger.debug(f"Raw intent response: {content}")
            
            # Clean up common malformed responses
            if content.startswith('"') and content.endswith('"') and content.count('"') == 2:
                # Handle case where response is just "intent" or similar
                logger.warning(f"Malformed intent response, using fallback: {content}")
                return {
                    "intent": "general_question",
                    "confidence": 0.7,
                    "entities": {}
                }
            
            # Try to extract JSON from the response if it contains extra text
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                content = json_match.group()
            elif not content.startswith('{'):
                # If no JSON found, create a fallback
                logger.warning(f"No valid JSON found in response: {content}")
                return {
                    "intent": "general_question", 
                    "confidence": 0.6,
                    "entities": {}
                }
            
            result = json.loads(content)
            
            # Validate the result has required fields
            if "intent" not in result:
                result["intent"] = "unknown"
            if "confidence" not in result:
                result["confidence"] = 0.0
            if "entities" not in result:
                result["entities"] = {}
                
            logger.info(f"Detected intent: {result.get('intent')} with confidence {result.get('confidence')}")
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error in intent detection: {str(e)}")
            logger.error(f"Raw response was: {response.choices[0].message.content if 'response' in locals() else 'No response'}")
            return {
                "intent": "general_question",
                "confidence": 0.5,
                "entities": {}
            }
        except Exception as e:
            logger.error(f"Error detecting intent: {str(e)}")
            return {
                "intent": "unknown",
                "confidence": 0.0,
                "entities": {}
            }
    
    def _get_default_system_prompt(self) -> str:
        """Get the default system prompt."""
        return """
        You are an internal AI assistant helping company employees with their queries.
        
        Your role is to:
        - Answer questions about company forms, organizational structure, and policies
        - Help users understand processes and procedures
        - Assist with submitting requests and checking statuses
        - Provide accurate information based on the context provided
        
        Guidelines:
        - Be helpful, professional, and concise
        - If you don't have enough information, say so
        - Base your answers on the provided context when available
        - For sensitive matters, direct users to appropriate channels
        - Always maintain confidentiality and data privacy
        """
