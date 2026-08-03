import requests

BASE_URL = "http://localhost:3000"

ACCESS_TOKEN = "PASTE_YOUR_ACCESS_TOKEN"

IMAGE_PATH = r"C:\Users\sagar doli\OneDrive\Desktop\enginnering\forgeops\scripts\WhatsApp Image 2025-09-23 at 4.10.08 PM.jpeg"      # Put any image beside this script

headers = {
    "Authorization": f"Bearer {ACCESS_TOKEN}"
}

files = {
    "profileImage": open(IMAGE_PATH, "rb")
}

response = requests.patch(
    f"{BASE_URL}/profile-image",
    headers=headers,
    files=files
)

print("=" * 50)
print("Status Code:", response.status_code)
print("=" * 50)

try:
    print(response.json())
except:
    print(response.text)