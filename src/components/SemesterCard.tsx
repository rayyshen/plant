'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { AutocompleteDropdown, AutocompleteOption } from '@/components/ui/autocomplete-dropdown';
import { Course } from '@/lib/types';

interface SemesterCardProps {
    semester: {
        id: string;
        name: string;
        courses: Course[];
        credits: number;
    };
    onAddCourse: (semesterId: string, course: Course) => void;
    onRemoveCourse: (semesterId: string, courseId: string) => void;
    onEditCourse: (semesterId: string, course: Course) => void;
    onToggleCourseCompletion: (semesterId: string, courseId: string) => void;
    onDeleteSemester: (semesterId: string) => void;
    onRenameSemester: (semesterId: string, newName: string) => void;
    courseOptions: Array<{
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
    }>;
    isDragOverlay?: boolean;
}

interface CourseItemProps {
    course: Course;
    onRemove: (courseId: string) => void;
    onEdit: (course: Course) => void;
    onToggleCompletion: (courseId: string) => void;
    isDragging?: boolean;
}

function CourseItem({ course, onRemove, onEdit, onToggleCompletion, isDragging }: CourseItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging: isSortableDragging,
    } = useSortable({ id: course.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isSortableDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`flex justify-between items-center p-3 organic-rounded-sm cursor-move transition-all duration-200 ${course.completed
                ? 'bg-primary/10 border border-primary/20 hover:bg-primary/15'
                : 'bg-card/50 hover:bg-card/80'
                } ${isDragging ? 'leaf-shadow-lg' : 'leaf-shadow'}`}
        >
            <div className="flex-1">
                <div className="flex items-center space-x-3">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompletion(course.id);
                        }}
                        className={`w-5 h-5 organic-rounded-sm border-2 flex items-center justify-center transition-colors ${course.completed
                            ? 'bg-primary border-primary text-primary-foreground'
                            : 'border-border hover:border-primary'
                            }`}
                    >
                        {course.completed && (
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center space-x-2">
                            <span className={`font-medium ${course.completed ? 'text-primary line-through' : 'text-foreground'}`}>
                                {course.code}
                            </span>
                            <span className={`${course.completed ? 'text-primary/80 line-through' : 'text-muted-foreground'}`}>
                                {course.name}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                ({course.credits} credits)
                            </span>
                        </div>
                        {course.prerequisites.length > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                                Prerequisites: {course.prerequisites.join(', ')}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.category === 'core'
                    ? 'bg-blue-100 text-blue-800'
                    : course.category === 'elective'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {course.category}
                </span>
                {course.completed && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                    </span>
                )}
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(course)}
                >
                    Edit
                </Button>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                        if (window.confirm(`Are you sure you want to remove ${course.code} - ${course.name}?`)) {
                            onRemove(course.id);
                        }
                    }}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                    Delete
                </Button>
            </div>
        </div>
    );
}

export function SemesterCard({
    semester,
    onAddCourse,
    onRemoveCourse,
    onEditCourse,
    onToggleCourseCompletion,
    onDeleteSemester,
    onRenameSemester,
    courseOptions,
    isDragOverlay = false
}: SemesterCardProps) {
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedCourseLabel, setSelectedCourseLabel] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [editingName, setEditingName] = useState(semester.name);

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id: semester.id,
    });

    const handleCourseSelection = (courseId: string) => {
        setSelectedCourse(courseId);
        const selectedOption = courseOptions.find(option => option.value === courseId);
        if (selectedOption) {
            setSelectedCourseLabel(selectedOption.label);
        }
    };

    const handleStartRename = () => {
        setIsEditingName(true);
        setEditingName(semester.name);
    };

    const handleSaveRename = () => {
        if (editingName.trim() && editingName.trim() !== semester.name) {
            onRenameSemester(semester.id, editingName.trim());
        }
        setIsEditingName(false);
    };

    const handleCancelRename = () => {
        setIsEditingName(false);
        setEditingName(semester.name);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSaveRename();
        } else if (e.key === 'Escape') {
            handleCancelRename();
        }
    };

    const handleAddCourse = () => {
        if (!selectedCourse) return;

        // Find the selected course from options
        const courseOption = courseOptions.find(option => option.value === selectedCourse);
        if (!courseOption) return;

        // Get course data from the option
        const courseData = courseOption.courseData;
        const newCourse: Course = {
            id: `course-${courseData.id}-${Date.now()}`, // Use course ID from JSON + timestamp for uniqueness
            code: `${courseData.subject}${courseData.courseNumber}`,
            name: courseData.courseTitle,
            credits: courseData.creditHourLow || 3,
            prerequisites: [],
            category: 'core', // Default category, can be changed later
            completed: false
        };

        onAddCourse(semester.id, newCourse);
        setSelectedCourse('');
        setSelectedCourseLabel('');
        setShowAddCourse(false);
    };

    return (
        <div
            ref={setDroppableRef}
            className={`border border-border organic-rounded-sm p-6 bg-card/80 backdrop-blur-sm leaf-shadow transition-all duration-200 ${isOver ? 'border-primary bg-primary/5' : ''
                }`}
        >
            <div className="flex justify-between items-center mb-4">
                {isEditingName ? (
                    <div className="flex items-center space-x-2 flex-1">
                        <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={handleSaveRename}
                            className="text-lg font-semibold text-foreground bg-transparent border-b border-primary focus:outline-none focus:border-primary px-1 py-1"
                            autoFocus
                        />
                        <div className="flex space-x-1">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleSaveRename}
                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                                ✓
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancelRename}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                ✕
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2 flex-1">
                        <h3 className="text-lg font-semibold text-foreground">
                            {semester.name}
                        </h3>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleStartRename}
                            className="text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                        >
                            ✏️
                        </Button>
                    </div>
                )}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                        {semester.credits} credits
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddCourse(!showAddCourse)}
                    >
                        {showAddCourse ? 'Cancel' : '+ Plant Course'}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            if (window.confirm(`Are you sure you want to delete the entire semester "${semester.name}"? This will remove all ${semester.courses.length} courses in this semester.`)) {
                                onDeleteSemester(semester.id);
                            }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        Delete Semester
                    </Button>
                </div>
            </div>

            {/* Add Course Form */}
            {showAddCourse && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                        <AutocompleteDropdown
                            options={courseOptions}
                            value={selectedCourseLabel}
                            onChange={handleCourseSelection}
                            placeholder="Search for a course..."
                            label="Select Course"
                            className="w-full"
                        />
                        <div className="flex space-x-2">
                            <Button
                                size="sm"
                                onClick={handleAddCourse}
                                disabled={!selectedCourse}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Add Course
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setShowAddCourse(false);
                                    setSelectedCourse('');
                                    setSelectedCourseLabel('');
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Courses List */}
            {semester.courses.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 mb-2">No courses planned for this semester</p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowAddCourse(true)}
                    >
                        Add Course
                    </Button>
                </div>
            ) : (
                <div className="space-y-2">
                    {semester.courses.map((course) => (
                        <CourseItem
                            key={course.id}
                            course={course}
                            onRemove={(courseId) => onRemoveCourse(semester.id, courseId)}
                            onEdit={(course) => onEditCourse(semester.id, course)}
                            onToggleCompletion={(courseId) => onToggleCourseCompletion(semester.id, courseId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
