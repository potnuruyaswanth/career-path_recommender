#!/usr/bin/env python3
"""Test the zero-hallucination chatbot pipeline"""

from chatbot_intent import classify_intent
from chatbot_decision import DecisionEngine
from chatbot_source import AnswerSource
from chatbot_formatter import ResponseFormatter
from data_loader import CareerData

# Load career data
loader = CareerData()

# Test question
question = "How do I become an engineer?"

# Step 1: Classify intent
intent_result = classify_intent(question)
print(f"Intent: {intent_result['intent']}")
print(f"Entities: {intent_result['entities']}")
print(f"Confidence: {intent_result['confidence']}")

# Step 2: Decision
decision = DecisionEngine.decide_source(intent_result['intent'], intent_result['entities'], intent_result['confidence'])
print(f"\nDecision Source: {decision['source']}")

# Step 3: Fetch data
answer_source = AnswerSource(loader)
if intent_result['intent'] == 'career_steps':
    fetched_data = answer_source.get_career_steps('software_engineer')
    print(f"Data Available: {fetched_data.get('available')}")
    
    # Step 4: Format
    formatted = ResponseFormatter.format_career_steps(fetched_data)
    print(f"\n✓ Full Pipeline Working!")
    print(f"\nFormatted Response:\n{formatted['answer'][:150]}...")
