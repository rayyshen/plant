'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sprout } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center plant-gradient">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto leaf-float"></div>
          <p className="mt-4 text-muted-foreground">Growing your experience...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen plant-gradient">
      {/* Navigation */}
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border/50 leaf-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Sprout className="w-5 h-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold text-primary">
                  Plant
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-accent/50">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="organic-rounded-sm">Start Growing</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6 leaf-float">
              <Sprout className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Cultivate Your Academic Journey
            <span className="block text-primary">with Intelligent Growth</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Plant helps you grow and thrive in your studies with personalized course recommendations,
            smart planning tools, and AI-powered insights that nurture your academic success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-3 organic-rounded-sm plant-grow plant-hover">
                Start Growing Today
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 organic-rounded-sm plant-hover">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-card/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose Plant?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built with nature-inspired design and cutting-edge AI technology to help you flourish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center plant-grow plant-hover">
              <div className="bg-primary/10 w-16 h-16 organic-rounded flex items-center justify-center mx-auto mb-4 leaf-shadow leaf-sway">
                <div className="text-2xl">🌱</div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Growth</h3>
              <p className="text-muted-foreground">
                AI-powered recommendations that adapt to your learning style and academic goals
              </p>
            </div>

            <div className="text-center plant-grow plant-hover">
              <div className="bg-primary/10 w-16 h-16 organic-rounded flex items-center justify-center mx-auto mb-4 leaf-shadow leaf-sway">
                <div className="text-2xl">🌿</div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Root Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your progress toward graduation with real-time requirement tracking
              </p>
            </div>

            <div className="text-center plant-grow plant-hover">
              <div className="bg-primary/10 w-16 h-16 organic-rounded flex items-center justify-center mx-auto mb-4 leaf-shadow leaf-sway">
                <div className="text-2xl">🌸</div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Career Bloom</h3>
              <p className="text-muted-foreground">
                Align your studies with future career opportunities and industry growth
              </p>
            </div>

            <div className="text-center plant-grow plant-hover">
              <div className="bg-primary/10 w-16 h-16 organic-rounded flex items-center justify-center mx-auto mb-4 leaf-shadow leaf-sway">
                <div className="text-2xl">🌳</div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Seasonal Planning</h3>
              <p className="text-muted-foreground">
                Plan your academic seasons with semester-by-semester course cultivation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-16 leaf-shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Plant the Seeds of Success?
          </h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already growing smarter with Plant's intelligent planning tools.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3 organic-rounded-sm plant-hover">
              Start Your Growth Journey 🌱
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card py-12 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Sprout className="w-4 h-4 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-primary">Plant</h3>
            </div>
            <p className="text-muted-foreground mb-4">
              Cultivating academic success through intelligent planning
            </p>
            <p className="text-sm text-muted-foreground/70">
              © 2025 Plant. Nurturing your educational journey.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
