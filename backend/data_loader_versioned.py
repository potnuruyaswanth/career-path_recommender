"""
Enhanced Data Loader with Versioning Support
=============================================

Loads career data from versioned directories (v1/, v2/, etc.)
Automatically uses the ACTIVE_DATA_VERSION from config.py

Features:
- Automatic version switching (change config.py, restart)
- Unified schema validation
- Fallback responses on missing data
- Caching support (CachedDataLoader)

Usage:
    from data_loader import VersionedDataLoader, load_career, load_exam, load_roadmap

    # Automatic - uses config.ACTIVE_DATA_VERSION
    career_data = load_career("software_engineer")
    exam_data = load_exam("jee")
    roadmap_data = load_roadmap("iti")
    
    # Or with explicit versioning
    loader = VersionedDataLoader(version="v1")
    doctor = loader.get_career("doctor")
"""

import os
import json
from typing import Dict, List, Any, Optional
from pathlib import Path
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(__file__))

try:
    from config import (
        ACTIVE_DATA_VERSION,
        CAREER_DATA_BASE,
        CAREERS_DIR,
        STREAMS_DIR,
        STREAM_VARIANTS_DIR,
        COURSES_DIR,
        EXAMS_DIR,
        MAPPINGS_DIR,
        FALLBACK_CAREER_RESPONSE,
        FALLBACK_EXAM_RESPONSE,
        FALLBACK_STREAM_RESPONSE,
    )
except ImportError:
    # Fallback if config not available
    ACTIVE_DATA_VERSION = "v1"
    CAREER_DATA_BASE = f"career-data/{ACTIVE_DATA_VERSION}"
    CAREERS_DIR = f"{CAREER_DATA_BASE}/careers"
    STREAMS_DIR = f"{CAREER_DATA_BASE}/streams"
    STREAM_VARIANTS_DIR = f"{CAREER_DATA_BASE}/stream_variants"
    COURSES_DIR = f"{CAREER_DATA_BASE}/courses"
    EXAMS_DIR = f"{CAREER_DATA_BASE}/exams"
    MAPPINGS_DIR = f"{CAREER_DATA_BASE}/mappings"
    FALLBACK_CAREER_RESPONSE = "Career information unavailable. Please try again."
    FALLBACK_EXAM_RESPONSE = "Exam information unavailable. Please try again."
    FALLBACK_STREAM_RESPONSE = "Stream information unavailable. Please try again."


class VersionedDataLoader:
    """
    Loads career data from versioned directories.
    
    Example:
        loader = VersionedDataLoader(version="v1")
        career = loader.get_career("software_engineer")
    """

    def __init__(self, version: Optional[str] = None):
        """
        Initialize loader with optional version override.
        
        Args:
            version: Specific version to load (e.g., "v1", "v2").
                    If None, uses ACTIVE_DATA_VERSION from config.
        """
        self.version = version or ACTIVE_DATA_VERSION
        self.base_path = Path(__file__).parent.parent / "career-data" / self.version
        
        # Verify version directory exists
        if not self.base_path.exists():
            raise FileNotFoundError(f"Version directory not found: {self.base_path}")
        
        self._cache = {}  # Simple in-memory cache

    def _load_json(self, *parts) -> Dict[str, Any]:
        """Load JSON file from versioned directory."""
        path = self.base_path / Path(*parts)
        
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return None
        except json.JSONDecodeError as e:
            print(f"Error decoding JSON from {path}: {e}")
            return None

    def get_career(self, career_id: str) -> Optional[Dict[str, Any]]:
        """
        Load career by ID.
        
        Returns unified schema:
            {
                "career_id": str,
                "display_name": str,
                "stream": str,
                "variant": str,
                "status": str,
                "last_verified": str,
                "entry_paths": list,
                "exams_required": list,
                "salary_band": {"entry": str, "mid": str, "senior": str},
                "failure_safe_paths": list
            }
        """
        if career_id in self._cache:
            return self._cache[career_id]
        
        filename = f"{career_id}.json"
        data = self._load_json("careers", filename)
        
        if data:
            self._cache[career_id] = data
            return data
        return None

    def get_stream(self, stream_id: str) -> Optional[Dict[str, Any]]:
        """Load stream by ID (e.g., 'science', 'commerce')."""
        filename = f"{stream_id}.json"
        return self._load_json("streams", filename)

    def get_variant(self, variant_id: str) -> Optional[Dict[str, Any]]:
        """Load stream variant by ID (e.g., 'mpc', 'bipc')."""
        filename = f"{variant_id}.json"
        return self._load_json("stream_variants", filename)

    def get_exam(self, exam_id: str) -> Optional[Dict[str, Any]]:
        """Load exam by ID (e.g., 'jee', 'neet')."""
        filename = f"{exam_id}.json"
        return self._load_json("exams", filename)

    def get_course(self, course_type: str) -> Optional[Dict[str, Any]]:
        """Load course by type (e.g., 'degree', 'engineering')."""
        # courses.json might be in a single file
        return self._load_json("courses", f"{course_type}.json")

    def get_roadmap(self, career_id: str) -> Optional[Dict[str, Any]]:
        """Load roadmap by career_id (e.g., 'iti', 'ba_humanities')."""
        filename = f"{career_id}.json"
        return self._load_json("roadmaps", filename)

    def get_all_careers(self) -> Dict[str, Dict[str, Any]]:
        """Load all career files."""
        careers = {}
        careers_path = self.base_path / "careers"
        
        if not careers_path.exists():
            return {}
        
        for filename in os.listdir(careers_path):
            if filename.endswith(".json"):
                career_id = filename[:-5]  # Remove .json
                career_data = self._load_json("careers", filename)
                if career_data:
                    careers[career_id] = career_data
        
        return careers

    def get_all_streams(self) -> Dict[str, Dict[str, Any]]:
        """Load all stream files."""
        streams = {}
        streams_path = self.base_path / "streams"
        
        if not streams_path.exists():
            return {}
        
        for filename in os.listdir(streams_path):
            if filename.endswith(".json"):
                stream_id = filename[:-5]
                stream_data = self._load_json("streams", filename)
                if stream_data:
                    streams[stream_id] = stream_data
        
        return streams

    def get_graph_edges(self) -> List[Dict[str, Any]]:
        """Load graph edges for relationships."""
        data = self._load_json("mappings", "graph-edges.json")
        return data.get("graph_edges", []) if data else []

    def validate_career_schema(self, career: Dict[str, Any]) -> bool:
        """
        Validate that career follows unified schema.
        
        Required fields:
            - career_id, display_name, stream, variant
            - status, last_verified
            - entry_paths, exams_required
            - salary_band (with entry, mid, senior)
            - failure_safe_paths
        """
        required_fields = {
            "career_id", "display_name", "stream", "variant",
            "status", "last_verified",
            "entry_paths", "exams_required",
            "salary_band", "failure_safe_paths"
        }
        
        missing = required_fields - set(career.keys())
        if missing:
            print(f"Career {career.get('career_id')} missing fields: {missing}")
            return False
        
        # Validate salary_band structure
        salary_band = career.get("salary_band", {})
        if not all(k in salary_band for k in ["entry", "mid", "senior"]):
            print(f"Career {career.get('career_id')} has incomplete salary_band")
            return False
        
        return True


