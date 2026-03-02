# Versioning System - Complete Guide

## 📋 Table of Contents

1. [Quick Reference](#quick-reference)
2. [Architecture](#architecture)
3. [Integration Steps](#integration-steps)
4. [Deployment Checklist](#deployment-checklist)
5. [Troubleshooting](#troubleshooting)

---

## Quick Reference

### One-Line Version Switch
```python
# File: backend/config.py (line 10)
ACTIVE_DATA_VERSION = "v1"  # Change to "v2", save, restart
```

### Common Tasks

| Task | Steps | Time |
|------|-------|------|
| Use v1 (production) | `ACTIVE_DATA_VERSION = "v1"` → restart | 30s |
| Test v2 (experimental) | `ACTIVE_DATA_VERSION = "v2"` → restart | 30s |
| Rollback from v2 to v1 | `ACTIVE_DATA_VERSION = "v1"` → restart | 30s |
| Add career to v2 | Create `v2/careers/{id}.json` → restart | 1m |
| Validate all data | `python validate_and_setup.py` | 2m |
| Check active version | Look at `backend/config.py` line 10 | 10s |

---

## Architecture

### System Flow

```
User Request (API)
        ↓
   FastAPI Endpoint
        ↓
VersionedDataLoader
        ↓
    config.py
    (Reads ACTIVE_DATA_VERSION)
        ↓
    ┌───┴───┐
    ↓       ↓
  career-data/v1    career-data/v2
  (PRODUCTION)      (EXPERIMENTAL)
  [ACTIVE]          [INACTIVE]
```

### How It Works

1. **User makes API request** → `/career/doctor`
2. **Backend calls data loader** → `load_career("doctor")`
3. **Data loader checks config.py** → `ACTIVE_DATA_VERSION = "v1"`
4. **Data loader reads from v1/** → `career-data/v1/careers/doctor.json`
5. **Data loader validates schema** → Ensures all required fields
6. **Data is returned to user** → Safe, validated data

### Version Control File

**File:** `backend/config.py`

```python
# Line 10 - THE ONLY LINE YOU NEED TO CHANGE
ACTIVE_DATA_VERSION = "v1"

# The rest is automatic:
CAREER_DATA_BASE = f"career-data/{ACTIVE_DATA_VERSION}"
CAREERS_DIR = f"{CAREER_DATA_BASE}/careers"
STREAMS_DIR = f"{CAREER_DATA_BASE}/streams"
EXAMS_DIR = f"{CAREER_DATA_BASE}/exams"
# ... etc, all paths update automatically
```

### Data Loader

**File:** `backend/data_loader_versioned.py`

```python
class VersionedDataLoader:
    def __init__(self):
        # Automatically reads ACTIVE_DATA_VERSION
        self.version = ACTIVE_DATA_VERSION
    
    def load_career(self, career_id):
        # Reads from: career-data/{v1 or v2}/careers/{career_id}.json
        # Validates schema before returning
        # Works exactly like old CareerData class
```

---

## Integration Steps

### Step 1: Verify Directory Structure (< 1 minute)

Confirm all directories exist:

```bash
# Check v1 careers (should have 25 files)
dir career-data\v1\careers

# Check v1 streams (should have 4 files)
dir career-data\v1\streams

# Check v2 mirror (should match v1 structure)
dir career-data\v2\careers
```

### Step 2: Check Backend Config (< 1 minute)

**File:** `backend/config.py`

Verify line 10 exists:
```python
ACTIVE_DATA_VERSION = "v1"
```

### Step 3: Verify Data Loader (< 1 minute)

**File:** `backend/data_loader_versioned.py`

Confirm class exists:
```python
class VersionedDataLoader:
    def load_career(self, career_id):
        # ... implementation
```

### Step 4: Run Validation (2 minutes)

```bash
cd c:\Users\kuruv\project\carrer
python validate_and_setup.py
```

Expected output:
```
v1: 🟢 HEALTHY
  - Careers: 25/25 valid (100%)
  - Status: Ready for production

v2: 🟢 HEALTHY
  - Careers: 0/0 (empty, ready for testing)
  - Status: Ready for production
```

### Step 5: Restart Backend

```bash
# Stop current backend (Ctrl+C if running)
# Restart:
python backend/main.py
```

### Step 6: Test API Endpoint

```bash
# Test with v1 (active)
curl http://localhost:8000/career/doctor

# Should return doctor data from v1
```

### Step 7: Test Version Switch

1. Edit `backend/config.py` line 10:
   ```python
   ACTIVE_DATA_VERSION = "v2"
   ```
2. Restart backend
3. Test API endpoint again:
   ```bash
   curl http://localhost:8000/career/doctor
   ```
4. Should still work (v2 has mirror data)
5. Switch back to v1:
   ```python
   ACTIVE_DATA_VERSION = "v1"
   ```

---

## Deployment Checklist

### Pre-Deployment (Before going live)

- [x] All 25 careers in `career-data/v1/careers/`
- [x] All 4 streams in `career-data/v1/streams/`
- [x] All 8 variants in `career-data/v1/stream_variants/`
- [x] All exams in `career-data/v1/exams/`
- [x] `backend/config.py` exists with `ACTIVE_DATA_VERSION = "v1"`
- [x] `backend/data_loader_versioned.py` exists
- [x] Validation passes: `python validate_and_setup.py`
- [x] v2/ directory exists with mirror structure
- [x] Tested version switching (v1 → v2 → v1)
- [x] Tested API endpoint returns correct data

### Version Integrity Checks

```bash
# Check v1 has 25 careers
ls career-data/v1/careers | wc -l  # Should output: 25

# Check v2 has same structure
ls career-data/v2/careers | wc -l  # Should output: 25

# Validate all data
python validate_and_setup.py  # Should show all GREEN ✅
```

### Production Readiness

- [x] Zero hallucinations (all data verified)
- [x] Schema consistency (all careers follow same format)
- [x] Instant rollback capability (tested)
- [x] A/B testing ready (v1 and v2 both available)
- [x] Documentation complete
- [x] Validation tool included
- [x] No external dependencies

---

## Troubleshooting

### Issue: API returns 404 for career

**Solution:**
1. Check `backend/config.py` line 10 shows `ACTIVE_DATA_VERSION = "v1"`
2. Check `career-data/v1/careers/` contains the career JSON file
3. Restart backend
4. Try API again

### Issue: Version switch doesn't work

**Solution:**
1. Edit `backend/config.py` line 10
2. **Save the file** (very important!)
3. **Restart backend completely** (Ctrl+C, then `python backend/main.py`)
4. Wait 5 seconds for backend to fully start
5. Try API endpoint again

### Issue: Validation fails

**Solution:**
1. Run validation: `python validate_and_setup.py`
2. Check output for which career/version failed
3. Fix the JSON syntax error (check quotes, commas, brackets)
4. Re-run validation
5. All should show ✅ GREEN

### Issue: Career data structure mismatch

**Solution:**
Each career JSON **MUST** have these exact fields:
```json
{
  "career_id": "string",
  "display_name": "string",
  "stream": "science|commerce|arts|vocational",
  "variant": "string",
  "status": "active|deprecated|experimental|under_review",
  "last_verified": "YYYY-MM",
  "entry_paths": ["array"],
  "exams_required": ["array"],
  "salary_band": {
    "entry": "string",
    "mid": "string",
    "senior": "string"
  },
  "failure_safe_paths": ["array"]
}
```

If any field is missing or wrong type, validation will fail.

---

## Testing Scenarios

### Scenario 1: Test New Career in v2 (No Risk)

1. Create: `career-data/v2/careers/new_career.json`
2. Edit config: `ACTIVE_DATA_VERSION = "v2"`
3. Restart backend
4. Test API: `curl http://localhost:8000/career/new_career`
5. If works → Keep it (safe in v2)
6. If fails → Delete and fix, no impact to v1
7. When ready: Copy to v1 and change version back

### Scenario 2: A/B Test Salary Changes

1. Copy v1 to v2: `cp -r career-data/v1/* career-data/v2/`
2. Edit v2 career salary: `career-data/v2/careers/doctor.json` (increase salary)
3. Edit config: `ACTIVE_DATA_VERSION = "v2"`
4. Restart, test new salary
5. If good → Copy changes to v1
6. If bad → Simply switch back to v1 (v2 is untouched)

### Scenario 3: Emergency Rollback

1. Your v2 has corrupted data
2. Users report issues
3. Edit config: `ACTIVE_DATA_VERSION = "v1"`
4. Restart backend
5. **Crisis over** - v1 is always safe

---

## API Integration Example

```python
# Old way (before versioning)
from backend.career_data import CareerData
career = CareerData().load_career("doctor")

# New way (after versioning) - BACKWARD COMPATIBLE
from backend.data_loader_versioned import load_career
career = load_career("doctor")  # Automatically uses active version!

# Both work the same way - data_loader_versioned handles version switching
```

---

## File Locations Reference

| Component | File | Purpose |
|-----------|------|---------|
| Version control | `backend/config.py` | Contains ACTIVE_DATA_VERSION |
| Data loader | `backend/data_loader_versioned.py` | Loads versioned data |
| Production careers | `career-data/v1/careers/` | 25 production career JSONs |
| Test careers | `career-data/v2/careers/` | Experimental career JSONs |
| Validation tool | `validate_and_setup.py` | Validates all career data |
| Data schema docs | `career-data/README.md` | Schema specification |
| This guide | `VERSIONING_GUIDE.md` | Complete versioning documentation |
| Project overview | `README.md` | Quick start + overview |

---

## Key Takeaways

1. **One line controls versioning:** `ACTIVE_DATA_VERSION = "v1"` or `"v2"`
2. **Instant rollback:** < 30 seconds to revert if something breaks
3. **Safe testing:** Experiment in v2, production stays in v1
4. **Backward compatible:** Existing code works without changes
5. **Data validated:** All 25 careers checked before deployment
6. **Zero dependencies:** Pure Python + JSON, no external libraries

---

**Version:** 1.0 | **Last Updated:** 2025-01-18 | **Status:** Production Ready
