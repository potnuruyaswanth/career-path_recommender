# 🔐 Zero-Hallucination Chatbot Architecture

## Overview
Enterprise-grade chatbot system that ensures **100% accurate answers** by using verified data as the ONLY source of truth.

## Architecture Components

### 1️⃣ Intent Classifier (`chatbot_intent.py`)
**Purpose**: Understand WHAT the user wants (not the answer)

**Features**:
- Rule-based classification (deterministic, no AI)
- Query normalization (lowercase, filler removal)
- Entity extraction (careers, streams, exams, etc.)
- 9 fixed intents (closed world)

**Intents**:
```python
- career_overview
- eligibility_check
- career_steps
- exam_info
- roadmap
- stream_guidance
- course_info
- comparison
- general_guidance
```

### 2️⃣ Decision Engine (`chatbot_decision.py`)
**Purpose**: Decide WHERE answers come from

**Answer Sources**:
- `APP_DATA_ONLY` - Verified JSON data only (eligibility, steps)
- `APP_DATA_GPT_EXPLAIN` - Data + optional GPT rewriting (roadmap, overview)
- `FALLBACK_GENERIC` - Generic guidance message

**Decision Matrix**:
| Intent | Source | GPT Allowed? |
|--------|--------|--------------|
| Eligibility | APP_DATA_ONLY | ❌ No |
| Career Steps | APP_DATA_ONLY | ❌ No |
| Roadmap | APP_DATA_GPT_EXPLAIN | ✅ Rewriting only |
| Stream Guidance | APP_DATA_ONLY | ❌ No |

### 3️⃣ Answer Source (`chatbot_source.py`)
**Purpose**: Fetch verified data from JSON files

**Safety Rules**:
- ✅ Only returns data that exists in JSON
- ❌ Never invents or guesses data
- ✅ Returns `{'available': False}` if data missing

**Methods**:
```python
fetch_career_data()        # Get career from JSON
get_career_eligibility()   # Eligibility requirements
get_career_steps()         # Step-by-step path
get_career_roadmap()       # Career progression
get_stream_guidance()      # Stream options
```

### 4️⃣ Response Formatter (`chatbot_formatter.py`)
**Purpose**: Convert data into consistent UI format

**Formats**:
- Career Intelligence Card format
- Structured sections (Why, What to Study, Skills, Roadmap)
- Markdown formatting for readability

**Optional GPT Enhancement**:
- Used ONLY for rewriting (not adding facts)
- Low temperature (0.3) for consistency
- Falls back to original on error
- Adds `gpt_enhanced: true` metadata

### 5️⃣ Main Endpoint (`/chatbot/ask`)
**Purpose**: Orchestrate the entire flow

**Flow**:
```
User Query
    ↓
Intent Classification (Rule-based)
    ↓
Decision Engine (Determine source)
    ↓
Answer Source (Fetch verified data)
    ↓
Response Formatter (Consistent UI)
    ↓
Optional GPT Explanation (Rewriting only)
    ↓
Return with metadata
```

## Safety Guardrails

### 🚫 GPT is NEVER Allowed to:
- Decide eligibility
- Add career steps
- Change requirements
- Invent data

### ✅ Every Factual Statement Must Exist in:
- `careers.json`
- `courses.json`
- `streams.json`
- `exams/*.json`

### 🔒 Fallback Strategy:
```
If data missing → "I don't have verified data for this yet."
```

## Response Metadata

Every response includes:
```json
{
  "answer": "...",
  "type": "career_card|stream_info|generic|error",
  "intent": "career_steps",
  "confidence": 0.9,
  "source": "APP_DATA_ONLY",
  "verified": true,
  "metadata": {
    "gpt_enhanced": false,
    "data_available": true
  }
}
```

## Frontend Integration

### Visual Indicators:
- ✓ Green badge = Verified from app data
- 🤖 Robot badge = GPT-enhanced explanation
- Green border = Verified answer

### Message Formatting:
- Pre-wrapped text (preserves line breaks)
- Markdown support
- Verified badge display

## Example Queries

### ✅ Accurate Answers (From Verified Data):
```
"How can I start CA foundation in class 12?"
→ Intent: eligibility_check
→ Source: APP_DATA_ONLY
→ Returns: Verified eligibility requirements

"How do I become an engineer?"
→ Intent: career_steps
→ Source: APP_DATA_ONLY
→ Returns: Step-by-step path from JSON

"What streams are available after class 10?"
→ Intent: stream_guidance
→ Source: APP_DATA_ONLY
→ Returns: Stream list from JSON
```

### 🔒 Safe Fallback (No Data):
```
"Tell me about quantum computing careers"
→ Intent: career_overview
→ Source: APP_DATA_ONLY
→ Data: Not available
→ Returns: "I don't have verified data for this yet."
```

## Why This Works

| Approach | Result |
|----------|--------|
| Direct GPT | ❌ Wrong answers, hallucination |
| Rule-only bot | ❌ Rigid, no flexibility |
| **This Architecture** | ✅ Accurate + Smart |

## Benefits

1. **Zero Hallucination**: All facts from verified JSON
2. **Transparent**: Metadata shows data source
3. **Consistent**: Same format everywhere
4. **Safe**: Multiple validation layers
5. **Smart**: Optional GPT for better UX (rewriting only)
6. **Enterprise-Ready**: Production-grade architecture

## Usage

### Backend:
```bash
# Restart backend to load new modules
python -m uvicorn main:app --reload
```

### Frontend:
- Chatbot automatically uses new endpoint
- Shows verified badges
- Enhanced message display

### Testing:
```bash
curl -X POST http://127.0.0.1:8000/chatbot/ask \
  -H "Content-Type: application/json" \
  -d '{"question": "How can I become a CA?"}'
```

## Configuration

### Enable GPT Enhancement (Optional):
```bash
# Set environment variable
export OPENAI_API_KEY="your-key-here"

# GPT will only rewrite (not add facts)
# Falls back gracefully if key missing
```

---

**Last Updated**: January 15, 2026  
**Version**: 2.0.0 (Zero-Hallucination Architecture)  
**Status**: ✅ Production Ready
