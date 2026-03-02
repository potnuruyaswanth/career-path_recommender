"""
INTEGRATION GUIDE: Chatbot Intelligence System
Complete implementation of all 8 features

This file shows how to integrate all modules into your FastAPI backend
"""

# ============================================================================
# 1. IMPORTS (Add to your main.py)
# ============================================================================

from fastapi import FastAPI, HTTPException, Query, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

# NEW: Import all intelligence modules
from chat_session import ChatSession, SessionManager
from clarifying_questions import ClarifyingQuestions, AmbiguityType, resolve_clarification
from data_versioning import (
    CareerStatusManager, DataVersion, DataIntegrityChecker
)
from cache_manager import (
    CacheManager, CachedDataLoader, FallbackResponses,
    ResponseCacheDecorator
)
from failure_safe_paths import FailureSafePath
from analytics import AnalyticsCollector, EventType, AnalyticsEvent
from enrich_career_data import migrate_careers_to_v2

# ============================================================================
# 2. INITIALIZE SERVICES (In FastAPI startup)
# ============================================================================

app = FastAPI(title='Career Path API with Intelligence')

# Initialize session management
session_manager = SessionManager()

# Initialize caching
cache_manager = CacheManager(ttl_seconds=3600)
cached_loader = CachedDataLoader(cache_manager)

# Initialize analytics (NO PII tracking)
analytics = AnalyticsCollector()

# Migrate data on startup (one-time)
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    print("🚀 Starting Career Path API Intelligence System")
    
    # Optional: Migrate career data with salary bands
    # migrate_careers_to_v2()
    
    print("✓ Session manager initialized")
    print("✓ Cache manager initialized")
    print("✓ Analytics collector initialized")
    print("✓ All intelligence features loaded")


# ============================================================================
# 3. REQUEST/RESPONSE MODELS
# ============================================================================

class ChatQuery(BaseModel):
    """User chat query."""
    query: str
    session_id: Optional[str] = None  # NEW: Session-based memory


class ChatResponse(BaseModel):
    """Bot response with context awareness."""
    message: str
    session_id: str
    requires_clarification: bool = False
    clarification_options: Optional[list] = None
    context: Optional[Dict[str, Any]] = None
    fallback: bool = False


# ============================================================================
# 4. CORE ENDPOINTS WITH INTELLIGENCE
# ============================================================================

@app.post("/chat/query")
async def chat_query(payload: ChatQuery):
    """
    Main chatbot endpoint with:
    - Session-level memory
    - Clarifying questions
    - Fallback responses
    - Analytics tracking
    """
    
    # Get or create session
    session = session_manager.get_session(payload.session_id)
    if not session:
        session = session_manager.create_session()
        analytics.log_session_started()
    
    query = payload.query.strip()
    
    try:
        # 1. LOG QUERY (for analytics)
        analytics.log_chatbot_query(
            intent="unknown",
            had_context=session.current_career is not None
        )
        
        # 2. DETECT AMBIGUITY
        is_ambiguous, ambiguity_type = ClarifyingQuestions.is_ambiguous(
            query,
            session.get_context()
        )
        
        if is_ambiguous:
            # Generate clarification
            clarification = None
            
            if ambiguity_type == AmbiguityType.VAGUE_INTENT:
                clarification = ClarifyingQuestions.generate_clarification_for_intent()
            elif ambiguity_type == AmbiguityType.MISSING_CONTEXT:
                clarification = ClarifyingQuestions.generate_clarification_for_context("career")
            elif ambiguity_type == AmbiguityType.MISSING_STREAM:
                clarification = ClarifyingQuestions.generate_clarification_for_context("stream")
            
            analytics.log_clarification_triggered(
                trigger_reason=str(ambiguity_type)
            )
            
            # Store pending clarification in session
            session.set_clarification_pending(
                clarification.get("options", []),
                {"type": ambiguity_type.value}
            )
            
            return ChatResponse(
                message=clarification["message"],
                session_id=session.session_id,
                requires_clarification=True,
                clarification_options=clarification["options"],
                fallback=False
            )
        
        # 3. PROCESS QUERY (with fallback)
        response = FallbackResponses.wrap_with_fallback(
            lambda: process_chat_query(query, session)
        )
        
        if not response.get("success"):
            # Log unanswered query
            analytics.log_unanswered_query(query)
            
            return ChatResponse(
                message=response.get("message", "I couldn't find information about that."),
                session_id=session.session_id,
                requires_clarification=False,
                fallback=True
            )
        
        # 4. UPDATE SESSION MEMORY
        result = response.get("data", {})
        if result.get("career"):
            session.update_memory(career=result["career"])
            analytics.log_career_viewed(result["career"])
        
        if result.get("stream"):
            session.update_memory(stream=result["stream"])
            analytics.log_stream_selected(result["stream"])
        
        session.update_memory(intent=result.get("intent"))
        session.add_to_history("user", query, result.get("entities", {}))
        session.add_to_history("bot", result.get("message", ""))
        
        # 5. RETURN RESPONSE
        return ChatResponse(
            message=result.get("message", ""),
            session_id=session.session_id,
            context=session.get_context(),
            fallback=False
        )
    
    except Exception as e:
        print(f"ERROR in chat_query: {str(e)}")
        return ChatResponse(
            message="Career data is temporarily unavailable. Please try again.",
            session_id=session.session_id,
            fallback=True
        )


