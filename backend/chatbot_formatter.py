"""
Response Formatter Module
Converts verified data into consistent UI format
"""

import os
import json
from typing import Dict, Optional
from chatbot_search import CareerSearch


class ResponseFormatter:
    """
    Format responses in Career Intelligence Card format
    
    CONSISTENT UI EVERYWHERE
    """
    @staticmethod
    def format_search_results(search_data: Dict) -> Dict:
        """
        Format comprehensive search results
        Shows careers, streams, exams, courses matching query
        """
        query = search_data.get('query', '')
        careers = search_data.get('careers', [])
        streams = search_data.get('streams', [])
        exams = search_data.get('exams', [])
        courses = search_data.get('courses', [])
        total = search_data.get('total_results', 0)
        
        answer_parts = [f"🔍 **Search Results for '{query}'** ({total} results found)\n"]
        
        if careers:
            answer_parts.append("**🎯 Careers:**")
            for c in careers[:3]:
                answer_parts.append(f"• {c['name']} - {c.get('description', 'N/A')[:80]}...")
        
        if streams:
            answer_parts.append("\n**🌊 Streams:**")
            for s in streams[:3]:
                answer_parts.append(f"• {s['name']} - {s.get('description', 'N/A')[:80]}...")
        
        if exams:
            answer_parts.append("\n**📝 Exams:**")
            for e in exams[:3]:
                answer_parts.append(f"• {e['name']} - {e.get('description', 'N/A')[:80]}...")
        
        if courses:
            answer_parts.append("\n**📚 Courses:**")
            for c in courses[:3]:
                answer_parts.append(f"• {c['name']} - {c.get('description', 'N/A')[:80]}...")
        
        if total == 0:
            answer_parts = [f"No results found for '{query}'. Try searching for specific careers, streams, or exams!"]
        
        return {
            'type': 'search_results',
            'query': query,
            'answer': '\n'.join(answer_parts),
            'metadata': {
                'careers_count': len(careers),
                'streams_count': len(streams),
                'exams_count': len(exams),
                'courses_count': len(courses)
            }
        }
    
    @staticmethod
    def format_eligibility(data: Dict) -> Dict:
        """
        Format eligibility check response
        """
        if not data.get('available'):
            return {
                'type': 'error',
                'answer': "I don't have verified data for this career yet. Please try our onboarding tool for personalized recommendations!"
            }
        
        career_name = data['career_name']
        
        # Build answer sections
        why = f"📋 **Eligibility for {career_name}**"
        
        requirements = []
        if data.get('minimum_education'):
            requirements.append(f"• Minimum Education: {data['minimum_education']}")
        
        if data.get('mandatory_subjects'):
            subjects = ', '.join(data['mandatory_subjects'])
            requirements.append(f"• Required Subjects: {subjects}")
        
        if data.get('entrance_exams'):
            exams = ', '.join(data['entrance_exams'])
            requirements.append(f"• Entrance Exams: {exams}")
        
        degree_status = "Yes" if data.get('degree_required') else "No"
        requirements.append(f"• Degree Required: {degree_status}")
        
        if data.get('foundation_in_12'):
            requirements.append(f"• Can start foundation in Class 12: Yes")
        
        what_to_study = "\n".join(requirements)
        
        return {
            'type': 'career_card',
            'career_name': career_name,
            'why': why,
            'what_to_study': what_to_study,
            'answer': f"{why}\n\n{what_to_study}"
        }
    
    @staticmethod
    def format_career_steps(data: Dict) -> Dict:
        """
        Format career steps response
        """
        if not data.get('available'):
            return {
                'type': 'error',
                'answer': "I don't have verified data for this career yet."
            }
        
        career_name = data['career_name']
        steps = data.get('steps', [])
        
        why = f"🎯 **How to become a {career_name}**"
        
        if steps:
            steps_text = "\n".join([f"{i+1}. {step}" for i, step in enumerate(steps)])
        else:
            # Fallback to roadmap
            roadmap = data.get('roadmap', {})
            steps_text = f"• Short-term: {roadmap.get('short_term', 'Choose the right stream')}\n"
            steps_text += f"• Mid-term: {roadmap.get('mid_term', 'Complete required education')}\n"
            steps_text += f"• Long-term: {roadmap.get('long_term', 'Gain experience and specialize')}"
        
        skills = data.get('skills_needed', [])
        skills_text = "• " + "\n• ".join(skills) if skills else "Build relevant skills for this field"
        
        # Add failure safe paths if available
        answer_parts = [why, f"📚 **Steps:**\n{steps_text}", f"💡 **Skills:**\n{skills_text}"]
        
        failure_paths = data.get('failure_safe_paths', [])
        if failure_paths:
            failure_text = "• " + "\n• ".join(failure_paths)
            answer_parts.append(f"🔄 **Alternatives if things don't work out:**\n{failure_text}")
        
        # Add salary info if available
        salary_band = data.get('salary_band', {})
        if salary_band:
            salary_text = f"Entry: {salary_band.get('entry', 'N/A')} → Mid: {salary_band.get('mid', 'N/A')} → Senior: {salary_band.get('senior', 'N/A')}"
            answer_parts.append(f"💰 **Salary Progression:**\n{salary_text}")
        
        return {
            'type': 'career_card',
            'career_name': career_name,
            'why': why,
            'what_to_study': steps_text,
            'skills': skills_text,
            'answer': "\n\n".join(answer_parts)
        }
    
    @staticmethod
    def format_roadmap(data: Dict, allow_gpt: bool = False) -> Dict:
        """
        Format career roadmap response
        """
        if not data.get('available'):
            return {
                'type': 'error',
                'answer': "I don't have roadmap data for this career yet."
            }
        
        career_name = data['career_name']
        
        why = f"🗺️ **Career Roadmap: {career_name}**"
        
        roadmap_text = f"**Short-term:** {data.get('short_term', 'Not available')}\n\n"
        roadmap_text += f"**Mid-term:** {data.get('mid_term', 'Not available')}\n\n"
        roadmap_text += f"**Long-term:** {data.get('long_term', 'Not available')}"
        
        if data.get('entry_point'):
            roadmap_text += f"\n\n**Entry Point:** {data['entry_point']}"
        
        return {
            'type': 'career_card',
            'career_name': career_name,
            'why': why,
            'roadmap': roadmap_text,
            'answer': f"{why}\n\n{roadmap_text}",
            'allow_gpt_explain': allow_gpt
        }
    
    @staticmethod
    def format_stream_guidance(data: Dict) -> Dict:
        """
        Format stream guidance response
        """
        if not data.get('available'):
            return {
                'type': 'error',
                'answer': "Stream data not available."
            }
        
        class_level = data['class_level']
        streams = data['streams']
        
        why = f"📚 **Streams after Class {class_level}**"
        
        stream_list = []
        for stream in streams:
            stream_list.append(f"• **{stream['name']}**: {stream['description']}")
        
        streams_text = "\n".join(stream_list)
        
        return {
            'type': 'stream_info',
            'why': why,
            'what_to_study': streams_text,
            'answer': f"{why}\n\n{streams_text}\n\nUse our onboarding tool to find the best stream for your interests!"
        }

    @staticmethod
    def format_exam_info(data: Dict) -> Dict:
        """Format basic exam information."""
        if not data.get('available'):
            return {
                'type': 'error',
                'answer': "I don't have verified details for that exam yet. Try asking about another exam or a career."
            }

        requires = ', '.join(data.get('requires', [])) or 'Not specified'
        leads_to = ', '.join(data.get('leads_to', [])) or 'Not specified'

        answer = [f"📝 **Exam: {data.get('exam_name', 'Exam')}**"]
        answer.append(f"• Requires: {requires}")
        answer.append(f"• Leads to: {leads_to}")
        return {
            'type': 'exam_info',
            'exam_name': data.get('exam_name'),
            'answer': "\n".join(answer)
        }
    
    @staticmethod
    def format_fallback() -> Dict:
        """
        Fallback response when no verified data available
        """
        return {
            'type': 'generic',
            'answer': "I can help with career steps, eligibility, exams, streams, and courses. Try:\n• 'Tell me about CA'\n• 'Search for engineering careers'\n• 'What exams for MBBS?'\n• 'Streams after Class 10'\nOr run the Onboarding Tool for personalized picks."
        }
    
    @staticmethod
    def apply_gpt_explanation(formatted_response: Dict, gpt_key: Optional[str]) -> Dict:
        """
        OPTIONAL: Use GPT to rewrite answer in simpler language
        
        CRITICAL: GPT does NOT add facts, only rewrites
        """
        if not gpt_key or formatted_response.get('type') == 'error':
            return formatted_response
        
        # GPT rewriting logic (controlled)
        try:
            import requests
            
            system_prompt = """You are a helpful career advisor assistant.
Rewrite the following verified career information in a friendly, conversational tone.

CRITICAL RULES:
1. DO NOT add new facts or steps
2. DO NOT change numbers or requirements
3. Only rephrase for clarity
4. Keep all factual content intact
5. Make it sound natural and encouraging
"""
            
            user_prompt = f"Rewrite this in simple, encouraging language:\n\n{formatted_response['answer']}"
            
            payload = {
                'model': 'gpt-4o-mini',
                'messages': [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': user_prompt}
                ],
                'temperature': 0.3,  # Low temperature for consistency
                'max_tokens': 400
            }
            
            resp = requests.post(
                'https://api.openai.com/v1/chat/completions',
                json=payload,
                headers={'Authorization': f'Bearer {gpt_key}'},
                timeout=10
            )
            
            if resp.ok:
                body = resp.json()
                rewritten = body['choices'][0]['message']['content']
                formatted_response['answer'] = rewritten
                formatted_response['gpt_enhanced'] = True
        
        except Exception as e:
            # Fallback to original on any error
            print(f"GPT explanation failed (using original): {e}")
            pass
        
        return formatted_response
