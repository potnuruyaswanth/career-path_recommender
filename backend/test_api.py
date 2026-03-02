from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_streams():
    r = client.get('/streams?class=10')
    print('GET /streams?class=10 ->', r.status_code)
    print(r.json())

def test_paths_mpc():
    r = client.get('/paths?variant=mpc')
    print('GET /paths?variant=mpc ->', r.status_code)
    print(r.json())

if __name__ == '__main__':
    test_streams()
    test_paths_mpc()