@app.post("/chat/clarify")
async def resolve_clarification(payload: Dict[str, Any]):
    """
    Handle user's clarification response.
    
    Example:
    {
        "session_id": "abc123",
        "selected_option": "1"
    }
    """
    
    session = session_manager.get_session(payload.get("session_id"))
    if not session:
        return {"error": "Session not found"}
    
    if not session.awaiting_clarification:
        return {"error": "No pending clarification"}
    
    # Resolve the clarification
    selected = resolve_clarification(
        payload.get("selected_option", ""),
        session.pending_context
    )
    
    if selected:
        session.resolve_clarification(selected)
        analytics.log_clarification_resolved(selected)
        
        # Re-process with resolved context
        return {
            "success": True,
            "resolved_to": selected,
            "next_message": f"Let me help you with {selected}..."
        }
    
    return {"error": "Could not resolve clarification"}


@app.get("/career/{career_id}")
async def get_career(career_id: str):
    """
    Get career details with:
    - Status warnings
    - Failure-safe paths
    - Salary bands
    - Disclaimer
    """
    
    try:
        career = cached_loader.get_career_detail(
            career_id,
            lambda cid: loader.get_career(cid)  # Your existing loader
        )
        
        if not career:
            return FallbackResponses.get_not_found_message("career")
        
        # Check status and add warnings
        status_info = CareerStatusManager.validate_career_status(career)
        
        if status_info["warnings"]:
            career["warnings"] = status_info["warnings"]
        
        # Add failure-safe paths (alternatives if this doesn't work out)
        career = FailureSafePath.add_failure_paths_to_career(career)
        
        # Log analytics
        analytics.log_career_viewed(career_id)
        
        return {"success": True, "career": career}
    
    except Exception as e:
        print(f"ERROR in get_career: {str(e)}")
        return FallbackResponses.get_generic_error()


@app.get("/exam/{exam_id}")
async def get_exam(exam_id: str):
    """
    Get exam details with failure-safe paths.
    """
    
    try:
        exam = cached_loader.get_exam_info(
            exam_id,
            lambda eid: loader.get_exam(eid)  # Your existing loader
        )
        
        if not exam:
            return FallbackResponses.get_not_found_message("exam")
        
        # Add failure paths (what to do if you don't clear this exam)
        exam = FailureSafePath.add_failure_paths_to_exam(exam)
        
        # Log analytics
        analytics.log_exam_queried(exam_id)
        
        return {"success": True, "exam": exam}
    
    except Exception as e:
        return FallbackResponses.get_generic_error()


@app.get("/session/{session_id}")
async def get_session_context(session_id: str):
    """
    Get current session context.
    Useful for frontend to know what we remember about user.
    """
    
    session = session_manager.get_session(session_id)
    if not session:
        return {"error": "Session not found or expired"}
    
    return {
        "session_id": session.session_id,
        "context": session.get_context(),
        "conversation_length": session.interaction_count,
        "last_activity": session.last_activity.isoformat()
    }


@app.post("/session/{session_id}/reset")
async def reset_session(session_id: str):
    """
    Clear session memory (user explicitly requested).
    """
    
    session = session_manager.get_session(session_id)
    if not session:
        return {"error": "Session not found"}
    
    session.reset()
    
    return {"success": True, "message": "Session memory cleared"}


@app.delete("/session/{session_id}")
async def end_session(session_id: str):
    """
    End session and cleanup.
    """
    
    duration_minutes = 0
    session = session_manager.get_session(session_id)
    
    if session:
        duration = (datetime.now() - session.created_at).total_seconds() / 60
        duration_minutes = int(duration)
        analytics.log_session_ended(duration_minutes)
    
    session_manager.end_session(session_id)
    
    return {"success": True, "session_duration_minutes": duration_minutes}


# ============================================================================
# 5. ANALYTICS & MONITORING ENDPOINTS
# ============================================================================

@app.get("/analytics/stats")
async def get_analytics_stats():
    """
    Get anonymized behavioral analytics.
    NO PII - only behavior patterns.
    """
    
    return {
        "event_stats": analytics.get_stats(),
        "popular_careers": analytics.get_popular_careers(limit=10),
        "confusion_points": analytics.get_confusion_points(),
        "dropout_patterns": analytics.get_dropout_patterns(),
        "cache_stats": cache_manager.get_stats(),
        "active_sessions": session_manager.get_session_count()
    }


@app.get("/data-health")
async def get_data_health():
    """
    Check overall data quality and freshness.
    """
    
    careers = loader.get_all_careers()  # Your loader
    health = DataIntegrityChecker.get_data_health_report(careers)
    
    return health


# ============================================================================
# 6. HELPER FUNCTION (Implement in your backend)
# ============================================================================

def process_chat_query(query: str, session: ChatSession) -> Dict[str, Any]:
    """
    Process chat query with session context.
    
    This integrates with your existing chatbot intent logic.
    """
    
    from chatbot_intent import classify_intent, extract_entities
    
    # Classify intent
    intent_result = classify_intent(query)
    entities = intent_result.get("entities", {})
    intent = intent_result.get("intent")
    
    # If we have session context, use it to augment entities
    if not entities.get("career") and session.current_career:
        entities["career"] = session.current_career
    
    if not entities.get("stream") and session.current_stream:
        entities["stream"] = session.current_stream
    
    # Generate response based on intent + entities
    # (Use your existing chatbot logic here)
    message = generate_bot_response(intent, entities, session)
    
    return {
        "message": message,
        "intent": intent,
        "entities": entities,
        "career": entities.get("career"),
        "stream": entities.get("stream")
    }


def generate_bot_response(intent: str, entities: Dict, session: ChatSession) -> str:
    """
    Generate response (use your existing bot logic).
    """
    # This is where your existing chatbot response logic goes
    # For now, return a placeholder
    return f"You asked about {intent}. I'll help you with that."


# ============================================================================
# 7. EXAMPLE: RUN MIGRATIONS & INITIALIZATION
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    
    # Optional: Run enrichment before starting
    # print("Enriching career data with salary bands...")
    # migrate_careers_to_v2()
    
    # Start server
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=False
    )
