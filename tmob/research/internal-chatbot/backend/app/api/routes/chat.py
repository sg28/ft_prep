from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from app.models.schemas import ChatRequest, ChatResponse, IntentRequest, IntentResponse
from app.core.rag import RAGSystem
from app.core.llm import LLMService
from app.services.template_service import TemplateInfoService
from app.utils.helpers import generate_conversation_id
from app.utils.logger import setup_logger
from datetime import datetime
import json

router = APIRouter()
logger = setup_logger(__name__)

# Initialize services (will be properly initialized on first use)
rag_system = None
llm_service = None
template_service = None


def get_rag_system() -> RAGSystem:
    """Get or initialize RAG system."""
    global rag_system
    if rag_system is None:
        rag_system = RAGSystem()
    return rag_system


def get_llm_service() -> LLMService:
    """Get or initialize LLM service."""
    global llm_service
    if llm_service is None:
        llm_service = LLMService()
    return llm_service


def get_template_service() -> TemplateInfoService:
    """Get or initialize Template service."""
    global template_service
    if template_service is None:
        template_service = TemplateInfoService()
    return template_service


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Send a message and get a response from the chatbot.
    
    Args:
        request: Chat request with message and optional conversation ID
        
    Returns:
        Chat response with assistant message and metadata
    """
    try:
        logger.info(f"Received chat request: {request.message[:50]}...")
        
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or generate_conversation_id()
        
        # Get services
        rag = get_rag_system()
        llm = get_llm_service()
        template_svc = get_template_service()
        
        # Detect intent first to determine response strategy
        intent_result = {"intent": "general_question", "confidence": 0.7}
        try:
            intent_result = await llm.detect_intent(request.message)
        except Exception as e:
            logger.warning(f"Intent detection failed, using fallback: {str(e)}")
        
        intent = intent_result.get("intent", "general_question")
        confidence = intent_result.get("confidence", 0.7)
        
        # Handle template-related queries specially
        if intent == "query_templates" and confidence > 0.7:
            logger.info("Processing template query")
            try:
                response_text = template_svc.handle_template_query(request.message)
                sources = [
                    {
                        "content": "Template information from internal knowledge base",
                        "metadata": {"type": "template_catalog", "source": "templates.json"}
                    }
                ]
                
                response = ChatResponse(
                    message=response_text,
                    conversation_id=conversation_id,
                    sources=sources,
                    intent=intent,
                    confidence=confidence,
                    timestamp=datetime.now().isoformat()
                )
                return response
                
            except Exception as e:
                logger.error(f"Error processing template query: {str(e)}")
                # Fall back to regular RAG if template service fails
        
        # Regular RAG processing for other queries
        sources = None
        context = ""
        if request.use_rag:
            logger.info("Retrieving relevant context from vector store")
            retrieved_docs = rag.retrieve(request.message)
            sources = [
                {
                    "content": doc.page_content[:200],
                    "metadata": doc.metadata
                }
                for doc in retrieved_docs
            ]
            context = "\n\n".join([doc.page_content for doc in retrieved_docs])
        
        # Generate response using LLM
        logger.info("Generating response with LLM")
        response_text = await llm.generate_response(
            message=request.message,
            context=context
        )
        
        response = ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            sources=sources if request.use_rag else None,
            intent=intent,
            confidence=confidence,
            timestamp=datetime.now().isoformat()
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")


@router.post("/intent", response_model=IntentResponse)
async def detect_intent(request: IntentRequest):
    """
    Detect the intent of a user message.
    
    Args:
        request: Intent request with message
        
    Returns:
        Detected intent and confidence
    """
    try:
        logger.info(f"Detecting intent for: {request.message[:50]}...")
        
        llm = get_llm_service()
        result = await llm.detect_intent(request.message)
        
        return IntentResponse(
            intent=result.get("intent", "unknown"),
            confidence=result.get("confidence", 0.0),
            entities=result.get("entities")
        )
        
    except Exception as e:
        logger.error(f"Error detecting intent: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error detecting intent: {str(e)}")


@router.post("/templates", response_model=ChatResponse)
async def query_templates(request: ChatRequest):
    """
    Get information about available project templates.
    
    Args:
        request: Chat request with template-related query
        
    Returns:
        Template information response
    """
    try:
        logger.info(f"Template query received: {request.message[:50]}...")
        
        conversation_id = request.conversation_id or generate_conversation_id()
        template_svc = get_template_service()
        
        # Process template query
        response_text = template_svc.handle_template_query(request.message)
        
        sources = [
            {
                "content": "Template information from internal knowledge base",
                "metadata": {"type": "template_catalog", "source": "templates.json"}
            }
        ]
        
        response = ChatResponse(
            message=response_text,
            conversation_id=conversation_id,
            sources=sources,
            intent="query_templates",
            confidence=1.0,
            timestamp=datetime.now().isoformat()
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing template query: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing template query: {str(e)}")


@router.websocket("/chat/stream")
async def chat_stream(websocket: WebSocket):
    """
    WebSocket endpoint for streaming chat responses.
    
    Args:
        websocket: WebSocket connection
    """
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            message = message_data.get("message", "")
            use_rag = message_data.get("use_rag", True)
            
            logger.info(f"Received WebSocket message: {message[:50]}...")
            
            # Get services
            rag = get_rag_system()
            llm = get_llm_service()
            
            # Retrieve context if RAG enabled
            context = ""
            if use_rag:
                retrieved_docs = rag.retrieve(message)
                context = "\n\n".join([doc.page_content for doc in retrieved_docs])
            
            # Stream response
            async for chunk in llm.stream_response(message, context):
                await websocket.send_text(json.dumps({"chunk": chunk}))
            
            # Send completion signal
            await websocket.send_text(json.dumps({"done": True}))
            
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.close()
