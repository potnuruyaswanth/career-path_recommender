#!/usr/bin/env python3
import importlib, traceback, sys

mods = [
    'fastapi',
    'uvicorn',
    'pydantic',
    'dotenv',
    'requests',
    'httpx',
    'openai',
    'networkx',
    'multipart'
]

ok = True
for m in mods:
    try:
        importlib.import_module(m)
        print(m, 'OK')
    except Exception:
        ok = False
        print(m, 'FAILED')
        traceback.print_exc()

sys.exit(0 if ok else 2)
