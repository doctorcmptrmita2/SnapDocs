import Link from 'next/link';
import { ArrowRight, Zap, Shield, GitBranch, Globe, Check, Github, FileText, Clock } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { CookieBanner } from '@/components/ui/CookieBanner';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Logo size="md" />
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Features
            </Link>
            <Link href="#pricing" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Pricing
            </Link>
            <Link href="/docs/repodocs/main" className="text-slate-600 hover:text-slate-900 text-sm font-medium">
              Docs
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 text-sm font-medium hidden sm:block">
              Sign In
            </Link>
            <Link
              href="/login"
              className="bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-600 transition shadow-sm"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-50 via-white to-sky-50" />
        
        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white border border-brand-200 text-brand-700 px-3 py-1.5 rounded-full text-sm mb-6 shadow-sm">
                <Zap className="w-4 h-4" />
                <span className="font-medium">5x faster than Mintlify</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
                Git to Docs in
                <span className="text-brand-500 block">30 Seconds</span>
              </h1>
              
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                Transform your GitHub markdown into beautiful documentation instantly. 
                No config files, no build steps, no waiting.
              </p>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <Link
                  href="/login"
                  className="bg-brand-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-brand-600 transition flex items-center gap-2 shadow-lg shadow-brand-500/25"
                >
                  <Github className="w-5 h-5" />
                  Connect GitHub
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/docs/repodocs/main"
                  className="text-slate-600 hover:text-slate-900 font-medium flex items-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  View Demo Docs
                </Link>
              </div>

              {/* Social proof */}
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Free forever for public repos
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  No credit card required
                </div>
              </div>
            </div>

            {/* Right - Mockup */}
            <div className="relative lg:pl-8">
              <div className="relative">
                {/* Browser mockup */}
                <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
                  {/* Browser header */}
                  <div className="bg-slate-100 px-4 py-3 flex items-center gap-2 border-b border-slate-200">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-white rounded-md px-3 py-1 text-xs text-slate-500 text-center">
                        docs.yourproject.com
                      </div>
                    </div>
                  </div>
                  
                  {/* Docs preview */}
                  <div className="flex">
                    {/* Sidebar */}
                    <div className="w-44 bg-slate-50 p-3 border-r border-slate-100 hidden sm:block">
                      <div className="space-y-1">
                        <div className="bg-brand-100 text-brand-700 px-2 py-1.5 rounded text-xs font-medium">
                          Getting Started
                        </div>
                        <div className="text-slate-600 px-2 py-1.5 text-xs">Installation</div>
                        <div className="text-slate-600 px-2 py-1.5 text-xs">Configuration</div>
                        <div className="text-slate-400 px-2 py-1.5 text-xs font-medium mt-3">API Reference</div>
                        <div className="text-slate-600 px-2 py-1.5 text-xs">Authentication</div>
                        <div className="text-slate-600 px-2 py-1.5 text-xs">Endpoints</div>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-4">
                      <h2 className="text-lg font-bold text-slate-900 mb-2">Getting Started</h2>
                      <p className="text-xs text-slate-500 mb-3">Learn how to set up your project in minutes</p>
                      
                      {/* Code block */}
                      <div className="bg-slate-900 rounded-lg p-3 mb-3">
                        <code className="text-xs text-green-400">npm install RepoDocs</code>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="h-2 bg-slate-100 rounded w-full" />
                        <div className="h-2 bg-slate-100 rounded w-4/5" />
                        <div className="h-2 bg-slate-100 rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-lg flex items-center gap-1.5">
                  <Zap className="w-3 h-3" />
                  Live in 30s
                </div>
                
                <div className="absolute -bottom-3 -left-3 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-slate-600">Auto-synced with GitHub</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">How it works</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Three simple steps to beautiful documentation</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Connect GitHub"
              description="Sign in with GitHub and select your repository"
              icon={<Github className="w-6 h-6" />}
            />
            <StepCard
              number="2"
              title="We fetch your docs"
              description="RepoDocs reads your markdown files and builds navigation"
              icon={<FileText className="w-6 h-6" />}
            />
            <StepCard
              number="3"
              title="Instant docs site"
              description="Your documentation is live with syntax highlighting and search"
              icon={<Zap className="w-6 h-6" />}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Built for developers</h2>
            <p className="text-slate-600 max-w-xl mx-auto">Everything you need for world-class documentation</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Zap className="w-5 h-5" />}
              title="Edge-First Performance"
              description="10ms response times globally. Docs cached at the edge, not fetched on every request."
            />
            <FeatureCard
              icon={<GitBranch className="w-5 h-5" />}
              title="Git-Native Versioning"
              description="Automatic version dropdown from branches and tags. No config needed."
            />
            <FeatureCard
              icon={<Shield className="w-5 h-5" />}
              title="Healthy Docs Engine"
              description="Catch broken links and missing metadata before they go live."
            />
            <FeatureCard
              icon={<Clock className="w-5 h-5" />}
              title="Auto-Sync on Push"
              description="Push to GitHub, docs update automatically via webhooks."
            />
            <FeatureCard
              icon={<Globe className="w-5 h-5" />}
              title="Custom Domains"
              description="Use your own domain with automatic SSL certificates."
            />
            <FeatureCard
              icon={<FileText className="w-5 h-5" />}
              title="150+ Languages"
              description="Syntax highlighting for every language via Shiki."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple pricing</h2>
            <p className="text-slate-600">Start free, upgrade when you need more</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <PricingCard
              name="Hobby"
              price="$0"
              description="For open source projects"
              features={[
                '1 public repository',
                'RepoDocs.dev subdomain',
                'Basic theme',
                'Community support',
              ]}
              cta="Get Started"
              href="/login"
            />
            <PricingCard
              name="Pro"
              price="$12"
              period="/month"
              description="For indie developers"
              features={[
                'Unlimited public repos',
                '1 private repository',
                'Custom domain',
                'Remove branding',
                'Priority support',
              ]}
              cta="Start Free Trial"
              href="/login"
              highlighted
            />
            <PricingCard
              name="Team"
              price="$29"
              period="/month"
              description="For growing teams"
              features={[
                'Unlimited private repos',
                'Version selector',
                'Docs health reports',
                'Team collaboration',
                'Analytics dashboard',
              ]}
              cta="Start Free Trial"
              href="/login"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-500 to-brand-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to ship better docs?
          </h2>
          <p className="text-brand-100 mb-8 text-lg">
            Join developers who trust RepoDocs for their documentation.
          </p>
          <Link
            href="/login"
            className="bg-white text-brand-600 px-8 py-3 rounded-xl font-medium hover:bg-brand-50 transition inline-flex items-center gap-2 shadow-lg"
          >
            <Github className="w-5 h-5" />
            Get Started Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Logo size="sm" />
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="/docs/repodocs/main" className="hover:text-slate-700">Docs</Link>
              <Link href="#pricing" className="hover:text-slate-700">Pricing</Link>
              <a href="https://github.com/doctorcmptrmita2/RepoDocs" className="hover:text-slate-700">GitHub</a>
            </div>
            <p className="text-sm text-slate-400">
              © 2026 RepoDocs. Built for developers.
            </p>
          </div>
        </div>
      </footer>

      {/* Cookie Banner */}
      <CookieBanner />
    </div>
  );
}

