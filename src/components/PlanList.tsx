'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlanService } from '@/lib/plan-service';
import { Plan } from '@/lib/types';

interface PlanListProps {
    userId: string;
    onPlanSelect?: (plan: Plan) => void;
}

export function PlanList({ userId, onPlanSelect }: PlanListProps) {
    const [plans, setPlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadPlans = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const userPlans = await PlanService.getUserPlans(userId);
            setPlans(userPlans);
        } catch (err) {
            setError('Failed to load plans');
            console.error('Error loading plans:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePlan = async (planId: string) => {
        if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
            return;
        }

        try {
            await PlanService.deletePlan(planId);
            setPlans(prev => prev.filter(plan => plan.id !== planId));
        } catch (err) {
            setError('Failed to delete plan');
            console.error('Error deleting plan:', err);
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
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    // Load plans on component mount
    React.useEffect(() => {
        loadPlans();
    }, [userId]);

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <Button onClick={loadPlans} variant="outline">
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
                    <p className="text-gray-500">Create your first academic plan to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Plans</h2>
                <Button onClick={loadPlans} variant="outline" size="sm">
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    {plan.title}
                                </h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    {plan.major} • {plan.careerGoal || 'No career goal specified'}
                                </p>
                                {plan.description && (
                                    <p className="text-sm text-gray-700 mb-3">{plan.description}</p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(plan.status)}`}>
                                    {plan.status}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                            <span>Created: {formatDate(plan.createdAt)}</span>
                            <span>Updated: {formatDate(plan.updatedAt)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm text-gray-600">
                                {plan.semesters.length} semester{plan.semesters.length !== 1 ? 's' : ''} planned
                            </div>
                            <div className="flex space-x-2">
                                {onPlanSelect && (
                                    <Button
                                        onClick={() => onPlanSelect(plan)}
                                        size="sm"
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        View Plan
                                    </Button>
                                )}
                                <Button
                                    onClick={() => handleDeletePlan(plan.id)}
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
