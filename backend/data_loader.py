import os
import json
from typing import Dict, List, Any

BASE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'career-data'))

class CareerData:
    """Career data loader with support for both 'id' and 'career_id' fields - Enhanced version"""
    def __init__(self, base_path: str = BASE):
        self.base = base_path
        self.nodes: Dict[str, Dict[str, Any]] = {}
        self.edges: List[Dict[str, Any]] = []
        self.rules: List[Dict[str, Any]] = []
        self.class_levels: Dict[str, Any] = {}
        self.load_all()

    def _load_json(self, *parts):
        path = os.path.join(self.base, *parts)
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)

    def load_all(self):
        # Load nodes from single-file lists and single objects
        # education_levels / class_10.json
        try:
            self.class_levels = self._load_json('class_10.json')
        except FileNotFoundError:
            self.class_levels = {}

        # streams.json, stream_variants.json, courses.json, careers.json, exams, phases
        for fname in ['streams.json', 'stream_variants.json', 'courses.json', 'careers.json']:
            p = os.path.join(self.base, fname)
            if os.path.exists(p):
                arr = self._load_json(fname)
                for item in arr:
                    self.nodes[item['id']] = item

        # also load single files created earlier (individual files under directories)
        # directories: phases, education_levels, streams, stream_variants, courses, careers, exams
        for folder in ['phases','education_levels','streams','stream_variants','courses','careers','exams']:
            dirpath = os.path.join(self.base, folder)
            if not os.path.isdir(dirpath):
                continue
            for fname in os.listdir(dirpath):
                if not fname.endswith('.json'):
                    continue
                data = self._load_json(folder, fname)
                # if file is an object
                if isinstance(data, dict):
                    # Support both 'id' and 'career_id' fields for backwards compatibility
                    node_id = data.get('id') or data.get('career_id')
                    if node_id and folder == 'careers' and not node_id.startswith('career:'):
                        # Add 'career:' prefix if missing
                        node_id = f'career:{node_id}'
                        data['id'] = node_id
                    if node_id:
                        self.nodes[node_id] = data
                # if it's a list, add each
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict):
                            node_id = item.get('id') or item.get('career_id')
                            if node_id and folder == 'careers' and not node_id.startswith('career:'):
                                node_id = f'career:{node_id}'
                                item['id'] = node_id
                            if node_id:
                                self.nodes[node_id] = item

        # load mappings/graph_edges.json
        try:
            edges = self._load_json('mappings', 'graph_edges.json')
            self.edges = edges
        except FileNotFoundError:
            self.edges = []

        # load rules
        try:
            rules = self._load_json('rules', 'transition_rules.json')
            self.rules = rules
        except FileNotFoundError:
            self.rules = []

    def normalize_variant_id(self, variant_param: str) -> str:
        if variant_param.startswith('variant:'):
            return variant_param
        return f'variant:{variant_param}'

    def normalize_class_id(self, class_param: str) -> str:
        # Accept '10' or 'class_10' or 'education:class_10'
        if class_param.startswith('education:'):
            return class_param
        if class_param.startswith('class_'):
            return f'education:{class_param}'
        return f'education:class_{class_param}'

    def get_streams_for_class(self, class_param: str) -> List[Dict[str, Any]]:
        class_id = self.normalize_class_id(class_param)
        # read class_10.json top-level streams if present
        streams = []
        if self.class_levels and self.class_levels.get('id') == class_id:
            for s in self.class_levels.get('streams', []):
                node = self.nodes.get(s)
                if node:
                    streams.append(node)
        else:
            # fallback: collect stream nodes referenced by edges from the education node
            for e in self.edges:
                if e.get('from') == class_id and e.get('type') == 'education_to_stream':
                    node = self.nodes.get(e.get('to'))
                    if node:
                        streams.append(node)
        return streams

    def variant_to_courses(self, variant_id: str) -> List[Dict[str, Any]]:
        # return course nodes reachable from variant, after applying rules
        result = []
        for e in self.edges:
            if e.get('from') == variant_id and e.get('type') == 'variant_to_course':
                to_id = e.get('to')
                if self._is_transition_allowed(variant_id, to_id):
                    node = self.nodes.get(to_id)
                    if node:
                        result.append(node)
        return result

    def get_variants_for_stream(self, stream_param: str) -> List[Dict[str, Any]]:
        # Accept either 'stream:science' or 'science'
        stream_id = stream_param if stream_param.startswith('stream:') else f'stream:{stream_param}'
        variants = []
        for e in self.edges:
            if e.get('from') == stream_id and e.get('type') == 'stream_to_variant':
                node = self.nodes.get(e.get('to'))
                if node:
                    variants.append(node)
        return variants

    def course_to_careers(self, course_id: str) -> List[Dict[str, Any]]:
        result = []
        for e in self.edges:
            if e.get('from') == course_id and e.get('type') == 'course_to_career':
                node = self.nodes.get(e.get('to'))
                if node:
                    result.append(node)
        return result

    def _is_transition_allowed(self, from_id: str, to_id: str) -> bool:
        # Apply disallow rules: if any rule has from==from_id and disallow_to_types contains to_id, block
        for r in self.rules:
            if r.get('from') == from_id:
                dis = r.get('disallow_to_types', [])
                if to_id in dis:
                    return False
        # No explicit disallow found
        return True

    def get_paths_for_variant(self, variant_param: str) -> Dict[str, Any]:
        variant_id = self.normalize_variant_id(variant_param)
        courses = self.variant_to_courses(variant_id)
        data = []
        for c in courses:
            careers = self.course_to_careers(c['id'])
            data.append({
                'course': c,
                'careers': careers
            })
        return {'variant': variant_id, 'paths': data}


# simple module-level loader
_loader: CareerData = None

def get_loader() -> CareerData:
    global _loader
    if _loader is None:
        _loader = CareerData()
    return _loader

if __name__ == '__main__':
    cd = CareerData()
    print('Loaded nodes:', len(cd.nodes))
    print('Loaded edges:', len(cd.edges))
    print('Loaded rules:', len(cd.rules))
