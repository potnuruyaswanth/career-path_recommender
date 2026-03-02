"""
Decision Engine Module
Determines WHERE answers come from - NEVER hallucinate
"""

from typing import Dict, Literal

# Answer source types
AnswerSource = Literal[
    "APP_DATA_ONLY",           # Only verified JSON data
    "APP_DATA_GPT_EXPLAIN",    # App data + GPT rewording (safe)
    "FALLBACK_GENERIC"         # Fallback message
]


class DecisionEngine:
    """
    THE BRAIN: Decides answer source based on intent
    
    CRITICAL RULE: GPT is NEVER the source of truth
    """
    
    # Decision matrix (STRICT RULES)
    DECISION_MATRIX = {
        "eligibility_check": "APP_DATA_ONLY",
        "career_steps": "APP_DATA_ONLY",
        "roadmap": "APP_DATA_GPT_EXPLAIN",
        "stream_guidance": "APP_DATA_ONLY",
        "exam_info": "APP_DATA_ONLY",
        "course_info": "APP_DATA_ONLY",
        "career_overview": "APP_DATA_GPT_EXPLAIN",
        "comparison": "APP_DATA_ONLY",
        "general_guidance": "FALLBACK_GENERIC"
    }
    
    @classmethod
    def decide_source(cls, intent: str, entities: Dict, confidence: float) -> Dict:
        """
        Decide answer source based on intent
        
        Returns:
            {
                'source': AnswerSource,
                'allow_gpt_explain': bool,
                'data_required': list
            }
        """
        
        # Low confidence -> fallback
        if confidence < 0.5:
            return {
                'source': 'FALLBACK_GENERIC',
                'allow_gpt_explain': False,
                'data_required': []
            }
        
        # Get source from decision matrix
        source = cls.DECISION_MATRIX.get(intent, 'FALLBACK_GENERIC')
        
        # Determine what data is needed
        data_required = cls._determine_data_needs(intent, entities)
        
        # Check if GPT explanation is allowed
        allow_gpt_explain = source == "APP_DATA_GPT_EXPLAIN"
        
        return {
            'source': source,
            'allow_gpt_explain': allow_gpt_explain,
            'data_required': data_required
        }
    
    @classmethod
    def _determine_data_needs(cls, intent: str, entities: Dict) -> list:
        """
        Determine what data needs to be fetched
        """
        needs = []
        
        if intent in ['career_steps', 'career_overview', 'roadmap', 'eligibility_check']:
            if entities.get('career'):
                needs.append(('career', entities['career']))
        
        if intent == 'stream_guidance':
            if entities.get('class_level'):
                needs.append(('streams', entities['class_level']))
        
        if intent == 'exam_info':
            if entities.get('exam'):
                needs.append(('exam', entities['exam']))
        
        if intent == 'course_info':
            if entities.get('course'):
                needs.append(('course', entities['course']))
        
        return needs
    
    @classmethod
    def validate_data_availability(cls, decision: Dict, fetched_data: Dict) -> bool:
        """
        Validate that required data is available
        
        Returns: True if we can answer, False if data missing
        """
        if decision['source'] == 'FALLBACK_GENERIC':
            return True
        
        # Check if we have the required data
        for data_type, data_id in decision['data_required']:
            if not fetched_data.get(data_type):
                return False
        
        return True
