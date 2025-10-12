'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Plan } from '@/lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { dataCache, CourseWithHardness, CSRequirements } from '@/lib/data-cache';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

interface ChatbotProps {
    plan: Plan;
}

export function Chatbot({ plan }: ChatbotProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [coursesWithHardness, setCoursesWithHardness] = useState<CourseWithHardness[]>([]);
    const [csRequirements, setCsRequirements] = useState<CSRequirements | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

    // Load courses with hardness data and CS requirements using cache
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load courses with hardness data using cache
                const coursesData = await dataCache.getCoursesWithHardness();
                setCoursesWithHardness(coursesData);

                // Load CS requirements using cache
                const csData = await dataCache.getCSRequirements();
                setCsRequirements(csData);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();
    }, []);

    // Scroll to bottom when new messages are added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Get elective suggestions based on career goal
    const getElectiveSuggestions = (careerGoal: string, major: string): string => {
        if (!careerGoal || !coursesWithHardness.length) return '';

        // Use the data cache helper function
        const relevantElectives = dataCache.getElectivesByCareerGoal(careerGoal);

        // Get top 5 electives with difficulty ratings
        const topElectives = relevantElectives
            .sort((a, b) => a.difficulty - b.difficulty) // Sort by difficulty (easier first)
            .slice(0, 5);

        if (topElectives.length === 0) return '';

        const electiveList = topElectives.map(course =>
            `• **${course.course_code}** - ${course.title} (Difficulty: ${course.difficulty}/5)`
        ).join('\n');

        return `\n\n**🌱 Elective Suggestions for "${careerGoal}":**\n${electiveList}\n\nThese electives align with your career goals and can help you develop relevant skills!`;
    };

    // Initialize with welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const careerGoal = plan.careerGoal?.trim();
            const electiveSuggestions = careerGoal ? getElectiveSuggestions(careerGoal, plan.major) : '';

            const welcomeMessage: ChatMessage = {
                id: 'welcome',
                content: `Hi! I'm your **academic planning assistant**. I can help you with:

• **Course scheduling** and semester planning
• **Requirement tracking** for your major
• **Balanced course loads** using difficulty ratings
• **Career-focused** course recommendations

I have access to your plan **"${plan.title}"** (${plan.major})${careerGoal ? ` and your career goal: **"${careerGoal}"**` : ''}.${electiveSuggestions}

How can I help you today?`,
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, plan.title, plan.major, plan.careerGoal, coursesWithHardness]);

    const generateContext = () => {
        // Get completed courses
        const completedCourses = plan.semesters.flatMap(semester =>
            semester.courses.filter(course => course.completed)
        );

        // Get all planned courses
        const allPlannedCourses = plan.semesters.flatMap(semester => semester.courses);

        // Get CS requirements context
        let csContext = '';
        if (csRequirements && plan.major.toLowerCase().includes('computer science')) {
            csContext = `\n\nCS Requirements Summary:
- CS Overview: ${csRequirements.requirements.CS_Overview.minRequired} courses required
- CS Fundamental: ${csRequirements.requirements.CS_Fundamental.minRequired} courses required  
- CS Required: ${csRequirements.requirements.CS_Required.minRequired} courses required
- Security Requirement: ${csRequirements.requirements.Security_Requirement.minRequired} courses required
- Presentation Requirement: ${csRequirements.requirements.Presentation_Requirement.minRequired} courses required
- Khoury Approved Electives: ${csRequirements.requirements.Khoury_Approved_Electives.minRequired} courses required
- Mathematics: ${csRequirements.requirements.Mathematics.minRequired} courses required
- Computing and Social Issues: ${csRequirements.requirements.Computing_and_Social_Issues.minRequired} courses required
- Electrical Engineering: ${csRequirements.requirements.Electrical_Engineering.minRequired} courses required
- Science Requirement: ${csRequirements.requirements.Science_Requirement.minRequired} courses required
- Writing: ${csRequirements.requirements.Writing.minRequired} courses required`;
        }

        return `Student Context:
- Major: ${plan.major}
- Career Goal: ${plan.careerGoal || 'Not specified'}
- Plan Status: ${plan.status}
- Completed Courses: ${completedCourses.length > 0 ? completedCourses.map(c => `${c.code} - ${c.name}`).join(', ') : 'None'}
- Total Planned Courses: ${allPlannedCourses.length}
- Current Semesters: ${plan.semesters.length}${csContext}

Course Difficulty Data Available: ${coursesWithHardness.length} courses with difficulty ratings (1-5 scale)`;
    };

    const sendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: inputMessage,
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

            const context = generateContext();

            // Create a sample of course difficulty data for the prompt
            const sampleCourses = coursesWithHardness.slice(0, 20).map(course =>
                `${course.course_code}: ${course.title} (Difficulty: ${course.difficulty}/5, Credits: ${course.credits})`
            ).join('\n');

            const prompt = `You are an academic planning assistant for Northeastern University students. 

${context}

Available Course Difficulty Sample (${coursesWithHardness.length} total courses):
${sampleCourses}

**Response Guidelines:**
- Keep responses concise and actionable (2-3 paragraphs max)
- Use **bold** for important course codes, requirements, and key points
- Use bullet points for lists
- Include specific course codes with difficulty ratings when relevant
- Focus on practical, immediate next steps
- Consider course difficulty for balanced semester loads
- When suggesting electives, prioritize courses that align with the student's career goal: "${plan.careerGoal || 'Not specified'}"
- Always mention difficulty ratings (1-5 scale) when recommending courses

Student Question: ${inputMessage}

Provide concise, formatted advice using markdown. Be specific and actionable.`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: text,
                role: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error generating response:', error);
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: '**Error:** Unable to process your request. Please try again.',
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <div className="fixed bottom-6 right-6 z-50">
                    <Button
                        onClick={() => setIsOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <MessageCircle className="w-6 h-6" />
                    </Button>
                </div>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-96 h-[600px] bg-card border border-border rounded-lg shadow-xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border bg-card/80">
                        <div className="flex items-center space-x-2">
                            <Bot className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold text-foreground">Academic Assistant</h3>
                        </div>
                        <Button
                            onClick={() => setIsOpen(false)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground'
                                        }`}
                                >
                                    <div className="flex items-start space-x-2">
                                        {message.role === 'assistant' && (
                                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        )}
                                        {message.role === 'user' && (
                                            <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        )}
                                        <div className="flex-1">
                                            <div className="text-sm markdown-content">
                                                <ReactMarkdown
                                                    components={{
                                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                                        strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                                                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                                                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                                                        li: ({ children }) => <li className="text-sm">{children}</li>,
                                                        code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                                                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                                                        h2: ({ children }) => <h2 className="text-base font-semibold mb-2">{children}</h2>,
                                                        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>
                                            <p className="text-xs opacity-70 mt-1">
                                                {message.timestamp.toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-muted text-muted-foreground rounded-lg p-3 max-w-[80%]">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="w-4 h-4" />
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-border">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about your academic plan..."
                                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                disabled={isLoading}
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={!inputMessage.trim() || isLoading}
                                size="sm"
                                className="px-3"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
