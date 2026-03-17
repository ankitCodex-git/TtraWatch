import React from 'react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#0B0E14] py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
        <p>&copy; {new Date().getFullYear()} TtraWatch by AnkitCodex. Designed for focused learning.</p>
      </div>
    </footer>
  );
}
