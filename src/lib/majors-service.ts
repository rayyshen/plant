import { AutocompleteOption } from '@/components/ui/autocomplete-dropdown';

interface MajorData {
    area_name: string;
    school_name: string;
}

interface MajorsResponse {
    data: {
        areas_of_study: MajorData[];
    };
}

let majorsCache: AutocompleteOption[] | null = null;

export class MajorsService {
    // Load majors from the JSON file
    static async getMajors(): Promise<AutocompleteOption[]> {
        // Return cached data if available
        if (majorsCache) {
            return majorsCache;
        }

        try {
            const response = await fetch('/Majors.json');
            if (!response.ok) {
                throw new Error('Failed to fetch majors data');
            }

            const data: MajorsResponse = await response.json();

            // Transform the data into AutocompleteOption format
            const majors = data.data.areas_of_study.map((major: MajorData) => ({
                value: major.area_name,
                label: major.area_name,
                description: major.school_name
            }));

            // Sort majors alphabetically
            majors.sort((a, b) => a.label.localeCompare(b.label));

            // Cache the results
            majorsCache = majors;

            return majors;
        } catch (error) {
            console.error('Error loading majors:', error);

            // Return a fallback list of common majors if the file fails to load
            return [
                { value: 'Computer Science', label: 'Computer Science', description: 'College of Computer and Information Science' },
                { value: 'Business Administration', label: 'Business Administration', description: 'D\'Amore-McKim School of Business' },
                { value: 'Engineering', label: 'Engineering', description: 'College of Engineering' },
                { value: 'Psychology', label: 'Psychology', description: 'College of Science' },
                { value: 'Biology', label: 'Biology', description: 'College of Science' },
                { value: 'Mathematics', label: 'Mathematics', description: 'College of Science' },
                { value: 'English', label: 'English', description: 'College of Social Sciences and Humanities' },
                { value: 'History', label: 'History', description: 'College of Social Sciences and Humanities' },
                { value: 'Art', label: 'Art', description: 'College of Arts, Media and Design' },
                { value: 'Architecture', label: 'Architecture', description: 'College of Arts, Media and Design' }
            ];
        }
    }

    // Clear the cache (useful for testing or if data needs to be refreshed)
    static clearCache(): void {
        majorsCache = null;
    }

    // Get a specific major by name
    static async getMajorByName(majorName: string): Promise<AutocompleteOption | null> {
        const majors = await this.getMajors();
        return majors.find(major => major.value === majorName) || null;
    }

    // Search majors by partial name
    static async searchMajors(query: string): Promise<AutocompleteOption[]> {
        const majors = await this.getMajors();
        const lowercaseQuery = query.toLowerCase();

        return majors.filter(major =>
            major.label.toLowerCase().includes(lowercaseQuery) ||
            (major.description && major.description.toLowerCase().includes(lowercaseQuery))
        );
    }
}
