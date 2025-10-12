interface CourseWithHardness {
    course_code: string;
    title: string;
    description: string;
    credits: string;
    prerequisites: string | null;
    attributes: string | null;
    department: string;
    elective: boolean;
    difficulty: number;
}

interface CSRequirements {
    requirements: {
        [key: string]: {
            minRequired: number;
            description: string;
        };
    };
    [key: string]: any;
}

class DataCache {
    private static instance: DataCache;
    private coursesWithHardness: CourseWithHardness[] | null = null;
    private csRequirements: CSRequirements | null = null;
    private lastCoursesFetch: number = 0;
    private lastCSFetch: number = 0;
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    private constructor() { }

    public static getInstance(): DataCache {
        if (!DataCache.instance) {
            DataCache.instance = new DataCache();
        }
        return DataCache.instance;
    }

    public async getCoursesWithHardness(): Promise<CourseWithHardness[]> {
        const now = Date.now();

        if (this.coursesWithHardness && (now - this.lastCoursesFetch) < this.CACHE_DURATION) {
            return this.coursesWithHardness;
        }

        try {
            const response = await fetch('/courses_with_hardness.json');
            if (!response.ok) {
                throw new Error('Failed to fetch courses with hardness data');
            }

            this.coursesWithHardness = await response.json();
            this.lastCoursesFetch = now;

            return this.coursesWithHardness || [];
        } catch (error) {
            console.error('Error fetching courses with hardness:', error);
            // Return cached data if available, even if expired
            return this.coursesWithHardness || [];
        }
    }

    public async getCSRequirements(): Promise<CSRequirements | null> {
        const now = Date.now();

        if (this.csRequirements && (now - this.lastCSFetch) < this.CACHE_DURATION) {
            return this.csRequirements;
        }

        try {
            const response = await fetch('/BSCS.json');
            if (!response.ok) {
                throw new Error('Failed to fetch CS requirements');
            }

            this.csRequirements = await response.json();
            this.lastCSFetch = now;

            return this.csRequirements;
        } catch (error) {
            console.error('Error fetching CS requirements:', error);
            // Return cached data if available, even if expired
            return this.csRequirements;
        }
    }

    public getCourseByCode(courseCode: string): CourseWithHardness | null {
        if (!this.coursesWithHardness) return null;

        return this.coursesWithHardness.find(
            course => course.course_code.toLowerCase() === courseCode.toLowerCase()
        ) || null;
    }

    public getCoursesByDifficulty(minDifficulty: number, maxDifficulty: number): CourseWithHardness[] {
        if (!this.coursesWithHardness) return [];

        return this.coursesWithHardness.filter(
            course => course.difficulty >= minDifficulty && course.difficulty <= maxDifficulty
        );
    }

    public getCoursesByDepartment(department: string): CourseWithHardness[] {
        if (!this.coursesWithHardness) return [];

        return this.coursesWithHardness.filter(
            course => course.department.toLowerCase() === department.toLowerCase()
        );
    }

    public getElectivesByCareerGoal(careerGoal: string): CourseWithHardness[] {
        if (!this.coursesWithHardness || !careerGoal) return [];

        const electives = this.coursesWithHardness.filter(course => course.elective);

        // Map career goals to relevant elective categories
        const careerMappings: { [key: string]: string[] } = {
            'software engineer': ['CS', 'IS', 'CY', 'DS'],
            'software engineering': ['CS', 'IS', 'CY', 'DS'],
            'data scientist': ['DS', 'STAT', 'MATH', 'CS'],
            'data science': ['DS', 'STAT', 'MATH', 'CS'],
            'product manager': ['BUSN', 'ENTR', 'MKTG', 'COMM'],
            'product management': ['BUSN', 'ENTR', 'MKTG', 'COMM'],
            'cybersecurity': ['CY', 'CS', 'IS', 'CRIM'],
            'cyber security': ['CY', 'CS', 'IS', 'CRIM'],
            'machine learning': ['DS', 'CS', 'MATH', 'STAT'],
            'ai': ['DS', 'CS', 'MATH', 'STAT'],
            'artificial intelligence': ['DS', 'CS', 'MATH', 'STAT'],
            'web developer': ['CS', 'IS', 'ARTG', 'COMM'],
            'web development': ['CS', 'IS', 'ARTG', 'COMM'],
            'mobile developer': ['CS', 'IS', 'ARTG'],
            'mobile development': ['CS', 'IS', 'ARTG'],
            'game developer': ['CS', 'ARTG', 'MUSI'],
            'game development': ['CS', 'ARTG', 'MUSI'],
            'devops': ['CS', 'IS', 'CY'],
            'cloud engineer': ['CS', 'IS', 'CY'],
            'full stack': ['CS', 'IS', 'ARTG'],
            'frontend': ['CS', 'IS', 'ARTG'],
            'backend': ['CS', 'IS', 'CY'],
            'database': ['CS', 'IS', 'DS'],
            'analyst': ['DS', 'STAT', 'BUSN', 'ECON'],
            'consultant': ['BUSN', 'COMM', 'ECON', 'PSYC'],
            'entrepreneur': ['ENTR', 'BUSN', 'MKTG', 'COMM'],
            'startup': ['ENTR', 'BUSN', 'MKTG', 'COMM']
        };

        const careerLower = careerGoal.toLowerCase();
        let relevantDepartments: string[] = [];

        // Find matching departments based on career goal
        for (const [keyword, departments] of Object.entries(careerMappings)) {
            if (careerLower.includes(keyword)) {
                relevantDepartments = departments;
                break;
            }
        }

        // If no specific match, suggest general electives
        if (relevantDepartments.length === 0) {
            relevantDepartments = ['CS', 'BUSN', 'COMM', 'PSYC', 'ECON'];
        }

        // Filter electives by relevant departments
        return electives.filter(course =>
            relevantDepartments.some(dept =>
                course.department.toLowerCase().includes(dept.toLowerCase())
            )
        );
    }

    public clearCache(): void {
        this.coursesWithHardness = null;
        this.csRequirements = null;
        this.lastCoursesFetch = 0;
        this.lastCSFetch = 0;
    }

    public getCacheStats(): {
        coursesCached: boolean;
        csRequirementsCached: boolean;
        coursesAge: number;
        csRequirementsAge: number;
    } {
        const now = Date.now();
        return {
            coursesCached: this.coursesWithHardness !== null,
            csRequirementsCached: this.csRequirements !== null,
            coursesAge: this.lastCoursesFetch ? now - this.lastCoursesFetch : 0,
            csRequirementsAge: this.lastCSFetch ? now - this.lastCSFetch : 0
        };
    }
}

export const dataCache = DataCache.getInstance();
export type { CourseWithHardness, CSRequirements };
