'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';

interface DeleteProjectButtonProps {
  projectSlug: string;
  projectName: string;
}

export function DeleteProjectButton({ projectSlug, projectName }: DeleteProjectButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition"
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // TODO: Implement delete
            alert('Delete functionality coming soon');
          }}
          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          Confirm Delete
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 dark:hover:bg-red-950/50 rounded-lg transition"
    >
      <Trash2 className="w-3.5 h-3.5" />
      Delete
    </button>
  );
}
