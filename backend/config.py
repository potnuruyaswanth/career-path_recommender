"""
Career Data Versioning Configuration
=====================================

Controls which version of career data (v1, v2, v3...) is active.
Change ACTIVE_DATA_VERSION to instantly switch versions without re-deploying.

Rules:
- v1 = LIVE/STABLE (production data, 100% trusted)
- v2+ = EXPERIMENTAL/TEST (new rules, salary updates, new careers, etc.)

To rollback:
1. Change ACTIVE_DATA_VERSION = "v1"
2. Restart backend
3. Done! (< 30 seconds rollback time)
"""

# ========== ACTIVE VERSION (CHANGE THIS TO SWITCH) ==========
ACTIVE_DATA_VERSION = "v1"  # Change to "v2" for experimental, "v3" for staging, etc.

# ========== CAREER DATA PATHS ==========
CAREER_DATA_BASE = f"career-data/{ACTIVE_DATA_VERSION}"

# Sub-directories (relative to CAREER_DATA_BASE)
CAREERS_DIR = f"{CAREER_DATA_BASE}/careers"
STREAMS_DIR = f"{CAREER_DATA_BASE}/streams"
STREAM_VARIANTS_DIR = f"{CAREER_DATA_BASE}/stream_variants"
COURSES_DIR = f"{CAREER_DATA_BASE}/courses"
EXAMS_DIR = f"{CAREER_DATA_BASE}/exams"
MAPPINGS_DIR = f"{CAREER_DATA_BASE}/mappings"

# ========== SPECIFIC CAREER FILES ==========
CAREER_FILES = {
    "software_engineer": f"{CAREERS_DIR}/software_engineer.json",
    "doctor": f"{CAREERS_DIR}/doctor.json",
    "dentist": f"{CAREERS_DIR}/dentist.json",
    "pharmacist": f"{CAREERS_DIR}/pharmacist.json",
    "civil_services": f"{CAREERS_DIR}/civil_services.json",
    "nurse_anm": f"{CAREERS_DIR}/nurse_anm.json",
    "nurse_gnm": f"{CAREERS_DIR}/nurse_gnm.json",
}

# ========== STREAM FILES ==========
STREAM_FILES = {
    "science": f"{STREAMS_DIR}/science.json",
    "commerce": f"{STREAMS_DIR}/commerce.json",
    "arts": f"{STREAMS_DIR}/arts.json",
    "vocational": f"{STREAMS_DIR}/vocational.json",
}

# ========== STREAM VARIANT FILES ==========
VARIANT_FILES = {
    "mpc": f"{STREAM_VARIANTS_DIR}/mpc.json",
    "bipc": f"{STREAM_VARIANTS_DIR}/bipc.json",
    "mec": f"{STREAM_VARIANTS_DIR}/mec.json",
    "hec": f"{STREAM_VARIANTS_DIR}/hec.json",
    "heg": f"{STREAM_VARIANTS_DIR}/heg.json",
    "hsp": f"{STREAM_VARIANTS_DIR}/hsp.json",
    "hpc": f"{STREAM_VARIANTS_DIR}/hpc.json",
    "technical_skills": f"{STREAM_VARIANTS_DIR}/technical_skills.json",
}

# ========== EXAM FILES ==========
EXAM_FILES = {
    "jee": f"{EXAMS_DIR}/jee.json",
    "neet": f"{EXAMS_DIR}/neet.json",
    "upsc": f"{EXAMS_DIR}/upsc.json",
    "ca_foundation": f"{EXAMS_DIR}/ca_foundation.json",
}

# ========== FEATURES & TOGGLES ==========
ENABLE_CACHING = True  # Enable TTL-based caching for performance
CACHE_TTL_SECONDS = 3600  # 1 hour default TTL
CACHE_HIT_TARGET = 0.96  # 96%+ hit rate expected after warm-up

ENABLE_SESSION_MEMORY = True  # Enable session state tracking
SESSION_TIMEOUT_MINUTES = 30  # Auto-expire inactive sessions

ENABLE_ANALYTICS = True  # Enable privacy-first analytics (zero PII)
ANALYTICS_LOG_FILE = "logs/analytics.json"

ENABLE_VERSIONING = True  # Enable data versioning support
VERSIONING_ENABLED_SINCE = "2025-12"

# ========== FALLBACK BEHAVIOR ==========
FALLBACK_CAREER_RESPONSE = "I couldn't find detailed information for that career. Would you like to explore alternative paths?"
FALLBACK_EXAM_RESPONSE = "Exam details unavailable. Please contact support or try another exam."
FALLBACK_STREAM_RESPONSE = "That stream isn't available in your region. Let's explore alternatives."

# ========== VERSION METADATA ==========
VERSION_METADATA = {
    "v1": {
        "status": "active",
        "created_date": "2025-01-18",
        "description": "Stable production data - all careers, exams, streams verified",
        "careers": 7,
        "exams": 5,
        "streams": 4,
        "variants": 8,
    },
    "v2": {
        "status": "experimental",
        "created_date": "2025-01-18",
        "description": "Upcoming changes - new salary bands, failure-safe paths improvements",
        "careers": 7,
        "exams": 5,
        "streams": 4,
        "variants": 8,
    },
}

# ========== HELPER FUNCTION TO GET CURRENT VERSION INFO ==========
def get_active_version_info():
    """Returns metadata about the currently active version."""
    return VERSION_METADATA.get(ACTIVE_DATA_VERSION, {})


def is_version_experimental():
    """Returns True if active version is experimental (v2+)."""
    return ACTIVE_DATA_VERSION != "v1"


def get_fallback_message(message_type="career"):
    """Returns user-friendly fallback message based on type."""
    fallback_map = {
        "career": FALLBACK_CAREER_RESPONSE,
        "exam": FALLBACK_EXAM_RESPONSE,
        "stream": FALLBACK_STREAM_RESPONSE,
    }
    return fallback_map.get(message_type, "Information unavailable. Please try again later.")
