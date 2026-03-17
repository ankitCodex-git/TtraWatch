import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Playlist, Video } from './types';

const PLAYLISTS_KEY = 'ttrawatch_playlists';
const VIDEOS_KEY = 'ttrawatch_videos';

const defaultPlaylists: Playlist[] = [
  { id: 'p1', name: 'Math', description: 'Algebra, calculus, problem solving', createdAt: Date.now() },
  { id: 'p2', name: 'Physics', description: 'Mechanics, electricity, waves', createdAt: Date.now() },
  { id: 'p3', name: 'Chemistry', description: 'Reactions, organic, lab skills', createdAt: Date.now() },
  { id: 'p4', name: 'Others', description: 'General tutorials and skills', createdAt: Date.now() },
];

const defaultVideos: Video[] = [
  { id: 'v1', playlistId: 'p1', youtubeId: 'LwCRRUa8yTU', title: 'Algebra Fundamentals', completed: false, createdAt: Date.now(), lastWatchedAt: Date.now() },
  { id: 'v2', playlistId: 'p1', youtubeId: '8mveOUqFzFA', title: 'Calculus: Limits and Continuity', completed: false, createdAt: Date.now(), lastWatchedAt: Date.now() - 1000 },
  { id: 'v3', playlistId: 'p1', youtubeId: 'ZzEzTrLSvwM', title: 'Geometry Essentials', completed: true, createdAt: Date.now(), lastWatchedAt: Date.now() - 2000 },
];

export function useStore() {
  const [playlists, setPlaylists] = useState<Playlist[]>(() => {
    const saved = localStorage.getItem(PLAYLISTS_KEY);
    return saved ? JSON.parse(saved) : defaultPlaylists;
  });

  const [videos, setVideos] = useState<Video[]>(() => {
    const saved = localStorage.getItem(VIDEOS_KEY);
    return saved ? JSON.parse(saved) : defaultVideos;
  });

  useEffect(() => {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(playlists));
  }, [playlists]);

  useEffect(() => {
    localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
  }, [videos]);

  const addPlaylist = (name: string, description: string) => {
    const newPlaylist: Playlist = {
      id: uuidv4(),
      name,
      description,
      createdAt: Date.now(),
    };
    setPlaylists((prev) => [...prev, newPlaylist]);
    return newPlaylist.id;
  };

  const updatePlaylist = (id: string, name: string, description: string) => {
    setPlaylists((prev) => prev.map(p => p.id === id ? { ...p, name, description } : p));
  };

  const deletePlaylist = (id: string) => {
    setPlaylists((prev) => prev.filter(p => p.id !== id));
    setVideos((prev) => prev.filter(v => v.playlistId !== id));
  };

  const addVideo = (playlistId: string, youtubeUrl: string, title?: string) => {
    const videoIdMatch = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
    const youtubeId = videoIdMatch ? videoIdMatch[1] : null;
    
    if (!youtubeId) return false;

    const newVideo: Video = {
      id: uuidv4(),
      playlistId,
      youtubeId,
      title: title || 'Untitled Video',
      completed: false,
      createdAt: Date.now(),
      lastWatchedAt: Date.now(),
    };
    setVideos((prev) => [...prev, newVideo]);
    return true;
  };

  const addVideos = (playlistId: string, videosToAdd: { youtubeId: string, title: string }[]) => {
    const newVideos: Video[] = videosToAdd.map(v => ({
      id: uuidv4(),
      playlistId,
      youtubeId: v.youtubeId,
      title: v.title || 'Untitled Video',
      completed: false,
      createdAt: Date.now(),
      lastWatchedAt: Date.now(),
    }));
    setVideos((prev) => [...prev, ...newVideos]);
  };

  const updateVideo = (id: string, title: string) => {
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, title } : v));
  };

  const toggleVideoComplete = (id: string) => {
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, completed: !v.completed } : v));
  };

  const markVideoAsWatched = (id: string) => {
    setVideos((prev) => prev.map(v => v.id === id ? { ...v, lastWatchedAt: Date.now() } : v));
  };

  const deleteVideo = (id: string) => {
    setVideos((prev) => prev.filter(v => v.id !== id));
  };

  return {
    playlists,
    videos,
    addPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideo,
    addVideos,
    updateVideo,
    toggleVideoComplete,
    markVideoAsWatched,
    deleteVideo,
  };
}
