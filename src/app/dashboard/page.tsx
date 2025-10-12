'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { CreatePlanForm } from '@/components/CreatePlanForm';
import { PlanList } from '@/components/PlanList';
import { Plan } from '@/lib/types';
import { Sprout } from 'lucide-react';

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
            <div className="min-h-screen plant-gradient flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 organic-rounded flex items-center justify-center mx-auto mb-4">
                        <Sprout className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-4">Please log in</h1>
                    <Button onClick={() => router.push('/login')} className="organic-rounded-sm">
                        Go to Login
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen plant-gradient">
            <nav className="bg-card/80 backdrop-blur-sm border-b border-border/50 leaf-shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <Sprout className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <h1 className="text-xl font-semibold text-primary">
                                    Plant
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground">
                                Welcome, {user.email}
                            </span>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="text-sm organic-rounded-sm"
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
                            <div>
                                <h2 className="text-3xl font-bold text-foreground">Your Garden</h2>
                                <p className="text-muted-foreground mt-1">
                                    Cultivate your academic plans and watch them grow
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowCreateForm(true)}
                                className="organic-rounded-sm plant-grow"
                            >
                                Plant New Plan
                            </Button>
                        </div>
                    </div>

                    {showCreateForm ? (
                        <div className="mb-8">
                            <div className="bg-card/80 backdrop-blur-sm organic-rounded-sm leaf-shadow p-6">
                                <CreatePlanForm
                                    userId={user.uid}
                                    onPlanCreated={handlePlanCreated}
                                    onCancel={() => setShowCreateForm(false)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-card/80 backdrop-blur-sm organic-rounded-sm leaf-shadow p-6">
                            <PlanList
                                userId={user.uid}
                                onPlanSelect={handlePlanSelect}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
