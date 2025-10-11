'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { CreatePlanForm } from '@/components/CreatePlanForm';
import { PlanList } from '@/components/PlanList';
import { Plan } from '@/lib/types';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [showCreateForm, setShowCreateForm] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    const handlePlanCreated = () => {
        setShowCreateForm(false);
        // The PlanList component will automatically refresh
    };

    const handlePlanSelect = (plan: Plan) => {
        // Navigate to the plan detail page
        router.push(`/dashboard/plans/${plan.id}`);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Northeastern Course Planner
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, {user.email}
                            </span>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="text-sm"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Create New Plan
                            </Button>
                        </div>
                        <p className="text-gray-600">
                            Manage your academic plans and track your progress towards graduation.
                        </p>
                    </div>

                    {showCreateForm ? (
                        <div className="mb-8">
                            <CreatePlanForm
                                userId={user.uid}
                                onPlanCreated={handlePlanCreated}
                                onCancel={() => setShowCreateForm(false)}
                            />
                        </div>
                    ) : (
                        <PlanList
                            userId={user.uid}
                            onPlanSelect={handlePlanSelect}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
