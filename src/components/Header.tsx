import React from 'react';
import { Link } from 'react-router-dom';

export function Header({ rightContent }: { rightContent?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B0E14]/80 backdrop-blur-md p-2">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <img className="avatar" src="/src/favicon.ico"
      alt="Lin Lanying" width={40} height={40}/>
          <span className="text-xl font-bold tracking-tight text-white">TtraWatch</span>
        </Link>
        <div className="flex items-center gap-4">
          {rightContent}
        </div>
      </div>
    </header>
  );
}
