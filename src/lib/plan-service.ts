import {
    collection,
    doc,
    addDoc,
    getDocs,
    getDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Plan, CreatePlanData } from './types';

const PLANS_COLLECTION = 'plans';

export class PlanService {
    // Create a new plan
    static async createPlan(userId: string, planData: CreatePlanData): Promise<string> {
        try {
            const now = new Date();
            const plan = {
                ...planData,
                userId,
                createdAt: Timestamp.fromDate(now),
                updatedAt: Timestamp.fromDate(now),
                status: 'draft' as const,
                semesters: []
            };

            const docRef = await addDoc(collection(db, PLANS_COLLECTION), plan);
            return docRef.id;
        } catch (error) {
            console.error('Error creating plan:', error);
            throw new Error('Failed to create plan');
        }
    }

    // Get all plans for a user
    static async getUserPlans(userId: string): Promise<Plan[]> {
        try {
            const q = query(
                collection(db, PLANS_COLLECTION),
                where('userId', '==', userId)
            );

            const querySnapshot = await getDocs(q);
            const plans: Plan[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                plans.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Plan);
            });

            // Sort plans by updatedAt in descending order on the client side
            plans.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

            return plans;
        } catch (error) {
            console.error('Error fetching user plans:', error);
            throw new Error('Failed to fetch plans');
        }
    }

    // Get a single plan by ID
    static async getPlan(planId: string): Promise<Plan | null> {
        try {
            const docRef = doc(db, PLANS_COLLECTION, planId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate() || new Date(),
                    updatedAt: data.updatedAt?.toDate() || new Date(),
                } as Plan;
            }

            return null;
        } catch (error) {
            console.error('Error fetching plan:', error);
            throw new Error('Failed to fetch plan');
        }
    }

    // Update a plan
    static async updatePlan(planId: string, updates: Partial<Plan>): Promise<void> {
        try {
            const docRef = doc(db, PLANS_COLLECTION, planId);
            await updateDoc(docRef, {
                ...updates,
                updatedAt: Timestamp.fromDate(new Date())
            });
        } catch (error) {
            console.error('Error updating plan:', error);
            throw new Error('Failed to update plan');
        }
    }

    // Delete a plan
    static async deletePlan(planId: string): Promise<void> {
        try {
            const docRef = doc(db, PLANS_COLLECTION, planId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Error deleting plan:', error);
            throw new Error('Failed to delete plan');
        }
    }
}
