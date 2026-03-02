import os
import json
import sys
try:
    import jsonschema
    JSONSCHEMA_AVAILABLE = True
except Exception:
    JSONSCHEMA_AVAILABLE = False

BASE = os.path.dirname(__file__)

errors = []
nodes = {}
files_checked = 0

# Load all JSON files
for root, dirs, files in os.walk(BASE):
    # skip non-node folders
    basefolder = os.path.basename(root)
    if basefolder in ('mappings', 'rules', 'schemas'):
        continue
    for fname in files:
        if not fname.endswith('.json'):
            continue
        path = os.path.join(root, fname)
        rel = os.path.relpath(path, BASE)
        try:
            with open(path, 'r', encoding='utf-8') as f:
                data = json.load(f)
        except Exception as e:
            errors.append(f"Invalid JSON in {rel}: {e}")
            continue
        files_checked += 1
        # Some files are arrays (streams.json etc.)
        if isinstance(data, dict):
            if 'id' in data and 'type' in data:
                nodes[data['id']] = data
        elif isinstance(data, list):
            for i, item in enumerate(data):
                if isinstance(item, dict) and 'id' in item and 'type' in item:
                    nodes[item['id']] = item

# Basic checks: graph_edges references
graph_path = os.path.join(BASE, 'mappings', 'graph_edges.json')
if os.path.exists(graph_path):
    try:
        with open(graph_path, 'r', encoding='utf-8') as f:
            edges = json.load(f)
    except Exception as e:
        errors.append(f"Invalid JSON in mappings/graph_edges.json: {e}")
        edges = []
    for e in edges:
        if 'from' not in e or 'to' not in e:
            errors.append(f"Edge missing 'from' or 'to': {e}")
            continue
        if e['from'] not in nodes:
            errors.append(f"Edge from references unknown node '{e['from']}' (edge id: {e.get('id')})")
        if e['to'] not in nodes:
            errors.append(f"Edge to references unknown node '{e['to']}' (edge id: {e.get('id')})")
else:
    errors.append('mappings/graph_edges.json not found')

# If schemas exist, run jsonschema validation for nodes and edges
schema_dir = os.path.join(BASE, 'schemas')
if JSONSCHEMA_AVAILABLE and os.path.isdir(schema_dir):
    try:
        with open(os.path.join(schema_dir, 'node_schema.json'), 'r', encoding='utf-8') as f:
            node_schema = json.load(f)
    except Exception:
        node_schema = None
    try:
        with open(os.path.join(schema_dir, 'edges_schema.json'), 'r', encoding='utf-8') as f:
            edges_schema = json.load(f)
    except Exception:
        edges_schema = None

    if node_schema:
        # Validate each loaded node object against node_schema
        for node_id, node_obj in nodes.items():
            try:
                jsonschema.validate(instance=node_obj, schema=node_schema)
            except Exception as e:
                errors.append(f"Node schema validation error for {node_id}: {e}")

    if edges_schema and 'edges' in locals():
        try:
            jsonschema.validate(edges, edges_schema)
        except Exception as e:
            errors.append(f'Graph edges schema validation error: {e}')
else:
    if not JSONSCHEMA_AVAILABLE:
        print('jsonschema package not available — skipping JSON Schema validation. To enable, run: pip install jsonschema')

# Check rules reference existing ids
rules_path = os.path.join(BASE, 'rules', 'transition_rules.json')
if os.path.exists(rules_path):
    try:
        with open(rules_path, 'r', encoding='utf-8') as f:
            rules = json.load(f)
    except Exception as e:
        errors.append(f"Invalid JSON in rules/transition_rules.json: {e}")
        rules = []
    for r in rules:
        if 'from' in r and r['from'] not in nodes:
            errors.append(f"Rule references unknown 'from' node: {r['from']} (rule id: {r.get('id')})")
        # check disallow_to_types if they appear to be ids
        if 'disallow_to_types' in r:
            for to in r['disallow_to_types']:
                if to not in nodes:
                    # allow if it looks like a type name (e.g., 'course:mbbs' is expected), still warn
                    errors.append(f"Rule disallow_to_types references unknown id '{to}' (rule id: {r.get('id')})")
else:
    errors.append('rules/transition_rules.json not found')

# Quick sanity: required top-level class_10 exists and lists streams
class10_path = os.path.join(BASE, 'class_10.json')
if os.path.exists(class10_path):
    try:
        with open(class10_path, 'r', encoding='utf-8') as f:
            c10 = json.load(f)
        if 'streams' not in c10 or not isinstance(c10['streams'], list):
            errors.append('class_10.json missing "streams" array')
        else:
            for s in c10['streams']:
                if s not in nodes:
                    errors.append(f'class_10.json references unknown stream id: {s}')
    except Exception as e:
        errors.append(f'Invalid JSON in class_10.json: {e}')
else:
    errors.append('class_10.json not found')

# Report
print('\nValidation report for career-data:')
print(f'Files checked: {files_checked}')
print(f'Unique nodes found: {len(nodes)}')

if errors:
    print('\nErrors found:')
    for e in errors:
        print('- ' + e)
    sys.exit(1)
else:
    print('\nNo errors found. JSON structure looks valid for basic checks.')
    sys.exit(0)
