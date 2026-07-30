import requests

BASE_URL = "http://localhost:3000"

session = requests.Session()

EMAIL = "admin@test.com"
PASSWORD = "Password123"

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"


def success(msg):
    print(f"{GREEN}[PASS]{RESET} {msg}")


def fail(msg):
    print(f"{RED}[FAIL]{RESET} {msg}")
    exit()


print("\n========== AUTHENTICATION TEST ==========\n")

# ---------------- REGISTER ----------------

print("Testing Register...")

register_data = {
    "name": "Admin",
    "email": EMAIL,
    "password": PASSWORD
}

response = session.post(
    f"{BASE_URL}/register",
    json=register_data
)

if response.status_code in [200, 201, 409]:
    success("Register")
else:
    fail(f"Register Failed ({response.status_code})")


# ---------------- LOGIN ----------------

print("\nTesting Login...")

response = session.post(
    f"{BASE_URL}/login",
    json={
        "email": EMAIL,
        "password": PASSWORD
    }
)

if response.status_code != 200:
    fail("Login Failed")

success("Login")

data = response.json()

access_token = data["accessToken"]

headers = {
    "Authorization": f"Bearer {access_token}"
}


# ---------------- PROFILE ----------------

print("\nTesting Profile...")

response = session.get(
    f"{BASE_URL}/profile",
    headers=headers
)

if response.status_code != 200:
    fail("Profile Failed")

success("Profile")


# ---------------- REFRESH ----------------

print("\nTesting Refresh Token...")

response = session.post(
    f"{BASE_URL}/refresh"
)

if response.status_code != 200:
    print("Status Code:", response.status_code)
    print("Response:", response.text)
    fail("Refresh Failed")
success("Refresh Token")

new_access_token = response.json()["accessToken"]

headers = {
    "Authorization": f"Bearer {new_access_token}"
}


# ---------------- PROFILE AGAIN ----------------

print("\nTesting New Access Token...")

response = session.get(
    f"{BASE_URL}/profile",
    headers=headers
)

if response.status_code != 200:
    fail("New Access Token Failed")

success("New Access Token")


# ---------------- LOGOUT ----------------

print("\nTesting Logout...")

response = session.post(
    f"{BASE_URL}/logout"
)

if response.status_code != 200:
    fail("Logout Failed")

success("Logout")


# ---------------- REFRESH AFTER LOGOUT ----------------

print("\nTesting Refresh After Logout...")

response = session.post(
    f"{BASE_URL}/refresh"
)

if response.status_code == 200:
    fail("Refresh should fail after logout")

success("Refresh Blocked After Logout")

print(f"\n{GREEN}========== ALL TESTS PASSED =========={RESET}")