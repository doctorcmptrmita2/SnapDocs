'use client';

import { useEffect, useRef } from 'react';

interface ProseContentProps {
  html: string;
}

export function ProseContent({ html }: ProseContentProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find all pre elements and add copy buttons
    const preElements = containerRef.current.querySelectorAll('pre');
    
    preElements.forEach((pre) => {
      // Skip if already has button
      if (pre.querySelector('.copy-btn')) return;
      
      // Add relative positioning
      pre.style.position = 'relative';
      pre.classList.add('group');
      
      // Get code text
      const code = pre.querySelector('code');
      const text = code?.textContent || pre.textContent || '';
      
      // Create copy button
      const btn = document.createElement('button');
      btn.className = 'copy-btn absolute top-2 right-2 p-2 rounded-md bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white transition-all opacity-0 group-hover:opacity-100';
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
      btn.title = 'Copy code';
      
      btn.addEventListener('click', async () => {
        await navigator.clipboard.writeText(text);
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-green-400"><polyline points="20 6 9 17 4 12"/></svg>`;
        setTimeout(() => {
          btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        }, 2000);
      });
      
      pre.appendChild(btn);
    });
  }, [html]);

  return (
    <div 
      ref={containerRef}
      className="prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
