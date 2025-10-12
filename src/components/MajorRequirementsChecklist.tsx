'use client';

import React, { useState, useEffect } from 'react';
import { Plan, Course } from '@/lib/types';
import { UserService, CompletedCourse } from '@/lib/user-service';
import { useAuth } from '@/lib/auth-context';
import { mapMajorNameToCode } from '@/lib/major-mapping';

interface MajorCourse {
    code: string;
    title: string;
    credits: string;
}

interface MajorRequirements {
    catalog_description: string;
    total_credits: number;
    major_credits: number | null;
    gpa_requirement: number | null;
    core_courses: MajorCourse[];
    supporting_courses: MajorCourse[];
    [key: string]: any; // Allow additional categories
}

interface MajorData {
    title: string;
    cip_code: string;
    catalog_url: string;
    requirements: MajorRequirements;
}

interface MajorRequirementsChecklistProps {
    plan: Plan;
    onUpdatePlan: (updatedPlan: Plan) => void;
}

interface CourseDetails {
    course_code: string;
    title: string;
    description: string;
    credits: string;
    prerequisites: string | null;
    attributes: string | null;
    department: string;
    elective: boolean;
}

export function MajorRequirementsChecklist({ plan, onUpdatePlan }: MajorRequirementsChecklistProps) {
    const { user } = useAuth();
    const [majorData, setMajorData] = useState<MajorData | null>(null);
    const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
    const [selectedCourse, setSelectedCourse] = useState<CourseDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [majorCode, setMajorCode] = useState<string | null>(null);

    console.log('MajorRequirementsChecklist rendered with plan:', plan);
    console.log('Plan major:', plan.major);
    console.log('User:', user);
    console.log('Completed courses from DB:', completedCourses);

    // Map plan major to major code
    useEffect(() => {
        const mappedCode = mapMajorNameToCode(plan.major);
        console.log('Mapped major code:', mappedCode);
        setMajorCode(mappedCode);
    }, [plan.major]);

    // Load major requirements
    useEffect(() => {
        const loadMajorRequirements = async () => {
            if (!majorCode) {
                setIsLoading(false);
                return;
            }

            try {
                console.log('Loading major requirements for:', majorCode);
                const response = await fetch('/major_requirements.json');
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log('Loaded major requirements data:', data);

                if (data.majors && data.majors[majorCode]) {
                    setMajorData(data.majors[majorCode]);
                } else {
                    console.error('Major not found:', majorCode);
                }
            } catch (error) {
                console.error('Error loading major requirements:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMajorRequirements();
    }, [majorCode]);

    // Load completed courses from database
    useEffect(() => {
        const loadCompletedCourses = async () => {
            if (!user) return;

            try {
                console.log('Loading completed courses for user:', user.uid);
                const courses = await UserService.getCompletedCourses(user.uid);
                console.log('Raw completed courses from DB:', courses);

                // Debug each course individually
                courses.forEach((course, index) => {
                    console.log(`Course ${index}:`, {
                        raw: course,
                        courseCode: course.courseCode,
                        codeType: typeof course.courseCode,
                        codeLength: course.courseCode?.length,
                        normalized: normalizeCourseCode(course.courseCode)
                    });
                });

                // Check for courses with missing codes
                const invalidCourses = courses.filter(course => !course.courseCode);
                if (invalidCourses.length > 0) {
                    console.warn('Found completed courses with missing codes:', invalidCourses);
                }

                setCompletedCourses(courses);
            } catch (error) {
                console.error('Error loading completed courses:', error);
            }
        };

        loadCompletedCourses();
    }, [user]);

    // Get all courses from all semesters
    const getAllCourses = (): Course[] => {
        const allCourses = plan.semesters.flatMap(semester => semester.courses);

        // Check for courses with missing codes
        const invalidCourses = allCourses.filter(course => !course.code);
        if (invalidCourses.length > 0) {
            console.warn('Found courses with missing codes:', invalidCourses);
        }

        console.log('All courses in plan:', allCourses.map(c => ({
            code: c.code,
            completed: c.completed,
            hasCode: !!c.code
        })));
        return allCourses;
    };

    // Normalize course code for comparison (remove spaces, convert to uppercase)
    const normalizeCourseCode = (code: string | undefined | null): string => {
        if (!code || typeof code !== 'string') {
            console.warn('normalizeCourseCode received invalid code:', code);
            return '';
        }
        return code.replace(/\s+/g, '').toUpperCase();
    };

    // Check if a requirement is fulfilled
    const isRequirementFulfilled = (requirement: MajorCourse): boolean => {
        // Safety check for requirement code
        if (!requirement.code) {
            console.warn('Requirement has no code:', requirement);
            return false;
        }

        const planCourses = getAllCourses();

        console.log(`\n=== Checking requirement: ${requirement.code} ===`);
        console.log('Plan courses:', planCourses.map(c => ({
            code: c.code,
            completed: c.completed,
            normalized: normalizeCourseCode(c.code)
        })));
        console.log('Completed courses from DB:', completedCourses.map(c => ({
            courseCode: c.courseCode,
            normalized: normalizeCourseCode(c.courseCode)
        })));

        const normalizedRequirementCode = normalizeCourseCode(requirement.code);
        console.log(`Normalized requirement code: "${normalizedRequirementCode}"`);

        // Check plan courses
        const planMatches = planCourses.filter(course => {
            if (!course.code) return false;
            const normalizedCourseCode = normalizeCourseCode(course.code);
            const matches = normalizedCourseCode === normalizedRequirementCode && course.completed;
            console.log(`Plan course "${course.code}" (normalized: "${normalizedCourseCode}") matches: ${matches}`);
            return matches;
        });

        // Check completed courses from database
        const dbMatches = completedCourses.filter(course => {
            if (!course.courseCode) return false;
            const normalizedCourseCode = normalizeCourseCode(course.courseCode);
            const matches = normalizedCourseCode === normalizedRequirementCode;
            console.log(`DB course "${course.courseCode}" (normalized: "${normalizedCourseCode}") matches: ${matches}`);
            return matches;
        });

        console.log('Plan matching courses:', planMatches);
        console.log('DB matching courses:', dbMatches);

        const isFulfilled = planMatches.length > 0 || dbMatches.length > 0;
        console.log(`Requirement ${requirement.code} fulfilled: ${isFulfilled}`);

        return isFulfilled;
    };

    // Get completed courses for a requirement
    const getCompletedCoursesForRequirement = (requirement: MajorCourse): (Course | CompletedCourse)[] => {
        if (!requirement.code) return [];

        const planCourses = getAllCourses();
        const normalizedRequirementCode = normalizeCourseCode(requirement.code);

        // Get completed courses from plan
        const planMatches = planCourses.filter(course =>
            course.code && normalizeCourseCode(course.code) === normalizedRequirementCode && course.completed
        );

        // Get completed courses from database
        const dbMatches = completedCourses.filter(course =>
            course.courseCode && normalizeCourseCode(course.courseCode) === normalizedRequirementCode
        );

        return [...planMatches, ...dbMatches];
    };

    // Check if a course is planned (added to plan but not completed)
    const isCoursePlanned = (requirement: MajorCourse): boolean => {
        if (!requirement.code) return false;

        const courses = getAllCourses();
        const normalizedRequirementCode = normalizeCourseCode(requirement.code);
        return courses.some(course =>
            course.code && normalizeCourseCode(course.code) === normalizedRequirementCode && !course.completed
        );
    };

    // Toggle course completion status
    const toggleCourseCompletion = (courseCode: string) => {
        if (!courseCode) return;

        const normalizedTargetCode = normalizeCourseCode(courseCode);
        const updatedSemesters = plan.semesters.map(semester => ({
            ...semester,
            courses: semester.courses.map(course =>
                course.code && normalizeCourseCode(course.code) === normalizedTargetCode
                    ? { ...course, completed: !course.completed }
                    : course
            )
        }));

        const updatedPlan = {
            ...plan,
            semesters: updatedSemesters
        };

        onUpdatePlan(updatedPlan);
    };

    // Toggle category expansion
    const toggleCategory = (categoryName: string) => {
        const newExpanded = new Set(expandedCategories);
        if (newExpanded.has(categoryName)) {
            newExpanded.delete(categoryName);
        } else {
            newExpanded.add(categoryName);
        }
        setExpandedCategories(newExpanded);
    };

    // Fetch course details from structured data
    const fetchCourseDetails = async (courseCode: string): Promise<CourseDetails | null> => {
        try {
            const response = await fetch('/all_courses_structured.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const courses: CourseDetails[] = await response.json();
            const course = courses.find(c => c.course_code === courseCode);
            return course || null;
        } catch (error) {
            console.error('Error fetching course details:', error);
            return null;
        }
    };

    // Handle double-click on course
    const handleCourseDoubleClick = async (courseCode: string) => {
        const courseDetails = await fetchCourseDetails(courseCode);
        if (courseDetails) {
            setSelectedCourse(courseDetails);
            setIsModalOpen(true);
        }
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    // Calculate progress for a category
    const getCategoryProgress = (courses: MajorCourse[]) => {
        const fulfilled = courses.filter(isRequirementFulfilled).length;
        const total = courses.length;
        const percentage = total > 0 ? (fulfilled / total) * 100 : 0;
        return { fulfilled, total, percentage };
    };

    // Get requirement categories
    const getRequirementCategories = (): { name: string; courses: MajorCourse[]; description: string }[] => {
        if (!majorData) {
            console.log('No major data available');
            return [];
        }

        const categories = [];

        // Core courses
        if (majorData.requirements.core_courses && majorData.requirements.core_courses.length > 0) {
            categories.push({
                name: 'Core Courses',
                courses: majorData.requirements.core_courses,
                description: 'Required core courses for the major'
            });
        }

        // Supporting courses
        if (majorData.requirements.supporting_courses && majorData.requirements.supporting_courses.length > 0) {
            categories.push({
                name: 'Supporting Courses',
                courses: majorData.requirements.supporting_courses,
                description: 'Supporting courses required for the major'
            });
        }

        // Concentrations
        if (majorData.requirements.concentrations && majorData.requirements.concentrations.length > 0) {
            categories.push({
                name: 'Concentrations',
                courses: majorData.requirements.concentrations,
                description: 'Concentration courses for the major'
            });
        }

        // Look for other course categories
        Object.keys(majorData.requirements).forEach(key => {
            if (key.endsWith('_courses') && key !== 'core_courses' && key !== 'supporting_courses') {
                const courses = majorData.requirements[key];
                if (Array.isArray(courses) && courses.length > 0) {
                    const categoryName = key.replace(/_courses$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    categories.push({
                        name: categoryName,
                        courses: courses,
                        description: `${categoryName} courses for the major`
                    });
                }
            }
        });

        // NU Path requirements (if they exist as an array of strings)
        if (majorData.requirements.nupath && Array.isArray(majorData.requirements.nupath)) {
            const nupathCourses = majorData.requirements.nupath.map((requirement: string) => ({
                code: requirement,
                title: '',
                credits: ''
            }));
            categories.push({
                name: 'NU Path Requirements',
                courses: nupathCourses,
                description: 'Northeastern University core curriculum requirements'
            });
        }

        console.log('Final categories:', categories);
        return categories;
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading requirements...</span>
                </div>
            </div>
        );
    }

    if (!majorData) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="text-center py-8">
                    <div className="text-red-600 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Requirements Not Available</h3>
                    <p className="text-gray-500 mb-4">
                        Requirements checklist is not available for "{plan.major}".
                        {majorCode ? ` (Code: ${majorCode})` : ' No matching major code found.'}
                    </p>
                    <p className="text-sm text-gray-400">
                        This major may not be supported yet, or the requirements data may be incomplete.
                    </p>
                </div>
            </div>
        );
    }

    const categories = getRequirementCategories();
    console.log('Categories after calculation:', categories);

    const totalCourses = categories.reduce((sum, cat) => sum + cat.courses.length, 0);
    const totalFulfilled = categories.reduce((sum, cat) => {
        const progress = getCategoryProgress(cat.courses);
        return sum + progress.fulfilled;
    }, 0);
    const overallProgress = totalCourses > 0 ? (totalFulfilled / totalCourses) * 100 : 0;

    console.log('Progress calculation:', { totalCourses, totalFulfilled, overallProgress });

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{majorData.title} Requirements Checklist</h2>
                <p className="text-gray-600 mb-4">
                    Track your progress toward completing the {majorData.title} major requirements. Click on courses to mark them as completed.
                </p>

                {/* Major Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium text-gray-700">Total Credits:</span>
                            <span className="ml-2 text-gray-600">{majorData.requirements.total_credits}</span>
                        </div>
                        {majorData.requirements.major_credits && (
                            <div>
                                <span className="font-medium text-gray-700">Major Credits:</span>
                                <span className="ml-2 text-gray-600">{majorData.requirements.major_credits}</span>
                            </div>
                        )}
                        {majorData.requirements.gpa_requirement && (
                            <div>
                                <span className="font-medium text-gray-700">GPA Requirement:</span>
                                <span className="ml-2 text-gray-600">{majorData.requirements.gpa_requirement}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Overall Progress */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                        <span className="text-sm text-gray-600">{totalFulfilled}/{totalCourses} completed</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${overallProgress}%` }}
                        ></div>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                        {overallProgress.toFixed(1)}% complete
                    </div>
                </div>
            </div>

            {/* Requirements Categories */}
            <div className="space-y-4">
                {categories.map((category) => {
                    const progress = getCategoryProgress(category.courses);
                    const isExpanded = expandedCategories.has(category.name);
                    const isCompleted = progress.fulfilled === category.courses.length;

                    return (
                        <div key={category.name} className="border border-gray-200 rounded-lg">
                            <button
                                onClick={() => toggleCategory(category.name)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                                        {category.description && (
                                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                                        )}
                                        <div className="flex items-center mt-2">
                                            <span className="text-sm text-gray-600 mr-4">
                                                {progress.fulfilled}/{category.courses.length} completed
                                            </span>
                                            <div className="flex-1 max-w-xs">
                                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                    <div
                                                        className={`h-1.5 rounded-full transition-all duration-300 ${isCompleted ? 'bg-green-500' : 'bg-blue-500'
                                                            }`}
                                                        style={{ width: `${progress.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            {isCompleted && (
                                                <span className="ml-2 text-green-600 text-sm font-medium">✓ Complete</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <svg
                                            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-200">
                                    <div className="pt-4 space-y-2">
                                        {category.courses.map((requirement, index) => {
                                            const isFulfilled = isRequirementFulfilled(requirement);
                                            const isPlanned = isCoursePlanned(requirement);
                                            const completedCourses = getCompletedCoursesForRequirement(requirement);

                                            return (
                                                <div
                                                    key={`${requirement.code}-${index}`}
                                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${isFulfilled
                                                        ? 'bg-green-50 border-green-200'
                                                        : isPlanned
                                                            ? 'bg-yellow-50 border-yellow-200'
                                                            : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                    onClick={() => handleCourseDoubleClick(requirement.code)}
                                                >
                                                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                toggleCourseCompletion(requirement.code);
                                                            }}
                                                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${isFulfilled
                                                                ? 'bg-green-500 border-green-500 text-white'
                                                                : 'border-gray-300 hover:border-green-500'
                                                                }`}
                                                        >
                                                            {isFulfilled && (
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center space-x-2">
                                                                <span className="font-bold text-gray-900 flex-shrink-0">{requirement.code}</span>
                                                                {requirement.title && (
                                                                    <span className="text-gray-600 truncate">{requirement.title}</span>
                                                                )}
                                                                {requirement.credits && (
                                                                    <span className="text-sm text-gray-500 flex-shrink-0">({requirement.credits} credits)</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="ml-4 flex-shrink-0">
                                                        {isFulfilled ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                                Completed
                                                            </span>
                                                        ) : isPlanned ? (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                Planned
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                                Not Planned
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Legend</h4>
                <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                        <span className="text-gray-600">Completed</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                        <span className="text-gray-600">Planned</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-gray-300 rounded"></div>
                        <span className="text-gray-600">Not Planned</span>
                    </div>
                </div>
            </div>

            {/* Course Details Modal */}
            {isModalOpen && selectedCourse && (
                <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.course_code}</h2>
                                    <h3 className="text-lg text-gray-700 mt-1">{selectedCourse.title}</h3>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Course Information</h4>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="font-medium text-gray-700">Credits:</span>
                                            <span className="ml-2 text-gray-600">{selectedCourse.credits}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Department:</span>
                                            <span className="ml-2 text-gray-600">{selectedCourse.department}</span>
                                        </div>
                                        <div>
                                            <span className="font-medium text-gray-700">Type:</span>
                                            <span className="ml-2 text-gray-600">{selectedCourse.elective ? 'Elective' : 'Required'}</span>
                                        </div>
                                    </div>
                                </div>

                                {selectedCourse.prerequisites && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Prerequisites</h4>
                                        <p className="text-gray-700">{selectedCourse.prerequisites}</p>
                                    </div>
                                )}

                                {selectedCourse.attributes && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Attributes</h4>
                                        <p className="text-gray-700">{selectedCourse.attributes}</p>
                                    </div>
                                )}

                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                                    <p className="text-gray-700 leading-relaxed">{selectedCourse.description}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