# ========== GLOBAL LOADER INSTANCE ==========
_default_loader = None

def get_default_loader() -> VersionedDataLoader:
    """Get or create default loader using ACTIVE_DATA_VERSION."""
    global _default_loader
    if _default_loader is None:
        _default_loader = VersionedDataLoader()
    return _default_loader


# ========== CONVENIENCE FUNCTIONS ==========

def load_career(career_id: str) -> Optional[Dict[str, Any]]:
    """Convenience function to load career."""
    loader = get_default_loader()
    return loader.get_career(career_id)


def load_stream(stream_id: str) -> Optional[Dict[str, Any]]:
    """Convenience function to load stream."""
    loader = get_default_loader()
    return loader.get_stream(stream_id)


def load_variant(variant_id: str) -> Optional[Dict[str, Any]]:
    """Convenience function to load stream variant."""
    loader = get_default_loader()
    return loader.get_variant(variant_id)


def load_exam(exam_id: str) -> Optional[Dict[str, Any]]:
    """Convenience function to load exam."""
    loader = get_default_loader()
    return loader.get_exam(exam_id)


def load_roadmap(career_id: str) -> Optional[Dict[str, Any]]:
    """Convenience function to load roadmap by career_id."""
    loader = get_default_loader()
    return loader.get_roadmap(career_id)


def load_all_careers() -> Dict[str, Dict[str, Any]]:
    """Convenience function to load all careers."""
    loader = get_default_loader()
    return loader.get_all_careers()


def load_all_streams() -> Dict[str, Dict[str, Any]]:
    """Convenience function to load all streams."""
    loader = get_default_loader()
    return loader.get_all_streams()


# ========== LEGACY COMPATIBILITY CLASS ==========

class CareerData:
    """
    Legacy compatibility class.
    Wraps VersionedDataLoader to maintain backward compatibility.
    """
    
    def __init__(self, base_path: str = None):
        """Initialize with optional base path (ignored, uses versioned system)."""
        self.loader = VersionedDataLoader()
        self.nodes = {}
        self.edges = []
        self.load_all()
    
    def load_all(self):
        """Load all data into legacy structure."""
        # Load all careers, streams, variants, exams into nodes dict
        careers = self.loader.get_all_careers()
        self.nodes.update(careers)
        
        streams = self.loader.get_all_streams()
        self.nodes.update(streams)
        
        # Load edges
        self.edges = self.loader.get_graph_edges()
    
    def _load_json(self, *parts):
        """Legacy method for loading JSON."""
        return self.loader._load_json(*parts)
    
    def get_node(self, node_id: str) -> Optional[Dict[str, Any]]:
        """Legacy method to get node by ID."""
        return self.nodes.get(node_id)
    
    def get_edges(self) -> List[Dict[str, Any]]:
        """Legacy method to get edges."""
        return self.edges


# ========== ENTRY POINT FOR TESTING ==========

if __name__ == "__main__":
    # Test loader
    print(f"Loading data from version: {ACTIVE_DATA_VERSION}")
    loader = VersionedDataLoader()
    
    # Test career loading
    doctor = loader.get_career("doctor")
    print(f"\nDoctor career: {doctor.get('display_name')}")
    print(f"  Salary band: {doctor.get('salary_band')}")
    print(f"  Status: {doctor.get('status')}")
    
    # Test all careers
    all_careers = loader.get_all_careers()
    print(f"\nTotal careers loaded: {len(all_careers)}")
    for cid, cdata in all_careers.items():
        print(f"  - {cdata.get('display_name')}")
