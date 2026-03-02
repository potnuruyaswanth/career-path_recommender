"""
Session-Level Conversation Memory
Stores session state WITHOUT permanent storage
"""

from datetime import datetime
from typing import Optional, Dict, Any
import uuid


class ChatSession:
    """
    Maintains conversation context within a single user session.
    NO permanent storage - resets on session end.
    """
    
    def __init__(self, session_id: Optional[str] = None):
        self.session_id = session_id or str(uuid.uuid4())
        self.created_at = datetime.now()
        self.last_activity = datetime.now()
        
        # Core memory state
        self.current_stream: Optional[str] = None
        self.current_career: Optional[str] = None
        self.last_intent: Optional[str] = None
        
        # Interaction history (within session only)
        self.conversation_history: list = []
        self.interaction_count: int = 0
        
        # Clarification state
        self.awaiting_clarification: bool = False
        self.clarification_options: list = []
        self.pending_context: Dict[str, Any] = {}
    
    def update_memory(
        self, 
        stream: Optional[str] = None,
        career: Optional[str] = None,
        intent: Optional[str] = None
    ):
        """Update session memory with detected values."""
        if stream is not None:
            self.current_stream = stream
        if career is not None:
            self.current_career = career
        if intent is not None:
            self.last_intent = intent
        
        self.last_activity = datetime.now()
    
    def add_to_history(self, role: str, message: str, entities: Dict[str, Any] = None):
        """Add interaction to conversation history."""
        self.conversation_history.append({
            "timestamp": datetime.now().isoformat(),
            "role": role,  # "user" or "bot"
            "message": message,
            "entities": entities or {}
        })
        
        if role == "user":
            self.interaction_count += 1
    
    def get_context(self) -> Dict[str, Any]:
        """Get current session context."""
        return {
            "session_id": self.session_id,
            "current_stream": self.current_stream,
            "current_career": self.current_career,
            "last_intent": self.last_intent,
            "interaction_count": self.interaction_count,
            "awaiting_clarification": self.awaiting_clarification,
            "pending_context": self.pending_context
        }
    
    def set_clarification_pending(
        self, 
        options: list, 
        context: Dict[str, Any]
    ):
        """Mark session as waiting for clarification."""
        self.awaiting_clarification = True
        self.clarification_options = options
        self.pending_context = context
    
    def resolve_clarification(self, selected_option: str):
        """Resolve pending clarification."""
        self.awaiting_clarification = False
        self.pending_context = {"selected_option": selected_option}
        self.clarification_options = []
    
    def reset(self):
        """Reset memory (user explicitly requested)."""
        self.current_stream = None
        self.current_career = None
        self.last_intent = None
        self.conversation_history = []
        self.interaction_count = 0
        self.awaiting_clarification = False
        self.clarification_options = []
        self.pending_context = {}
        self.last_activity = datetime.now()
    
    def is_stale(self, timeout_minutes: int = 30) -> bool:
        """Check if session is stale (inactive)."""
        elapsed = (datetime.now() - self.last_activity).total_seconds() / 60
        return elapsed > timeout_minutes


class SessionManager:
    """
    Manages multiple chat sessions (in-memory, no persistence).
    Sessions stored in a simple dict - scale with Redis if needed.
    """
    
    def __init__(self):
        self._sessions: Dict[str, ChatSession] = {}
    
    def create_session(self) -> ChatSession:
        """Create a new chat session."""
        session = ChatSession()
        self._sessions[session.session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get existing session."""
        session = self._sessions.get(session_id)
        
        # Auto-cleanup stale sessions
        if session and session.is_stale():
            del self._sessions[session_id]
            return None
        
        return session
    
    def end_session(self, session_id: str) -> bool:
        """End session and cleanup."""
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False
    
    def cleanup_stale_sessions(self):
        """Remove all stale sessions."""
        stale_ids = [
            sid for sid, session in self._sessions.items()
            if session.is_stale()
        ]
        for sid in stale_ids:
            del self._sessions[sid]
        return len(stale_ids)
    
    def get_session_count(self) -> int:
        """Get count of active sessions."""
        self.cleanup_stale_sessions()
        return len(self._sessions)
