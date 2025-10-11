'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AutocompleteDropdown, AutocompleteOption } from '@/components/ui/autocomplete-dropdown';
import { PlanService } from '@/lib/plan-service';
import { MajorsService } from '@/lib/majors-service';
import { CreatePlanData } from '@/lib/types';

interface CreatePlanFormProps {
    userId: string;
    onPlanCreated: () => void;
    onCancel: () => void;
}

export function CreatePlanForm({ userId, onPlanCreated, onCancel }: CreatePlanFormProps) {
    const [formData, setFormData] = useState<CreatePlanData>({
        title: '',
        description: '',
        major: '',
        careerGoal: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [majors, setMajors] = useState<AutocompleteOption[]>([]);
    const [majorsLoading, setMajorsLoading] = useState(true);

    // Load majors on component mount
    useEffect(() => {
        const loadMajors = async () => {
            try {
                const majorsData = await MajorsService.getMajors();
                setMajors(majorsData);
            } catch (error) {
                console.error('Error loading majors:', error);
                setError('Failed to load majors list');
            } finally {
                setMajorsLoading(false);
            }
        };

        loadMajors();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await PlanService.createPlan(userId, formData);
            onPlanCreated();
        } catch (err) {
            setError('Failed to create plan. Please try again.');
            console.error('Error creating plan:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Plan</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Plan Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Computer Science 4-Year Plan"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe your academic goals and objectives..."
                    />
                </div>

                <AutocompleteDropdown
                    options={majors}
                    value={formData.major}
                    onChange={(value) => setFormData(prev => ({ ...prev, major: value }))}
                    placeholder={majorsLoading ? "Loading majors..." : "Search for your major..."}
                    label="Major"
                    required
                    disabled={majorsLoading}
                />

                <div>
                    <label htmlFor="careerGoal" className="block text-sm font-medium text-gray-700 mb-1">
                        Career Goal
                    </label>
                    <input
                        type="text"
                        id="careerGoal"
                        name="careerGoal"
                        value={formData.careerGoal}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                    />
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {isLoading ? 'Creating...' : 'Create Plan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
