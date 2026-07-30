import requests
import uuid
import sys
import time

BASE_URL = "http://localhost:3000"

REGISTER_URL = f"{BASE_URL}/register"
LOGIN_URL = f"{BASE_URL}/login"
PROJECTS_URL = f"{BASE_URL}/projects"

TEST_USER = {
    "name": "ForgeOps Test User",
    "email": "test@forgeops.com",
    "password": "Password123"
}

session = requests.Session()

passed = 0
failed = 0

project_id = None


def pass_test(message):
    global passed
    passed += 1
    print(f"[PASS] {message}")


def fail_test(message):
    global failed
    failed += 1
    print(f"[FAIL] {message}")


def print_response(response):
    print(f"Status : {response.status_code}")

    try:
        print(response.json())
    except Exception:
        print(response.text)


def register_if_needed():

    print("\nChecking test account...")

    response = session.post(
        REGISTER_URL,
        json=TEST_USER
    )

    if response.status_code == 201:
        pass_test("Register User")
        return

    if response.status_code == 409:
        print("[INFO] Test user already exists")
        return

    fail_test("Register User")
    print_response(response)
    sys.exit(1)


def login():

    print("\nLogging in...")

    response = session.post(
        LOGIN_URL,
        json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }
    )

    if response.status_code != 200:
        fail_test("Login")
        print_response(response)
        sys.exit(1)

    data = response.json()

    token = data["token"]

    session.headers.update({
        "Authorization": f"Bearer {token}"
    })

    pass_test("Login")


def create_project():

    global project_id

    print("\nCreating Project...")

    unique_title = f"Project-{uuid.uuid4().hex[:8]}"

    payload = {
        "title": unique_title,
        "description": "Created by API Test Suite",
        "status": "Todo",
        "priority": "High",
        "dueDate": "2026-12-31",
        "tags": [
            "python",
            "testing"
        ]
    }

    response = session.post(
        PROJECTS_URL,
        json=payload
    )

    if response.status_code != 201:
        fail_test("Create Project")
        print_response(response)
        return

    body = response.json()

    project_id = body["project"]["_id"]

    pass_test("Create Project")


def duplicate_project():

    print("\nChecking Duplicate Project...")

    response = session.get(PROJECTS_URL)

    if response.status_code != 200:
        fail_test("Duplicate Project")
        return

    projects = response.json()["projects"]

    if len(projects) == 0:
        fail_test("Duplicate Project")
        return

    title = projects[0]["title"]

    payload = {
    "title": title,
    "description": "This is a duplicate project created by the API test suite.",
    "status": "Todo",
    "priority": "High",
    "dueDate": "2026-12-31",
    "tags": ["testing"]
}

    response = session.post(
        PROJECTS_URL,
        json=payload
    )

    if response.status_code == 409:
        pass_test("Duplicate Project")
        return

    fail_test("Duplicate Project")
    print_response(response)


def get_projects():

    print("\nGetting Projects...")

    response = session.get(PROJECTS_URL)

    if response.status_code != 200:
        fail_test("Get Projects")
        print_response(response)
        return

    body = response.json()

    if "projects" not in body:
        fail_test("Get Projects")
        return

    pass_test("Get Projects")


def get_project_by_id():

    print("\nGetting Project By ID...")

    response = session.get(
        f"{PROJECTS_URL}/{project_id}"
    )

    if response.status_code != 200:
        fail_test("Get Project By ID")
        print_response(response)
        return

    pass_test("Get Project By ID")

    def update_project():

     print("\nUpdating Project...")

    payload = {
        "title": "Updated Project",
        "description": "Updated by API Test",
        "status": "In Progress",
        "priority": "Medium",
        "tags": [
            "updated",
            "api"
        ]
    }

    response = session.put(
        f"{PROJECTS_URL}/{project_id}",
        json=payload
    )

    if response.status_code != 200:
        fail_test("Update Project")
        print_response(response)
        return

    pass_test("Update Project")


def search_projects():

    print("\nSearching Projects...")

    response = session.get(
        PROJECTS_URL,
        params={
            "search": "Updated"
        }
    )

    if response.status_code != 200:
        fail_test("Search")
        print_response(response)
        return

    pass_test("Search")


def pagination_test():

    print("\nPagination Test...")

    response = session.get(
        PROJECTS_URL,
        params={
            "page": 1,
            "limit": 5
        }
    )

    if response.status_code != 200:
        fail_test("Pagination")
        print_response(response)
        return

    pass_test("Pagination")


def sorting_test():

    print("\nSorting Test...")

    response = session.get(
        PROJECTS_URL,
        params={
            "sort": "oldest"
        }
    )

    if response.status_code != 200:
        fail_test("Sorting")
        print_response(response)
        return

    pass_test("Sorting")


def status_filter_test():

    print("\nStatus Filter Test...")

    response = session.get(
        PROJECTS_URL,
        params={
            "status": "In Progress"
        }
    )

    if response.status_code != 200:
        fail_test("Status Filter")
        print_response(response)
        return

    pass_test("Status Filter")


def priority_filter_test():

    print("\nPriority Filter Test...")

    response = session.get(
        PROJECTS_URL,
        params={
            "priority": "Medium"
        }
    )

    if response.status_code != 200:
        fail_test("Priority Filter")
        print_response(response)
        return

    pass_test("Priority Filter")


def validation_test():

    print("\nValidation Test...")

    payload = {
        "title": "",
        "description": ""
    }

    response = session.post(
        PROJECTS_URL,
        json=payload
    )

    if response.status_code == 400:
        pass_test("Validation")
        return

    fail_test("Validation")


def invalid_token_test():

    print("\nInvalid Token Test...")

    bad = requests.Session()

    bad.headers.update({
        "Authorization": "Bearer invalid-token"
    })

    response = bad.get(PROJECTS_URL)

    if response.status_code == 401:
        pass_test("Invalid Token")
        return

    fail_test("Invalid Token")


def unauthorized_test():

    print("\nUnauthorized Test...")

    guest = requests.Session()

    response = guest.get(PROJECTS_URL)

    if response.status_code == 401:
        pass_test("Unauthorized")
        return

    fail_test("Unauthorized")


def delete_project():

    print("\nDeleting Project...")

    response = session.delete(
        f"{PROJECTS_URL}/{project_id}"
    )

    if response.status_code != 200:
        fail_test("Delete Project")
        print_response(response)
        return

    pass_test("Delete Project")


def print_summary(start_time):

    elapsed = time.time() - start_time

    print("\n" + "=" * 50)
    print("ForgeOps API Test Suite")
    print("=" * 50)

    print(f"Passed : {passed}")
    print(f"Failed : {failed}")
    print(f"Time   : {elapsed:.2f} sec")

    if failed == 0:
        print("\nALL TESTS PASSED")
        sys.exit(0)

    print("\nTESTS FAILED")
    sys.exit(1)


def main():

    start_time = time.time()

    print("=" * 50)
    print("ForgeOps API Test Suite")
    print("=" * 50)

    register_if_needed()

    login()

    create_project()

    duplicate_project()

    get_projects()

    get_project_by_id()

    update_project()

    search_projects()

    pagination_test()

    sorting_test()

    status_filter_test()

    priority_filter_test()

    validation_test()

    invalid_token_test()

    unauthorized_test()

    delete_project()

    print_summary(start_time)


if __name__ == "__main__":
    main()