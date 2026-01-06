import Link from 'next/link';
import { ArrowRight, Zap, Shield, GitBranch, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">SnapDoc</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/pricing" className="text-slate-600 hover:text-slate-900">
              Pricing
            </Link>
            <Link href="/docs" className="text-slate-600 hover:text-slate-900">
              Docs
            </Link>
            <Link
              href="/login"
              className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm mb-6">
          <Zap className="w-4 h-4" />
          5x faster setup than Mintlify
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6 leading-tight">
          Git to Docs in<br />
          <span className="text-brand-500">30 Seconds</span>
        </h1>
        
        <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
          The most reliable & high-performance bridge between Git and Docs.
          Connect your repo, get beautiful documentation instantly.
        </p>
        
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/login"
            className="bg-brand-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-600 transition flex items-center gap-2"
          >
            Start Free <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/docs"
            className="border border-slate-300 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition"
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Edge-First Performance"
            description="10ms response times globally. Your docs are cached at the edge, not fetched from GitHub on every request."
          />
          <FeatureCard
            icon={<GitBranch className="w-6 h-6" />}
            title="Git-Native Versioning"
            description="Automatic version dropdown from your branches and tags. No config files needed."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Healthy Docs Engine"
            description="Catch broken links, missing metadata, and redirect issues before they go live."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to ship better docs?</h2>
          <p className="text-slate-400 mb-8">
            Join developers who trust SnapDoc for their documentation.
          </p>
          <Link
            href="/login"
            className="bg-brand-500 text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-600 transition inline-flex items-center gap-2"
          >
            <Globe className="w-5 h-5" />
            Connect GitHub
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          © 2026 SnapDoc. Built for developers, by developers.
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-lg transition">
      <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
