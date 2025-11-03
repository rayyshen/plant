'use client';

import React, { useState, useCallback } from 'react';
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

    const loadPlans = useCallback(async () => {
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
    }, [userId]);

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
                return 'bg-muted text-muted-foreground';
            case 'active':
                return 'bg-primary/10 text-primary';
            case 'completed':
                return 'bg-accent text-accent-foreground';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft':
                return '🌱';
            case 'active':
                return '🌿';
            case 'completed':
                return '🌳';
            default:
                return '🌱';
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
    }, [userId, loadPlans]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-32">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Growing your plans...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 bg-destructive/10 organic-rounded flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p className="text-destructive mb-4">{error}</p>
                <Button onClick={loadPlans} variant="outline" className="organic-rounded-sm">
                    Try Again
                </Button>
            </div>
        );
    }

    if (plans.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 bg-primary/10 organic-rounded flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">No plans yet</h3>
                <p className="text-muted-foreground mb-6">Plant your first academic plan to start growing!</p>
                <div className="text-4xl">🌱</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">Your Garden</h2>
                    <p className="text-muted-foreground">Your cultivated academic plans</p>
                </div>
                <Button onClick={loadPlans} variant="outline" size="sm" className="organic-rounded-sm">
                    Refresh
                </Button>
            </div>

            <div className="grid gap-4">
                {plans.map((plan) => (
                    <div key={plan.id} className="border border-border rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-card/50">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h3 className="text-lg font-semibold text-foreground">
                                        {plan.title}
                                    </h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(plan.status)}`}>
                                        <span>{getStatusIcon(plan.status)}</span>
                                        <span className="capitalize">{plan.status}</span>
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {plan.major} • {plan.careerGoal || 'No career goal specified'}
                                </p>
                                {plan.description && (
                                    <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                            <span>Planted: {formatDate(plan.createdAt)}</span>
                            <span>Last tended: {formatDate(plan.updatedAt)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="text-sm text-muted-foreground">
                                {plan.semesters.length} semester{plan.semesters.length !== 1 ? 's' : ''} planned
                            </div>
                            <div className="flex space-x-2">
                                {onPlanSelect && (
                                    <Button
                                        onClick={() => onPlanSelect(plan)}
                                        size="sm"
                                        className="organic-rounded-sm"
                                    >
                                        Tend Plan
                                    </Button>
                                )}
                                <Button
                                    onClick={() => handleDeletePlan(plan.id)}
                                    size="sm"
                                    variant="outline"
                                    className="text-destructive hover:text-destructive hover:border-destructive/50 organic-rounded-sm"
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
