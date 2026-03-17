import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { VideoPlayer } from '../components/VideoPlayer';
import { VideoItem } from '../components/VideoItem';
import { ArrowLeft, Plus, Link as LinkIcon, AlertCircle, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Video } from '../types';

export function PlaylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, videos, addVideo, updateVideo, toggleVideoComplete, deleteVideo, markVideoAsWatched } = useStore();
  
  const playlist = playlists.find(p => p.id === id);
  const playlistVideos = videos.filter(v => v.playlistId === id);
  
  const activeVideos = playlistVideos.filter(v => !v.completed);
  const completedVideos = playlistVideos.filter(v => v.completed);

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedVideoId) {
      markVideoAsWatched(selectedVideoId);
    }
  }, [selectedVideoId]);

  const [isAddMode, setIsAddMode] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActiveVideos = activeVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredCompletedVideos = completedVideos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!playlist) {
      navigate('/');
    }
  }, [playlist, navigate]);

  useEffect(() => {
    if (playlistVideos.length > 0 && !selectedVideoId) {
      // Select first active video, or first completed if no active
      const firstVideo = activeVideos[0] || completedVideos[0];
      if (firstVideo) {
        setSelectedVideoId(firstVideo.id);
      }
    }
  }, [playlistVideos, selectedVideoId, activeVideos, completedVideos]);

  if (!playlist) return null;

  const selectedVideo = playlistVideos.find(v => v.id === selectedVideoId) || null;

  const handleAddVideo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newUrl.trim()) return;
    
    const success = addVideo(playlist.id, newUrl, newTitle);
    if (success) {
      setNewUrl('');
      setNewTitle('');
      setIsAddMode(false);
    } else {
      setError('Invalid YouTube URL');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVideoId && editTitle.trim()) {
      updateVideo(editingVideoId, editTitle);
      setEditingVideoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200">
      <Header 
        rightContent={
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <span className="hidden sm:inline">{playlist.name}</span>
          </div>
        }
      />

      <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{playlist.name}</h1>
            {playlist.description && (
              <p className="mt-1 text-sm text-slate-400">{playlist.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 xl:grid-cols-4">
          {/* Left Column: Video Player */}
          <div className="lg:col-span-2 xl:col-span-3">
            <VideoPlayer video={selectedVideo} />
          </div>

          {/* Right Column: Playlist & Controls */}
          <div className="flex flex-col gap-6 lg:h-[calc(100vh-12rem)]">
            
            {/* Add Video Section */}
            <div className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#151A23] shadow-xl h-full">
              <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Playlist</h2>
                  {!isAddMode && (
                    <button 
                      onClick={() => setIsAddMode(true)}
                      className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-cyan-500/20"
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Video
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {isAddMode && (
                    <motion.form 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                      onSubmit={handleAddVideo}
                    >
                      <div className="space-y-3 rounded-xl bg-black/30 p-4 border border-white/5 mb-2">
                        <div>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                            <input
                              type="url"
                              value={newUrl}
                              onChange={(e) => setNewUrl(e.target.value)}
                              placeholder="Paste YouTube URL..."
                              className="w-full rounded-lg border border-white/10 bg-black/50 py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                              required
                            />
                          </div>
                          {error && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-400">
                              <AlertCircle className="h-3 w-3" /> {error}
                            </p>
                          )}
                        </div>
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          placeholder="Custom Title (Optional)"
                          className="w-full rounded-lg border border-white/10 bg-black/50 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        />
                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-cyan-400"
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            onClick={() => { setIsAddMode(false); setError(''); }}
                            className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>

              {/* Video Lists */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-6">
                
                {/* Search Videos */}
                {(activeVideos.length > 0 || completedVideos.length > 0) && (
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search videos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-black/50 py-2 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                  </div>
                )}

                {/* Active Videos */}
                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-400 uppercase tracking-wider">
                    Active Videos ({filteredActiveVideos.length})
                  </h3>
                  {filteredActiveVideos.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No active videos found.</p>
                  ) : (
                    <div className="space-y-2">
                      {filteredActiveVideos.map(video => (
                        <VideoItem
                          key={video.id}
                          video={video}
                          isActive={selectedVideoId === video.id}
                          onSelect={() => setSelectedVideoId(video.id)}
                          onToggleComplete={() => toggleVideoComplete(video.id)}
                          onEdit={() => {
                            setEditingVideoId(video.id);
                            setEditTitle(video.title);
                          }}
                          onDelete={() => deleteVideo(video.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Completed Videos */}
                {filteredCompletedVideos.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-sm font-medium text-emerald-500/70 uppercase tracking-wider">
                      Completed ({filteredCompletedVideos.length})
                    </h3>
                    <div className="space-y-2">
                      {filteredCompletedVideos.map(video => (
                        <VideoItem
                          key={video.id}
                          video={video}
                          isActive={selectedVideoId === video.id}
                          onSelect={() => setSelectedVideoId(video.id)}
                          onToggleComplete={() => toggleVideoComplete(video.id)}
                          onEdit={() => {
                            setEditingVideoId(video.id);
                            setEditTitle(video.title);
                          }}
                          onDelete={() => deleteVideo(video.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Video Modal */}
      <AnimatePresence>
        {editingVideoId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setEditingVideoId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#151A23] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-6">Edit Video Title</h2>
              <form onSubmit={handleSaveEdit} className="space-y-5">
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingVideoId(null)}
                    className="flex-1 rounded-xl bg-white/5 py-3 font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!editTitle.trim()}
                    className="flex-1 rounded-xl bg-cyan-500 py-3 font-semibold text-black transition-colors hover:bg-cyan-400 disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
