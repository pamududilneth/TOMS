"""
Run this directly to test Drive upload in isolation:
    python test_drive_upload.py path\to\any\test\image.jpg
"""
import sys
from app.utils.drive_uploader import upload_image_and_get_public_url

if len(sys.argv) < 2:
    print("Usage: python test_drive_upload.py <path-to-image>")
    sys.exit(1)

path = sys.argv[1]
url = upload_image_and_get_public_url(path, "test-upload.jpg")

if url:
    print(f"SUCCESS. Public URL: {url}")
    print("Open that URL in your browser — you should see the image directly.")
else:
    print("FAILED. Scroll up for the full error traceback.")