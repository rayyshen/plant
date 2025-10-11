export interface Plan {
    id: string;
    title: string;
    description: string;
    major: string;
    careerGoal: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    status: 'draft' | 'active' | 'completed';
    semesters: Semester[];
}

export interface Semester {
    id: string;
    name: string; // e.g., "Fall 2024", "Spring 2025"
    courses: Course[];
    credits: number;
}

export interface Course {
    id: string;
    code: string; // e.g., "CS2500"
    name: string;
    credits: number;
    prerequisites: string[];
    category: 'core' | 'elective' | 'general';
    completed: boolean;
}

export interface CreatePlanData {
    title: string;
    description: string;
    major: string;
    careerGoal: string;
}
