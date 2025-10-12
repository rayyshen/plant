'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AutocompleteDropdown, AutocompleteOption } from '@/components/ui/autocomplete-dropdown';
import { PlanService } from '@/lib/plan-service';
import { MajorsService } from '@/lib/majors-service';
import { CreatePlanData } from '@/lib/types';
import { Sprout } from 'lucide-react';

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
        <div className="space-y-6">
            <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 organic-rounded flex items-center justify-center mx-auto mb-4">
                    <Sprout className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Plant New Plan</h2>
                <p className="text-muted-foreground">Cultivate your academic journey with a personalized plan</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                        Plan Title *
                    </label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground placeholder-muted-foreground plant-focus"
                        placeholder="e.g., Computer Science Growth Plan"
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                        Description
                    </label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground placeholder-muted-foreground plant-focus"
                        placeholder="Describe your academic goals and how you want to grow..."
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
                    <label htmlFor="careerGoal" className="block text-sm font-medium text-foreground mb-2">
                        Career Goal
                    </label>
                    <input
                        type="text"
                        id="careerGoal"
                        name="careerGoal"
                        value={formData.careerGoal}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground placeholder-muted-foreground plant-focus"
                        placeholder="e.g., Software Engineer, Data Scientist, Product Manager"
                    />
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                        className="organic-rounded-sm"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="organic-rounded-sm"
                    >
                        {isLoading ? 'Planting...' : 'Plant Plan'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
