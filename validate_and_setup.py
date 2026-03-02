#!/usr/bin/env python3
"""
Career Data Versioning - Validation & Setup Script
====================================================

Validates all career data follows the unified schema.
Generates reports and health checks for each version.

Usage:
    python validate_and_setup.py          # Validate all versions
    python validate_and_setup.py v1       # Validate specific version
    python validate_and_setup.py --health  # Health check report
"""

import json
import os
from pathlib import Path
from typing import Dict, List, Tuple
import sys
import argparse
from datetime import datetime

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

try:
    from backend.data_loader_versioned import VersionedDataLoader
except ImportError:
    print("Error: Could not import VersionedDataLoader. Make sure backend/ is in path.")
    sys.exit(1)


class CareerDataValidator:
    """Validates career data against unified schema."""
    
    REQUIRED_FIELDS = {
        "career_id", "display_name", "stream", "variant",
        "status", "last_verified",
        "entry_paths", "exams_required",
        "salary_band", "failure_safe_paths"
    }
    
    REQUIRED_SALARY_BANDS = {"entry", "mid", "senior"}
    VALID_STATUSES = {"active", "deprecated", "experimental", "under_review"}
    VALID_STREAMS = {"science", "commerce", "arts", "vocational"}
    
    def __init__(self):
        self.errors = []
        self.warnings = []
        self.valid_careers = []
    
    def validate_career(self, career_id: str, career: Dict) -> bool:
        """
        Validate single career against schema.
        Returns True if valid, False otherwise.
        """
        self.errors.clear()
        self.warnings.clear()
        
        # Check required fields
        missing = self.REQUIRED_FIELDS - set(career.keys())
        if missing:
            self.errors.append(f"Missing fields: {missing}")
            return False
        
        # Validate career_id format
        if not career.get("career_id"):
            self.errors.append("career_id is empty")
            return False
        
        if career.get("career_id") != career_id.replace(".json", ""):
            self.errors.append(f"career_id '{career['career_id']}' doesn't match filename '{career_id}'")
        
        # Validate display_name
        if not career.get("display_name"):
            self.errors.append("display_name is empty")
            return False
        
        # Validate stream
        if career.get("stream") not in self.VALID_STREAMS:
            self.errors.append(f"Invalid stream: {career.get('stream')}. Valid: {self.VALID_STREAMS}")
        
        # Validate status
        if career.get("status") not in self.VALID_STATUSES:
            self.warnings.append(f"Unknown status: {career.get('status')}. Expected: {self.VALID_STATUSES}")
        
        # Validate last_verified format (YYYY-MM)
        last_verified = career.get("last_verified", "")
        if not last_verified or not self._is_valid_date_format(last_verified):
            self.warnings.append(f"Invalid last_verified: {last_verified}. Expected YYYY-MM format")
        
        # Validate entry_paths
        if not career.get("entry_paths"):
            self.warnings.append("entry_paths is empty")
        elif not isinstance(career.get("entry_paths"), list):
            self.errors.append("entry_paths must be a list")
            return False
        
        # Validate exams_required
        if not isinstance(career.get("exams_required"), list):
            self.errors.append("exams_required must be a list")
            return False
        
        # Validate salary_band
        salary_band = career.get("salary_band", {})
        if not isinstance(salary_band, dict):
            self.errors.append("salary_band must be a dictionary")
            return False
        
        missing_bands = self.REQUIRED_SALARY_BANDS - set(salary_band.keys())
        if missing_bands:
            self.errors.append(f"salary_band missing: {missing_bands}")
            return False
        
        # Validate salary values aren't placeholders
        for band_type, value in salary_band.items():
            if not value or value.upper() in ["TBD", "TBC", "PENDING", "UNKNOWN"]:
                self.errors.append(f"salary_band.{band_type} is placeholder: {value}")
        
        # Validate failure_safe_paths
        if not isinstance(career.get("failure_safe_paths"), list):
            self.errors.append("failure_safe_paths must be a list")
            return False
        
        if not career.get("failure_safe_paths"):
            self.warnings.append("failure_safe_paths is empty")
        
        return len(self.errors) == 0
    
    @staticmethod
    def _is_valid_date_format(date_str: str) -> bool:
        """Check if date is in YYYY-MM format."""
        if not date_str or len(date_str) != 7 or date_str[4] != "-":
            return False
        try:
            year, month = date_str.split("-")
            int(year)
            int(month)
            return True
        except (ValueError, AttributeError):
            return False


