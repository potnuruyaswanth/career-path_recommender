# Career Data Versioning System

Complete guide to the versioned career data structure implemented for instant rollback, A/B testing, and safe data updates.

## 📋 Quick Overview

```
career-data/
├── v1/                    # LIVE / STABLE (production)
│   ├── careers/           # 25 career files ✅
│   ├── streams/           # 4 stream files
│   ├── stream_variants/   # 8 variant files
│   ├── courses/           # Course definitions
│   ├── exams/             # 5+ exam files
│   └── mappings/          # Graph edges & relationships
│
├── v2/                    # EXPERIMENTAL / TESTING
│   └── (same structure as v1)
│
└── README.md              # This file
```

## 📊 Current Data (v1)

**25 Careers Across 4 Streams:**
- 🔬 **Science** (8): Engineer, Doctor, Dentist, Pharmacist, Nursing, Architect
- 💼 **Commerce** (7): CA, CS, CMA, B.Com, BBA, BMS
- 📚 **Arts** (9): Economics, Political Science, History, Sociology, Psychology, Geography, Literature, Social Work, Public Admin
- 🛠️ **Vocational** (1): Nursing Assistant

## 🎯 What Goes Where

### ✅ v1 = LIVE / PRODUCTION
Put data here if you are **100% confident** it's correct:
- Current salary bands verified with real data
- Existing exam eligibility rules
- Stable career roadmaps
- Proven failure-safe paths
- Data last verified within 3 months

**Example:** `v1/careers/doctor.json` - NEET requirement, salary ranges confirmed

### ⚠️ v2+ = EXPERIMENTAL / TESTING
Put data here for testing before going live:
- New salary band updates
- Newly added careers
- Revised failure-safe path improvements
- UI-driven schema changes
- Exam rule changes (e.g., reduced attempts)
- New certifications or variants

**Example:** `v2/careers/data_scientist.json` - New career not yet in production

## 🔧 How to Switch Versions

### Method 1: Config File (Recommended)

Edit `backend/config.py`:

```python
ACTIVE_DATA_VERSION = "v1"  # Change to "v2" for experimental
```

Then restart backend:

```bash
python main.py
```

**Rollback time: < 30 seconds** ⚡

### Method 2: Environment Variable

```bash
# Start with v2
ACTIVE_DATA_VERSION=v2 python main.py
```

### Method 3: Runtime (Future)

API endpoint to switch versions (planned):

```bash
POST /api/admin/version/switch
{
  "version": "v2",
  "reason": "Testing new salary bands"
}
```

## 📊 Unified Career Schema

**Every career file MUST follow this exact structure:**

```json
{
  "career_id": "string (unique identifier)",
  "display_name": "string (user-facing name)",
  "stream": "string (science|commerce|arts|vocational)",
  "variant": "string (mpc|bipc|hec|hpc|etc)",
  
  "status": "active|deprecated|experimental|under_review",
  "last_verified": "YYYY-MM (when data was last checked)",
  
  "entry_paths": [
    "string (course/degree paths)"
  ],
  
  "exams_required": [
    "string (exam_id from exams/ folder)"
  ],
  
  "salary_band": {
    "entry": "₹X–Y LPA (first 2-3 years)",
    "mid": "₹X–Y LPA (5-8 years experience)",
    "senior": "₹X+ LPA (10+ years)"
  },
  
  "failure_safe_paths": [
    "string (alternative career paths if primary goal fails)"
  ]
}
```

### Example: `v1/careers/software_engineer.json`

```json
{
  "career_id": "software_engineer",
  "display_name": "Software Engineer",
  "stream": "science",
  "variant": "mpc",
  
  "status": "active",
  "last_verified": "2025-12",
  
  "entry_paths": [
    "b_tech_cse",
    "b_sc_cs",
    "bca"
  ],
  
  "exams_required": [
    "jee",
    "state_cet"
  ],
  
  "salary_band": {
    "entry": "₹4–8 LPA",
    "mid": "₹10–18 LPA",
    "senior": "₹25+ LPA"
  },
  
  "failure_safe_paths": [
    "IT support roles",
    "Web development certifications",
    "Freelancing / startups"
  ]
}
```

## 📁 File Structure Reference

### `/careers` - Career Definitions
- `software_engineer.json` - Software Engineer
- `doctor.json` - Doctor (MBBS)
- `dentist.json` - Dentist (BDS)
- `pharmacist.json` - Pharmacist
- `civil_services.json` - Civil Services (IAS/IPS/IFS)
- `nurse_anm.json` - Auxiliary Nurse Midwifery
- `nurse_gnm.json` - General Nursing & Midwifery

