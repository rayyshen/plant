import json
import re
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
import google.generativeai as genai

# Configure your API key
genai.configure(api_key="AIzaSyBWpnHeX-xn-GtBhFs9ldcA3hRteD05oe0")

# Load courses JSON
with open("Data/all_courses_structured.json", "r") as f:
    courses = json.load(f)

OUTPUT_FILE = "courses_with_hardness.json"
MAX_WORKERS = 10
PROGRESS_INTERVAL = 50

def evaluate_hardness(course):
    """Send course info to Gemini-2.5-flash and get difficulty score."""
    prompt = f"""
    Evaluate the technical difficulty of this Northeastern course from 1 (easiest) to 10 (hardest).
    Only return the number (1-10).

    Title: {course['title']}
    Description: {course['description']}
    """

    try:
        response = genai.generate_text(
            model="gemini-2.5-flash",
            prompt=prompt
        )
        text = response.result if hasattr(response, "result") else ""
        match = re.search(r"\b([1-9]|10)\b", text)
        score = int(match.group(0)) if match else None
    except Exception as e:
        print(f"⚠️ Error processing course {course['course_code']}: {e}")
        score = None

    course['Hardness'] = score
    return course

def main():
    updated_courses = []
    total = len(courses)

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(evaluate_hardness, c): idx for idx, c in enumerate(courses)}
        for i, future in enumerate(as_completed(futures)):
            updated_courses.append(future.result())
            if (i + 1) % PROGRESS_INTERVAL == 0 or (i + 1) == total:
                print(f"Processed {i + 1}/{total} courses...")

    with open(OUTPUT_FILE, "w") as f:
        json.dump(updated_courses, f, indent=2)

    print(f"✅ Done! Saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
