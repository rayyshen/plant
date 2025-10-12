'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';

interface PDFUploadProps {
    onCoursesParsed: (courses: any[]) => void;
    onError: (error: string) => void;
    isLoading: boolean;
}

export default function PDFUpload({ onCoursesParsed, onError, isLoading }: PDFUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.type !== 'application/pdf') {
            onError('Please upload a PDF file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            onError('File size must be less than 10MB');
            return;
        }

        setUploadedFile(file);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!uploadedFile) return;

        try {
            const formData = new FormData();
            formData.append('pdf', uploadedFile);

            const response = await fetch('/api/parse-courses', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to parse PDF');
            }

            onCoursesParsed(data.courses);
        } catch (error: any) {
            onError(error.message || 'Failed to upload and parse PDF');
        }
    };

    const removeFile = () => {
        setUploadedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Upload Your Completed Courses (PDF)
                </label>
                <p className="text-sm text-muted-foreground mb-4">
                    Upload a PDF of your transcript or course list to automatically plant your completed courses.
                </p>
            </div>

            <div
                className={`border-2 border-dashed organic-rounded-sm p-6 text-center transition-all duration-200 ${dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {uploadedFile ? (
                    <div className="space-y-4">
                        <div className="flex items-center justify-center space-x-2">
                            <div className="w-8 h-8 bg-primary/10 organic-rounded flex items-center justify-center">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium text-foreground">{uploadedFile.name}</span>
                        </div>
                        <div className="flex space-x-2 justify-center">
                            <Button
                                onClick={handleUpload}
                                disabled={isLoading}
                                className="organic-rounded-sm"
                            >
                                {isLoading ? 'Planting...' : 'Plant Courses'}
                            </Button>
                            <Button
                                onClick={removeFile}
                                variant="outline"
                                disabled={isLoading}
                                className="organic-rounded-sm"
                            >
                                Remove
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-primary/10 organic-rounded flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                                >
                                    Click to upload
                                </button>
                                {' '}or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground/70">PDF files only, max 10MB</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileInput}
                            className="hidden"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
