'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sprout, BookOpen, Target, Users, TrendingUp, Star, ArrowRight, CheckCircle } from 'lucide-react';

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
    return null; 
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
      <div className="relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10"></div>
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/15 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-32 right-20 w-6 h-6 bg-primary/30 rotate-45 leaf-float"></div>
        <div className="absolute bottom-32 left-20 w-4 h-4 bg-secondary/40 rounded-full leaf-sway"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-accent/25 rounded-full leaf-float delay-1000"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
          <div className="text-center">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full mb-6 leaf-float border-2 border-primary/20">
                <Sprout className="w-12 h-12 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Cultivate Your
              <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Academic Journey
              </span>
              <span className="block text-3xl md:text-4xl text-muted-foreground font-normal mt-2">
                with Intelligent Growth
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto leading-relaxed">
              Plant helps you grow and thrive in your studies with personalized course recommendations,
              smart planning tools, and AI-powered insights that nurture your academic success.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 mb-10 text-center">
              <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-border/50">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold">10,000+ Students</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-border/50">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold">500+ Courses</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 px-4 py-2 rounded-full border border-border/50">
                <Target className="w-5 h-5 text-primary" />
                <span className="text-sm font-semibold">95% Success Rate</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-10 py-4 organic-rounded-sm plant-grow plant-hover bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg">
                  Start Growing Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="text-lg px-10 py-4 organic-rounded-sm plant-hover border-2 hover:bg-accent/50">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-gradient-to-b from-card/30 to-card/60 py-24">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 border border-primary/20 rounded-full"></div>
          <div className="absolute top-32 right-20 w-16 h-16 border border-secondary/20 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 border border-accent/20 rounded-full"></div>
          <div className="absolute bottom-32 right-1/3 w-24 h-24 border border-primary/20 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Why Choose <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Plant?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built with nature-inspired design and cutting-edge AI technology to help you flourish
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group text-center plant-grow plant-hover bg-card/40 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-20 h-20 organic-rounded flex items-center justify-center mx-auto mb-6 leaf-shadow leaf-sway group-hover:scale-110 transition-transform duration-300">
                <Sprout className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Smart Growth</h3>
              <p className="text-muted-foreground leading-relaxed">
                AI-powered recommendations that adapt to your learning style and academic goals
              </p>
            </div>

            <div className="group text-center plant-grow plant-hover bg-card/40 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 w-20 h-20 organic-rounded flex items-center justify-center mx-auto mb-6 leaf-shadow leaf-sway group-hover:scale-110 transition-transform duration-300">
                <Target className="w-10 h-10 text-secondary-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Root Tracking</h3>
              <p className="text-muted-foreground leading-relaxed">
                Monitor your progress toward graduation with real-time requirement tracking
              </p>
            </div>

            <div className="group text-center plant-grow plant-hover bg-card/40 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 w-20 h-20 organic-rounded flex items-center justify-center mx-auto mb-6 leaf-shadow leaf-sway group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Career Bloom</h3>
              <p className="text-muted-foreground leading-relaxed">
                Align your studies with future career opportunities and industry growth
              </p>
            </div>

            <div className="group text-center plant-grow plant-hover bg-card/40 backdrop-blur-sm rounded-2xl p-8 border border-border/50 hover:border-primary/30 transition-all duration-300">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-20 h-20 organic-rounded flex items-center justify-center mx-auto mb-6 leaf-shadow leaf-sway group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Seasonal Planning</h3>
              <p className="text-muted-foreground leading-relaxed">
                Plan your academic seasons with semester-by-semester course cultivation
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials/Stats Section */}
      <div className="bg-gradient-to-br from-background to-card/30 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Trusted by Northeastern Students Worldwide
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what students are saying about their academic growth journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 plant-hover">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "The degree planner provided by the school sucks! Plant is a life saver. I'm graduating on time!,"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-primary">JZ</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Jackson Zheng</p>
                  <p className="text-sm text-muted-foreground">Computer Science Student</p>
                </div>
              </div>
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 plant-hover">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "Why does Northeastern even make these degree planners? Just let Ray, Raymond, and Jackson do it! Lmao!!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-secondary-foreground">RL</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Raymond Liu</p>
                  <p className="text-sm text-muted-foreground">Computer Science Student</p>
                </div>
              </div>
            </div>

            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 border border-border/50 plant-hover">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-muted-foreground mb-4 italic">
                "I was going to flunk out of this school but Plant saved me. I'm only graduating 3 years late!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center mr-3">
                  <span className="text-sm font-semibold text-accent-foreground">RA</span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Ray Shen</p>
                  <p className="text-sm text-muted-foreground">Computer Science Student</p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Benefits */}
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">100% On-Time</h3>
              <p className="text-sm text-muted-foreground">Graduation Rate</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-secondary/20 to-secondary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">25% Faster</h3>
              <p className="text-sm text-muted-foreground">Course Planning</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-accent/20 to-accent/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">95% Accuracy</h3>
              <p className="text-sm text-muted-foreground">AI Recommendations</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">10K+ Students</h3>
              <p className="text-sm text-muted-foreground">Will Trust Plant Daily</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-primary/80 py-20 leaf-shadow-lg relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-6">
            Ready to Plant the Seeds of Success?
          </h2>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students who are already growing smarter with Plant's intelligent planning tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-10 py-4 organic-rounded-sm plant-hover bg-white text-primary hover:bg-white/90 shadow-xl border-2 border-white/20">
                Start Your Growth Journey
                <Sprout className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-10 py-4 organic-rounded-sm plant-hover border-2 border-white/30 text-white hover:bg-white/10">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-card to-card/50 py-16 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <Sprout className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Plant</h3>
            </div>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Cultivating academic success through intelligent planning and personalized growth strategies
            </p>
            <div className="flex justify-center space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <div className="text-sm text-muted-foreground">Active Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Courses Tracked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground/70">
              © 2025 Plant. Nurturing your educational journey with intelligent growth.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
