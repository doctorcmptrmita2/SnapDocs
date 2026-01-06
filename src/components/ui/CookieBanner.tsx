'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay for better UX
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="max-w-lg mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleAccept}
            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition"
          >
            Accept
          </button>
          <button
            onClick={handleDecline}
            className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
