"""
Answer Source Module
SAFE data retrieval - App data is the ONLY source of truth
"""

import os
import json
from typing import Dict, Optional, List
from data_loader_versioned import load_career, load_stream, load_exam
from config import CAREERS_DIR, STREAMS_DIR, EXAMS_DIR


class AnswerSource:
    """
    Fetch answers from verified sources ONLY (uses versioned data)
    
    SAFETY RULE: Never invent data
    """
    
    def __init__(self, loader=None):
        # Keep a loader reference for stream lookups; fallback to None-safe usage
        self.loader = loader
    
    def fetch_career_data(self, career_id: str) -> Optional[Dict]:
        """
        Fetch verified career data from versioned JSON
        """
        # Try loading from versioned data
        print(f"🔍 fetch_career_data: Trying to load career_id='{career_id}'")
        career_data = load_career(career_id)
        
        if career_data:
            print(f"✅ Loaded career data: {career_data.get('display_name', 'N/A')}")
            return career_data
        
        # Try with career: prefix
        if not career_id.startswith('career:'):
            print(f"🔍 Trying with prefix: 'career:{career_id}'")
            career_data = load_career(f'career:{career_id}')
            if career_data:
                print(f"✅ Loaded with prefix: {career_data.get('display_name', 'N/A')}")
        
        if not career_data:
            print(f"❌ Failed to load career: {career_id}")
        
        return career_data
    
    def fetch_stream_data(self, class_level: str) -> List[Dict]:
        """
        Fetch stream data for a class level
        """
        if not self.loader:
            return []
        return self.loader.get_streams_for_class(class_level)

    def get_exam_info(self, exam_id: str) -> Dict:
        """Return basic exam information from versioned data."""
        exam = load_exam(exam_id) or load_exam(f'exam:{exam_id}')
        if not exam:
            return {'available': False}

        return {
            'available': True,
            'exam_id': exam.get('id', exam_id),
            'exam_name': exam.get('display_name', exam_id.upper()),
            'requires': exam.get('requires', []),
            'leads_to': exam.get('leads_to', []),
            'metadata': exam.get('metadata', {})
        }
    
    def fetch_exam_data(self, exam_name: str) -> Optional[Dict]:
        """
        Fetch exam information
        """
        # Search in nodes for exam
        for node_id, node in self.loader.nodes.items():
            if node.get('type') == 'exam':
                display_name = node.get('display_name', '').lower()
                if exam_name.lower() in display_name or exam_name.lower() in node_id.lower():
                    return node
        return None
    
    def fetch_paths_for_career(self, career_id: str) -> Dict:
        """
        Get all paths leading to a career
        """
        paths = []
        
        # Search edges for paths to this career
        for edge in self.loader.edges:
            if edge.get('target') == career_id or edge.get('target') == f'career:{career_id}':
                source_id = edge.get('source')
                source_node = self.loader.nodes.get(source_id)
                if source_node:
                    paths.append({
                        'from': source_node.get('display_name', source_id),
                        'type': source_node.get('type'),
                        'id': source_id
                    })
        
        return {'paths': paths}
    
    def get_career_eligibility(self, career_id: str) -> Dict:
        """
        Get eligibility requirements for a career
        
        STRICT: Only return what exists in data
        """
        career = self.fetch_career_data(career_id)
        
        if not career:
            return {'available': False}
        
        attrs = career.get('attributes', {})
        
        return {
            'available': True,
            'career_name': career.get('display_name', career_id),
            'minimum_education': attrs.get('minimum_education', 'Not specified'),
            'mandatory_subjects': attrs.get('mandatory_subjects', []),
            'degree_required': attrs.get('degree_required', True),
            'entrance_exams': attrs.get('entrance_exams', []),
            'foundation_in_12': attrs.get('foundation_allowed_in_12', False)
        }
    
    def get_career_steps(self, career_id: str) -> Dict:
        """
        Get step-by-step path to career
        
        CRITICAL: Only verified steps from JSON
        """
        career = self.fetch_career_data(career_id)
        
        if not career:
            return {'available': False}
        
        # Build steps from versioned career data
        steps = []
        
        # Add entry paths as steps
        entry_paths = career.get('entry_paths', [])
        if entry_paths:
            steps.append(f"Complete {', '.join(entry_paths)} course")
        
        # Add exam requirements
        exams_required = career.get('exams_required', [])
        if exams_required:
            steps.append(f"Clear entrance exams: {', '.join(exams_required).upper()}")
        
        # Add stream/variant info
        stream = career.get('stream')
        variant = career.get('variant')
        if stream and variant:
            steps.insert(0, f"Choose {stream.capitalize()} stream with {variant.upper()} variant in Class 12")
        
        # Add salary progression as career growth info
        salary_band = career.get('salary_band', {})
        
        return {
            'available': True,
            'career_name': career.get('display_name', career_id),
            'steps': steps,
            'salary_band': salary_band,
            'failure_safe_paths': career.get('failure_safe_paths', []),
            'exams_required': exams_required,
            'stream': stream,
            'variant': variant,
            'skills_needed': self._generate_career_skills(career)
        }
    
    def _generate_career_skills(self, career: Dict) -> list:
        """Generate relevant skills for a career based on its field"""
        stream = career.get('stream', '')
        career_id = career.get('career_id', '')
        
        # Define skills by career type
        skills_map = {
            'barch_architecture': ['Creativity and design thinking', 'Technical drawing', '3D modeling (AutoCAD, SketchUp)', 'Building codes knowledge', 'Project management'],
            'software_engineer': ['Programming (Python, Java, C++)', 'Data structures & algorithms', 'Problem-solving', 'Software development lifecycle', 'Version control (Git)'],
            'doctor': ['Medical knowledge', 'Clinical skills', 'Patient care', 'Critical thinking', 'Communication skills'],
            'chartered_accountant': ['Accounting & taxation', 'Financial analysis', 'Audit procedures', 'Attention to detail', 'Business communication'],
            'company_secretary': ['Corporate law', 'Compliance management', 'Corporate governance', 'Legal drafting', 'Business ethics'],
            'cost_management_accountant': ['Cost accounting', 'Financial management', 'Business analysis', 'Strategic planning', 'Excel & analytics tools']
        }
        
        # Return career-specific skills or generic based on stream
        if career_id in skills_map:
            return skills_map[career_id]
        elif stream == 'science':
            return ['Analytical thinking', 'Problem-solving', 'Technical skills', 'Research abilities', 'Practical application']
        elif stream == 'commerce':
            return ['Financial literacy', 'Business acumen', 'Numerical skills', 'Communication', 'Analytical thinking']
        elif stream == 'arts':
            return ['Critical thinking', 'Communication', 'Research skills', 'Cultural awareness', 'Writing abilities']
        else:
            return ['Relevant technical skills', 'Communication', 'Problem-solving', 'Continuous learning']
    
    def get_career_roadmap(self, career_id: str) -> Dict:
        """
        Get career progression roadmap
        """
        career = self.fetch_career_data(career_id)
        
        if not career:
            return {'available': False}
        
        roadmap = career.get('roadmap', {})
        
        return {
            'available': bool(roadmap),
            'career_name': career.get('display_name', career_id),
            'short_term': roadmap.get('short_term', 'Data not available'),
            'mid_term': roadmap.get('mid_term', 'Data not available'),
            'long_term': roadmap.get('long_term', 'Data not available'),
            'entry_point': roadmap.get('entry', 'Data not available')
        }
    
    def get_stream_guidance(self, class_level: str) -> Dict:
        """
        Get stream options for a class
        """
        streams = self.fetch_stream_data(class_level)
        
        if not streams:
            return {'available': False}
        
        stream_list = []
        for stream in streams[:6]:  # Limit to 6
            stream_list.append({
                'name': stream.get('display_name', stream.get('id')),
                'id': stream.get('id'),
                'description': stream.get('description', 'Explore this stream for various career paths')
            })
        
        return {
            'available': True,
            'class_level': class_level,
            'streams': stream_list
        }
