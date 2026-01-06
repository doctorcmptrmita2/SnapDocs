'use client';

import { signIn } from 'next-auth/react';
import { Github, Zap } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-2xl">SnapDoc</span>
          </div>

          {/* Heading */}
          <h1 className="text-2xl font-bold text-center mb-2">
            Welcome back
          </h1>
          <p className="text-slate-500 text-center mb-8">
            Sign in to manage your documentation
          </p>

          {/* GitHub Sign In */}
          <button
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full bg-slate-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-slate-800 transition flex items-center justify-center gap-3"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </button>

          {/* Info */}
          <p className="text-xs text-slate-400 text-center mt-6">
            We'll request access to your repositories to fetch documentation.
            Your code stays on GitHub.
          </p>
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <Link href="/" className="text-slate-500 hover:text-slate-700 text-sm">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
