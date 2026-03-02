"""
Comprehensive Career Search Module
Searches across streams, careers, exams, and courses
"""

import json
from typing import Dict, List, Optional
from data_loader_versioned import load_career, load_stream, load_exam
from config import CAREERS_DIR, STREAMS_DIR, EXAMS_DIR


class CareerSearch:
    """
    Comprehensive search engine for careers, streams, exams, courses
    """

    @staticmethod
    def search_careers(query: str) -> List[Dict]:
        """
        Search for careers matching query
        Returns list of matching careers with details
        """
        results = []
        query_lower = query.lower()
        
        # Get all career files
        if not CAREERS_DIR.exists():
            return results
            
        for career_file in CAREERS_DIR.glob('*.json'):
            try:
                with open(career_file, 'r', encoding='utf-8') as f:
                    career = json.load(f)
                    
                display_name = career.get('display_name', '').lower()
                description = career.get('description', '').lower()
                id_str = career.get('id', '').lower()
                
                # Match on name, description, or id
                if (query_lower in display_name or 
                    query_lower in description or 
                    query_lower in id_str):
                    results.append({
                        'id': career.get('id'),
                        'name': career.get('display_name'),
                        'description': career.get('description', 'N/A'),
                        'salary_band': career.get('salary_band', {}),
                        'exams': career.get('exams_required', []),
                        'stream': career.get('stream'),
                        'variant': career.get('variant'),
                        'type': 'career'
                    })
            except Exception as e:
                print(f"Error loading career {career_file}: {e}")
                
        return results

    @staticmethod
    def search_streams(query: str) -> List[Dict]:
        """
        Search for streams matching query
        """
        results = []
        query_lower = query.lower()
        
        if not STREAMS_DIR.exists():
            return results
            
        for stream_file in STREAMS_DIR.glob('*.json'):
            try:
                with open(stream_file, 'r', encoding='utf-8') as f:
                    stream = json.load(f)
                    
                display_name = stream.get('display_name', '').lower()
                description = stream.get('description', '').lower()
                id_str = stream.get('id', '').lower()
                
                if (query_lower in display_name or 
                    query_lower in description or 
                    query_lower in id_str):
                    results.append({
                        'id': stream.get('id'),
                        'name': stream.get('display_name'),
                        'description': stream.get('description', 'N/A'),
                        'variants': stream.get('variants', []),
                        'type': 'stream'
                    })
            except Exception as e:
                print(f"Error loading stream {stream_file}: {e}")
                
        return results

    @staticmethod
    def search_exams(query: str) -> List[Dict]:
        """
        Search for exams matching query
        """
        results = []
        query_lower = query.lower()
        
        if not EXAMS_DIR.exists():
            return results
            
        for exam_file in EXAMS_DIR.glob('*.json'):
            try:
                with open(exam_file, 'r', encoding='utf-8') as f:
                    exam = json.load(f)
                    
                display_name = exam.get('display_name', '').lower()
                description = exam.get('description', '').lower()
                id_str = exam.get('id', '').lower()
                
                if (query_lower in display_name or 
                    query_lower in description or 
                    query_lower in id_str):
                    results.append({
                        'id': exam.get('id'),
                        'name': exam.get('display_name'),
                        'description': exam.get('description', 'N/A'),
                        'type': 'exam',
                        'difficulty': exam.get('difficulty', 'N/A'),
                        'passing_score': exam.get('passing_score', 'N/A')
                    })
            except Exception as e:
                print(f"Error loading exam {exam_file}: {e}")
                
        return results

    @staticmethod
    def search_courses(query: str) -> List[Dict]:
        """
        Search for courses matching query
        """
        results = []
        query_lower = query.lower()
        
        courses_dir = CAREERS_DIR.parent / 'courses'
        
        if not courses_dir.exists():
            return results
            
        for course_file in courses_dir.glob('*.json'):
            try:
                with open(course_file, 'r', encoding='utf-8') as f:
                    course = json.load(f)
                    
                display_name = course.get('display_name', '').lower()
                description = course.get('description', '').lower()
                id_str = course.get('id', '').lower()
                
                if (query_lower in display_name or 
                    query_lower in description or 
                    query_lower in id_str):
                    results.append({
                        'id': course.get('id'),
                        'name': course.get('display_name'),
                        'description': course.get('description', 'N/A'),
                        'duration': course.get('duration', 'N/A'),
                        'type': 'course'
                    })
            except Exception as e:
                print(f"Error loading course {course_file}: {e}")
                
        return results

    @staticmethod
    def comprehensive_search(query: str) -> Dict:
        """
        Search across all data types
        Returns comprehensive results for careers, streams, exams, courses
        """
        return {
            'query': query,
            'careers': CareerSearch.search_careers(query),
            'streams': CareerSearch.search_streams(query),
            'exams': CareerSearch.search_exams(query),
            'courses': CareerSearch.search_courses(query),
            'total_results': len(CareerSearch.search_careers(query)) + 
                           len(CareerSearch.search_streams(query)) + 
                           len(CareerSearch.search_exams(query)) + 
                           len(CareerSearch.search_courses(query))
        }
