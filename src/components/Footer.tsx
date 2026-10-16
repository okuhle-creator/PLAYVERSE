import React from 'react';
import { Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-canvas)] py-8 mt-auto text-xs text-[var(--text-muted)]">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[var(--text-primary)] font-mono">PLAYVERSE</span>
            <span>&bull;</span>
            <span>Day 4 of 10-Day Software Challenge</span>
          </div>
          <span className="hidden sm:inline text-[var(--border-subtle)]">|</span>
          <p>Zero tracking, fully client-side web arcade.</p>
        </div>

        <div className="flex items-center gap-4 font-mono">
          <div className="flex items-center gap-1.5">
            <Terminal size={13} className="text-[var(--color-accent)]" />
            <span>Built with React + TypeScript + Vite</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
