"""
Clarifying Question Logic
Detects ambiguous queries and asks for clarification
"""

from typing import Dict, List, Optional, Any
from enum import Enum


class AmbiguityType(Enum):
    VAGUE_INTENT = "vague_intent"
    MULTIPLE_CAREERS = "multiple_careers"
    MISSING_STREAM = "missing_stream"
    MISSING_CONTEXT = "missing_context"


# Queries that are inherently vague without context
VAGUE_QUERY_PATTERNS = [
    "what exams",
    "what are exams",
    "how to prepare",
    "how do i prepare",
    "is it good",
    "is it worth it",
    "what next",
    "what should i do",
    "how do i start",
    "what do i need",
    "what's required",
    "can i do it",
    "is it hard",
    "how difficult",
    "what skills",
    "how long"
]

# Queries requiring specific context
CONTEXT_DEPENDENT_PATTERNS = {
    "eligibility": ["eligible", "qualify", "requirement", "can i"],
    "exam_prep": ["prepare for", "study for", "pass", "clear"],
    "career_steps": ["start", "begin", "become", "way to"],
    "salary": ["earn", "salary", "pay", "income", "money"]
}


class ClarifyingQuestions:
    """Generates and manages clarifying questions."""
    
    @staticmethod
    def is_ambiguous(query: str, session_context: Dict[str, Any]) -> tuple[bool, Optional[AmbiguityType]]:
        """
        Detect if query is ambiguous.
        Returns: (is_ambiguous, ambiguity_type)
        """
        normalized = query.lower().strip()
        
        # Check for vague patterns
        for pattern in VAGUE_QUERY_PATTERNS:
            if pattern in normalized:
                # If we have session context, we might resolve it
                if not session_context.get('current_career') and not session_context.get('current_stream'):
                    return True, AmbiguityType.VAGUE_INTENT
        
        # Check context-dependent patterns
        for intent_type, patterns in CONTEXT_DEPENDENT_PATTERNS.items():
            for pattern in patterns:
                if pattern in normalized:
                    # Check if we have required context
                    if intent_type == "exam_prep" and not session_context.get('current_career'):
                        return True, AmbiguityType.MISSING_CONTEXT
                    elif intent_type == "career_steps" and not session_context.get('current_stream'):
                        return True, AmbiguityType.MISSING_STREAM
        
        return False, None
    
    @staticmethod
    def generate_clarification_for_career(careers: List[str]) -> Dict[str, Any]:
        """
        Generate clarification when multiple careers match.
        """
        return {
            "type": "multiple_careers",
            "message": "I found multiple matches. Are you asking about:",
            "options": [{"id": i, "name": career} for i, career in enumerate(careers)],
            "needs_response": True
        }
    
    @staticmethod
    def generate_clarification_for_intent() -> Dict[str, Any]:
        """
        Generate clarification for vague intent.
        """
        return {
            "type": "vague_intent",
            "message": "Are you asking about:",
            "options": [
                {"id": "eligibility", "name": "📋 Eligibility requirements"},
                {"id": "exam_preparation", "name": "📚 Exam preparation tips"},
                {"id": "career_roadmap", "name": "🗺️ Career roadmap & steps"},
                {"id": "salary", "name": "💰 Salary & growth"}
            ],
            "needs_response": True
        }
    
    @staticmethod
    def generate_clarification_for_context(missing: str) -> Dict[str, Any]:
        """
        Generate clarification for missing context.
        """
        if missing == "stream":
            return {
                "type": "missing_stream",
                "message": "Which stream are you in or interested in?",
                "options": [
                    {"id": "science", "name": "🔬 Science (PCM/PCB)"},
                    {"id": "commerce", "name": "💼 Commerce"},
                    {"id": "arts", "name": "📖 Arts"},
                ],
                "needs_response": True
            }
        
        if missing == "career":
            return {
                "type": "missing_context",
                "message": "Which career are you interested in?",
                "options": [
                    {"id": "charted_accountant", "name": "📊 Chartered Accountant (CA)"},
                    {"id": "software_engineer", "name": "💻 Software Engineer"},
                    {"id": "doctor", "name": "🏥 Doctor (MBBS)"},
                    {"id": "civil_services", "name": "🏛️ Civil Services (IAS/IPS)"},
                    {"id": "registered_nurse", "name": "🏥 Registered Nurse"},
                ],
                "needs_response": True
            }
        
        return {
            "type": "missing_context",
            "message": "I need more context. Can you provide more details?",
            "needs_response": True
        }


def resolve_clarification(response: str, clarification_context: Dict[str, Any]) -> Optional[str]:
    """
    Parse user's clarification response and extract selected value.
    
    Args:
        response: User's selected option (could be number, id, or text)
        clarification_context: The clarification that was presented
    
    Returns:
        Resolved value or None if unresolved
    """
    clar_type = clarification_context.get("type")
    options = clarification_context.get("options", [])
    
    response_lower = response.lower().strip()
    
    # Try numeric match (1, 2, 3, etc.)
    try:
        idx = int(response) - 1  # User says "1" for first option
        if 0 <= idx < len(options):
            return options[idx].get("id")
    except (ValueError, IndexError):
        pass
    
    # Try exact match on option id
    for option in options:
        if option.get("id").lower() == response_lower:
            return option.get("id")
    
    # Try partial match on option name
    for option in options:
        if response_lower in option.get("name", "").lower():
            return option.get("id")
    
    return None
