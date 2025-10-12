'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { PlanService } from '@/lib/plan-service';
import { Plan } from '@/lib/types';
import { SemesterPlan } from '@/components/SemesterPlan';
import { CSRequirementsChecklist } from '@/components/CSRequirementsChecklist';

interface PlanPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default function PlanPage({ params }: PlanPageProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [plan, setPlan] = useState<Plan | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const resolvedParams = use(params);
    const planId = resolvedParams.slug;

    useEffect(() => {
        const loadPlan = async () => {
            if (!user) return;

            try {
                setIsLoading(true);
                setError(null);
                const planData = await PlanService.getPlan(planId);

                if (!planData) {
                    setError('Plan not found');
                    return;
                }

                // Check if the plan belongs to the current user
                if (planData.userId !== user.uid) {
                    setError('You do not have permission to view this plan');
                    return;
                }

                setPlan(planData);
            } catch (err) {
                setError('Failed to load plan');
                console.error('Error loading plan:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadPlan();
    }, [planId, user]);

    const handleBackToDashboard = () => {
        router.push('/dashboard');
    };

    const handleUpdatePlan = (updatedPlan: Plan) => {
        setPlan(updatedPlan);
    };

    const handleSavePlan = async () => {
        if (!plan) return;

        try {
            setIsSaving(true);
            await PlanService.updatePlan(plan.id, plan);
            // Show success message or notification
            console.log('Plan saved successfully');
        } catch (err) {
            console.error('Error saving plan:', err);
            setError('Failed to save plan');
        } finally {
            setIsSaving(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft':
                return 'bg-gray-100 text-gray-800';
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    };

    const isComputerScienceMajor = (major: string) => {
        const lowerMajor = major.toLowerCase();
        return lowerMajor.includes('computer science') ||
            lowerMajor.includes('cs') ||
            lowerMajor.includes('computer science*') ||
            lowerMajor.includes('khoury');
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h1>
                    <Button onClick={() => router.push('/login')}>
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Button
                                    onClick={handleBackToDashboard}
                                    variant="outline"
                                    className="mr-4"
                                >
                                    ← Back to Dashboard
                                </Button>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Northeastern Course Planner
                                </h1>
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Button
                                    onClick={handleBackToDashboard}
                                    variant="outline"
                                    className="mr-4"
                                >
                                    ← Back to Dashboard
                                </Button>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Northeastern Course Planner
                                </h1>
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="text-center">
                                <div className="text-red-600 mb-4">
                                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                                <p className="text-gray-600 mb-4">{error}</p>
                                <Button onClick={handleBackToDashboard}>
                                    Back to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen bg-gray-50">
                <nav className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <Button
                                    onClick={handleBackToDashboard}
                                    variant="outline"
                                    className="mr-4"
                                >
                                    ← Back to Dashboard
                                </Button>
                                <h1 className="text-xl font-semibold text-gray-900">
                                    Northeastern Course Planner
                                </h1>
                            </div>
                        </div>
                    </div>
                </nav>
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Plan Not Found</h2>
                                <p className="text-gray-600 mb-4">The requested plan could not be found.</p>
                                <Button onClick={handleBackToDashboard}>
                                    Back to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <Button
                                onClick={handleBackToDashboard}
                                variant="outline"
                                className="mr-4"
                            >
                                ← Back to Dashboard
                            </Button>
                            <h1 className="text-xl font-semibold text-gray-900">
                                Northeastern Course Planner
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, {user.email}
                            </span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Plan Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                    {plan.title}
                                </h1>
                                <p className="text-lg text-gray-600 mb-2">
                                    {plan.major} • {plan.careerGoal || 'No career goal specified'}
                                </p>
                                {plan.description && (
                                    <p className="text-gray-700 mb-4">{plan.description}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(plan.status)}`}>
                                    {plan.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>Created: {formatDate(plan.createdAt)}</span>
                            <span>Last Updated: {formatDate(plan.updatedAt)}</span>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Requirements Checklist */}
                        <div className="lg:col-span-1">
                            {isComputerScienceMajor(plan?.major || '') ? (
                                <CSRequirementsChecklist
                                    plan={plan!}
                                    onUpdatePlan={handleUpdatePlan}
                                />
                            ) : (
                                <div className="bg-white rounded-lg shadow-md p-6">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements Checklist</h2>
                                    <p className="text-gray-600">
                                        Requirements checklist is currently only available for Computer Science majors.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Semester Planning */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <SemesterPlan
                                    plan={plan}
                                    onUpdatePlan={handleUpdatePlan}
                                    onSavePlan={handleSavePlan}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
