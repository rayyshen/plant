'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            await signIn(email, password);
            router.push('/dashboard');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            setError(errorMessage);
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
                        Welcome back
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Continue growing your academic journey
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
                                    autoComplete="current-password"
                                    required
                                    className="w-full px-4 py-3 border border-border rounded-lg bg-background/50 text-foreground placeholder-muted-foreground plant-focus"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
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
                            {loading ? 'Growing...' : 'Sign In'}
                        </Button>

                        <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                                New to Plant?{' '}
                                <Link href="/signup" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                    Start growing
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
