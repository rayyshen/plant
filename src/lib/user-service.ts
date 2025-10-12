import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface CompletedCourse {
    courseCode: string;  // Changed from 'code' to 'courseCode'
    courseName: string;  // Changed from 'name' to 'courseName'
    credits: number;
    grade?: string;
    semester?: string;
}

export interface UserData {
    email: string;
    completedCourses: CompletedCourse[];
    createdAt: Date;
}

export class UserService {
    // Get user data including completed courses
    static async getUserData(userId: string): Promise<UserData | null> {
        try {
            const userDocRef = doc(db, 'users', userId);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                console.log('Raw user data from Firestore:', data);
                console.log('Completed courses from Firestore:', data.completedCourses);

                const userData = {
                    email: data.email,
                    completedCourses: data.completedCourses || [],
                    createdAt: data.createdAt?.toDate() || new Date(),
                } as UserData;

                console.log('Processed user data:', userData);
                return userData;
            }

            console.log('User document does not exist');
            return null;
        } catch (error) {
            console.error('Error fetching user data:', error);
            throw new Error('Failed to fetch user data');
        }
    }

    // Get only completed courses for a user
    static async getCompletedCourses(userId: string): Promise<CompletedCourse[]> {
        try {
            const userData = await this.getUserData(userId);
            const courses = userData?.completedCourses || [];
            console.log('Final completed courses returned:', courses);
            return courses;
        } catch (error) {
            console.error('Error fetching completed courses:', error);
            return [];
        }
    }
}
