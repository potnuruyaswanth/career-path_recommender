"""
Career Data Enrichment with Salary Bands & Status
Script to add salary, failure paths, and status fields to career data
"""

import json
import os
from typing import Dict, List, Any
from datetime import datetime


# Salary band data (ethical, market-realistic)
SALARY_BANDS = {
    "software_engineer": {
        "entry": "₹3–6 LPA",
        "mid": "₹8–15 LPA",
        "senior": "₹20+ LPA",
        "note": "Varies by skill, location, and organization type"
    },
    "data_scientist": {
        "entry": "₹5–8 LPA",
        "mid": "₹12–20 LPA",
        "senior": "₹25+ LPA",
        "note": "Competitive field; high demand"
    },
    "ai_engineer": {
        "entry": "₹6–10 LPA",
        "mid": "₹15–25 LPA",
        "senior": "₹30+ LPA",
        "note": "Rapidly growing; premium compensation"
    },
    "doctor": {
        "entry": "₹3–5 LPA",
        "mid": "₹8–15 LPA",
        "senior": "₹20+ LPA",
        "note": "Includes government and private sector; varies by specialization"
    },
    "registered_nurse": {
        "entry": "₹2–3 LPA",
        "mid": "₹4–8 LPA",
        "senior": "₹10+ LPA",
        "note": "Growing healthcare sector; specializations pay more"
    },
    "chartered_accountant": {
        "entry": "₹3–6 LPA",
        "mid": "₹10–20 LPA",
        "senior": "₹25+ LPA",
        "note": "High growth post-qualification; practice vs job roles"
    },
    "civil_services": {
        "entry": "₹5.5–6 LPA",
        "mid": "₹10–15 LPA",
        "senior": "₹20+ LPA",
        "note": "Government salary + allowances; job security"
    },
    "architect": {
        "entry": "₹2–4 LPA",
        "mid": "₹6–12 LPA",
        "senior": "₹15+ LPA",
        "note": "Can increase significantly with practice"
    },
    "lawyer": {
        "entry": "₹2–4 LPA",
        "mid": "₹8–15 LPA",
        "senior": "₹25+ LPA",
        "note": "Highly variable; practice vs corporate law"
    },
    "teacher": {
        "entry": "₹1.5–2.5 LPA",
        "mid": "₹3–6 LPA",
        "senior": "₹8+ LPA",
        "note": "Government vs private; government offers pension"
    }
}


class CareerDataEnricher:
    """
    Enriches career data with salary bands, status, and metadata.
    """
    
    @staticmethod
    def enrich_career(career: Dict[str, Any]) -> Dict[str, Any]:
        """
        Add salary, status, and verification fields to career.
        
        Args:
            career: Career object from careers.json
        
        Returns:
            Enriched career object
        """
        
        # Add status fields if missing
        if "status" not in career:
            career["status"] = "active"
        
        if "last_verified" not in career:
            career["last_verified"] = datetime.now().strftime("%Y-%m")
        
        # Extract career ID (remove "career:" prefix)
        career_id = career.get("id", "").replace("career:", "")
        
        # Add salary band if available
        if career_id in SALARY_BANDS:
            career["salary_band"] = SALARY_BANDS[career_id]
        
        # Add data source tracking
        if "metadata" not in career:
            career["metadata"] = {}
        
        career["metadata"]["last_enriched"] = datetime.now().isoformat()
        
        return career
    
    @staticmethod
    def enrich_careers_file(filepath: str) -> bool:
        """
        Enrich all careers in careers.json file.
        
        Args:
            filepath: Path to careers.json
        
        Returns:
            True if successful, False otherwise
        """
        try:
            # Read existing data
            with open(filepath, 'r', encoding='utf-8') as f:
                careers = json.load(f)
            
            # Enrich each career
            enriched_careers = [
                CareerDataEnricher.enrich_career(career)
                for career in careers
            ]
            
            # Backup original
            backup_path = filepath + ".backup"
            if not os.path.exists(backup_path):
                with open(backup_path, 'w', encoding='utf-8') as f:
                    json.dump(careers, f, indent=2, ensure_ascii=False)
                print(f"✓ Backup created: {backup_path}")
            
            # Write enriched data
            with open(filepath, 'w', encoding='utf-8') as f:
                json.dump(enriched_careers, f, indent=2, ensure_ascii=False)
            
            print(f"✓ Enriched {len(enriched_careers)} careers in {filepath}")
            return True
        
        except Exception as e:
            print(f"✗ Error enriching careers: {str(e)}")
            return False
    
    @staticmethod
    def generate_enrichment_report(careers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate report on enrichment status.
        """
        report = {
            "total_careers": len(careers),
            "with_salary": 0,
            "with_status": 0,
            "with_verification_date": 0,
            "by_status": {
                "active": 0,
                "deprecated": 0,
                "under_review": 0,
                "experimental": 0,
                "unknown": 0
            },
            "careers_missing_salary": [],
            "timestamp": datetime.now().isoformat()
        }
        
        for career in careers:
            if "salary_band" in career:
                report["with_salary"] += 1
            else:
                report["careers_missing_salary"].append(
                    career.get("display_name", career.get("id"))
                )
            
            if "status" in career:
                report["with_status"] += 1
                status = career["status"]
                if status in report["by_status"]:
                    report["by_status"][status] += 1
                else:
                    report["by_status"]["unknown"] += 1
            
            if "last_verified" in career:
                report["with_verification_date"] += 1
        
        return report


# Migration script to run in backend startup
def migrate_careers_to_v2():
    """
    One-time migration: enrich all careers with salary and status.
    Call this during backend initialization if needed.
    """
    careers_path = os.path.join(
        os.path.dirname(__file__),
        "..",
        "career-data",
        "careers.json"
    )
    
    if os.path.exists(careers_path):
        success = CareerDataEnricher.enrich_careers_file(careers_path)
        if success:
            # Generate report
            with open(careers_path, 'r', encoding='utf-8') as f:
                careers = json.load(f)
            
            report = CareerDataEnricher.generate_enrichment_report(careers)
            print("\n📊 Enrichment Report:")
            print(f"  Careers with salary: {report['with_salary']}/{report['total_careers']}")
            print(f"  Careers with status: {report['with_status']}/{report['total_careers']}")
            print(f"  Careers with verification: {report['with_verification_date']}/{report['total_careers']}")
            
            if report["careers_missing_salary"]:
                print(f"\n⚠️  Careers missing salary bands:")
                for career in report["careers_missing_salary"]:
                    print(f"     - {career}")
        
        return success
    
    return False


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        print(f"Enriching careers from: {filepath}")
        CareerDataEnricher.enrich_careers_file(filepath)
    else:
        print("Usage: python enrich_career_data.py <path_to_careers.json>")
        print("\nOr import and call migrate_careers_to_v2() in your backend startup")