def validate_version(version: str) -> Dict:
    """
    Validate entire version directory.
    Returns report dict.
    """
    print(f"\n{'='*70}")
    print(f"📊 VALIDATING VERSION: {version}")
    print(f"{'='*70}")
    
    try:
        loader = VersionedDataLoader(version=version)
    except FileNotFoundError as e:
        print(f"❌ Error: {e}")
        return {
            "version": version,
            "status": "error",
            "message": str(e)
        }
    
    validator = CareerDataValidator()
    careers = loader.get_all_careers()
    
    print(f"\n📂 Checking {len(careers)} careers...")
    
    results = {
        "version": version,
        "total_careers": len(careers),
        "valid": 0,
        "invalid": 0,
        "with_warnings": 0,
        "careers": {},
        "summary": {}
    }
    
    for career_id, career_data in sorted(careers.items()):
        is_valid = validator.validate_career(career_id, career_data)
        
        status = "✅ VALID" if is_valid else "❌ INVALID"
        
        if validator.warnings:
            status += " (⚠️ WARNINGS)"
        
        career_status = career_data.get("status", "unknown")
        salary_entry = career_data.get("salary_band", {}).get("entry", "N/A")
        
        print(f"  {status:20} {career_id:25} [{career_status:12}] {salary_entry}")
        
        if is_valid:
            results["valid"] += 1
        else:
            results["invalid"] += 1
        
        if validator.warnings:
            results["with_warnings"] += 1
        
        results["careers"][career_id] = {
            "valid": is_valid,
            "errors": validator.errors.copy(),
            "warnings": validator.warnings.copy(),
            "status": career_data.get("status"),
            "last_verified": career_data.get("last_verified"),
            "salary_band": career_data.get("salary_band"),
        }
    
    # Summary
    print(f"\n📈 SUMMARY:")
    print(f"  ✅ Valid careers:        {results['valid']}/{len(careers)}")
    print(f"  ❌ Invalid careers:      {results['invalid']}/{len(careers)}")
    print(f"  ⚠️ With warnings:        {results['with_warnings']}/{len(careers)}")
    
    results["summary"] = {
        "valid_percentage": (results["valid"] / len(careers) * 100) if careers else 0,
        "ready_for_production": results["invalid"] == 0,
        "timestamp": datetime.now().isoformat()
    }
    
    if results["invalid"] == 0:
        print(f"\n✅ Version {version} is READY FOR PRODUCTION")
    else:
        print(f"\n⚠️ Fix {results['invalid']} careers before deploying")
        print(f"\nDetailed errors:")
        for cid, details in results["careers"].items():
            if details["errors"]:
                print(f"\n  {cid}:")
                for error in details["errors"]:
                    print(f"    ❌ {error}")
    
    return results


def generate_health_report(reports: List[Dict]):
    """Generate comprehensive health report for all versions."""
    print(f"\n{'='*70}")
    print(f"🏥 HEALTH REPORT - ALL VERSIONS")
    print(f"{'='*70}\n")
    
    for report in reports:
        version = report.get("version")
        if "message" in report:
            print(f"{version}: ❌ ERROR - {report['message']}")
            continue
        
        valid = report.get("valid", 0)
        total = report.get("total_careers", 0)
        percentage = (valid / total * 100) if total > 0 else 0
        
        health_status = "🟢 HEALTHY" if report["summary"].get("ready_for_production") else "🔴 NEEDS FIXES"
        
        print(f"{version}: {health_status}")
        print(f"  - Careers:  {valid}/{total} valid ({percentage:.0f}%)")
        print(f"  - Warnings: {report.get('with_warnings', 0)}")
        print(f"  - Status:   {'Ready for production' if report['summary'].get('ready_for_production') else 'Has issues'}")
        print()


def list_versions():
    """List all available versions."""
    base_path = Path(__file__).parent / "career-data"
    versions = []
    
    for item in base_path.iterdir():
        if item.is_dir() and item.name.startswith("v"):
            versions.append(item.name)
    
    return sorted(versions)


def main():
    parser = argparse.ArgumentParser(
        description="Validate career data versions against unified schema"
    )
    parser.add_argument(
        "version",
        nargs="?",
        help="Specific version to validate (e.g., v1, v2). If omitted, validates all."
    )
    parser.add_argument(
        "--health",
        action="store_true",
        help="Generate health report for all versions"
    )
    parser.add_argument(
        "--list",
        action="store_true",
        help="List all available versions"
    )
    
    args = parser.parse_args()
    
    # List versions
    if args.list:
        versions = list_versions()
        print(f"Available versions: {versions}")
        return
    
    # Get versions to validate
    if args.version:
        versions = [args.version]
    else:
        versions = list_versions()
    
    if not versions:
        print("❌ No versions found in career-data/")
        return
    
    # Validate each version
    reports = []
    for version in versions:
        report = validate_version(version)
        reports.append(report)
    
    # Generate health report
    if args.health or len(versions) > 1:
        generate_health_report(reports)
    
    # Exit with error if any version is invalid
    for report in reports:
        if report.get("invalid", 0) > 0:
            sys.exit(1)


if __name__ == "__main__":
    main()
