import argparse
import sys
import logging
from pathlib import Path

logging.basicConfig(
    filename="validator.log",
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s"
)

parser = argparse.ArgumentParser(
    description="Validate a ForgeOps environment file."
)

def readenvfile(path):
    try:
        with open(path, "r") as file:
            contents = file.readlines()
        return contents

    except FileNotFoundError:
        print(f"❌ File not found: {path}")
        sys.exit(1)


def parseenv(contents):
    variables = {}

    for line_number, line in enumerate(contents, start=1):
        line = line.strip()

        if not line or line.startswith("#"):
            continue

        if "=" not in line:
            print(f"❌ Line {line_number}: Invalid format -> {line}")
            continue

        key, value = line.split("=", 1)
        variables[key.strip()] = value.strip()

    return variables


def validateenv(foundvariables, requiredvariables):
    haserrors = False
    logging.info("Checking required variables...")
    print("\nChecking required variables...\n")

    for variable in requiredvariables:
        if variable not in foundvariables:
            logging.error(f"Missing required variable: {variable}")
            print(f"❌ Missing required variable: {variable}")
            haserrors = True

    print("\nChecking for unexpected variables...\n")

    for variable in foundvariables:
        if variable not in requiredvariables:
            logging.error(f"⚠️ Unexpected variable: {variable}")
            print(f"⚠️ Unexpected variable: {variable}")

    if haserrors:
        print("\n❌ Environment validation failed.")
        sys.exit(1)
    logging.info("Environment validation passed.")
    print("\n✅ Environment validation passed.")

parser = argparse.ArgumentParser(
    description="Validate a ForgeOps environment file."
)

parser.add_argument(
    "envfile",
    help="Path to the .env file"
)

args = parser.parse_args()

envpath = args.envfile

project_root = Path(__file__).parent.parent

env_file = project_root / envpath
example_file = project_root / ".env.example"

envcontents = readenvfile(env_file)
examplecontents = readenvfile(example_file)

foundvariables = parseenv(envcontents)
requiredvariables = parseenv(examplecontents)

validateenv(foundvariables, requiredvariables.keys())