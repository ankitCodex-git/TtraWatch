import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { PlaylistCard } from '../components/PlaylistCard';
import { Plus, X, Search, Clock, PlayCircle, ListPlus, Link as LinkIcon, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fetchPlaylistVideos } from '../youtube';

export function Dashboard() {
  const navigate = useNavigate();
  const { playlists, videos, addPlaylist, addVideos, updatePlaylist, deletePlaylist } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'import'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [importUrl, setImportUrl] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const filteredPlaylists = playlists.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentVideos = videos
    .filter(v => !v.completed)
    .sort((a, b) => (b.lastWatchedAt || 0) - (a.lastWatchedAt || 0))
    .slice(0, 3);

  const handleOpenModal = (mode: 'create' | 'edit' | 'import', playlist?: { id: string; name: string; description: string }) => {
    setModalMode(mode);
    setError('');
    if (playlist) {
      setEditingId(playlist.id);
      setName(playlist.name);
      setDescription(playlist.description);
    } else {
      setEditingId(null);
      setName('');
      setDescription('');
      setImportUrl('');
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (modalMode === 'import') {
      if (!name.trim() || !importUrl.trim()) return;
      
      setIsLoading(true);
      try {
        const fetchedVideos = await fetchPlaylistVideos(importUrl);
        const newPlaylistId = addPlaylist(name, description);
        addVideos(newPlaylistId, fetchedVideos);
        setIsModalOpen(false);
        navigate(`/playlist/${newPlaylistId}`);
      } catch (err: any) {
        setError(err.message || 'Failed to import playlist');
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!name.trim()) return;
      if (editingId) {
        updatePlaylist(editingId, name, description);
      } else {
        addPlaylist(name, description);
      }
      setIsModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-200">
      <Header 
        rightContent={
          <div className="flex gap-2">
            <button
              onClick={() => handleOpenModal('import')}
              className="flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/10"
            >
              <ListPlus className="h-4 w-4 text-purple-400" />
              <span className="hidden sm:inline">Import Playlist</span>
            </button>
            <button
              onClick={() => handleOpenModal('create')}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:shadow-cyan-500/40"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Playlist</span>
            </button>
          </div>
        }
      />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Your Playlists</h1>
            <p className="mt-2 text-slate-400">Organize and track your learning journey.</p>
          </div>
          
          <div className="flex gap-4">
            <div className="rounded-2xl border border-white/10 bg-[#151A23] px-5 py-3 shadow-lg">
              <div className="text-sm font-medium text-slate-400">Total Videos</div>
              <div className="mt-1 text-2xl font-bold text-white">{videos.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#151A23] px-5 py-3 shadow-lg">
              <div className="text-sm font-medium text-slate-400">Completed</div>
              <div className="mt-1 text-2xl font-bold text-emerald-400">
                {videos.filter(v => v.completed).length}
              </div>
            </div>
          </div>
        </div>

        {recentVideos.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
              <Clock className="h-5 w-5 text-cyan-400" /> Continue Learning
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentVideos.map(video => {
                const playlist = playlists.find(p => p.id === video.playlistId);
                return (
                  <Link 
                    key={video.id} 
                    to={`/playlist/${video.playlistId}`} 
                    className="group flex items-center gap-4 rounded-2xl border border-white/5 bg-[#151A23] p-4 transition-all hover:border-cyan-500/30 hover:bg-white/5"
                  >
                    <div className="relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800">
                      <img 
                        src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} 
                        alt="" 
                        className="h-full w-full object-cover opacity-70 transition-opacity group-hover:opacity-100" 
                      />
                      <PlayCircle className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 shadow-black drop-shadow-md transition-all group-hover:scale-110 group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium text-slate-200 group-hover:text-cyan-400">{video.title}</span>
                      <span className="truncate text-xs text-slate-500">{playlist?.name || 'Unknown Playlist'}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-8 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search playlists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#151A23] py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>
        </div>

        {filteredPlaylists.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-[#151A23]/50 py-32 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <Plus className="h-10 w-10 text-slate-500" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-white">No playlists yet</h3>
            <p className="mt-2 text-slate-400">Create your first playlist to start organizing videos.</p>
            <button
              onClick={() => handleOpenModal('create')}
              className="mt-8 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              Create Playlist
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                videos={videos.filter((v) => v.playlistId === playlist.id)}
                onEdit={() => handleOpenModal('edit', playlist)}
                onDelete={() => deletePlaylist(playlist.id)}
              />
            ))}
          </div>
        )}
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => !isLoading && setIsModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#151A23] p-8 shadow-2xl"
            >
              <button
                onClick={() => !isLoading && setIsModalOpen(false)}
                className="absolute right-6 top-6 rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              
              <h2 className="text-2xl font-bold text-white mb-6">
                {modalMode === 'edit' ? 'Edit Playlist' : modalMode === 'import' ? 'Import YouTube Playlist' : 'Create Playlist'}
              </h2>
              
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                    Playlist Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="e.g., React Masterclass"
                    autoFocus
                  />
                </div>
                
                {modalMode === 'import' && (
                  <div>
                    <label htmlFor="importUrl" className="mb-2 block text-sm font-medium text-slate-300">
                      YouTube Playlist URL
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="url"
                        id="importUrl"
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                        placeholder="Paste link here..."
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-slate-300">
                    Description <span className="text-slate-500">(Optional)</span>
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    placeholder="What is this playlist about?"
                  />
                </div>

                {error && (
                  <p className="flex items-center gap-2 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </p>
                )}

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={!name.trim() || (modalMode === 'import' && !importUrl.trim()) || isLoading}
                    className={`w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white shadow-lg transition-all disabled:opacity-50 ${
                      modalMode === 'import' 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-purple-500/25 hover:shadow-purple-500/40' 
                        : 'bg-gradient-to-r from-cyan-500 to-blue-500 shadow-cyan-500/25 hover:shadow-cyan-500/40'
                    }`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      modalMode === 'edit' ? 'Save Changes' : modalMode === 'import' ? 'Import & Create' : 'Create Playlist'
                    )}
                  </button>
                </div>
                
                {modalMode === 'import' && (
                  <p className="text-[10px] text-slate-500 text-center">
                    Note: All videos in the playlist will be added automatically.
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Footer />
    </div>
  );
}
