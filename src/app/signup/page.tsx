'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import PDFUpload from '@/components/PDFUpload';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sprout } from 'lucide-react';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [parsedCourses, setParsedCourses] = useState<any[]>([]);
    const [isParsingCourses, setIsParsingCourses] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleCoursesParsed = (courses: any[]) => {
        setParsedCourses(courses);
        setIsParsingCourses(false);
    };

    const handleParseError = (error: string) => {
        setError(error);
        setIsParsingCourses(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        try {
            setError('');
            setLoading(true);

            // Create user account
            const userCredential = await signUp(email, password);
            const user = userCredential.user;

            // Save completed courses to Firestore if any were parsed
            if (parsedCourses.length > 0) {
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    completedCourses: parsedCourses,
                    createdAt: new Date(),
                });
            } else {
                // Create user document even without courses
                await setDoc(doc(db, 'users', user.uid), {
                    email: user.email,
                    completedCourses: [],
                    createdAt: new Date(),
                });
            }

            router.push('/dashboard');
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center plant-gradient py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-6">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                            <Sprout className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h1 className="text-2xl font-bold text-primary">Plant</h1>
                    </div>
                    <h2 className="text-3xl font-extrabold text-foreground">
                        Start growing
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Plant the seeds of your academic success
                    </p>
                </div>

                <div className="bg-card/80 backdrop-blur-sm organic-rounded-sm leaf-shadow p-8">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground placeholder-muted-foreground plant-focus"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground placeholder-muted-foreground plant-focus"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="confirm-password" className="block text-sm font-medium text-foreground mb-2">
                                    Confirm Password
                                </label>
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type="password"
                                    autoComplete="new-password"
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground placeholder-muted-foreground plant-focus"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* PDF Upload Section */}
                        <div className="mt-6">
                            <PDFUpload
                                onCoursesParsed={handleCoursesParsed}
                                onError={handleParseError}
                                isLoading={isParsingCourses}
                            />
                            {parsedCourses.length > 0 && (
                                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                    <p className="text-sm text-primary">
                                        🌱 Successfully planted {parsedCourses.length} completed courses!
                                    </p>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm text-destructive">{error}</p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 organic-rounded-sm"
                        >
                            {loading ? 'Planting seeds...' : 'Start Growing'}
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                Already growing with Plant?{' '}
                                <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
