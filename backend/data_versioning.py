"""
Data Versioning & Career Status Management
Ensures data integrity and tracks career information validity
"""

from enum import Enum
from typing import Dict, List, Any, Optional
from datetime import datetime
import json


class CareerStatus(Enum):
    """Career status indicators."""
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    UNDER_REVIEW = "under_review"
    EXPERIMENTAL = "experimental"


class DataVersion:
    """Manages data versioning."""
    
    # Active version used in production
    ACTIVE_VERSION = "v2"
    
    # Available versions
    AVAILABLE_VERSIONS = ["v1", "v2"]
    
    @classmethod
    def get_active_version(cls) -> str:
        """Get currently active data version."""
        return cls.ACTIVE_VERSION
    
    @classmethod
    def is_version_available(cls, version: str) -> bool:
        """Check if version exists."""
        return version in cls.AVAILABLE_VERSIONS
    
    @classmethod
    def set_active_version(cls, version: str) -> bool:
        """
        Switch active data version.
        Use with caution - affects all new queries.
        """
        if cls.is_version_available(version):
            cls.ACTIVE_VERSION = version
            return True
        return False


class CareerStatusManager:
    """
    Manages career information status.
    Add to career JSON:
    {
        "career_id": "software_engineer",
        "status": "active",
        "last_verified": "2025-12"
    }
    """
    
    # Default: careers should have status field
    STATUS_REQUIREMENTS = {
        "status": CareerStatus.ACTIVE,
        "last_verified": None,
        "warnings": []
    }
    
    @staticmethod
    def add_status_to_career(career_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure career has status metadata."""
        if "status" not in career_data:
            career_data["status"] = CareerStatus.ACTIVE.value
        
        if "last_verified" not in career_data:
            career_data["last_verified"] = datetime.now().strftime("%Y-%m")
        
        if "warnings" not in career_data:
            career_data["warnings"] = []
        
        return career_data
    
    @staticmethod
    def validate_career_status(career_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check career status and add warnings if needed.
        Returns enriched career data.
        """
        result = {
            "is_valid": True,
            "status": career_data.get("status", "active"),
            "last_verified": career_data.get("last_verified"),
            "warnings": []
        }
        
        status = career_data.get("status", "active")
        
        if status == CareerStatus.DEPRECATED.value:
            result["is_valid"] = False
            result["warnings"].append(
                "⚠️ This career information is deprecated and may not be current."
            )
        
        elif status == CareerStatus.UNDER_REVIEW.value:
            result["warnings"].append(
                "⚠️ This career information is under review and may change."
            )
        
        elif status == CareerStatus.EXPERIMENTAL.value:
            result["warnings"].append(
                "⚠️ This is experimental information. Verify with official sources."
            )
        
        return result
    
    @staticmethod
    def add_disclaimer_to_response(career_data: Dict[str, Any]) -> str:
        """
        Generate user-facing disclaimer based on career status.
        """
        status = career_data.get("status", "active")
        
        base_disclaimer = "⚠️ Information may change. Verify with official authority."
        
        if status == CareerStatus.DEPRECATED.value:
            return "This career path is no longer actively promoted. Contact official sources for current information."
        
        elif status == CareerStatus.UNDER_REVIEW.value:
            return "This information is under review and may be updated soon."
        
        elif status == CareerStatus.EXPERIMENTAL.value:
            return "This is experimental information. Verify independently with official sources."
        
        return base_disclaimer


class DataIntegrityChecker:
    """
    Validates data integrity and identifies outdated information.
    """
    
    # Check if data hasn't been verified in more than N months
    MAX_MONTHS_WITHOUT_VERIFICATION = 12
    
    @staticmethod
    def is_data_stale(last_verified: str) -> bool:
        """Check if career data is stale (not verified recently)."""
        try:
            verified_date = datetime.strptime(last_verified, "%Y-%m")
            months_passed = (datetime.now() - verified_date).days // 30
            return months_passed > DataIntegrityChecker.MAX_MONTHS_WITHOUT_VERIFICATION
        except (ValueError, TypeError):
            return True  # Assume stale if we can't parse date
    
    @staticmethod
    def check_career_data_completeness(career_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check if career data has all required fields.
        """
        required_fields = [
            "id",
            "display_name",
            "status",
            "last_verified"
        ]
        
        missing_fields = [field for field in required_fields if field not in career_data]
        
        return {
            "is_complete": len(missing_fields) == 0,
            "missing_fields": missing_fields,
            "is_stale": DataIntegrityChecker.is_data_stale(
                career_data.get("last_verified", "1900-01")
            )
        }
    
    @staticmethod
    def get_data_health_report(careers: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate health report for entire career database.
        """
        report = {
            "total_careers": len(careers),
            "active": 0,
            "deprecated": 0,
            "under_review": 0,
            "experimental": 0,
            "stale_data": 0,
            "incomplete_careers": [],
            "timestamp": datetime.now().isoformat()
        }
        
        for career in careers:
            status = career.get("status", "active")
            
            if status == CareerStatus.ACTIVE.value:
                report["active"] += 1
            elif status == CareerStatus.DEPRECATED.value:
                report["deprecated"] += 1
            elif status == CareerStatus.UNDER_REVIEW.value:
                report["under_review"] += 1
            elif status == CareerStatus.EXPERIMENTAL.value:
                report["experimental"] += 1
            
            if DataIntegrityChecker.is_data_stale(career.get("last_verified", "1900-01")):
                report["stale_data"] += 1
            
            completeness = DataIntegrityChecker.check_career_data_completeness(career)
            if not completeness["is_complete"]:
                report["incomplete_careers"].append({
                    "id": career.get("id"),
                    "missing_fields": completeness["missing_fields"]
                })
        
        return report
