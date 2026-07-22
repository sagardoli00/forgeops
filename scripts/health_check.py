from pathlib import Path
import subprocess
import platform
import shutil
import sys

passed = 0
failed = 0


def check_file(file_name):
    global passed, failed

    root = Path(__file__).resolve().parent.parent
    path = root / file_name

    if path.exists():
        print(f"[PASS] {file_name} exists")
        passed += 1
        return True

    print(f"[FAIL] {file_name} not found")
    failed += 1
    return False


def check_command(name, command):
    global passed, failed

    if shutil.which(command[0]) is None:
        print(f"[FAIL] {name} is not installed")
        failed += 1
        return False

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=False
        )

        if result.returncode == 0:
            version = result.stdout.strip().split("\n")[0]
            print(f"[PASS] {name}: {version}")
            passed += 1
            return True

        print(f"[FAIL] {name} returned an error")
        failed += 1
        return False

    except Exception as error:
        print(f"[FAIL] {name}: {error}")
        failed += 1
        return False


print("=" * 50)
print("ForgeOps Health Checker")
print("=" * 50)

print("\nChecking files...\n")

check_file(".env")
check_file(".env.example")
check_file("README.md")

print("\nChecking tools...\n")

commands = {
    "Git": ["git", "--version"],
    "Python": ["python", "--version"],
    "Docker": ["docker", "--version"],
    "Node": ["node", "--version"],
    "npm": ["npm.cmd", "--version"] if platform.system() == "Windows" else ["npm", "--version"],
}

for name, command in commands.items():
    check_command(name, command)

print("\n" + "=" * 50)
print("Summary")
print("=" * 50)

print(f"Passed : {passed}")
print(f"Failed : {failed}")

if failed == 0:
    print("\nSystem Status : HEALTHY")
    sys.exit(0)

print("\nSystem Status : UNHEALTHY")
sys.exit(1)