### `/streams` - Stream Definitions
- `science.json` - Science stream (MPC, BiPC, etc)
- `commerce.json` - Commerce stream (HEC, HEG, etc)
- `arts.json` - Arts stream (HEC, HEG, HSP, etc)
- `vocational.json` - Vocational/Skill-based paths

### `/stream_variants` - Specific Combinations
- `mpc.json` - Mathematics, Physics, Chemistry (Engineering focus)
- `bipc.json` - Biology, Physics, Chemistry (Medical focus)
- `mec.json` - Math, Economics, CS (Mixed)
- `hec.json` - History, Economics, Commerce (Admin focus)
- `heg.json` - History, Economics, Geography (Social sciences)
- `hsp.json` - History, Sociology, Philosophy (Philosophy focus)
- `hpc.json` - History, Political Science, Commerce (Law focus)
- `technical_skills.json` - Technical certifications

### `/courses` - Course Definitions
- `degree.json` - Degree programs
- `engineering.json` - Engineering specializations
- `medical.json` - Medical programs
- `diploma.json` - Diploma programs

### `/exams` - Competitive/Entrance Exams
- `jee.json` - JEE Main/Advanced
- `neet.json` - NEET (Medical)
- `upsc.json` - UPSC Civil Services
- `ca_foundation.json` - CA Foundation
- `cma_foundation.json` - CMA Foundation
- `cs_foundation.json` - CS Foundation
- `ssc.json` - SSC Exams
- `state_cet.json` - State CET
- `state_psc.json` - State PSC
- (add more as needed)

### `/mappings` - Relationship Graphs
- `graph-edges.json` - Stream→Career, Exam→Career relationships

## 💻 Backend Code Integration

### Using VersionedDataLoader

```python
from backend.data_loader_versioned import VersionedDataLoader, load_career

# Automatic - uses ACTIVE_DATA_VERSION from config.py
doctor = load_career("doctor")
print(doctor["salary_band"]["entry"])  # ₹6–10 LPA

# Or with explicit version
loader = VersionedDataLoader(version="v1")
engineer = loader.get_career("software_engineer")

# Get all careers
all_careers = loader.get_all_careers()
for career_id, career_data in all_careers.items():
    print(career_data["display_name"])

# Validate schema
is_valid = loader.validate_career_schema(doctor)
```

### Using Legacy CareerData Class (Backward Compatible)

```python
from backend.data_loader import CareerData

# Still works - automatically uses versioned system
data = CareerData()
careers = data.nodes  # Contains all careers

# Access specific career
doctor = data.get_node("doctor")
```

### In FastAPI Endpoints

```python
from fastapi import APIRouter
from backend.data_loader_versioned import load_career, get_default_loader

router = APIRouter()

@router.get("/career/{career_id}")
async def get_career_details(career_id: str):
    career = load_career(career_id)
    if not career:
        return {"error": "Career not found"}
    return career

@router.get("/version")
async def get_active_version():
    from backend.config import ACTIVE_DATA_VERSION, get_active_version_info
    return {
        "version": ACTIVE_DATA_VERSION,
        "info": get_active_version_info()
    }

@router.get("/admin/validate-all")
async def validate_all_careers():
    """Validate all careers follow unified schema."""
    loader = get_default_loader()
    careers = loader.get_all_careers()
    
    results = {
        "total": len(careers),
        "valid": 0,
        "invalid": 0,
        "errors": []
    }
    
    for cid, cdata in careers.items():
        if loader.validate_career_schema(cdata):
            results["valid"] += 1
        else:
            results["invalid"] += 1
            results["errors"].append(cid)
    
    return results
```

## 🚀 Instant Rollback Example

### Scenario: v2 Salary Bands Break Something

1. **Before deployment:** You updated all salary bands in v2/
2. **After deployment:** Users complaining about wrong salaries
3. **Rollback:**

```python
# backend/config.py
ACTIVE_DATA_VERSION = "v1"  # Changed from "v2"
```

Restart backend:

```bash
python main.py
```

**Result:** System instantly uses old salary data ✅

No code changes. No cache clearing. No database migration. **< 30 seconds total.**

## 🔄 Versioning Workflow

### Adding a New Career

1. **Create in v2 first (testing):**
   ```json
   // v2/careers/data_scientist.json
   {
     "career_id": "data_scientist",
     "display_name": "Data Scientist",
     ...
   }
   ```

2. **Test in v2:**
   ```python
   ACTIVE_DATA_VERSION = "v2"  # In config.py
   # Run tests, verify it works
   ```

3. **Once verified, copy to v1:**
   ```bash
   cp career-data/v2/careers/data_scientist.json \
      career-data/v1/careers/data_scientist.json
   ```

4. **Switch backend:**
   ```python
   ACTIVE_DATA_VERSION = "v1"  # Update to v1
   # Restart backend
   ```

### Updating Salary Data

