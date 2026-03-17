import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Edit2, Trash2, Play, CheckCircle2 } from 'lucide-react';
import { Playlist, Video } from '../types';
import { motion } from 'motion/react';

interface PlaylistCardProps {
  playlist: Playlist;
  videos: Video[];
  onEdit: () => void;
  onDelete: () => void;
}

export function PlaylistCard({ playlist, videos, onEdit, onDelete }: PlaylistCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const completedCount = videos.filter(v => v.completed).length;
  const totalCount = videos.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#151A23] p-6 shadow-xl transition-all hover:border-cyan-500/30 hover:shadow-cyan-500/10"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
      
      <div className="relative flex items-start justify-between">
        <Link to={`/playlist/${playlist.id}`} className="flex-1">
          <h3 className="text-xl font-semibold text-white transition-colors group-hover:text-cyan-400">
            {playlist.name}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">
            {playlist.description || 'No description provided.'}
          </p>
        </Link>
        
        <div className="relative ml-4">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full z-20 mt-2 w-36 overflow-hidden rounded-xl border border-white/10 bg-[#1A212D] py-1 shadow-2xl backdrop-blur-xl">
                <button
                  onClick={() => { setShowMenu(false); onEdit(); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <Edit2 className="h-4 w-4" /> Edit
                </button>
                <button
                  onClick={() => { setShowMenu(false); onDelete(); }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="relative mt-6">
        <div className="flex items-center justify-between text-xs font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <Play className="h-3.5 w-3.5" />
            <span>{totalCount} videos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className={progress === 100 ? 'text-emerald-400' : ''}>{progress}%</span>
          </div>
        </div>
        
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </motion.div>
  );
}
