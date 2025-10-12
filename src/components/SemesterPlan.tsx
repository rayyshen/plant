'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { SemesterCard } from '@/components/SemesterCard';
import { Button } from '@/components/ui/button';
import { Plan, Course, Semester } from '@/lib/types';

interface CourseData {
    id: number;
    termEffective: string;
    subject: string;
    courseNumber: string;
    courseTitle: string;
    courseDescription: string;
    creditHourLow: number;
    labHourLow: number | null;
    college: string;
    department: string;
}

interface StructuredCourseData {
    course_code: string;
    title: string;
    description: string;
    credits: string;
    prerequisites: string | null;
    attributes: string | null;
    department: string;
    elective: boolean;
}

interface SemesterPlanProps {
    plan: Plan;
    onUpdatePlan: (updatedPlan: Plan) => void;
    onSavePlan: () => void;
}

export function SemesterPlan({ plan, onUpdatePlan, onSavePlan }: SemesterPlanProps) {
    const [courseOptions, setCourseOptions] = useState<Array<{
        value: string;
        label: string;
        description: string;
        courseData: {
            id: number;
            subject: string;
            courseNumber: string;
            courseTitle: string;
            creditHourLow: number;
            department: string;
            college: string;
        };
    }>>([]);
    const [activeCourse, setActiveCourse] = useState<Course | null>(null);
    const [isLoadingCourses, setIsLoadingCourses] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    // Load course options from all_courses_structured.json
    useEffect(() => {
        const loadCourses = async () => {
            try {
                const response = await fetch('/all_courses_structured.json');
                const structuredCourses: StructuredCourseData[] = await response.json();

                // Map structured course data to CourseData format
                const courses: CourseData[] = structuredCourses.map((course, index) => {
                    // Parse course code to extract subject and course number
                    const courseCodeParts = course.course_code ? course.course_code.split(' ') : ['', ''];
                    const [subject, courseNumber] = courseCodeParts;

                    // Parse credits from string format like "3 Hours" to number
                    const creditsMatch = course.credits ? course.credits.match(/(\d+)/) : null;
                    const creditHourLow = creditsMatch ? parseInt(creditsMatch[1]) : 0;

                    return {
                        id: index + 1, // Generate sequential ID
                        termEffective: '', // Not available in structured data
                        subject: subject || '',
                        courseNumber: courseNumber || '',
                        courseTitle: course.title || '',
                        courseDescription: course.description || '',
                        creditHourLow: creditHourLow,
                        labHourLow: null, // Not available in structured data
                        college: course.department || '', // Using department as college
                        department: course.department || ''
                    };
                });

                const options = courses.map(course => ({
                    value: course.id.toString(),
                    label: `${course.subject}${course.courseNumber} - ${course.courseTitle}`,
                    description: `${course.college} • ${course.creditHourLow} credits`,
                    courseData: {
                        id: course.id,
                        subject: course.subject,
                        courseNumber: course.courseNumber,
                        courseTitle: course.courseTitle,
                        creditHourLow: course.creditHourLow,
                        department: course.department,
                        college: course.college
                    }
                }));

                setCourseOptions(options);
            } catch (error) {
                console.error('Error loading courses:', error);
            } finally {
                setIsLoadingCourses(false);
            }
        };

        loadCourses();
    }, []);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const course = findCourseById(active.id as string);
        setActiveCourse(course);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCourse(null);

        if (!over) return;

        const activeCourse = findCourseById(active.id as string);
        if (!activeCourse) return;

        // Find source semester (where the course currently is)
        const sourceSemester = findSemesterByCourseId(active.id as string);
        if (!sourceSemester) return;

        // Find target semester - check if over.id is a semester ID or a course ID
        let targetSemester: Semester | null = null;

        // First, check if over.id is a semester ID
        targetSemester = plan.semesters.find(semester => semester.id === over.id) || null;

        // If not found, check if over.id is a course ID and find its semester
        if (!targetSemester) {
            targetSemester = findSemesterByCourseId(over.id as string);
        }

        if (!targetSemester) return;

        // Don't move if source and target are the same
        if (sourceSemester.id === targetSemester.id) return;

        // Remove course from source semester and add to target semester
        const updatedSemesters = plan.semesters.map(semester => {
            if (semester.id === sourceSemester.id) {
                // Remove course from source semester
                return {
                    ...semester,
                    courses: semester.courses.filter(course => course.id !== active.id),
                    credits: semester.credits - activeCourse.credits
                };
            } else if (semester.id === targetSemester.id) {
                // Add course to target semester
                return {
                    ...semester,
                    courses: [...semester.courses, activeCourse],
                    credits: semester.credits + activeCourse.credits
                };
            }
            return semester;
        });

        const updatedPlan = {
            ...plan,
            semesters: updatedSemesters
        };

        onUpdatePlan(updatedPlan);
    };

    const findCourseById = (courseId: string): Course | null => {
        for (const semester of plan.semesters) {
            const course = semester.courses.find(c => c.id === courseId);
            if (course) return course;
        }
        return null;
    };

    const findSemesterByCourseId = (courseId: string): Semester | null => {
        for (const semester of plan.semesters) {
            if (semester.courses.some(c => c.id === courseId)) {
                return semester;
            }
        }
        return null;
    };

    const handleAddCourse = (semesterId: string, course: Course) => {
        const updatedSemesters = plan.semesters.map(semester => {
            if (semester.id === semesterId) {
                return {
                    ...semester,
                    courses: [...semester.courses, course],
                    credits: semester.credits + course.credits
                };
            }
            return semester;
        });

        const updatedPlan = {
            ...plan,
            semesters: updatedSemesters
        };

        onUpdatePlan(updatedPlan);
    };

    const handleRemoveCourse = (semesterId: string, courseId: string) => {
        const updatedSemesters = plan.semesters.map(semester => {
            if (semester.id === semesterId) {
                const course = semester.courses.find(c => c.id === courseId);
                return {
                    ...semester,
                    courses: semester.courses.filter(c => c.id !== courseId),
                    credits: semester.credits - (course?.credits || 0)
                };
            }
            return semester;
        });

        const updatedPlan = {
            ...plan,
            semesters: updatedSemesters
        };

        onUpdatePlan(updatedPlan);
    };

    const handleEditCourse = (semesterId: string, course: Course) => {
        // TODO: Implement course editing functionality
        console.log('Edit course:', course);
    };

    const handleToggleCourseCompletion = (semesterId: string, courseId: string) => {
        const updatedSemesters = plan.semesters.map(semester => {
            if (semester.id === semesterId) {
                return {
                    ...semester,
                    courses: semester.courses.map(course =>
                        course.id === courseId
                            ? { ...course, completed: !course.completed }
                            : course
                    )
                };
            }
            return semester;
        });

        const updatedPlan = {
            ...plan,
            semesters: updatedSemesters
        };

        onUpdatePlan(updatedPlan);
    };

    const handleDeleteSemester = (semesterId: string) => {
        const updatedSemesters = plan.semesters.filter(semester => semester.id !== semesterId);

        const updatedPlan = {
            ...plan,
            semesters: updatedSemesters
        };

        onUpdatePlan(updatedPlan);
    };

    const handleRenameSemester = (semesterId: string, newName: string) => {
        const updatedSemesters = plan.semesters.map(semester => {
            if (semester.id === semesterId) {
                return {
                    ...semester,
                    name: newName
                };
            }
            return semester;
        });

        const updatedPlan = {
            ...plan,
            semesters: updatedSemesters
        };

        onUpdatePlan(updatedPlan);
    };

    const generateDefaultSemesters = (): Semester[] => {
        const semesters: Semester[] = [];
        const semesterNames = [
            'Fall 2025', 'Spring 2026', 'Summer 1 2026', 'Summer 2 2026',
            'Fall 2026', 'Spring 2027', 'Summer 1 2027', 'Summer 2 2027',
            'Fall 2027', 'Spring 2028', 'Summer 1 2028', 'Summer 2 2028',
            'Fall 2028', 'Spring 2029'
        ];

        semesterNames.forEach((name, index) => {
            semesters.push({
                id: `semester-${index + 1}`,
                name: name,
                courses: [],
                credits: 0
            });
        });

        return semesters;
    };

    const handleAddSemester = () => {
        const semesterNumber = plan.semesters.length + 1;
        const newSemester: Semester = {
            id: `semester-${Date.now()}`,
            name: `Semester ${semesterNumber}`,
            courses: [],
            credits: 0
        };

        const updatedPlan = {
            ...plan,
            semesters: [...plan.semesters, newSemester]
        };

        onUpdatePlan(updatedPlan);
    };

    const handleAddDefaultSemesters = () => {
        const defaultSemesters = generateDefaultSemesters();
        const updatedPlan = {
            ...plan,
            semesters: defaultSemesters
        };

        onUpdatePlan(updatedPlan);
    };

    if (isLoadingCourses) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading courses...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Academic Plan</h2>
                <div className="flex space-x-2">
                    <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleAddSemester}
                    >
                        Add Semester
                    </Button>
                    <Button
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={handleAddDefaultSemesters}
                    >
                        Add Default Semesters
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={onSavePlan}
                    >
                        Save Plan
                    </Button>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {plan.semesters.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No semesters planned yet</h3>
                        <p className="text-gray-500 mb-4">Start building your academic plan by adding semesters and courses.</p>
                        <div className="flex justify-center space-x-3">
                            <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={handleAddDefaultSemesters}
                            >
                                Add Default Semesters (14)
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={handleAddSemester}
                            >
                                Add Single Semester
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {plan.semesters.map((semester) => (
                            <SemesterCard
                                key={semester.id}
                                semester={semester}
                                onAddCourse={handleAddCourse}
                                onRemoveCourse={handleRemoveCourse}
                                onEditCourse={handleEditCourse}
                                onToggleCourseCompletion={handleToggleCourseCompletion}
                                onDeleteSemester={handleDeleteSemester}
                                onRenameSemester={handleRenameSemester}
                                courseOptions={courseOptions}
                            />
                        ))}
                    </div>
                )}

                <DragOverlay>
                    {activeCourse ? (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg shadow-lg">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                    <span className="font-medium text-gray-900">
                                        {activeCourse.code}
                                    </span>
                                    <span className="text-gray-600">
                                        {activeCourse.name}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                        ({activeCourse.credits} credits)
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
