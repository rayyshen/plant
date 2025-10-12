// Mapping between plan major names and major_requirements.json codes
const MAJOR_NAME_TO_CODE_MAPPING: Record<string, string> = {
    // Computer Science (excluded as requested)
    "Computer Science": "BSCS-CSCI",
    "Computer Science*": "BSCS-CSCI",

    // Africana Studies
    "Africana Studies": "BA-AFCS",

    // Applied Physics
    "Applied Physics": "BS-APHY",

    // Architecture
    "Architectural Studies": "BS-ARCS",
    "Architecture": "BS-ARCH",

    // Art
    "Art: Art, Visual Studies": "BA-ARTS",

    // American Sign Language
    "American Sign Language": "BS-ASLI",
    "American Sign Language – English Interpreting": "BS-ASLI",

    // Bioengineering
    "Bioengineering": "BSBIOE-BION",

    // Biology
    "Biology*": "BS-BIOL",
    "Biology": "BS-BIOL",
    "Cell and Molecular Biology": "BS-BIOL",

    // Biomedical Physics
    "Biomedical Physics": "BS-BIMP",

    // Business Administration
    "Business Administration*": "BSBA-BSAD",
    "Business Administration": "BSBA-BSAD",
    "Business Administration: Accounting": "BSBA-BSAD",
    "Business Administration: Accounting and Advisory Services": "BSBA-BSAD",
    "Business Administration: Brand Management": "BSBA-BSAD",
    "Business Administration: Business Analytics": "BSBA-BSAD",
    "Business Administration: Corporate Innovation": "BSBA-BSAD",
    "Business Administration: Entrepreneurial Startups": "BSBA-BSAD",
    "Business Administration: Family Business": "BSBA-BSAD",
    "Business Administration: Finance": "BSBA-BSAD",
    "Business Administration: Fintech": "BSBA-BSAD",
    "Business Administration: Healthcare Management and Consulting": "BSBA-BSAD",
    "Business Administration: Management": "BSBA-BSAD",
    "Business Administration: Management Information Systems": "BSBA-BSAD",
    "Business Administration: Marketing": "BSBA-BSAD",
    "Business Administration: Marketing Analytics": "BSBA-BSAD",
    "Business Administration: Social Innovation and Entrepreneurship": "BSBA-BSAD",
    "Business Administration: Supply Chain Management": "BSBA-BSAD",
    "Business Administration: Undeclared": "BSBA-BSAD",

    // Chemical Engineering
    "Chemical Engineering": "BSCHE-CHME",

    // Chemistry
    "Chemistry": "BS-CHEM",

    // Civil Engineering
    "Civil Engineering": "BSCE-CIVE",

    // Communication Studies
    "Communication Studies": "BA-CMST",

    // Computer Engineering
    "Computer Engineering": "BSEE-ELEE", // This might need adjustment

    // Computing and Law
    "Computing and Law": "BA-CUAN", // This might need adjustment

    // Criminology and Criminal Justice
    "Criminology and Criminal Justice": "BS-CUAN",

    // Cultural Anthropology
    "Cultural Anthropology": "BA-CUAN", // This might need adjustment

    // Cybersecurity
    "Cybersecurity": "BS-CYBS",

    // Data Science
    "Data Science": "BS-DASC",

    // Design
    "Design": "BFA-DESN",

    // Economics
    "Economics": "BA-ECON",

    // Electrical Engineering
    "Electrical Engineering": "BSEE-ELEE",

    // English
    "English": "BA-ENGL",

    // Environmental Engineering
    "Environmental Engineering": "BSENVE-ENVI",

    // Environmental Studies
    "Environmental Studies": "BA-ENVS",

    // Game Design
    "Game Design": "BFA-GAME",

    // Global Studies
    "Global Studies": "BA-GLAS",

    // Health Science
    "Health Science": "BS-HLSC",

    // History
    "History": "BA-HIST",

    // Human Services
    "Human Services": "BA-HSVC",

    // Industrial Engineering
    "Industrial Engineering": "BS-INST",

    // International Affairs
    "International Affairs": "BA-INAF",

    // Journalism
    "Journalism": "BA-JOUR",

    // Landscape Architecture
    "Landscape Architecture": "BLA-LARC",

    // Linguistics
    "Linguistics": "BS-LING",

    // Marine Biology
    "Marine Biology": "BS-MARB",

    // Mathematics
    "Mathematics": "BA-MATH",
    "Mathematics*": "BS-MATH",

    // Mechanical Engineering
    "Mechanical Engineering": "BSME-MECE",

    // Media and Screen Studies
    "Media and Screen Studies": "BA-MSST",

    // Media Arts
    "Media Arts": "BFA-MART",

    // Music
    "Music": "BA-MUSI",

    // Nursing
    "Nursing": "BSN-NURS",

    // Philosophy
    "Philosophy": "BA-PHIL",
    "Philosophy*": "BS-PHIL",

    // Physics
    "Physics": "BS-PHYS",

    // Political Science
    "Political Science": "BA-POLI",
    "Political Science*": "BS-POLI",

    // Psychology
    "Psychology": "BS-PSYC",
    "Psychology*": "BS-PSYC",
    "Behavioral Neuroscience*": "BS-PSYC",

    // Public Health
    "Public Health": "BA-PUHE",

    // Public Relations
    "Public Relations": "BA-PUBR",

    // Religion, Culture, and Public Life
    "Religion, Culture, and Public Life": "BA-REST",

    // Sociology
    "Sociology": "BA-SOCI",
    "Sociology*": "BS-SOCI",

    // Spanish
    "Spanish": "BA-SPAN",

    // Theatre
    "Theatre": "BA-THEA",
    "Theatre*": "BS-THEA",

    // Biochemistry
    "Biochemistry": "BS-CHEM", // This might need adjustment
};

/**
 * Maps a plan major name to the corresponding major code in major_requirements.json
 * @param majorName The major name from the plan
 * @returns The corresponding major code, or null if not found
 */
export function mapMajorNameToCode(majorName: string): string | null {
    // Direct mapping
    if (MAJOR_NAME_TO_CODE_MAPPING[majorName]) {
        return MAJOR_NAME_TO_CODE_MAPPING[majorName];
    }

    // Try case-insensitive matching
    const lowerMajorName = majorName.toLowerCase();
    for (const [name, code] of Object.entries(MAJOR_NAME_TO_CODE_MAPPING)) {
        if (name.toLowerCase() === lowerMajorName) {
            return code;
        }
    }

    // Try partial matching for complex names
    for (const [name, code] of Object.entries(MAJOR_NAME_TO_CODE_MAPPING)) {
        if (name.toLowerCase().includes(lowerMajorName) || lowerMajorName.includes(name.toLowerCase())) {
            return code;
        }
    }

    return null;
}

/**
 * Checks if a major is a computer science major
 * @param majorName The major name from the plan
 * @returns True if it's a computer science major
 */
export function isComputerScienceMajor(majorName: string): boolean {
    const lowerMajorName = majorName.toLowerCase();
    return lowerMajorName.includes('computer science') ||
        lowerMajorName.includes('cs') ||
        lowerMajorName.includes('computer science*') ||
        lowerMajorName.includes('khoury') ||
        lowerMajorName.includes('computing');
}
