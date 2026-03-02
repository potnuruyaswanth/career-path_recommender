"""
Privacy-First Analytics
Track behavior patterns ONLY - NO personal data
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum
import json


class EventType(Enum):
    """Analytics event types - behavior only, no PII."""
    
    CAREER_VIEWED = "career_viewed"
    CAREER_COMPARISON = "career_comparison"
    EXAM_QUERIED = "exam_queried"
    STREAM_SELECTED = "stream_selected"
    CLARIFICATION_TRIGGERED = "clarification_triggered"
    CLARIFICATION_RESOLVED = "clarification_resolved"
    UNANSWERED_QUERY = "unanswered_query"
    DROPOUT_RECOVERY_CLICKED = "dropout_recovery_clicked"
    FAILURE_PATH_EXPLORED = "failure_path_explored"
    DISCLAIMER_VIEWED = "disclaimer_viewed"
    SESSION_STARTED = "session_started"
    SESSION_ENDED = "session_ended"
    CHATBOT_QUERY = "chatbot_query"


class AnalyticsEvent:
    """
    Single analytics event.
    POLICY: No PII, no usernames, no emails, no IP tracking.
    """
    
    def __init__(
        self,
        event_type: EventType,
        entity: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Create analytics event.
        
        Args:
            event_type: Type of event (from EventType enum)
            entity: What was interacted with (e.g., "chartered_accountant", "neet")
            metadata: Additional anonymous data
        """
        self.event_id = self._generate_event_id()
        self.event_type = event_type.value
        self.entity = entity  # SANITIZED - only career/exam IDs, no user data
        self.metadata = metadata or {}
        self.timestamp = datetime.now().isoformat()
    
    @staticmethod
    def _generate_event_id() -> str:
        """Generate anonymous event ID."""
        import uuid
        return str(uuid.uuid4())
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dict for logging/storage."""
        return {
            "event_id": self.event_id,
            "event_type": self.event_type,
            "entity": self.entity,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }
    
    def to_json(self) -> str:
        """Convert to JSON."""
        return json.dumps(self.to_dict())


class AnalyticsCollector:
    """
    Collects and stores anonymous behavioral analytics.
    """
    
    def __init__(self, max_events: int = 10000):
        """
        Initialize analytics collector.
        
        Args:
            max_events: Max events to keep in memory before cleanup
        """
        self.events: List[AnalyticsEvent] = []
        self.max_events = max_events
        self.event_counts: Dict[str, int] = {}
    
    def log_event(self, event: AnalyticsEvent) -> None:
        """Log an analytics event."""
        self.events.append(event)
        
        # Track count by type
        event_type = event.event_type
        self.event_counts[event_type] = self.event_counts.get(event_type, 0) + 1
        
        # Cleanup if too many
        if len(self.events) > self.max_events:
            self._cleanup_old_events()
    
    def log_career_viewed(self, career_id: str) -> None:
        """Log when user views a career."""
        event = AnalyticsEvent(
            EventType.CAREER_VIEWED,
            entity=career_id
        )
        self.log_event(event)
    
    def log_exam_queried(self, exam_id: str) -> None:
        """Log when user asks about an exam."""
        event = AnalyticsEvent(
            EventType.EXAM_QUERIED,
            entity=exam_id
        )
        self.log_event(event)
    
    def log_stream_selected(self, stream_id: str) -> None:
        """Log stream selection."""
        event = AnalyticsEvent(
            EventType.STREAM_SELECTED,
            entity=stream_id
        )
        self.log_event(event)
    
    def log_clarification_triggered(self, trigger_reason: str) -> None:
        """Log when clarification question was shown."""
        event = AnalyticsEvent(
            EventType.CLARIFICATION_TRIGGERED,
            metadata={"reason": trigger_reason}
        )
        self.log_event(event)
    
    def log_clarification_resolved(self, resolution: str) -> None:
        """Log when user answered clarification."""
        event = AnalyticsEvent(
            EventType.CLARIFICATION_RESOLVED,
            metadata={"resolution": resolution}
        )
        self.log_event(event)
    
    def log_unanswered_query(self, query: str) -> None:
        """
        Log when chatbot couldn't answer query.
        DATA POLICY: Log the intent, NOT the raw query.
        """
        # Extract intent from query (don't log raw user text)
        intent = self._extract_safe_intent(query)
        event = AnalyticsEvent(
            EventType.UNANSWERED_QUERY,
            metadata={"intent": intent}
        )
        self.log_event(event)
    
    def log_dropout_recovery_clicked(self, recovery_option: str) -> None:
        """Log when user explores failure/recovery paths."""
        event = AnalyticsEvent(
            EventType.DROPOUT_RECOVERY_CLICKED,
            entity=recovery_option
        )
        self.log_event(event)
    
    def log_failure_path_explored(self, original_path: str, alternative: str) -> None:
        """Log when user explores alternative careers."""
        event = AnalyticsEvent(
            EventType.FAILURE_PATH_EXPLORED,
            metadata={
                "original_path": original_path,
                "alternative": alternative
            }
        )
        self.log_event(event)
    
    def log_disclaimer_viewed(self) -> None:
        """Log disclaimer page view."""
        event = AnalyticsEvent(EventType.DISCLAIMER_VIEWED)
        self.log_event(event)
    
    def log_session_started(self) -> None:
        """Log session creation."""
        event = AnalyticsEvent(EventType.SESSION_STARTED)
        self.log_event(event)
    
    def log_session_ended(self, duration_minutes: int) -> None:
        """Log session end with duration."""
        event = AnalyticsEvent(
            EventType.SESSION_ENDED,
            metadata={"duration_minutes": duration_minutes}
        )
        self.log_event(event)
    
    def log_chatbot_query(self, intent: str, had_context: bool = False) -> None:
        """
        Log chatbot interaction.
        
        Args:
            intent: Detected intent (safe to log)
            had_context: Whether session context was available
        """
        event = AnalyticsEvent(
            EventType.CHATBOT_QUERY,
            metadata={
                "intent": intent,
                "had_context": had_context
            }
        )
        self.log_event(event)
    
    def _extract_safe_intent(self, query: str) -> str:
        """
        Extract intent from query without logging raw query.
        This is safe - only intent categories, no PII.
        """
        q = query.lower()
        
        if any(word in q for word in ["exam", "neet", "jee"]):
            return "exam_interest"
        elif any(word in q for word in ["stream", "choice", "science", "commerce"]):
            return "stream_interest"
        elif any(word in q for word in ["salary", "pay", "earn"]):
            return "salary_interest"
        elif any(word in q for word in ["eligible", "qualify"]):
            return "eligibility_interest"
        elif any(word in q for word in ["fail", "clear", "pass"]):
            return "exam_outcome"
        else:
            return "general_interest"
    
    def _cleanup_old_events(self) -> int:
        """
        Remove oldest events to stay within limit.
        Keeps recent behavior trends.
        """
        removed = len(self.events) - (self.max_events // 2)
        self.events = self.events[removed:]
        return removed
    
    def get_stats(self) -> Dict[str, Any]:
        """Get analytics summary statistics."""
        return {
            "total_events": len(self.events),
            "event_types": self.event_counts,
            "events_by_type": {
                event_type: count
                for event_type, count in sorted(
                    self.event_counts.items(),
                    key=lambda x: x[1],
                    reverse=True
                )
            },
            "timestamp": datetime.now().isoformat()
        }
    
    def get_popular_careers(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most viewed/queried careers."""
        career_views = {}
        
        for event in self.events:
            if event.event_type in [
                EventType.CAREER_VIEWED.value,
                EventType.CAREER_COMPARISON.value
            ]:
                career = event.entity
                career_views[career] = career_views.get(career, 0) + 1
        
        return sorted(
            [{"career": c, "views": v} for c, v in career_views.items()],
            key=lambda x: x["views"],
            reverse=True
        )[:limit]
    
    def get_confusion_points(self) -> List[Dict[str, Any]]:
        """
        Identify where users get confused.
        Returns events that led to clarification requests.
        """
        confusion_intents = {}
        
        for event in self.events:
            if event.event_type == EventType.CLARIFICATION_TRIGGERED.value:
                reason = event.metadata.get("reason", "unknown")
                confusion_intents[reason] = confusion_intents.get(reason, 0) + 1
        
        return sorted(
            [{"confusion_point": k, "count": v} for k, v in confusion_intents.items()],
            key=lambda x: x["count"],
            reverse=True
        )
    
    def get_dropout_patterns(self) -> List[Dict[str, Any]]:
        """
        Identify failure paths most explored.
        Shows where users need alternative guidance.
        """
        recovery_paths = {}
        
        for event in self.events:
            if event.event_type == EventType.FAILURE_PATH_EXPLORED.value:
                original = event.metadata.get("original_path")
                recovery_paths[original] = recovery_paths.get(original, 0) + 1
        
        return sorted(
            [{"career": k, "recovery_clicks": v} for k, v in recovery_paths.items()],
            key=lambda x: x["recovery_clicks"],
            reverse=True
        )
    
    def export_events(self, event_type: Optional[str] = None) -> str:
        """
        Export events as JSONL (one JSON per line).
        Safe for logging and analysis.
        """
        filtered = (
            self.events
            if event_type is None
            else [e for e in self.events if e.event_type == event_type]
        )
        
        return "\n".join(event.to_json() for event in filtered)
