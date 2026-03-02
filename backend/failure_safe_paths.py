"""
Failure-Safe Paths
Alternative routes when exams/paths don't work out
Builds user trust through honest guidance
"""

from typing import Dict, List, Any, Optional


class FailureSafePath:
    """
    Manages alternative career paths when primary goal fails.
    Reduces anxiety by showing options beyond pass/fail.
    """
    
    # Default failure paths for different exam types
    EXAM_FAILURE_PATHS = {
        "ca_foundation": [
            {
                "id": "retry",
                "name": "Retry next attempt",
                "description": "Take CA Foundation again in the next session",
                "difficulty": "Same",
                "timeline": "6 months"
            },
            {
                "id": "switch_bcom_mba",
                "name": "B.Com + MBA",
                "description": "Switch to MBA path for management roles",
                "difficulty": "Similar",
                "timeline": "3-4 years",
                "outcome": "Finance Manager, Business Analyst"
            },
            {
                "id": "switch_cs",
                "name": "Company Secretary (CS)",
                "description": "Similar field, potentially easier path to chartered status",
                "difficulty": "Similar",
                "timeline": "4.5 years",
                "outcome": "Corporate Secretary, Compliance Officer"
            },
            {
                "id": "switch_cma",
                "name": "Cost Management Accountant (CMA)",
                "description": "Alternative accounting professional qualification",
                "difficulty": "Similar",
                "timeline": "4-5 years",
                "outcome": "Cost Accountant, Financial Analyst"
            },
            {
                "id": "accounting_job",
                "name": "Accounting job roles",
                "description": "Pursue accounting positions without full CA qualification",
                "difficulty": "Easier",
                "timeline": "Immediate",
                "outcome": "Accountant, Finance Associate, Audit Assistant"
            }
        ],
        
        "neet": [
            {
                "id": "retry",
                "name": "Retry NEET",
                "description": "Prepare better and attempt NEET again",
                "difficulty": "Same",
                "timeline": "1 year"
            },
            {
                "id": "state_medical_entrance",
                "name": "State Medical Entrance Exams",
                "description": "State-level MBBS/BDS entrance (often easier)",
                "difficulty": "Slightly easier",
                "timeline": "6-12 months",
                "outcome": "MBBS/BDS from state colleges"
            },
            {
                "id": "nursing",
                "name": "Nursing (B.Sc Nursing)",
                "description": "Healthcare field with better entrance odds",
                "difficulty": "Easier",
                "timeline": "Direct admission possible",
                "outcome": "Registered Nurse, Healthcare Professional"
            },
            {
                "id": "bsc_science",
                "name": "B.Sc (Biology/Genetics)",
                "description": "Science degree without medical entrance",
                "difficulty": "Easier",
                "timeline": "Direct admission",
                "outcome": "Geneticist, Lab Technician, Research"
            },
            {
                "id": "pharmacy",
                "name": "Pharmacy (D.Pharm / B.Pharm)",
                "description": "Healthcare field related to medicine",
                "difficulty": "Easier",
                "timeline": "Lower entrance barrier",
                "outcome": "Pharmacist, Drug Safety Officer"
            },
            {
                "id": "healthcare_admin",
                "name": "Healthcare Administration",
                "description": "Healthcare management without clinical path",
                "difficulty": "Easier",
                "timeline": "Pursue after 12th",
                "outcome": "Hospital Administrator, Health Manager"
            }
        ],
        
        "jee": [
            {
                "id": "retry",
                "name": "Retry JEE",
                "description": "Better preparation and attempt again",
                "difficulty": "Same",
                "timeline": "1 year"
            },
            {
                "id": "state_engineering",
                "name": "State Engineering Entrance",
                "description": "State CET exams (often easier than JEE)",
                "difficulty": "Easier",
                "timeline": "Available yearly",
                "outcome": "B.Tech from state colleges"
            },
            {
                "id": "diploma_engineering",
                "name": "Diploma in Engineering",
                "description": "2-year diploma program, direct admission",
                "difficulty": "Easier",
                "timeline": "Direct admission, faster completion",
                "outcome": "Junior Engineer, lateral entry to B.Tech"
            },
            {
                "id": "bsc_engineering",
                "name": "B.Sc (Physics/Math)",
                "description": "Engineering-related science degree",
                "difficulty": "Easier",
                "timeline": "Direct admission",
                "outcome": "Scientist, Researcher, Teacher"
            },
            {
                "id": "iit_distancing",
                "name": "ITI (Industrial Training)",
                "description": "Skilled technical training, faster employment",
                "difficulty": "Easier",
                "timeline": "1-2 years",
                "outcome": "Technician, Supervisor roles"
            },
            {
                "id": "btech_lateral",
                "name": "Diploma → B.Tech Lateral Entry",
                "description": "Do diploma first, then lateral entry to B.Tech",
                "difficulty": "Structured path",
                "timeline": "2 + 2 years",
                "outcome": "B.Tech degree with guaranteed entry"
            }
        ],
        
        "upsc": [
            {
                "id": "retry",
                "name": "Retry UPSC",
                "description": "Better preparation and attempt again (attempt limit: 7)",
                "difficulty": "Same",
                "timeline": "1 year"
            },
            {
                "id": "state_psc",
                "name": "State PSC / MPSC",
                "description": "State-level civil services exam",
                "difficulty": "Similar / Easier",
                "timeline": "Ongoing",
                "outcome": "State IAS/IPS equivalent"
            },
            {
                "id": "ssc",
                "name": "SSC (CGL / CHSL / MTS)",
                "description": "Central government jobs, easier selection",
                "difficulty": "Easier",
                "timeline": "Multiple attempts yearly",
                "outcome": "Government officer roles"
            },
            {
                "id": "banking_insurance",
                "name": "Banking / Insurance exams",
                "description": "Financial sector government jobs",
                "difficulty": "Easier",
                "timeline": "Year-round",
                "outcome": "Bank officer, Insurance executive"
            },
            {
                "id": "railways",
                "name": "Railway recruitment",
                "description": "Government railway jobs",
                "difficulty": "Easier",
                "timeline": "Periodic",
                "outcome": "Railway officer"
            },
            {
                "id": "corporate_governance",
                "name": "Corporate Management",
                "description": "Private sector officer roles",
                "difficulty": "Potentially easier",
                "timeline": "Ongoing",
                "outcome": "Manager, Executive roles"
            }
        ],
        
        "jee_advanced": [
            {
                "id": "retry",
                "name": "Retry JEE Advanced",
                "description": "Prepare better and attempt again (attempt limit: 2)",
                "difficulty": "Same",
                "timeline": "Next year only"
            },
            {
                "id": "iit_jee_main_nits",
                "name": "Pursue NIT B.Tech",
                "description": "Excellent colleges through JEE Main (if qualified)",
                "difficulty": "Already qualified",
                "timeline": "Immediate",
                "outcome": "B.Tech from premier NIT"
            },
            {
                "id": "university_engineering",
                "name": "State University B.Tech",
                "description": "Good engineering colleges through state entrance",
                "difficulty": "Easier path",
                "timeline": "Parallel attempts",
                "outcome": "B.Tech degree"
            },
            {
                "id": "iit_entrance_coaching",
                "name": "Coaching for IIT (if in early year)",
                "description": "Consider more structured coaching",
                "difficulty": "Same",
                "timeline": "1-2 years"
            }
        ]
    }
    
    # Default failure paths for career choices
    CAREER_FAILURE_PATHS = {
        "software_engineer": [
            {
                "id": "data_science",
                "name": "Data Science / AI Engineer",
                "description": "Similar technical skills, high demand",
                "difficulty": "Related",
                "timeline": "Can transition with courses"
            },
            {
                "id": "systems_admin",
                "name": "System Administrator / DevOps",
                "description": "Infrastructure and operations",
                "difficulty": "Related",
                "timeline": "Direct role transition"
            },
            {
                "id": "qa_engineer",
                "name": "QA / Testing Engineer",
                "description": "Quality assurance and testing",
                "difficulty": "Similar",
                "timeline": "Direct role transition"
            },
            {
                "id": "product_manager",
                "name": "Product Manager / Manager",
                "description": "Management career in tech",
                "difficulty": "Step up",
                "timeline": "After experience"
            }
        ],
        
        "doctor": [
            {
                "id": "nursing",
                "name": "Nursing",
                "description": "Healthcare professional role",
                "difficulty": "Similar",
                "timeline": "Direct to B.Sc Nursing"
            },
            {
                "id": "pharmacy",
                "name": "Pharmacy",
                "description": "Healthcare & pharmaceutical roles",
                "difficulty": "Similar",
                "timeline": "Direct admission"
            },
            {
                "id": "dentistry",
                "name": "Dentistry / BDS",
                "description": "Healthcare specialization",
                "difficulty": "Similar",
                "timeline": "Medical entrance"
            },
            {
                "id": "biomedical",
                "name": "Biomedical Engineering",
                "description": "Medical device and healthcare tech",
                "difficulty": "Similar",
                "timeline": "Engineering path"
            }
        ]
    }
    
    @staticmethod
    def get_exam_failure_paths(exam_id: str) -> List[Dict[str, Any]]:
        """
        Get failure paths for specific exam.
        
        Args:
            exam_id: Exam identifier (e.g., "neet", "jee", "ca_foundation")
        
        Returns:
            List of alternative paths
        """
        return FailureSafePath.EXAM_FAILURE_PATHS.get(exam_id, [])
    
    @staticmethod
    def get_career_failure_paths(career_id: str) -> List[Dict[str, Any]]:
        """
        Get failure paths for career choice.
        Shows what to do if you want to pivot.
        
        Args:
            career_id: Career identifier (e.g., "software_engineer", "doctor")
        
        Returns:
            List of alternative careers
        """
        return FailureSafePath.CAREER_FAILURE_PATHS.get(career_id, [])
    
    @staticmethod
    def add_failure_paths_to_exam(exam_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add failure paths to exam response.
        """
        exam_id = exam_data.get("id", "").lower()
        failure_paths = FailureSafePath.get_exam_failure_paths(exam_id)
        
        if failure_paths:
            exam_data["failure_paths"] = failure_paths
            exam_data["failure_message"] = (
                "If you don't clear this exam, here are alternative paths "
                "to achieve your career goals:"
            )
        
        return exam_data
    
    @staticmethod
    def add_failure_paths_to_career(career_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add failure paths to career response.
        Shows pivots if person changes mind.
        """
        career_id = career_data.get("id", "").replace("career:", "").lower()
        failure_paths = FailureSafePath.get_career_failure_paths(career_id)
        
        if failure_paths:
            career_data["alternative_careers"] = failure_paths
            career_data["alternative_message"] = (
                "Want to explore related careers? Here are some options:"
            )
        
        return career_data
    
    @staticmethod
    def generate_encouragement_message(failure_context: str) -> str:
        """
        Generate encouraging message based on failure context.
        Reduce fear and build trust.
        """
        messages = {
            "exam_fail": (
                "Remember: Not clearing an exam doesn't define your career. "
                "Many successful people took unconventional paths. "
                "Let's explore what options work best for you."
            ),
            "career_change": (
                "Career changes are completely normal. "
                "Your skills and interests may evolve, and that's perfectly fine. "
                "Let's find what excites you."
            ),
            "stream_change": (
                "Changing your stream or career goal is not failure—it's learning. "
                "Many successful people switched paths based on their interests."
            ),
            "restart": (
                "It's never too late to start over or try something new. "
                "The best career is one you're passionate about."
            )
        }
        
        return messages.get(failure_context, messages["exam_fail"])
