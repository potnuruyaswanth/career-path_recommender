from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import os
import requests
import json
from typing import Optional
from pathlib import Path
from data_loader import CareerData
from chatbot_nba import NBAEngine

app = FastAPI(title='Career Path API')
loader = CareerData()  # Create a fresh instance and load all data - Updated with complete career details
nba_engine = NBAEngine(loader)  # Initialize NBA engine for next-best-action recommendations
# Reload trigger: Software Engineer roadmap updated with detailed phases

# Helpers
def _norm_id(prefix: str, value: str) -> str:
    return value if value.startswith(f"{prefix}:") else f"{prefix}:{value}"

# CORS origins - Production (Vercel) + Local development (commented for production)
origins = [
    # Production domains (Vercel)
    "https://career-path-navigator-sobk.vercel.app",
    "https://www.career-path-navigator-sobk.vercel.app",
    
    # Production Render backend (self-reference for direct API calls)
    "https://career-navigator-backend-7el6.onrender.com",

    # Local development
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    # Allow all Vercel preview domains and Render deployment domains
    allow_origin_regex=r"https://(.*\.vercel\.app|.*\.onrender\.com|.*\.herokuapp\.com|.*\d+\.\d+\.\d+\.\d+.*)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve static frontend files (optional unified deployment)
public_dir = Path(__file__).parent.parent / "public"
if public_dir.exists():
    app.mount("/", StaticFiles(directory=str(public_dir), html=True), name="public")
else:
    # Fallback for development
    @app.get("/")
    def root():
        return {"message": "Career Path API - Frontend not mounted. Use /docs for API documentation."}

@app.get('/streams')
def get_streams(class_param: Optional[str] = Query('10', alias='class')):
    """Return streams available for a class (e.g., ?class=10)."""
    streams = loader.get_streams_for_class(class_param)
    if not streams:
        raise HTTPException(status_code=404, detail='No streams found for the specified class')
    return {'class': class_param, 'streams': streams}

@app.get('/paths')
def get_paths(variant: str = Query(...)):
    """Return valid paths (courses -> careers) for a given stream variant (e.g., ?variant=mpc)."""
    res = loader.get_paths_for_variant(variant)
    # Return empty paths instead of 404 to prevent frontend errors
    # This allows the frontend to collect paths from multiple variants
    return res or {'paths': []}


@app.get('/variants')
def get_variants(stream: str = Query(...)):
    """Return stream variants for a given stream id (e.g., ?stream=science or ?stream=stream:science)."""
    variants = loader.get_variants_for_stream(stream)
    if not variants:
        raise HTTPException(status_code=404, detail='No variants found for the specified stream')
    return {'stream': stream, 'variants': variants}


@app.get('/stream/{streamId}')
def get_stream(streamId: str):
    """Return detailed information for a specific stream."""
    # normalize id
    stream_id = streamId if ':' in streamId else f'stream:{streamId}'
    node = loader.nodes.get(stream_id)
    if not node:
        raise HTTPException(status_code=404, detail='Stream not found')
    return {'stream': node}


@app.get('/ai/explain')
def ai_explain(career: str = Query(...)):
    """Return a safe, template-based explanation for a career id (e.g., ?career=software_engineer).

    This is a placeholder for AI; it uses the career node attributes to build an explanation.
    """
    # normalize id
    career_id = career if ':' in career else f'career:{career}'
    node = loader.nodes.get(career_id)
    if not node:
        raise HTTPException(status_code=404, detail='Career not found')

    attrs = node.get('attributes', {})
    skills = node.get('skills', [])
    
    # Use custom attributes if available, otherwise generate from templates
    why = node.get('why_path') or f"This career ({node.get('display_name')}) typically follows the courses: {', '.join(attrs.get('course_ids', [])) or 'relevant degrees and certifications'}."
    what_to_study = node.get('what_to_study') or ('Subjects and courses: ' + (', '.join(attrs.get('mandatory_subjects', attrs.get('course_ids', []))) or 'See course requirements'))
    
    # Use roadmap from node if available
    if node.get('roadmap'):
        roadmap = node.get('roadmap')
    else:
        roadmap = {
            'short_term': 'Choose the correct stream/variant; focus on required subjects and basics.',
            'mid_term': 'Complete relevant degree or prepare for entrance exams as needed.',
            'long_term': 'Gain experience, specialize, and pursue higher studies or leadership roles.'
        }
    
    skills_list = skills
    
    # Include additional career details
    key_milestones = node.get('key_milestones', {})
    tips_for_success = node.get('tips_for_success', [])
    nba_attributes = attrs.get('nba_attributes', {})

    return {
        'career_id': career_id,
        'display_name': node.get('display_name'),
        'description': node.get('description'),
        'why': why,
        'what_to_study': what_to_study,
        'skills': skills_list,
        'roadmap': roadmap,
        'key_milestones': key_milestones,
        'tips_for_success': tips_for_success,
        'nba_attributes': nba_attributes,
        'attributes': attrs,
        'note': 'This explanation is generated from structured data and templates; it is not a human expert opinion.'
    }


@app.get('/graph')
def get_graph():
    """Return nodes and edges for the career graph. Nodes are the loaded node objects; edges are the mappings.

    The response includes `nodes` (dict of id -> node) and `edges` (list).
    """
    return {'nodes': loader.nodes, 'edges': loader.edges}


class RankRequest(BaseModel):
    user_profile: dict
    valid_paths: list


@app.post('/ai/rank')
def ai_rank(req: RankRequest):
    """Rank provided valid_paths for the given user_profile.

    If OPENAI_API_KEY is set in environment, attempt a controlled AI call.
    Otherwise, use a deterministic heuristic.
    """
    user = req.user_profile
    paths = req.valid_paths
    
    print(f"[AI RANK] Received {len(paths)} paths for user profile: {user}")

    # Extract candidate careers from paths
    candidates = []
    for p in paths:
        # p expected as {course: {...}, careers: [{...}]}
        course = p.get('course', {})
        for c in p.get('careers', []):
            candidates.append({
                'career_id': c.get('id'),
                'career_name': c.get('display_name'),
                'course_id': course.get('id'),
                'course_name': course.get('display_name'),
                'skills': c.get('skills', [])
            })
    
    print(f"[AI RANK] Extracted {len(candidates)} candidate careers")

    # If OPENAI_API_KEY present, call OpenAI Chat Completions with strict instructions
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    if OPENAI_API_KEY:
        system = (
            "You are a safe career guidance assistant. You MUST only evaluate and rank the provided candidate list. "
            "Do NOT suggest or invent candidates outside the provided list. Reply with JSON only, no extra text."
        )
        options_text = json.dumps(candidates, ensure_ascii=False)
        user_text = (
            "User profile: " + json.dumps(user) + "\n\n"
            + "Candidates: " + options_text + "\n\n"
            + "Task: Rank the candidates by fit to the user profile and provide a short reason for each. "
            + "Return JSON only in the following schema: {\"ranked\": [{\"career_id\": \"...\", \"career_name\": \"...\", \"score\": 0.0, \"reason\": \"...\"}]}"
        )
        payload = {
            'model': 'gpt-4o-mini',
            'messages': [
                {'role': 'system', 'content': system},
                {'role': 'user', 'content': user_text}
            ],
            'temperature': 0.0,
            'max_tokens': 512
        }
        try:
            resp = requests.post('https://api.openai.com/v1/chat/completions', json=payload,
                                 headers={'Authorization': f'Bearer {OPENAI_API_KEY}'}, timeout=15)
            resp.raise_for_status()
            body = resp.json()
            content = body['choices'][0]['message']['content']
            # Extract JSON substring robustly
            import re
            m = re.search(r"\{[\s\S]*\}", content)
            if m:
                parsed = json.loads(m.group(0))
                # basic validation of parsed structure
                if isinstance(parsed, dict) and 'ranked' in parsed:
                    return parsed
        except Exception as e:
            # Log and fall back to deterministic heuristic
            print('AI call failed or returned invalid JSON:', e)

    # Heuristic fallback ranking
    interests = set((user.get('interests') or []))
    
    # Deduplicate candidates by career_id
    seen = {}
    for c in candidates:
        career_id = c['career_id']
        if career_id not in seen:
            seen[career_id] = c
    
    ranked = []
    for c in seen.values():
        score = 0
        name = (c.get('career_name') or '').lower()
        for it in interests:
            if it.lower() in name:
                score += 3
        # skills match
        for s in c.get('skills', []):
            for it in interests:
                if it.lower() in s.lower():
                    score += 2
        
        # Only include careers with score > 0 or top general careers
        if score > 0:
            ranked.append({
                'career_id': c['career_id'], 
                'career_name': c['career_name'], 
                'score': score, 
                'reason': f"Matches your interests in {', '.join(interests)}"
            })
    
    # If no matches, add top 5 general careers
    if len(ranked) == 0:
        for c in list(seen.values())[:5]:
            ranked.append({
                'career_id': c['career_id'], 
                'career_name': c['career_name'], 
                'score': 0, 
                'reason': "General career path available to you"
            })
    
    ranked.sort(key=lambda x: -x['score'])
    # Limit to top 15 results
    ranked = ranked[:15]
    return {'ranked': ranked}


class ChatbotRequest(BaseModel):
    question: str


@app.post('/chatbot/ask')
def chatbot_ask(req: ChatbotRequest):
    """
    🔐 ZERO-HALLUCINATION CHATBOT ENDPOINT
    
    Architecture:
    1. Intent Classification (Rule-based)
    2. Decision Engine (Determine answer source)
    3. Answer Source (App data ONLY)
    4. Response Formatter (Consistent UI)
    5. Optional GPT Explanation (Rewriting only)
    
    CRITICAL: GPT is NEVER the source of truth
    """
    from chatbot_intent import classify_intent
    from chatbot_decision import DecisionEngine
    from chatbot_source import AnswerSource
    from chatbot_formatter import ResponseFormatter
    from chatbot_search import CareerSearch
    
    question = req.question
    
    # STEP 1: Classify Intent (Rule-based, deterministic)
    intent_result = classify_intent(question)
    intent = intent_result['intent']
    entities = intent_result['entities']
    confidence = intent_result['confidence']
    
    # STEP 2: Decision Engine - Decide answer source
    decision = DecisionEngine.decide_source(intent, entities, confidence)
    
    # Fetch required data based on intent
    answer_source = AnswerSource(loader)
    fetched_data = {}  # Initialize as empty dict
    
    # Check if this is a general search query (mentions stream, career, exam, course)
    search_keywords = ['stream', 'career', 'exam', 'course', 'job', 'what', 'tell me about']
    is_search_query = any(keyword in question.lower() for keyword in search_keywords)
    
    if is_search_query and confidence < 0.7:
        # Perform comprehensive search
        search_results = CareerSearch.comprehensive_search(question)
        if search_results['total_results'] > 0:
            formatted = ResponseFormatter.format_search_results(search_results)
            return {
                'answer': formatted.get('answer', 'Search completed'),
                'type': formatted.get('type', 'search_results'),
                'intent': 'search',
                'confidence': 0.8,
                'verified': True,
                'metadata': formatted.get('metadata', {})
            }
    
    # Fetch required data based on intent
    if intent == 'eligibility_check' and entities.get('career'):
        fetched_data = answer_source.get_career_eligibility(entities['career'])
    
    elif intent == 'career_steps' and entities.get('career'):
        fetched_data = answer_source.get_career_steps(entities['career'])
    
    elif intent == 'career_skills' and entities.get('career'):
        fetched_data = answer_source.get_career_steps(entities['career'])
    
    elif intent == 'failure_paths' and entities.get('career'):
        fetched_data = answer_source.get_career_steps(entities['career'])
    
    elif intent == 'roadmap' and entities.get('career'):
        fetched_data = answer_source.get_career_roadmap(entities['career'])
    
    elif intent == 'stream_guidance':
        class_level = entities.get('class_level', '10')
        fetched_data = answer_source.get_stream_guidance(class_level)

    elif intent == 'exam_info' and entities.get('exam'):
        fetched_data = answer_source.get_exam_info(entities['exam'])
    
    elif intent == 'career_overview' and entities.get('career'):
        fetched_data = answer_source.get_career_steps(entities['career'])
    
    print(f"🔍 DEBUG: intent={intent}, entities={entities}, fetched_data available={fetched_data.get('available') if fetched_data else 'NONE'}")
    
    # STEP 4: Validate data availability; if missing, try comprehensive search before fallback
    if not fetched_data or not fetched_data.get('available', False):
        print(f"⚠️  No verified data; attempting search. fetched_data={fetched_data}")
        search_results = CareerSearch.comprehensive_search(question)
        if search_results.get('total_results', 0) > 0:
            formatted = ResponseFormatter.format_search_results(search_results)
            return {
                'answer': formatted.get('answer', 'Search completed'),
                'type': formatted.get('type', 'search_results'),
                'intent': 'search',
                'confidence': 0.8,
                'verified': True,
                'metadata': formatted.get('metadata', {})
            }
        # Use fallback if search also empty
        formatted = ResponseFormatter.format_fallback()
    else:
        print(f"✅ Formatting response for {intent}")
        # STEP 5: Format response based on intent
        if intent == 'eligibility_check':
            formatted = ResponseFormatter.format_eligibility(fetched_data)
        elif intent in ['career_steps', 'career_overview', 'career_skills', 'failure_paths']:
            formatted = ResponseFormatter.format_career_steps(fetched_data)
        elif intent == 'roadmap':
            formatted = ResponseFormatter.format_roadmap(fetched_data, decision['allow_gpt_explain'])
        elif intent == 'stream_guidance':
            formatted = ResponseFormatter.format_stream_guidance(fetched_data)
        elif intent == 'exam_info':
            formatted = ResponseFormatter.format_exam_info(fetched_data)
        else:
            formatted = ResponseFormatter.format_fallback()
    
    # STEP 6: Optional GPT Explanation (REWRITING ONLY)
    # Only if decision allows AND OPENAI_API_KEY is set
    OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY')
    if decision['allow_gpt_explain'] and OPENAI_API_KEY and formatted.get('type') == 'career_card':
        formatted = ResponseFormatter.apply_gpt_explanation(formatted, OPENAI_API_KEY)
    
    # SAFETY GUARDRAIL: Add metadata for transparency
    return {
        'answer': formatted.get('answer', 'Unable to process request'),
        'type': formatted.get('type', 'generic'),
        'intent': intent,
        'confidence': confidence,
        'source': decision['source'],
        'verified': True,  # All answers are from verified data
        'metadata': {
            'gpt_enhanced': formatted.get('gpt_enhanced', False),
            'data_available': bool(fetched_data),
            'debug_entities': entities,
            'debug_fetched_available': fetched_data.get('available') if isinstance(fetched_data, dict) else None
        }
    }


# ========================
# PHASE 2: NBA ENDPOINTS
# ========================

@app.get('/career/{career_id}/next-actions')
def get_next_actions(career_id: str):
    """
    Get recommended next best actions for a career
    
    Returns actionable items based on:
    - Career type (exam, degree, govt, medical, skill)
    - Available pathways
    - Career attributes
    
    Example: /career/software_engineer/next-actions
    """
    result = nba_engine.get_next_actions(career_id)
    
    if not result.get('available', False):
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    
    return result


@app.get('/career/{career_id}/eligibility')
def get_eligibility(career_id: str):
    """
    Get eligibility requirements and checklist for a career
    
    Example: /career/chartered_accountant/eligibility
    """
    result = nba_engine.get_eligibility(career_id)
    
    if not result.get('available', False):
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    
    return result


@app.get('/career/{career_id}/similar')
def get_similar_careers(career_id: str):
    """
    Get similar careers and alternate options
    
    Example: /career/software_engineer/similar
    """
    result = nba_engine.get_similar_careers(career_id)
    
    if not result.get('available', False):
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    
    return result


@app.get('/career/{career_id}/failure-paths')
def get_failure_recovery(career_id: str):
    """
    Get recovery options if exam/degree fails
    
    Example: /career/doctor/failure-paths
    """
    result = nba_engine.get_failure_paths(career_id)
    
    if not result.get('available', False):
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    
    return result


@app.get('/career/{career_id}/alternate-paths')
def get_alternate_career_paths(career_id: str):
    """
    Get alternate routes to reach the same career
    
    Example: /career/software_engineer/alternate-paths
    """
    result = nba_engine.get_alternate_paths(career_id)
    
    if not result.get('available', False):
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    
    return result


# ------------------------
# Exam endpoints (for NBA)
# ------------------------

@app.get('/exam/{exam_id}/eligibility')
def get_exam_eligibility(exam_id: str):
    """Return basic eligibility info for an exam using loaded data."""
    eid = _norm_id('exam', exam_id)
    node = loader.nodes.get(eid)
    if not node:
        raise HTTPException(status_code=404, detail=f'Exam {exam_id} not found')
    attrs = node.get('attributes', {})
    return {
        'exam_id': eid,
        'exam_name': node.get('display_name', exam_id.upper()),
        'requires': node.get('requires', []),
        'leads_to': node.get('leads_to', []),
        'attributes': attrs,
        'metadata': node.get('metadata', {})
    }


@app.get('/exam/{exam_id}/syllabus')
def get_exam_syllabus(exam_id: str):
    """Return syllabus and prep timeline if available; else minimal structure."""
    eid = _norm_id('exam', exam_id)
    node = loader.nodes.get(eid)
    if not node:
        raise HTTPException(status_code=404, detail=f'Exam {exam_id} not found')
    syllabus = node.get('syllabus') or []
    timeline = node.get('prep_timeline') or []
    return {
        'exam_id': eid,
        'exam_name': node.get('display_name', exam_id.upper()),
        'syllabus': syllabus,
        'prep_timeline': timeline,
        'note': 'Syllabus/timeline may be minimal if not present in data.'
    }


@app.get('/career/{career_id}/alternate-exams')
def get_alternate_exams(career_id: str):
    """Return other exams relevant to the career based on nba_attributes.exam_types."""
    cid = _norm_id('career', career_id)
    career = loader.nodes.get(cid)
    if not career:
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    nba = career.get('attributes', {}).get('nba_attributes', {})
    exam_types = nba.get('exam_types', [])
    exams = []
    for et in exam_types:
        eid = _norm_id('exam', et)
        node = loader.nodes.get(eid)
        if node:
            exams.append({
                'id': eid,
                'name': node.get('display_name', et.upper()),
                'requires': node.get('requires', []),
                'leads_to': node.get('leads_to', [])
            })
    return {
        'career_id': cid,
        'career_name': career.get('display_name'),
        'alternate_exams': exams
    }


# --------------------------
# Course endpoints (for NBA)
# --------------------------

@app.get('/course/{course_id}/structure')
def get_course_structure(course_id: str):
    """Return duration and entry exams for a course."""
    coid = _norm_id('course', course_id)
    course = loader.nodes.get(coid)
    if not course:
        raise HTTPException(status_code=404, detail=f'Course {course_id} not found')
    attrs = course.get('attributes', {})
    return {
        'course_id': coid,
        'course_name': course.get('display_name'),
        'duration_years': attrs.get('duration_years'),
        'eligible_stream_variants': attrs.get('eligible_stream_variants', []),
        'entry_exams': attrs.get('entry_exams', [])
    }


@app.get('/course/{course_id}/career-outcomes')
def get_course_outcomes(course_id: str):
    """Return careers reachable from a course via edges."""
    coid = _norm_id('course', course_id)
    if coid not in loader.nodes:
        raise HTTPException(status_code=404, detail=f'Course {course_id} not found')
    outcomes = []
    for e in loader.edges:
        if e.get('from') == coid and e.get('type') == 'course_to_career':
            target = loader.nodes.get(e.get('to'))
            if target:
                outcomes.append({'id': target.get('id'), 'name': target.get('display_name')})
    return {
        'course_id': coid,
        'career_outcomes': outcomes,
        'count': len(outcomes)
    }


# --------------------------
# Career skills endpoint
# --------------------------

@app.get('/career/{career_id}/skills')
def get_career_skills(career_id: str):
    cid = _norm_id('career', career_id)
    node = loader.nodes.get(cid)
    if not node:
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    return {
        'career_id': cid,
        'career_name': node.get('display_name'),
        'skills': node.get('skills', [])
    }


# --------------------------
# Additional NBA endpoints
# --------------------------

@app.get('/course/{course_id}/higher-education')
def get_course_higher_education(course_id: str):
    """Return higher studies options (basic stub from data)."""
    coid = _norm_id('course', course_id)
    course = loader.nodes.get(coid)
    if not course:
        raise HTTPException(status_code=404, detail=f'Course {course_id} not found')
    # Minimal stub; real data can be enriched later
    options = course.get('higher_studies', [])
    return {'course_id': coid, 'course_name': course.get('display_name'), 'higher_studies': options}


@app.get('/course/{course_id}/exit-points')
def get_course_exit_points(course_id: str):
    """Return possible exit points (basic stub)."""
    coid = _norm_id('course', course_id)
    course = loader.nodes.get(coid)
    if not course:
        raise HTTPException(status_code=404, detail=f'Course {course_id} not found')
    exits = course.get('exit_points', [])
    return {'course_id': coid, 'course_name': course.get('display_name'), 'exit_points': exits}


@app.get('/course/{course_id}/lateral-entry')
def get_course_lateral_entry(course_id: str):
    """Return lateral entry options (diploma to degree upgrade)."""
    coid = _norm_id('course', course_id)
    course = loader.nodes.get(coid)
    if not course:
        raise HTTPException(status_code=404, detail=f'Course {course_id} not found')
    lateral = course.get('lateral_entry', [])
    return {'course_id': coid, 'course_name': course.get('display_name'), 'lateral_entry': lateral}


@app.get('/course/{course_id}/govt-exams')
def get_course_govt_exams(course_id: str):
    """Return government exams eligible after this course (basic stub)."""
    coid = _norm_id('course', course_id)
    course = loader.nodes.get(coid)
    if not course:
        raise HTTPException(status_code=404, detail=f'Course {course_id} not found')
    exams = course.get('govt_exams', [])
    return {'course_id': coid, 'course_name': course.get('display_name'), 'govt_exams': exams}


@app.get('/career/govt-service/hierarchy')
def govt_service_hierarchy():
    """Return a general government service hierarchy (stub)."""
    hierarchy = [
        {'rank': 'Junior Officer', 'years': '0-5'},
        {'rank': 'Senior Officer', 'years': '5-10'},
        {'rank': 'Assistant Director', 'years': '10-15'},
        {'rank': 'Deputy Director', 'years': '15-20'},
        {'rank': 'Director', 'years': '20+'}
    ]
    return {'service_hierarchy': hierarchy}


@app.get('/career/govt-service/posting')
def govt_service_posting_growth():
    """Return generic posting and growth info (stub)."""
    return {
        'posting_types': ['District', 'State', 'Central'],
        'growth_factors': ['Exam performance', 'Seniority', 'Annual reviews']
    }


@app.get('/career/{career_id}/other-govt-exams')
def get_other_govt_exams(career_id: str):
    """Return other related government exams for the career (basic stub)."""
    cid = _norm_id('career', career_id)
    node = loader.nodes.get(cid)
    if not node:
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    # Minimal related exams set; can be enriched via data
    exams = ['exam:ssc', 'exam:state_psc']
    results = []
    for eid in exams:
        exnode = loader.nodes.get(eid)
        if exnode:
            results.append({'id': eid, 'name': exnode.get('display_name', eid)})
    return {'career_id': cid, 'career_name': node.get('display_name'), 'other_govt_exams': results}


@app.get('/course/{course_id}/entry-jobs')
def get_course_entry_jobs(course_id: str):
    """Return entry jobs after diploma/course (stub)."""
    coid = _norm_id('course', course_id)
    course = loader.nodes.get(coid)
    if not course:
        raise HTTPException(status_code=404, detail=f'Course {course_id} not found')
    jobs = course.get('entry_jobs', [])
    return {'course_id': coid, 'course_name': course.get('display_name'), 'entry_jobs': jobs}


@app.get('/career/{career_id}/entry-positions')
def get_career_entry_positions(career_id: str):
    cid = _norm_id('career', career_id)
    node = loader.nodes.get(cid)
    if not node:
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    # Stub entry positions; enrich per career later
    positions = node.get('entry_positions', [])
    return {'career_id': cid, 'career_name': node.get('display_name'), 'entry_positions': positions}


@app.get('/career/{career_id}/certifications')
def get_career_certifications(career_id: str):
    cid = _norm_id('career', career_id)
    node = loader.nodes.get(cid)
    if not node:
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    certs = node.get('certifications', [])
    return {'career_id': cid, 'career_name': node.get('display_name'), 'certifications': certs}


@app.get('/career/{career_id}/work-options')
def get_career_work_options(career_id: str):
    cid = _norm_id('career', career_id)
    node = loader.nodes.get(cid)
    if not node:
        raise HTTPException(status_code=404, detail=f'Career {career_id} not found')
    # Basic analysis stub
    return {
        'career_id': cid,
        'career_name': node.get('display_name'),
        'options': ['Full-time job', 'Freelance/Contract', 'Internship/Apprenticeship']
    }


if __name__ == '__main__':
    import uvicorn
    # Production: Render uses PORT environment variable
    # Local dev: Uncomment line below to run on localhost:8000
    # uvicorn.run('main:app', host='127.0.0.1', port=8000, reload=True)
    
    # Production mode (uses PORT from environment)
    port = int(os.getenv('PORT', 8000))
    uvicorn.run('main:app', host='0.0.0.0', port=port, reload=False)
# force reload
 
# Trigger Render redeploy  
