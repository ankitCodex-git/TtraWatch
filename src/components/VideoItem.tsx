import React, { useState } from 'react';
import { Video } from '../types';
import { CheckCircle2, Circle, MoreVertical, Edit2, Trash2, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface VideoItemProps {
  video: Video;
  isActive: boolean;
  onSelect: () => void;
  onToggleComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function VideoItem({ video, isActive, onSelect, onToggleComplete, onEdit, onDelete }: VideoItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative flex items-center justify-between rounded-xl border p-3 transition-all ${
        isActive
          ? 'border-cyan-500/50 bg-cyan-950/30 shadow-lg shadow-cyan-900/20'
          : video.completed
          ? 'border-emerald-500/20 bg-emerald-950/10 opacity-80 hover:opacity-100'
          : 'border-white/5 bg-[#1A212D] hover:border-white/20 hover:bg-white/5'
      }`}
    >
      <div className="flex flex-1 items-center gap-3 overflow-hidden">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete();
          }}
          className="flex-shrink-0 text-slate-400 transition-colors hover:text-emerald-400"
        >
          {video.completed ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>
        
        <button
          onClick={onSelect}
          className="flex flex-1 items-center gap-3 overflow-hidden text-left"
        >
          <div className="flex h-10 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-800 relative">
            <img 
              src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
              alt="" 
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition-opacity group-hover:opacity-100"
            />
            {isActive && <Play className="absolute h-4 w-4 text-white shadow-black drop-shadow-md" fill="currentColor" />}
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className={`truncate text-sm font-medium ${video.completed ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
              {video.title}
            </span>
            <span className="text-xs text-slate-500">YouTube</span>
          </div>
        </button>
      </div>

      <div className="relative ml-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="rounded-full p-1.5 text-slate-500 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full z-20 mt-1 w-32 overflow-hidden rounded-lg border border-white/10 bg-[#151A23] py-1 shadow-xl backdrop-blur-xl">
              <button
                onClick={() => { setShowMenu(false); onEdit(); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => { setShowMenu(false); onDelete(); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
