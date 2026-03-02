"""
Next Best Action (NBA) Engine
Determines relevant actions for any career based on attributes
"""

import os
import json
from typing import Dict, List, Optional, Any
from data_loader import CareerData


class NBAEngine:
    """
    Next Best Action Engine
    
    Given a career, returns actionable next steps based on:
    - Career type (exam-based, degree-based, govt, medical, etc.)
    - User's current status
    - Available pathways
    """
    
    def __init__(self, loader: CareerData):
        self.loader = loader
        self.nba_matrix = self._load_nba_matrix()
        self.nba_rules = self._load_nba_rules()
    
    def _load_nba_matrix(self) -> Dict:
        """Load NBA actions matrix"""
        try:
            path = os.path.join(
                os.path.dirname(__file__),
                '..',
                'career-data',
                'nba_actions_matrix.json'
            )
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def _load_nba_rules(self) -> Dict:
        """Load NBA rules engine"""
        try:
            path = os.path.join(
                os.path.dirname(__file__),
                '..',
                'career-data',
                'nba_action_rules.json'
            )
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def get_next_actions(self, career_id: str) -> Dict:
        """
        Get recommended next actions for a career
        
        Returns:
        {
            'career_id': 'career:software_engineer',
            'career_name': 'Software Engineer',
            'actions': [
                {
                    'id': 'eligibility_checklist',
                    'label': 'Show Eligibility Checklist',
                    'icon': '✓',
                    'endpoint': '/career/{id}/eligibility'
                },
                ...
            ],
            'action_categories': {
                'universal': [...],
                'degree_based': [...],
                'skill_based': [...]
            }
        }
        """
        # Normalize career ID
        if not career_id.startswith('career:'):
            career_id = f'career:{career_id}'
        
        # Get career data
        career = self.loader.nodes.get(career_id)
        if not career:
            return {'available': False, 'career_id': career_id}
        
        # Get NBA attributes (career-level or merged from stream variants)
        nba_attrs = self._resolve_nba_attributes(career)
        
        # Determine which action categories apply
        applicable_actions = self._determine_actions(nba_attrs)
        
        # Build response with action endpoints
        action_details = self._build_action_details(applicable_actions)
        
        return {
            'available': True,
            'career_id': career_id,
            'career_name': career.get('display_name', career_id),
            'career_type': career.get('attributes', {}).get('nature', 'Unknown'),
            'actions': action_details['all_actions'],
            'action_categories': action_details['categorized'],
            'action_count': len(action_details['all_actions']),
            'nba_attributes': nba_attrs
        }
    
    def _resolve_nba_attributes(self, career: Dict) -> Dict:
        """Resolve NBA attributes from career or related stream variants as fallback.

        Aggregates boolean flags and merges exam_types lists.
        """
        attrs = career.get('attributes', {})
        nba = dict(attrs.get('nba_attributes', {}) or {})

        # If already present, return
        if nba:
            return nba

        # Fallback: collect from referenced stream variants
        variant_ids = attrs.get('stream_paths', [])
        aggregate = {
            'has_exam': False,
            'has_degree': False,
            'has_diploma': False,
            'is_govt_service': False,
            'is_medical': False,
            'is_skill_based': False,
            'exam_types': []
        }
        for vid in variant_ids:
            vnode = self.loader.nodes.get(vid)
            if not vnode:
                continue
            vattrs = vnode.get('attributes', {})
            vnba = vattrs.get('nba_attributes', {})
            if not vnba:
                continue
            for key in ['has_exam','has_degree','has_diploma','is_govt_service','is_medical','is_skill_based']:
                aggregate[key] = aggregate[key] or bool(vnba.get(key, False))
            et = vnba.get('exam_types', []) or []
            for e in et:
                if e not in aggregate['exam_types']:
                    aggregate['exam_types'].append(e)

        # If nothing found, return empty dict; else return merged
        return {k: v for k, v in aggregate.items() if v not in (False, [], None)}
    
    def _determine_actions(self, nba_attrs: Dict) -> List[str]:
        """
        Determine which actions to show based on career attributes
        
        Returns list of action IDs
        """
        actions = []
        
        # Always include universal actions
        actions.extend([
            'eligibility_checklist',
            'compare_similar',
            'failure_recovery',
            'alternate_paths'
        ])
        
        # Exam-based
        if nba_attrs.get('has_exam', False):
            actions.extend([
                'exam_eligibility',
                'syllabus_timeline',
                'alternate_exams'
            ])
        
        # Degree-based
        if nba_attrs.get('has_degree', False):
            actions.extend([
                'degree_structure',
                'career_roles',
                'higher_studies',
                'exit_options'
            ])
        
        # Diploma
        if nba_attrs.get('has_diploma', False):
            actions.extend([
                'diploma_roles',
                'lateral_entry',
                'govt_exams_diploma'
            ])
        
        # Govt service
        if nba_attrs.get('is_govt_service', False):
            actions.extend([
                'service_hierarchy',
                'posting_growth',
                'other_govt_exams'
            ])
        
        # Medical
        if nba_attrs.get('is_medical', False):
            actions.extend([
                'licensing',
                'practice_options',
                'specialization'
            ])
        
        # Skill-based
        if nba_attrs.get('is_skill_based', False):
            actions.extend([
                'required_skills',
                'entry_jobs',
                'certifications',
                'freelance_vs_job'
            ])
        
        return actions
    
    def _build_action_details(self, action_ids: List[str]) -> Dict:
        """Build detailed action information with endpoints"""
        matrix = self.nba_matrix
        rules = self.nba_rules
        
        endpoint_mapping = rules.get('action_to_endpoint_mapping', {})
        
        all_actions = []
        categorized = {}
        
        # Organize by category
        for category_key in ['universal', 'exam_based', 'degree_based', 'diploma', 
                            'govt_service', 'medical', 'skill_based']:
            category_name = category_key.replace('_', ' ').title()
            actions_in_category = []
            
            # Get actions from matrix
            matrix_key = f'{category_key}_actions'
            if matrix_key in matrix:
                for action in matrix[matrix_key]:
                    action_id = action.get('id')
                    if action_id in action_ids:
                        action_detail = {
                            'id': action_id,
                            'label': action.get('label'),
                            'icon': action.get('icon'),
                            'description': action.get('description'),
                            'data_source': action.get('data_source')
                        }
                        
                        # Add endpoint if available
                        if action_id in endpoint_mapping:
                            action_detail['endpoint'] = endpoint_mapping[action_id].get('endpoint')
                            action_detail['method'] = endpoint_mapping[action_id].get('method')
                        
                        actions_in_category.append(action_detail)
                        all_actions.append(action_detail)
            
            if actions_in_category:
                categorized[category_key] = actions_in_category
        
        return {
            'all_actions': all_actions,
            'categorized': categorized
        }
    
    def get_eligibility(self, career_id: str) -> Dict:
        """Get eligibility requirements"""
        if not career_id.startswith('career:'):
            career_id = f'career:{career_id}'
        
        career = self.loader.nodes.get(career_id)
        if not career:
            return {'available': False}
        
        attrs = career.get('attributes', {})
        
        return {
            'available': True,
            'career_name': career.get('display_name'),
            'minimum_education': attrs.get('minimum_education', 'Not specified'),
            'mandatory_subjects': attrs.get('mandatory_subjects', []),
            'entrance_exams': attrs.get('entrance_exams', []),
            'age_limit': attrs.get('age_limit', 'Not specified'),
            'attempts': attrs.get('attempts', 'Unlimited'),
            'eligibility_checklist': self._build_eligibility_checklist(career)
        }
    
    def _build_eligibility_checklist(self, career: Dict) -> List[Dict]:
        """Build eligibility checklist items"""
        checklist = []
        attrs = career.get('attributes', {})
        
        # Standard checks
        checks = [
            ('Education', attrs.get('minimum_education', '')),
            ('Subjects', ', '.join(attrs.get('mandatory_subjects', []))),
            ('Entrance Exam', ', '.join(attrs.get('entrance_exams', []))),
            ('Age Limit', attrs.get('age_limit', '')),
            ('Attempts Allowed', attrs.get('attempts', '')),
        ]
        
        for check_name, check_value in checks:
            if check_value:
                checklist.append({
                    'requirement': check_name,
                    'details': check_value,
                    'status': 'important'
                })
        
        return checklist
    
    def get_similar_careers(self, career_id: str) -> Dict:
        """Get similar careers from graph edges"""
        if not career_id.startswith('career:'):
            career_id = f'career:{career_id}'
        
        career = self.loader.nodes.get(career_id)
        if not career:
            return {'available': False}
        
        similar_careers = []
        
        # Find similar careers in edges
        for edge in self.loader.edges:
            if edge.get('source') == career_id and edge.get('type') == 'career_similar':
                target_id = edge.get('target')
                target_career = self.loader.nodes.get(target_id)
                if target_career:
                    similar_careers.append({
                        'id': target_id,
                        'name': target_career.get('display_name'),
                        'nature': target_career.get('attributes', {}).get('nature'),
                        'reason': edge.get('reason', 'Similar career path')
                    })
        
        return {
            'available': True,
            'career_id': career_id,
            'career_name': career.get('display_name'),
            'similar_careers': similar_careers,
            'comparison_count': len(similar_careers)
        }
    
    def get_failure_paths(self, career_id: str) -> Dict:
        """Get recovery options if exam/degree fails"""
        if not career_id.startswith('career:'):
            career_id = f'career:{career_id}'
        
        career = self.loader.nodes.get(career_id)
        if not career:
            return {'available': False}
        
        failure_paths = []
        attrs = career.get('attributes', {})
        
        # Get failure paths from career attributes
        if 'failure_paths' in attrs:
            failure_paths = attrs['failure_paths']
        else:
            # Generate generic failure paths based on career type
            failure_paths = self._generate_failure_paths(career)
        
        return {
            'available': True,
            'career_id': career_id,
            'career_name': career.get('display_name'),
            'failure_paths': failure_paths,
            'total_options': len(failure_paths),
            'message': 'Don\'t worry! Here are your backup options.'
        }
    
    def _generate_failure_paths(self, career: Dict) -> List[Dict]:
        """Generate generic failure recovery paths"""
        paths = []
        attrs = career.get('attributes', {})
        
        # Based on nature of career, suggest fallbacks
        nature = attrs.get('nature', '').lower()
        
        if 'technical' in nature:
            paths = [
                {'option': 'Retry the entrance exam next year', 'effort': 'Medium'},
                {'option': 'Switch to a related technical field', 'effort': 'Low'},
                {'option': 'Pursue diploma in related field', 'effort': 'Medium'},
                {'option': 'Self-learning + job entry', 'effort': 'High'},
            ]
        elif 'medical' in nature:
            paths = [
                {'option': 'Retry NEET next year with better prep', 'effort': 'Medium'},
                {'option': 'Switch to nursing or paramedical courses', 'effort': 'Low'},
                {'option': 'Pursue B.Sc in medical sciences', 'effort': 'Low'},
                {'option': 'Healthcare management or admin', 'effort': 'Medium'},
            ]
        elif 'govt' in nature.lower() or 'government' in nature.lower():
            paths = [
                {'option': 'Retry the exam next year', 'effort': 'Medium'},
                {'option': 'Try other govt exams (SSC, State PSC)', 'effort': 'Medium'},
                {'option': 'Switch to private sector jobs', 'effort': 'Low'},
                {'option': 'Pursue management studies', 'effort': 'Medium'},
            ]
        else:
            paths = [
                {'option': 'Explore related career paths', 'effort': 'Low'},
                {'option': 'Build alternative skill set', 'effort': 'Medium'},
                {'option': 'Pursue higher education in different field', 'effort': 'Medium'},
                {'option': 'Entrepreneurship/freelancing', 'effort': 'High'},
            ]
        
        return paths
    
    def get_alternate_paths(self, career_id: str) -> Dict:
        """Get alternate routes to the same career"""
        if not career_id.startswith('career:'):
            career_id = f'career:{career_id}'
        
        career = self.loader.nodes.get(career_id)
        if not career:
            return {'available': False}
        
        alternate_paths = []
        
        # Find alternate paths in edges
        for edge in self.loader.edges:
            if edge.get('target') == career_id and edge.get('type') in ['variant_to_career', 'course_to_career']:
                source_id = edge.get('source')
                source_node = self.loader.nodes.get(source_id)
                if source_node:
                    alternate_paths.append({
                        'id': source_id,
                        'name': source_node.get('display_name'),
                        'type': source_node.get('type'),
                        'description': source_node.get('description', 'Alternative path'),
                        'difficulty': edge.get('difficulty', 'Medium')
                    })
        
        return {
            'available': True,
            'career_id': career_id,
            'career_name': career.get('display_name'),
            'alternate_paths': alternate_paths,
            'total_paths': len(alternate_paths),
            'message': 'Multiple routes lead to this career'
        }
