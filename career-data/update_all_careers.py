import json
import os

# Load careers.json
careers_path = os.path.join(os.path.dirname(__file__), 'careers.json')
with open(careers_path, 'r', encoding='utf-8') as f:
    careers_list = json.load(f)

# Load courses to get course display names
courses_path = os.path.join(os.path.dirname(__file__), 'courses.json')
with open(courses_path, 'r', encoding='utf-8') as f:
    courses_data = json.load(f)

courses_map = {c['id']: c['display_name'] for c in courses_data}

updated_count = 0
for career in careers_list:
    # Skip if already has detailed fields
    if 'why_path' in career and 'what_to_study' in career and 'roadmap' in career:
        continue
    
    updated_count += 1
    career_id = career.get('id', 'unknown')
    display_name = career.get('display_name', career_id)
    
    # Get course names
    course_ids = career.get('attributes', {}).get('course_ids', [])
    course_names = [courses_map.get(cid, cid) for cid in course_ids[:3]]  # Top 3
    courses_str = ', '.join(course_names) if course_names else 'relevant courses'
    
    # Get stream paths
    stream_paths = career.get('attributes', {}).get('stream_paths', [])
    stream_str = ', '.join([sp.replace('variant:', '').upper() for sp in stream_paths[:2]]) if stream_paths else 'various streams'
    
    # Get career type
    career_type = career.get('attributes', {}).get('career_type', 'Professional')
    nature = career.get('attributes', {}).get('nature', 'Specialized')
    
    # Add missing fields
    if 'why_path' not in career:
        career['why_path'] = f"{display_name} typically follows courses like {courses_str} and focuses on {nature.lower()} work in {career_type.lower()} sector."
    
    if 'what_to_study' not in career:
        career['what_to_study'] = f"Subjects and courses: {courses_str}. Key skills include those listed in the career profile."
    
    if 'roadmap' not in career:
        career['roadmap'] = {
            "short_term": f"{stream_str} background, Prepare for relevant entrance exams",
            "mid_term": f"Complete {course_names[0] if course_names else 'degree program'} (typically 3-4 years)",
            "long_term": f"Work as {display_name}, gain experience, consider specialization or higher studies"
        }
    
    if 'short_description' not in career:
        career['short_description'] = f"A career in {nature.lower()} focusing on professional growth in {career_type.lower()} organizations."

# Save updated file
with open(careers_path, 'w', encoding='utf-8') as f:
    json.dump(careers_list, f, indent=2, ensure_ascii=False)

print(f"✅ Updated {updated_count} careers with missing fields")
print(f"📊 Total careers: {len(careers_list)}")
