'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logout();
            router.push('/');
        } catch (error) {
            console.error('Failed to logout:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
                                Northeastern Course Planner
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">
                                Welcome, {user?.email}
                            </span>
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="text-sm"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Welcome to Your Course Planner
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your personalized course planning dashboard is coming soon!
                            </p>
                            <div className="space-y-2 text-sm text-gray-500">
                                <p>• AI-powered course recommendations</p>
                                <p>• Major requirement tracking</p>
                                <p>• Career goal alignment</p>
                                <p>• Semester planning tools</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