function StepCard({ number, title, description, icon }: { 
  number: string; 
  title: string; 
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-brand-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
        {number}
      </div>
      <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-xl flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-5 hover:shadow-md hover:border-slate-200 transition">
      <div className="w-10 h-10 bg-brand-50 text-brand-500 rounded-lg flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-slate-600 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({ 
  name, 
  price, 
  period, 
  description, 
  features, 
  cta, 
  href,
  highlighted 
}: { 
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div className={`rounded-2xl p-6 ${
      highlighted 
        ? 'bg-brand-500 text-white ring-4 ring-brand-500/20 scale-105' 
        : 'bg-white border border-slate-200'
    }`}>
      <h3 className={`font-semibold text-lg mb-1 ${highlighted ? 'text-white' : 'text-slate-900'}`}>
        {name}
      </h3>
      <p className={`text-sm mb-4 ${highlighted ? 'text-brand-100' : 'text-slate-500'}`}>
        {description}
      </p>
      <div className="mb-6">
        <span className={`text-4xl font-bold ${highlighted ? 'text-white' : 'text-slate-900'}`}>
          {price}
        </span>
        {period && <span className={highlighted ? 'text-brand-100' : 'text-slate-500'}>{period}</span>}
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm">
            <Check className={`w-4 h-4 ${highlighted ? 'text-brand-200' : 'text-green-500'}`} />
            <span className={highlighted ? 'text-white' : 'text-slate-600'}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        href={href}
        className={`block text-center py-2.5 rounded-lg font-medium transition ${
          highlighted
            ? 'bg-white text-brand-600 hover:bg-brand-50'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}
