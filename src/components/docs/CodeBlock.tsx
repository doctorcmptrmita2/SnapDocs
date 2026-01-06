'use client';

import { useEffect, useRef } from 'react';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
  html: string;
}

export function CodeBlock({ html }: CodeBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Find all pre elements and add copy buttons
    const preElements = containerRef.current.querySelectorAll('pre');
    
    preElements.forEach((pre) => {
      // Add group class for hover effect
      pre.classList.add('group', 'relative');
      
      // Create copy button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'copy-button-container';
      
      // Get code text
      const code = pre.querySelector('code');
      const text = code?.textContent || pre.textContent || '';
      
      // Insert button container
      pre.style.position = 'relative';
      pre.insertBefore(buttonContainer, pre.firstChild);
      
      // Store text for copy
      buttonContainer.setAttribute('data-code', text);
    });
  }, [html]);

  return (
    <div 
      ref={containerRef}
      className="prose-code-wrapper"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
