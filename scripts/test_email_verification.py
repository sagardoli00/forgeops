import requests

BASE_URL = "http://localhost:3000"

payload = {
    "name": "Test User",
    "email": "tdxssdddd2d@example.com",
    "password": "Password123!"
}

try:
    response = requests.post(
        f"{BASE_URL}/register",
        json=payload,
        timeout=10
    )

    print("=" * 50)
    print("Status Code:", response.status_code)
    print("=" * 50)

    try:
        print(response.json())
    except Exception:
        print(response.text)

except requests.exceptions.ConnectionError:
    print("❌ Could not connect to the server.")
    print("Make sure your backend is running.")

except Exception as e:
    print(f"❌ Error: {e}")