1. **In v2:**
   - Update salary_band for multiple careers
   - Set `last_verified` to current month
   - Add new failure_safe_paths if needed

2. **Validate:**
   ```python
   curl http://localhost:8000/admin/validate-all
   # Check for errors
   ```

3. **A/B Test (Future):**
   - Run 10% of traffic on v2
   - Monitor conversion/satisfaction
   - If good → switch 100% to v2
   - If bad → stay on v1

4. **Deploy to v1 once confident**

## 📊 Data Status Tracking

Track what's in each version:

| Career | v1 Status | v2 Status | Notes |
|--------|-----------|-----------|-------|
| Software Engineer | active | active | Both verified 2025-12 |
| Data Scientist | — | experimental | New career, testing |
| Doctor | active | deprecated | Salary band changes in prep |
| Dentist | active | active | No changes planned |

## ✅ Validation Checklist

Before switching to a new version:

- [ ] All careers have `career_id`
- [ ] All careers have `display_name`
- [ ] All careers have `status` (active/experimental/deprecated)
- [ ] All careers have `last_verified` (YYYY-MM format)
- [ ] All careers have `salary_band` with entry/mid/senior
- [ ] All exams are properly mapped to careers
- [ ] Failure-safe paths are realistic alternatives
- [ ] No career is left with empty `entry_paths`
- [ ] No salary data is placeholder text (e.g., "TBD")
- [ ] All stream/variant references are valid
- [ ] Ran schema validation script (see section below)

## 🛠️ Validation Script

Run this before switching versions:

```python
# validate_version.py
from backend.data_loader_versioned import VersionedDataLoader

def validate_version(version: str):
    loader = VersionedDataLoader(version=version)
    careers = loader.get_all_careers()
    
    print(f"\n📊 Validating version {version}")
    print(f"Total careers: {len(careers)}")
    
    valid = 0
    invalid = 0
    
    for career_id, career_data in careers.items():
        if loader.validate_career_schema(career_data):
            valid += 1
        else:
            invalid += 1
            print(f"❌ {career_id}: Invalid schema")
    
    print(f"\n✅ Valid: {valid}")
    print(f"❌ Invalid: {invalid}")
    
    if invalid == 0:
        print(f"\n✅ Version {version} is ready for production!")
    else:
        print(f"\n⚠️ Fix {invalid} issues before deploying")

if __name__ == "__main__":
    validate_version("v1")
    validate_version("v2")
```

Run it:

```bash
python validate_version.py
```

## 📈 Performance Impact

- **No performance loss** - Same data structure, just organized by version
- **Caching still works** - `cache_manager.py` compatible
- **Session memory unaffected** - `chat_session.py` compatible
- **Analytics unaffected** - `analytics.py` tracks across versions

## 🎓 Common Tasks

### Task 1: Switch to v2 for Testing
```python
# backend/config.py
ACTIVE_DATA_VERSION = "v2"
# Restart: python main.py
```

### Task 2: Rollback to v1
```python
# backend/config.py
ACTIVE_DATA_VERSION = "v1"
# Restart: python main.py
```

### Task 3: Copy v2 Changes to v1
```bash
# Linux/Mac
cp -r career-data/v2/* career-data/v1/

# Windows PowerShell
Copy-Item -Path "career-data/v2/*" -Destination "career-data/v1/" -Recurse -Force
```

### Task 4: Create v3 for Major Overhaul
```bash
# Copy v1 as base for v3
cp -r career-data/v1 career-data/v3

# Edit files in v3
# Test with ACTIVE_DATA_VERSION = "v3"
```

## 🔐 Security & Privacy

- ✅ No versioning of user data
- ✅ No PII in any career files
- ✅ Analytics still privacy-first
- ✅ Versioning is config-only (no code changes)
- ✅ All versions read-only from user perspective

## 🚨 Troubleshooting

### Problem: "Version directory not found"
**Solution:** Verify folder structure exists:
```bash
ls career-data/v1/  # Should show: careers/ streams/ exams/ etc
```

### Problem: Career data returns empty
**Solution:** Check ACTIVE_DATA_VERSION in config.py:
```python
print(ACTIVE_DATA_VERSION)  # Should be "v1" or "v2"
```

### Problem: Old data still showing after switching
**Solution:** Clear cache and restart:
```bash
# Delete cache files if using persistent cache
# Restart backend
python main.py
```

## 📚 References

- [config.py](backend/config.py) - Versioning configuration
- [data_loader_versioned.py](backend/data_loader_versioned.py) - Loader implementation
- [cache_manager.py](backend/cache_manager.py) - Caching layer
- [analytics.py](backend/analytics.py) - Privacy-first analytics
- [chat_session.py](backend/chat_session.py) - Session management

---

**Version:** v1.0  
**Last Updated:** 2025-01-18  
**Status:** ✅ Production Ready
