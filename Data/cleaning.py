import json
import re

INPUT_FILE = "all_courses.json"
OUTPUT_FILE = "all_courses_structured.json"

def clean_text(s):
    """Clean invisible characters, multiple spaces, and strip."""
    if not s:
        return s
    s = s.replace("\u00A0", " ")  # NBSP
    s = s.replace("\u2007", " ")  # figure space
    s = s.replace("\u202F", " ")  # narrow NBSP
    s = re.sub(r"\s+", " ", s)
    return s.strip()

def split_multiple_courses(course_str):
    """
    Split a string containing multiple courses into individual course strings.
    Pattern: CODE XXXX. Title.
    """
    course_str = clean_text(course_str)
    # Match code like "CS 4100" followed by a period
    pattern = r"([A-Z]{2,}\s*\d{4}[A-Za-z]*\.\s*.*?)(?=(?:[A-Z]{2,}\s*\d{4}[A-Za-z]*\.)|$)"
    matches = re.findall(pattern, course_str, re.DOTALL)
    return [m.strip() for m in matches if m.strip()]

def parse_course_string(course_str, department="UNKNOWN"):
    course_str = clean_text(course_str)
    normalized_str = course_str.replace("\n", " ").replace("\r", " ")
    normalized_str = re.sub(r"\s+", " ", normalized_str)

    course = {
        "course_code": None,
        "title": None,
        "description": "",
        "credits": None,
        "prerequisites": None,
        "attributes": None,
        "department": department,
        "elective": False
    }

    # Attempt to extract course_code, title, credits
    match = re.match(r"^([A-Z]{2,}\s*\d+[A-Za-z]*)\.\s*(.*?)\.\s*\((.*?)\)", normalized_str)
    if match:
        course["course_code"] = clean_text(match.group(1))
        course["title"] = clean_text(match.group(2))
        course["credits"] = clean_text(match.group(3))
        description_start = normalized_str.find(match.group(0)) + len(match.group(0))
        course["description"] = clean_text(normalized_str[description_start:])
    else:
        # Fallback: treat entire string as description
        course["description"] = normalized_str
        # Try to infer code from start
        code_match = re.match(r"([A-Z]{2,}\s*\d+[A-Za-z]*)", normalized_str)
        if code_match:
            course["course_code"] = clean_text(code_match.group(1))

    # Elective detection
    if re.search(r"\b(elective|optional course)\b", normalized_str, re.IGNORECASE):
        course["elective"] = True

    # Prerequisites extraction
    prereq_match = re.search(
    r"Prerequisite\(s\)?:\s*(.+?)(?=(?:Attribute\(s\):|$))",
    normalized_str,
    re.IGNORECASE
    )
    if prereq_match:
        course["prerequisites"] = clean_text(prereq_match.group(1))

    # Attributes extraction
    attr_match = re.search(
        r"Attribute\(s\):\s*(.+?)(?=$)",
        normalized_str,
        re.IGNORECASE
    )
    if attr_match:
        course["attributes"] = clean_text(attr_match.group(1))

    return course

def main():
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Ensure top-level is a list
    if not isinstance(data, list):
        data = [data]

    all_courses = []

    for dept_data in data:
        raw_courses = dept_data.get("courses") or []
        # Infer department from URL if possible
        department = "UNKNOWN"
        if "url" in dept_data:
            parts = dept_data["url"].split("/")
            if len(parts) > 0:
                department = parts[-2].upper()

        for course_entry in raw_courses:
            split_courses = split_multiple_courses(course_entry)
            for course_str in split_courses:
                parsed = parse_course_string(course_str, department)
                all_courses.append(parsed)

    # Deduplicate courses by course_code
    unique_courses = {}
    for c in all_courses:
        code = c.get("course_code")
        if code and code not in unique_courses:
            unique_courses[code] = c

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(list(unique_courses.values()), f, indent=2, ensure_ascii=False)

    print(f"Saved {len(unique_courses)} courses to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
